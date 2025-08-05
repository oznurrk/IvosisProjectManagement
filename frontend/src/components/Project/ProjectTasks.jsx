import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  Select, Textarea, Card, Text, Group, Stack, Badge, Button, 
  Progress, Grid, Paper, Title, Divider, 
  Modal, ActionIcon, Tooltip
} from "@mantine/core";
import { IconCalendar, IconArrowLeft, IconUsers, IconClock, IconEdit, IconDownload, IconX } from '@tabler/icons-react';
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";
import PaginationComponent from "../../Layout/PaginationComponent";

// ResizeObserver hatası için global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
      const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
      if (resizeObserverErr) {
        resizeObserverErr.setAttribute('style', 'display: none');
      }
      if (resizeObserverErrDiv) {
        resizeObserverErrDiv.setAttribute('style', 'display: none');
      }
    }
  });
}

const ProjectTasks = () => {
  const [projectName, setProjectName] = useState("");
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [taskToReassign, setTaskToReassign] = useState(null);
  const [processToReassign, setProcessToReassign] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [processAssignModalOpen, setProcessAssignModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [searchFilters, setSearchFilters] = useState({
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const CARD_HEIGHT = 600;
  // sayfadaki kayıt sayısını localStorage'dan alan ve dfault olarak 6 olan state
  const [pageSize,setPageSize] = useState(() => {
    const stored = localStorage.getItem("pageSize");
    return stored ? parseInt(stored) : 6;
  })
  
  // Cache edilmiş veriler
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const currentUserId = user?.id || 1;
  const projectId = localStorage.getItem("selectedProjectId");
  const token = localStorage.getItem("token");

  // Sayfa boyutu değiştiğinde sayfa numarasını sıfırla
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("pageSize", newPageSize);
    setCurrentPage(1);
  })

  // Status helper functions - memoized
  const statusConfig = useMemo(() => ({
    NotStarted: { label: "Başlamadı", color: "#7ed2e2" },
    InProgress: { label: "Devam Ediyor", color: "#ffd43b" },
    Completed: { label: "Tamamlandı", color: "#51cf66" },
    Cancelled: { label: "İptal Edildi", color: "#ff6b6b" }
  }), []);

  const getStatusLabel = useCallback((status) => statusConfig[status]?.label || status, [statusConfig]);

  // Dosya listesi alma - task'ı refresh etmek için
  const refreshTaskFiles = useCallback(async (taskId) => {
    try {
      const taskResponse = await axios.get(`http://localhost:5000/api/ProjectTasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return taskResponse.data;
    } catch (error) {
      console.error('Task refresh hatası:', error);
      return null;
    }
  }, [token]);

  // Dosya indirme - path kontrolü ile
  const handleFileDownload = useCallback(async (taskId, fileName) => {
    try {
      console.log('İndirme isteği:', { taskId, fileName });
      
      // Önce dosyanın var olup olmadığını kontrol et
      const checkResponse = await axios.get(
        `http://localhost:5000/api/ProjectTasks/${taskId}/files/${encodeURIComponent(fileName)}/path`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Dosya path kontrolü:', checkResponse.data);
      
      if (!checkResponse.data.Exists) {
        alert(`Dosya bulunamadı: ${fileName}`);
        return;
      }

      // Dosyayı indir
      const response = await axios.get(
        `http://localhost:5000/api/ProjectTasks/${taskId}/files/${encodeURIComponent(fileName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Blob'u indirilebilir link haline getir
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Dosya başarıyla indirildi:', fileName);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      if (error.response?.status === 404) {
        alert(`Dosya bulunamadı: ${fileName}. Dosya silinmiş olabilir.`);
      } else {
        alert(`Dosya indirme hatası: ${error.response?.data?.message || error.message}`);
      }
    }
  }, [token]);

  // Dosya yükleme - geliştirilmiş
  const handleMultipleFileUpload = useCallback(async (taskId, files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [taskId]: true }));

    try {
      // Mevcut task'ı bul
      let currentTask = null;
      for (const process of projectProcesses) {
        const task = process.tasks.find(t => t.id === taskId);
        if (task) {
          currentTask = task;
          break;
        }
      }

      if (!currentTask) {
        throw new Error('Task bulunamadı');
      }

      // Mevcut dosya path'lerini al
      const currentFilePaths = currentTask.filePath || [];
      
      // Yeni dosyalar için path'ler oluştur
      const newFilePaths = Array.from(files).map((file, index) => 
        `uploads/${Date.now()}_${index}_${file.name}`
      );

      // Tüm dosya path'lerini birleştir
      const allFilePaths = [...currentFilePaths, ...newFilePaths];

      // Task'ı güncelle
      const updateDto = {
        status: currentTask.status,
        startDate: currentTask.startDate ? new Date(currentTask.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: currentTask.assignedUserId,
        endDate: currentTask.endDate ? new Date(currentTask.endDate).toISOString() : null,
        description: currentTask.description || "",
        filePath: allFilePaths,
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskId}`, updateDto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Task'ı backend'den tekrar al (güncel fileNames için)
      const refreshedTask = await refreshTaskFiles(taskId);
      if (refreshedTask) {
        // State'i güncelle
        setProjectProcesses(prev => prev.map(process => ({
          ...process,
          tasks: process.tasks.map(task => {
            if (task.id === taskId) {
              return { 
                ...task, 
                filePath: refreshedTask.filePath,
                fileNames: refreshedTask.fileNames // Backend'den gelen güncel fileNames
              };
            }
            return task;
          })
        })));
      }

      alert(`${files.length} dosya başarıyla yüklendi!`);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yükleme hatası: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFiles(prev => ({ ...prev, [taskId]: false }));
    }
  }, [token, projectProcesses, currentUserId, refreshTaskFiles]);

  // Dosya silme - state güncellemesi düzeltildi
  const handleFileDelete = useCallback(async (taskId, fileName) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinizden emin misiniz?`)) return;

    try {
      // Mevcut task'ı bul
      let currentTask = null;
      for (const process of projectProcesses) {
        const task = process.tasks.find(t => t.id === taskId);
        if (task) {
          currentTask = task;
          break;
        }
      }

      if (!currentTask) {
        alert('Task bulunamadı');
        return;
      }

      // Silinecek dosyayı path listesinden çıkar
      const updatedFilePaths = (currentTask.filePath || []).filter(path => {
        // FileHelper.ExtractOriginalFileName mantığını kullan
        const pathParts = path.split('/').pop().split('_');
        const extractedFileName = pathParts.length >= 3 ? pathParts.slice(2).join('_') : path;
        return extractedFileName !== fileName;
      });

      console.log('Silme işlemi:', {
        fileName,
        currentPaths: currentTask.filePath,
        updatedPaths: updatedFilePaths
      });

      // Task'ı güncelle
      const updateDto = {
        status: currentTask.status,
        startDate: currentTask.startDate ? new Date(currentTask.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: currentTask.assignedUserId,
        endDate: currentTask.endDate ? new Date(currentTask.endDate).toISOString() : null,
        description: currentTask.description || "",
        filePath: updatedFilePaths,
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskId}`, updateDto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Task'ı backend'den tekrar al (güncel fileNames için)
      const refreshedTask = await refreshTaskFiles(taskId);
      if (refreshedTask) {
        // State'i güncelle
        setProjectProcesses(prev => prev.map(process => ({
          ...process,
          tasks: process.tasks.map(task => {
            if (task.id === taskId) {
              return { 
                ...task, 
                filePath: refreshedTask.filePath,
                fileNames: refreshedTask.fileNames // Backend'den gelen güncel fileNames
              };
            }
            return task;
          })
        })));
        
        alert('Dosya başarıyla silindi!');
      } else {
        // Fallback - refresh edilemezse manuel güncelleme
        setProjectProcesses(prev => prev.map(process => ({
          ...process,
          tasks: process.tasks.map(task => {
            if (task.id === taskId) {
              // Manuel fileNames hesaplama
              const newFileNames = updatedFilePaths.map(path => {
                const pathParts = path.split('/').pop().split('_');
                return pathParts.length >= 3 ? pathParts.slice(2).join('_') : path;
              });
              return { 
                ...task, 
                filePath: updatedFilePaths,
                fileNames: newFileNames
              };
            }
            return task;
          })
        })));
        
        alert('Dosya silindi!');
      }

    } catch (error) {
      console.error('Dosya silme hatası:', error);
      alert('Dosya silme hatası: ' + (error.response?.data?.message || error.message));
    }
  }, [projectProcesses, token, currentUserId, refreshTaskFiles]);

  // Dosya simgesi belirleme fonksiyonu
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const icons = {
      pdf: '📄',
      doc: '📄',
      docx: '📄',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      txt: '📝',
      zip: '📦',
      rar: '📦'
    };
    return icons[extension] || '📎';
  };

  // Kullanıcı ismini id'den almak için yardımcı fonksiyon
  const getUserNameById = useCallback((id) => {
    const u = users.find(u => u.id === id);
    return u ? u.name : "Atanmamış";
  }, [users]);

  // Kullanıcıları API'den çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Kullanıcılar alınamadı", error);
      }
    };

    fetchUsers();
  }, [token]);

  // Process atamasını değiştirme fonksiyonu
  const handleProcessReassign = useCallback(async (newUserIdStr) => {
    const newUserId = parseInt(newUserIdStr);
    if (!processToReassign) return;

    try {
      // Process'in tüm görevlerini yeni kullanıcıya ata
      const updatePromises = processToReassign.tasks.map(task => {
        return axios.put(`http://localhost:5000/api/projectTasks/${task.id}`, {
          status: task.status || "NotStarted",
          startDate: task.startDate ? new Date(task.startDate).toISOString() : new Date().toISOString(),
          assignedUserId: newUserId,
          endDate: task.endDate ? new Date(task.endDate).toISOString() : null,
          description: task.description || "",
          filePath: task.filePath || [],
          updatedByUserId: currentUserId,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });

      await Promise.all(updatePromises);

      // State'i güncelle
      setProjectProcesses(prevProcesses =>
        prevProcesses.map(process => 
          process.processId === processToReassign.processId
            ? {
                ...process,
                assignedUser: getUserNameById(newUserId),
                tasks: process.tasks.map(task => ({ ...task, assignedUserId: newUserId }))
              }
            : process
        )
      );

      setProcessAssignModalOpen(false);
      setProcessToReassign(null);
      setSelectedUserId(null);

      alert("Process ataması başarıyla değiştirildi!");
    } catch (err) {
      alert("Process ataması değiştirilemedi");
      console.error("API HATASI:", err);
    }
  }, [processToReassign, token, currentUserId, getUserNameById]);

  // Orijinal API çağrı mantığını koruyarak optimize et
  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // 1. Proje adı
      const projectRes = await axios.get(
        `http://localhost:5000/api/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjectName(projectRes.data.name);

      // 2. ProjectTasks verisi
      const projectTasksRes = await axios.get(
        `http://localhost:5000/api/ProjectTasks/by-project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Gruplandır
      const grouped = {};
      for (const task of projectTasksRes.data) {
        const processId = task.processId;
        if (!grouped[processId]) grouped[processId] = [];
        grouped[processId].push(task);
      }

      // Her process için detayları getir
      const result = await Promise.all(
        Object.entries(grouped).map(async ([processId, tasks]) => {
          let processName = "";
          let assignedUser = "";
          let processCreatedDate = "";

          // Process bilgisi
          try {
            const processRes = await axios.get(
              `http://localhost:5000/api/processes/${processId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            processName = processRes.data.name;
          } catch (err) {
            console.error(`Process ${processId} alınamadı:`, err);
          }

          // ProcessTasks tablosundan en erken tarihi al
          const earliestTask = tasks.reduce((earliest, task) => {
            if (!earliest || (task.createdAt && task.createdAt < earliest.createdAt)) {
              return task;
            }
            return earliest;
          }, null);

          processCreatedDate = earliestTask?.createdAt || "";

          // User bilgisi (ilk atanan)
          try {
            const firstAssigned = tasks.find(t => t.assignedUserId);
            if (firstAssigned) {
              const userRes = await axios.get(
                `http://localhost:5000/api/users/${firstAssigned.assignedUserId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              assignedUser = userRes.data.name;
            }
          } catch (err) {
            console.error("User bilgisi alınamadı:", err);
          }

          // Task detayları
          const tasksWithNames = await Promise.all(
            tasks.map(async (task) => {
              try {
                const taskRes = await axios.get(
                  `http://localhost:5000/api/tasks/${task.taskId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                return { 
                  ...task, 
                  task: taskRes.data,
                  // filePath ve fileNames backend'den geliyor
                };
              } catch (err) {
                console.error(`Task ${task.taskId} alınamadı:`, err);
                return { 
                  ...task, 
                  task: { title: "Bilinmeyen Görev" }
                };
              }
            })
          );

          // Sırala
          const sortedTasks = tasksWithNames.sort((a, b) =>
            (a.task.order || 0) - (b.task.order || 0)
          );

          return {
            processId,
            processName,
            assignedUser,
            processCreatedDate,
            tasks: sortedTasks,
          };
        })
      );
      setProjectProcesses(result);
    } catch (err) {
      console.error("Veriler alınamadı", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  // Filtrelenmiş süreçler - memoized
  const filteredProcesses = useMemo(() => {
    let filtered = projectProcesses;

    if (searchFilters.processName) {
      filtered = filtered.filter(process =>
        process.processName.toLowerCase().includes(searchFilters.processName.toLowerCase())
      );
    }

    if (searchFilters.taskName || searchFilters.status || searchFilters.startDate || searchFilters.endDate) {
      filtered = filtered.map(process => ({
        ...process,
        tasks: process.tasks.filter(task => {
          const matchesTaskName = !searchFilters.taskName ||
            task.task?.title.toLowerCase().includes(searchFilters.taskName.toLowerCase());
          const matchesStatus = !searchFilters.status || task.status === searchFilters.status;
          const matchesStartDate = !searchFilters.startDate ||
            (task.startDate && task.startDate.split('T')[0] >= searchFilters.startDate);
          const matchesEndDate = !searchFilters.endDate ||
            (task.endDate && task.endDate.split('T')[0] <= searchFilters.endDate);

          return matchesTaskName && matchesStatus && matchesStartDate && matchesEndDate;
        })
      })).filter(process => process.tasks.length > 0);
    }

    return filtered;
  }, [projectProcesses, searchFilters]);

  // İstatistikler - memoized
  const calculateStatusStats = useCallback((tasks) => {
    if (!tasks.length) return { notStarted: 100, inProgress: 0, completed: 0, cancelled: 0 };

    const total = tasks.length;
    const stats = Object.keys(statusConfig).reduce((acc, status) => {
      acc[status.toLowerCase()] = tasks.filter(t => t.status === status).length;
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(stats).map(([key, count]) => [key, Math.round((count / total) * 100)])
    );
  }, [statusConfig]);

  const projectStats = useMemo(() => {
    const allTasks = filteredProcesses.flatMap(p => p.tasks);
    return calculateStatusStats(allTasks);
  }, [filteredProcesses, calculateStatusStats]);

  // Event handlers
  const handleFilterChange = useCallback((key, value) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({
      processName: "", taskName: "", status: "", startDate: "", endDate: ""
    });
  }, []);

  const handleComplete = useCallback(async (task) => {
    try {
      const dto = {
        status: task.status,
        startDate: task.startDate,
        assignedUserId: task.assignedUserId,
        endDate: task.endDate || null,
        description: task.description,
        filePath: task.filePath || [],
        updatedByUserId: currentUserId,
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${task.id}`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Görev başarıyla güncellendi");
    } catch (err) {
      console.error("Güncelleme hatası:", err.response?.data || err.message);
    }
  }, [currentUserId, token]);

  const handleReassign = useCallback(async (newUserIdStr) => {
    const newUserId = parseInt(newUserIdStr);
    if (!taskToReassign) return;

    try {
      const payload = {
        status: taskToReassign.status || "NotStarted",
        startDate: taskToReassign.startDate ? new Date(taskToReassign.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: newUserId,
        endDate: taskToReassign.endDate ? new Date(taskToReassign.endDate).toISOString() : null,
        description: taskToReassign.description || "",
        filePath: taskToReassign.filePath || [],
        updatedByUserId: taskToReassign.assignedUserId || 1,
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskToReassign.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Sadece ilgili görevde assignedUserId bilgisini güncelle
      setProjectProcesses(prevProcesses =>
        prevProcesses.map(process => ({
          ...process,
          tasks: process.tasks.map(task =>
            task.id === taskToReassign.id
              ? { ...task, assignedUserId: newUserId }
              : task
          )
        }))
      );

      setAssignModalOpen(false);
      setTaskToReassign(null);
      setSelectedUserId(null);

      alert("Atama başarıyla değiştirildi ve liste güncellendi.");
    } catch (err) {
      alert("Atama değiştirilemedi");
      console.error("API HATASI:", err);
    }
  }, [taskToReassign, token]);

  const updateTaskInState = useCallback((taskId, updates) => {
    setProjectProcesses(prev =>
      prev.map(p => ({
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }))
    );
  }, []);

  const formatDate = useCallback((dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('tr-TR') : "Belirtilmemiş";
  }, []);

  // Effects
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // StatusBar component
  const StatusBar = ({ stats, size = "md", showLabels = true }) => (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {Object.entries(statusConfig).map(([key, config]) => {
            const statKey = key.toLowerCase();
            return (
              <Text key={key} size="xs" style={{ color: config.color }}>
                {config.label}: {stats[statKey] || 0}%
              </Text>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        {Object.entries(statusConfig).map(([key, config]) => {
          const statKey = key.toLowerCase();
          return (
            <div key={key} style={{ flex: 1 }}>
              <Progress value={stats[statKey] || 0} color={config.color} size={size} />
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[400px] flex items-center justify-center bg-[#effafc]">
        <Stack align="center" spacing="md">
          <div className="w-10 h-10 rounded-full animate-spin border-3 border-[#d6f3f7] border-t-[#279ab3]" />
          <Text size="lg" color="dimmed">Yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  // Process Cards View
  if (!selectedProcess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header
          title="Süreçler"
          subtitle={`${projectName}`}
          icon={IconCalendar}
          stats={projectStats}
          showStats={true}
        />

        <div className="px-6 py-4">
          <FilterAndSearch
            searchFilters={searchFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filtersConfig={[
              {key:"processName", type:"text", placeholder: "Süreç adına göre ara..."},
              {key:"startDate", type:"date"},
              {key:"endDate", type:"date"}
            ]}
          />

          <Grid gutter="xl">
            {filteredProcesses
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((process) => {
                const processStats = calculateStatusStats(process.tasks);
                const completedTasks = process.tasks.filter(t => t.status === 'Completed').length;
                const totalTasks = process.tasks.length;
                const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <Grid.Col key={process.processId} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card
                      withBorder
                      padding="lg"
                      radius="xl"
                      className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white border-gray-200"
                      style={{ 
                        height: 400,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => setSelectedProcess(process)}
                    >
                      {/* Header Section - Sabit yükseklik */}
                      <div className="flex justify-between items-start mb-4" style={{ minHeight: '80px' }}>
                        <div className="flex-1 overflow-hidden">
                          <Title 
                            order={3} 
                            className="text-[#1e293b] font-bold leading-tight"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: '1.3',
                              maxHeight: '2.6em',
                              marginBottom: '8px'
                            }}
                            title={process.processName} // Tooltip için tam metin
                          >
                            {process.processName}
                          </Title>
                          <Badge 
                            size="lg" 
                            variant="light" 
                            color="blue"
                          >
                            {completionPercentage}% Tamamlandı
                          </Badge>
                        </div>
                      </div>

                      <Divider color="gray.3" className="mb-4" />

                      {/* Info Section - Esnek büyüme */}
                      <div className="flex-1 flex flex-col justify-between">
                        <Stack spacing="sm">
                          <Paper 
                            padding="sm" 
                            radius="md" 
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                          >
                            <Group spacing="xs" align="center">
                              <IconCalendar size={16} />
                              <Text size="sm" color="ivosis.6" weight={500}>
                                Oluşturulma: {formatDate(process.processCreatedDate)}
                              </Text>
                            </Group>
                          </Paper>

                          <Paper 
                            padding="sm" 
                            radius="md" 
                          >
                            <Group spacing="xs" align="center" position="apart">
                              <Group spacing="xs" className="flex-1 min-w-0">
                                <IconUsers size={16} />
                                <Text 
                                  size="sm" 
                                  weight={500}
                                  className="truncate"
                                  title={process.assignedUser}
                                >
                                  Atanan: {process.assignedUser}
                                </Text>
                              </Group>
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<IconEdit size={12} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProcessToReassign(process);
                                  setProcessAssignModalOpen(true);
                                }}
                                className="flex-shrink-0"
                              >
                                Değiştir
                              </Button>
                            </Group>
                          </Paper>

                          <div className="grid grid-cols-1 gap-3">
                            <Paper 
                              padding="sm" 
                              radius="md" 
                              className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100"
                            >
                              <Group spacing="xs" align="center" position="center">
                                <Text size="lg" weight={700} color="#7c3aed">
                                  {totalTasks}
                                </Text>
                                <Text size="xs" color="#7c3aed">
                                  Toplam Görev
                                </Text>
                              </Group>
                            </Paper>
                          </div>
                        </Stack>

                        {/* Progress Section - Alt kısma sabitlendi */}
                        <div className="mt-4">
                          <Text size="sm" weight={600} color="#475569" className="mb-3">
                            İlerleme Durumu
                          </Text>
                          <StatusBar stats={processStats} size="lg" showLabels={false} />
                          <div className="flex justify-between mt-2">
                            <Text size="xs" color="#64748b">Başlangıç</Text>
                            <Text size="xs" color="#64748b">Tamamlanma</Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Grid.Col>
                );
              })}
          </Grid>

          {/* Pagination Component for Process Cards */}
          <PaginationComponent
            totalItems={filteredProcesses.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[3, 6, 9, 12]}
            itemName="süreç"
          />

          {filteredProcesses.length === 0 && (
            <Paper 
              shadow="lg" 
              padding="xl" 
              radius="xl" 
              className="text-center mt-8 bg-white"
            >
              <div className="py-8">
                <Text size="xl" color="#64748b" weight={600} className="mb-4">
                  🔍 Arama kriterlerinize uygun süreç bulunamadı
                </Text>
                <Text size="md" color="#94a3b8" className="mb-6">
                  Farklı filtreler deneyebilir veya mevcut filtreleri temizleyebilirsiniz.
                </Text>
                <Button 
                  variant="gradient" 
                  gradient={{ from: '#279ab3', to: '#1d7a8c' }}
                  onClick={clearFilters} 
                  size="md"
                  radius="xl"
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </Paper>
          )}
        </div>

        {/* Process Assign Modal */}
        <Modal
          opened={processAssignModalOpen}
          onClose={() => {
            setProcessAssignModalOpen(false);
            setProcessToReassign(null);
            setSelectedUserId(null);
          }}
          title="Süreç Atamasını Değiştir"
          centered
          size="md"
          radius="lg"
        >
          {processToReassign && (
            <Stack spacing="lg">
              <div>
                <Text size="sm" weight={500} className="mb-2">
                  <span className="font-bold text-blue-600">Süreç: </span> 
                  {processToReassign.processName}
                </Text>
                <Text size="xs" color="dimmed">
                  Bu süreçteki tüm görevler yeni kullanıcıya atanacaktır.
                </Text>
              </div>
              
              <Select
                label="Yeni Atanan Kullanıcı"
                placeholder="Kullanıcı Seçin"
                data={users.map(u => ({ value: u.id.toString(), label: u.name }))}
                value={selectedUserId}
                onChange={setSelectedUserId}
                searchable
                nothingFound="Kullanıcı bulunamadı"
                radius="md"
              />
              
              <Group position="right" spacing="sm">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => {
                    setProcessAssignModalOpen(false);
                    setProcessToReassign(null);
                    setSelectedUserId(null);
                  }}
                  radius="md"
                >
                  İptal
                </Button>
                <Button
                  onClick={() => selectedUserId && handleProcessReassign(selectedUserId)}
                  disabled={!selectedUserId}
                  variant="gradient"
                  gradient={{ from: '#279ab3', to: '#24809c' }}
                  radius="md"
                >
                  Atamayı Kaydet
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
      </div>
    );
  }

  // Task Details View
  const currentProcess = filteredProcesses.find(p => p.processId === selectedProcess.processId);
  if (!currentProcess) return null;

  const processStats = calculateStatusStats(currentProcess.tasks);
  const paginatedTasks = currentProcess.tasks.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  const getEndDate = (task) => {
  if (task.endDate) return task.endDate.split("T")[0];
  if (task.startDate) {
    const start = new Date(task.startDate);
    start.setDate(start.getDate() + 15);
    return start.toISOString().split("T")[0];
  }
    return "";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={currentProcess.processName}
        subtitle={`${projectName} Görevleri`}
        stats={processStats}
        showStats={true}
      />

      <div className="px-4">
        <FilterAndSearch
            searchFilters={searchFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filtersConfig={[
              { key: "taskName", type: "text", placeholder: "Görev adına göre ara..." },
              {
                key: "status",
                type: "select",
                placeholder: "Durum seçin...",
                options: [
                  { value: "", label: "Tümü" },
                  { value: "NotStarted", label: "Başlamadı" },
                  { value: "InProgress", label: "Devam Ediyor" },
                  { value: "Completed", label: "Tamamlandı" },
                  { value: "Cancelled", label: "İptal Edildi" },
                ],
              },
              { key: "startDate", type: "date" },
              { key: "endDate", type: "date" }
            ]}
          />
        
        <div className="flex justify-start mb-5">
          <Button
            onClick={() => setSelectedProcess(null)}
            className="bg-gradient-to-r from-[#279ab3] to-[#1d7a8c] text-white hover:from-[#1d7a8c] hover:to-[#155b6b]"
          >
            <IconArrowLeft size={20} />
            Süreçler
          </Button>
        </div>

        <Grid gutter="lg">
          {paginatedTasks.map((task) => (
              <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  withBorder
                  padding="md"
                  style={{ height: CARD_HEIGHT }}
                  className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200"
                  shadow="sm"
                  radius="lg"
                >
                  
                  <Stack spacing="sm" className="h-full">
                    <Group position="apart" align="flex-start">
                      {/* Görev Başlığı */}
                      <Text size="sm" weight={500} className="flex-1" style={{ color: '#112d3b' }}>
                       {task.task?.title || "Görev Adı Yok"}
                    </Text>
                      {/* Görev Status */}
                    <Badge color="cyan" size="sm" variant="light" radius="sm">
                      {getStatusLabel(task.status)}
                    </Badge>
                    </Group>
                    
                    <Group position="apart">
                      {/* Atanan Kullanıcı */}
                      <Text size="xs" color="#279ab3" weight={500}>
                      👤 Atanan: {getUserNameById(task.assignedUserId)}
                    </Text>
                    {/* Atanan Kullanıcı Değiştirme Butonu */}
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => {
                        setTaskToReassign(task);
                        setAssignModalOpen(true);
                      }}
                    >
                      Atamayı Değiştir
                    </Button>
                    </Group>

                    <Stack spacing="xs">
                      <Paper padding="xs" className="bg-[#e3f2fd]">
                        <Text size="xs" color="#1976d2" weight={500}>🏢 Proje: {projectName}</Text>
                      </Paper>
                      <Paper padding="xs" className="bg-[#f3e5f5]">
                        <Text size="xs" color="#7b1fa2" weight={500}>⚙️ Süreç: {currentProcess.processName}</Text>
                      </Paper>
                    </Stack>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text size="xs" color="#007bff" className="mb-1">📅 Başlangıç</Text>
                        <input
                          type="date"
                          value={task.startDate?.split("T")[0] || ""}
                          readOnly
                          className="w-full px-2 py-1.5 border border-[#ced4da] rounded text-xs bg-[#f8f9fa] text-[#007bff]"
                        />
                      </div>
                      <div>
                        <Text size="xs" color="#007bff" className="mb-1">🎯 Bitiş</Text>
                        <input
  type="date"
  value={getEndDate(task)}
  onChange={(e) =>
    updateTaskInState(task.id, { endDate: e.target.value })
  }
  className="w-full px-2 py-1.5 border border-[#ced4da] rounded text-xs bg-[#f8f9fa] text-[#007bff]"
/>
                      </div>
                    </div>

                    <Select
                      size="sm"
                      placeholder="Durum Seçin"
                      value={task.status}
                      onChange={(value) => updateTaskInState(task.id, { status: value })}
                      data={[
                        { value: "NotStarted", label: "Başlamadı" },
                        { value: "InProgress", label: "Devam Ediyor" },
                        { value: "Completed", label: "Tamamlandı" },
                        { value: "Cancelled", label: "İptal Edildi" },
                      ]}
                    />

                    <Textarea
                      size="sm"
                      placeholder="Görev notları ve açıklamaları..."
                      value={task.description || ""}
                      onChange={(e) => updateTaskInState(task.id, { description: e.target.value })}
                      minRows={2}
                      maxRows={2}
                    />

                    {/* Dosya Yönetimi - Backend FileNames ile senkronize */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Text size="xs" color="#007bff" weight={500}>📎 Dosyalar</Text>
                        <Badge size="xs" color="blue" variant="light">
                          {task.fileNames?.length || 0}
                        </Badge>
                      </div>
                      
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                        onChange={(e) => handleMultipleFileUpload(task.id, e.target.files)}
                        className="w-full text-xs p-1.5 border border-[#ced4da] rounded bg-white hover:bg-gray-50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={uploadingFiles[task.id]}
                      />
                      
                      {uploadingFiles[task.id] && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                          <Text size="xs" color="blue">Dosyalar yükleniyor...</Text>
                        </div>
                      )}

                      {/* Backend'den gelen dosya adları */}
                      {task.fileNames && task.fileNames.length > 0 && (
                        <div className="max-h-24 overflow-y-auto bg-gray-50 rounded p-2 space-y-1">
                          {task.fileNames.map((fileName, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded px-2 py-1 shadow-sm">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="text-xs">{getFileIcon(fileName)}</span>
                                <Text size="xs" className="truncate" title={fileName}>
                                  {fileName}
                                </Text>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tooltip label="İndir">
                                  <ActionIcon
                                    size="xs"
                                    color="blue"
                                    variant="light"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFileDownload(task.id, fileName);
                                    }}
                                  >
                                    <IconDownload size={12} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Sil">
                                  <ActionIcon
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFileDelete(task.id, fileName);
                                    }}
                                  >
                                    <IconX size={12} />
                                  </ActionIcon>
                                </Tooltip>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleComplete(task)}
                      className="border-0 mt-auto"
                      style={{ background: 'linear-gradient(135deg, #279ab3 0%, #1d7a8c 100%)' }}
                      loading={uploadingFiles[task.id]}
                    >
                      Güncelle
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
        </Grid>

        {/* Pagination Component for Tasks */}
        <PaginationComponent
          totalItems={currentProcess.tasks.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[3, 6, 9, 12, 15]}
          itemName="görev"
        />

        {/* Task Listeleri Boşsa */}
        {paginatedTasks.length === 0 && !loading && (
          <Paper 
            shadow="md" 
            padding="xl" 
            className="text-center mt-8 bg-white"
            radius="lg"
          >
            <div className="py-8">
              <Text size="xl" color="#64748b" weight={600} className="mb-4">
                🔍 Bu süreçte görev bulunamadı
              </Text>
              <Text size="md" color="#94a3b8" className="mb-6">
                Arama kriterlerinizi değiştirmeyi deneyebilirsiniz.
              </Text>
              <Button 
                variant="gradient" 
                gradient={{ from: '#279ab3', to: '#1d7a8c' }}
                onClick={clearFilters} 
                size="md"
                radius="xl"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </Paper>
        )}
      </div>
      
      {/* Task Assignment Modal */}
      <Modal
        opened={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setTaskToReassign(null);
          setSelectedUserId(null);
        }}
        title="Yeni Görevli Atama"
        centered
        size="sm"
        radius="lg"
      >
        {taskToReassign && (
          <Stack spacing="lg">
            <div>
              <Text size="sm" weight={500} className="mb-2">
                <span className="font-bold text-blue-600">Görev: </span> 
                {taskToReassign.task?.title}
              </Text>
              <Text size="xs" color="dimmed">
                Bu görevi yeni bir kullanıcıya atayabilirsiniz.
              </Text>
            </div>
            
            <Select
              label="Atamayı Değiştir"
              placeholder="Kullanıcı Seçin"
              data={users.map(u => ({ value: u.id.toString(), label: u.name }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              searchable
              nothingFound="Kullanıcı bulunamadı"
              radius="md"
            />
            
            <Group position="right" spacing="sm">
              <Button
                variant="outline"
                color="red"
                onClick={() => {
                  setAssignModalOpen(false);
                  setTaskToReassign(null);
                  setSelectedUserId(null);
                }}
                radius="md"
              >
                İptal
              </Button>
              <Button
                onClick={() => selectedUserId && handleReassign(selectedUserId)}
                disabled={!selectedUserId}
                variant="gradient"
                gradient={{ from: '#279ab3', to: '#24809c' }}
                radius="md"
              >
                Atamayı Kaydet
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default ProjectTasks;