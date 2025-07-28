import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  Select, Textarea, Card, Text, Group, Stack, Badge, Button, 
  Progress, Pagination, Grid, Paper, Title, Divider, 
  Modal, ActionIcon, Tooltip
} from "@mantine/core";
import { IconCalendar, IconArrowLeft, IconUsers, IconClock, IconEdit, IconDownload, IconX } from '@tabler/icons-react';
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";

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

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 600; // Increased height for file management
  
  // Cache edilmiş veriler
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);
  const currentUserId = user?.id || 1;
  const projectId = localStorage.getItem("selectedProjectId");
  const token = localStorage.getItem("token");

  // Status helper functions - memoized
  const statusConfig = useMemo(() => ({
    NotStarted: { label: "Başlamadı", color: "#7ed2e2" },
    InProgress: { label: "Devam Ediyor", color: "#ffd43b" },
    Completed: { label: "Tamamlandı", color: "#51cf66" },
    Cancelled: { label: "İptal Edildi", color: "#ff6b6b" }
  }), []);

  const getStatusLabel = useCallback((status) => statusConfig[status]?.label || status, [statusConfig]);

  // Dosya formatını normalize et - MyTasks'ten alınan fonksiyon
  const normalizeFiles = useCallback((filePath) => {
    if (!filePath) return [];
    
    try {
      if (typeof filePath === 'string') {
        // JSON string ise parse et
        if (filePath.startsWith('[') || filePath.startsWith('{')) {
          const parsed = JSON.parse(filePath);
          return Array.isArray(parsed) ? parsed : [parsed];
        }
        // Basit string ise dosya olarak kabul et
        return [{ name: filePath, url: filePath, path: filePath }];
      }
      
      if (Array.isArray(filePath)) {
        return filePath.map(file => {
          if (typeof file === 'string') {
            return { name: file, url: file, path: file };
          }
          return file;
        });
      }
      
      return [filePath];
    } catch (e) {
      console.warn('Dosya formatı parse edilemedi:', e);
      return [];
    }
  }, []);

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

  // Çoklu dosya yükleme fonksiyonu
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

      // Mevcut dosyaları al
      const currentFiles = currentTask.files || [];
      
      // Yeni dosyalar için simülasyon (gerçek implementasyonda backend'e upload edilecek)
      const newFiles = Array.from(files).map((file, index) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        path: `uploads/${Date.now()}_${index}_${file.name}`,
        url: `http://localhost:5000/uploads/${Date.now()}_${index}_${file.name}`
      }));

      // Tüm dosyaları birleştir
      const allFiles = [...currentFiles, ...newFiles];
      const filePaths = allFiles.map(file => file.url || file.path || file.name);

      // Task'ı güncelle
      const updateDto = {
        status: currentTask.status,
        startDate: currentTask.startDate ? new Date(currentTask.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: currentTask.assignedUserId,
        endDate: currentTask.endDate ? new Date(currentTask.endDate).toISOString() : null,
        description: currentTask.description || "",
        filePath: filePaths,
        updatedByUserId: currentUserId
      };

      console.log('Dosya yükleme payload:', updateDto);

      await axios.put(`http://localhost:5000/api/projectTasks/${taskId}`, updateDto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // State'i güncelle
      setProjectProcesses(prev => prev.map(process => ({
        ...process,
        tasks: process.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, files: allFiles };
          }
          return task;
        })
      })));

      alert(`${newFiles.length} dosya başarıyla yüklendi ve task güncellendi!`);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yükleme hatası: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFiles(prev => ({ ...prev, [taskId]: false }));
    }
  }, [token, projectProcesses, currentUserId]);

  // Dosya silme fonksiyonu
  const handleFileDelete = useCallback(async (taskId, fileIndex) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;

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

      if (!currentTask) return;

      // Dosyayı listeden çıkar
      const updatedFiles = currentTask.files.filter((_, index) => index !== fileIndex);
      const filePaths = updatedFiles.map(file => file.url || file.path || file.name);

      // Task'ı güncelle
      const updateDto = {
        status: currentTask.status,
        startDate: currentTask.startDate ? new Date(currentTask.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: currentTask.assignedUserId,
        endDate: currentTask.endDate ? new Date(currentTask.endDate).toISOString() : null,
        description: currentTask.description || "",
        filePath: filePaths,
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskId}`, updateDto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // State'i güncelle
      setProjectProcesses(prev => prev.map(process => ({
        ...process,
        tasks: process.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, files: updatedFiles };
          }
          return task;
        })
      })));

      alert('Dosya silindi ve task güncellendi!');
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      alert('Dosya silme hatası: ' + (error.response?.data?.message || error.message));
    }
  }, [projectProcesses, token, currentUserId]);

  // Dosya indirme fonksiyonu
  const handleFileDownload = useCallback((file) => {
    const link = document.createElement('a');
    link.href = file.url || file.path || file.name;
    link.download = file.name || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
        // Dosya path'lerini hazırla
        const filePaths = task.files ? task.files.map(file => {
          return file.url || file.path || file.name;
        }) : [];

        return axios.put(`http://localhost:5000/api/projectTasks/${task.id}`, {
          status: task.status || "NotStarted",
          startDate: task.startDate ? new Date(task.startDate).toISOString() : new Date().toISOString(),
          assignedUserId: newUserId,
          endDate: task.endDate ? new Date(task.endDate).toISOString() : null,
          description: task.description || "",
          filePath: filePaths,
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
          console.log("ProcessTasks'ten alınan tarih: ", processCreatedDate);

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
                
                // Dosya bilgilerini normalize et
                const files = normalizeFiles(task.filePath);

                return { 
                  ...task, 
                  task: taskRes.data,
                  files: files
                };
              } catch (err) {
                console.error(`Task ${task.taskId} alınamadı:`, err);
                return { 
                  ...task, 
                  task: { title: "Bilinmeyen Görev" },
                  files: normalizeFiles(task.filePath)
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
  }, [projectId, token, normalizeFiles]);

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
      // Dosya path'lerini hazırla
      const filePaths = task.files ? task.files.map(file => {
        return file.url || file.path || file.name;
      }) : [];

      const dto = {
        status: task.status,
        startDate: task.startDate,
        assignedUserId: task.assignedUserId,
        endDate: task.endDate || null,
        description: task.description,
        filePath: filePaths,
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
      // Dosya path'lerini hazırla
      const filePaths = taskToReassign.files ? taskToReassign.files.map(file => {
        return file.url || file.path || file.name;
      }) : [];

      const payload = {
        status: taskToReassign.status || "NotStarted",
        startDate: taskToReassign.startDate ? new Date(taskToReassign.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: newUserId,
        endDate: taskToReassign.endDate ? new Date(taskToReassign.endDate).toISOString() : null,
        description: taskToReassign.description || "",
        filePath: filePaths,
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

  // Process Cards View - Yenilenmiş Tasarım
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
            {filteredProcesses.map((process) => {
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
                    className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white border-gray-200 "
                    style={{ 
                      height: 360,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    onClick={() => setSelectedProcess(process)}
                  >
                    <Stack spacing="md" style={{ height: '100%' }}>
                      {/* Header Section */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Title order={3} className="text-[#1e293b] mb-2 font-bold">
                            {process.processName}
                          </Title>
                          <Badge 
                            size="lg" 
                            variant="light" 
                            color="blue"
                            className="mb-3"
                          >
                            {completionPercentage}% Tamamlandı
                          </Badge>
                        </div>
                      </div>

                      <Divider color="gray.3" />

                      {/* Info Section */}
                      <Stack spacing="sm">
                        <Paper 
                          padding="sm" 
                          radius="md" 
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        >
                          <Group spacing="xs" align="center">
                            <IconCalendar size={16}  />
                            <Text size="sm" color="ivosis.6" weight={500}>
                              Oluşturulma: {formatDate(process.processCreatedDate)}
                            </Text>
                          </Group>
                        </Paper>

                        <Paper 
                          padding="sm" 
                          radius="md" 
                          className=""
                        >
                          <Group spacing="xs" align="center" position="apart">
                            <Group spacing="xs">
                              <IconUsers size={16}  />
                              <Text size="sm" weight={500}>
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
                            >
                              Değiştir
                            </Button>
                          </Group>
                        </Paper>

                        <div className="grid grid-cols-2 gap-3">
                          <Paper 
                            padding="sm" 
                            radius="md" 
                            className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100"
                          >
                            <Group spacing="xs" align="center">
                              <Text size="lg" weight={700} color="#7c3aed">
                                {totalTasks}
                              </Text>
                              <Text size="xs" color="#7c3aed">
                                Toplam Görev
                              </Text>
                            </Group>
                          </Paper>

                          <Paper 
                            padding="sm" 
                            radius="md" 
                            className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100"
                          >
                            <Group spacing="xs" align="center">
                              <IconClock size={16} color="#059669" />
                              <Text size="sm" color="#059669" weight={500}>
                                {completedTasks} Tamamlandı
                              </Text>
                            </Group>
                          </Paper>
                        </div>
                      </Stack>

                      {/* Progress Section */}
                      <div className="mt-auto">
                        <Text size="sm" weight={600} color="#475569" className="mb-3">
                          İlerleme Durumu
                        </Text>
                        <StatusBar stats={processStats} size="lg" showLabels={false} />
                        <div className="flex justify-between mt-2">
                          <Text size="xs" color="#64748b">Başlangıç</Text>
                          <Text size="xs" color="#64748b">Tamamlanma</Text>
                        </div>
                      </div>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>

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
  const totalPages = Math.ceil(currentProcess.tasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = currentProcess.tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

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
                          value={task.endDate?.split("T")[0] || ""}
                          onChange={(e) => updateTaskInState(task.id, { endDate: e.target.value })}
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

                    {/* Optimize Edilmiş Çoklu Dosya Yönetimi */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Text size="xs" color="#007bff" weight={500}>📎 Dosyalar</Text>
                        <Badge size="xs" color="blue" variant="light">
                          {task.files?.length || 0}
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
                          <Text size="xs" color="blue">Dosyalar yükleniyor ve task güncelleniyor...</Text>
                        </div>
                      )}

                      {/* Yüklenen Dosyalar Listesi */}
                      {task.files && task.files.length > 0 && (
                        <div className="max-h-24 overflow-y-auto bg-gray-50 rounded p-2 space-y-1">
                          {task.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded px-2 py-1 shadow-sm">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <span className="text-xs">{getFileIcon(file.name)}</span>
                                <Text size="xs" className="truncate" title={file.name}>
                                  {file.name}
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
                                      handleFileDownload(file);
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
                                      handleFileDelete(task.id, index);
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

         {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="md" color="ivosis.6" />
          </div>
        )}
      </div>
      
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
      >
        {taskToReassign && (
          <Stack spacing="sm">
            <Text size="sm" weight={500}>
              <span className="font-bold">Görev: </span> {taskToReassign.task?.title}
            </Text>
            <Select
              label="Atamayı Değiştir"
              placeholder="Kullanıcı Seçin"
              data={users.map(u => ({ value: u.id.toString(), label: u.name }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              searchable
              nothingFound="Kullanıcı bulunamadı"
            />
            <Button
              onClick={() => selectedUserId && handleReassign(selectedUserId)}
              disabled={!selectedUserId}
              fullWidth
              color="ivosis.6"
            >
              Atamayı Kaydet
            </Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default ProjectTasks;