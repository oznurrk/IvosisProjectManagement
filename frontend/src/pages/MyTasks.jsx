import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Select, Textarea, Text, Group, Stack, Badge, Button, Pagination, Grid, Paper, Modal, Card, ActionIcon, Tooltip } from "@mantine/core";
import { IconUser, IconCalendarUser, IconFile, IconX, IconDownload, IconEye, IconMessage } from '@tabler/icons-react';
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";
// TaskChatWidget import'unu kaldırıyoruz çünkü eksik
// import TaskChatWidget from "../components/TaskChat/TaskChat";

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

const MyTasks = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({});
  
  // Chat için state'ler
  const [activeChatTaskId, setActiveChatTaskId] = useState(null);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  
  const [searchFilters, setSearchFilters] = useState({
    projectName: "",
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 650;

  // Auth bilgileri
  const token = localStorage.getItem("token");
  const userObj = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }, []);
  const currentUserId = userObj?.id || 1;

  // Task'ı refresh etmek için
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

  // API call optimizasyonu
  const fetchTaskDetails = useCallback(async (projectTask) => {
    const [projectRes, processRes, taskRes] = await Promise.allSettled([
      axios.get(`http://localhost:5000/api/projects/${projectTask.projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`http://localhost:5000/api/processes/${projectTask.processId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get(`http://localhost:5000/api/tasks/${projectTask.taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    return {
      ...projectTask,
      projectName: projectRes.status === 'fulfilled' ? projectRes.value.data.name : "Bilinmeyen Proje",
      processName: processRes.status === 'fulfilled' ? processRes.value.data.name : "Bilinmeyen Süreç",
      taskDetails: taskRes.status === 'fulfilled' ? taskRes.value.data : { title: "Bilinmeyen Görev", description: "" },
      assignedUserName: users.find(u => u.id === projectTask.assignedUserId)?.name || "Bilinmiyor"
    };
  }, [token, users]);

  // Görevleri getir
  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const myTasksRes = await axios.get(
          "http://localhost:5000/api/ProjectTasks/my-tasks",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const tasksData = myTasksRes.data?.data || [];
        if (!Array.isArray(tasksData)) {
          setMyTasks([]);
          return;
        }

        const tasksWithDetails = await Promise.all(tasksData.map(fetchTaskDetails));
        
        const sortedTasks = tasksWithDetails.sort((a, b) => {
          if (a.projectName !== b.projectName) {
            return a.projectName.localeCompare(b.projectName);
          }
          if (a.processName !== b.processName) {
            return a.processName.localeCompare(b.processName);
          }
          return (a.taskDetails.order || 0) - (b.taskDetails.order || 0);
        });
        
        setMyTasks(sortedTasks);
      } catch (error) {
        console.error("Görevler alınamadı:", error);
        if (error.response?.status === 401) {
          alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [token, fetchTaskDetails]);

  // Kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Kullanıcılar alınamadı:", error);
      }
    };

    fetchUsers();
  }, [token]);

  // Geliştirilmiş çoklu dosya yükleme fonksiyonu
  const handleMultipleFileUpload = useCallback(async (taskId, files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [taskId]: true }));

    try {
      // Mevcut task'ı bul
      const currentTask = myTasks.find(task => task.id === taskId);
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
        setMyTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              filePath: refreshedTask.filePath,
              fileNames: refreshedTask.fileNames
            };
          }
          return task;
        }));
      }

      alert(`${files.length} dosya başarıyla yüklendi!`);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yükleme hatası: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFiles(prev => ({ ...prev, [taskId]: false }));
    }
  }, [token, myTasks, currentUserId, refreshTaskFiles]);

  // Geliştirilmiş dosya silme fonksiyonu
  const handleFileDelete = useCallback(async (taskId, fileName) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinizden emin misiniz?`)) return;

    try {
      const currentTask = myTasks.find(task => task.id === taskId);
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
        setMyTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return { 
              ...task, 
              filePath: refreshedTask.filePath,
              fileNames: refreshedTask.fileNames
            };
          }
          return task;
        }));
        
        alert('Dosya başarıyla silindi!');
      } else {
        // Fallback - refresh edilemezse manuel güncelleme
        setMyTasks(prev => prev.map(task => {
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
        }));
        
        alert('Dosya silindi!');
      }

    } catch (error) {
      console.error('Dosya silme hatası:', error);
      alert('Dosya silme hatası: ' + (error.response?.data?.message || error.message));
    }
  }, [myTasks, token, currentUserId, refreshTaskFiles]);

  // Filtrelenmiş görevler
  const filteredTasks = useMemo(() => {
    return myTasks.filter(task => {
      if (searchFilters.projectName && !task.projectName.toLowerCase().includes(searchFilters.projectName.toLowerCase())) return false;
      if (searchFilters.processName && !task.processName.toLowerCase().includes(searchFilters.processName.toLowerCase())) return false;
      if (searchFilters.taskName && !task.taskDetails.title.toLowerCase().includes(searchFilters.taskName.toLowerCase())) return false;
      if (searchFilters.status && task.status !== searchFilters.status) return false;
      if (searchFilters.startDate && task.startDate && task.startDate.split('T')[0] < searchFilters.startDate) return false;
      if (searchFilters.endDate && task.endDate && task.endDate.split('T')[0] > searchFilters.endDate) return false;
      return true;
    });
  }, [myTasks, searchFilters]);

  // Sayfalama
  const { totalPages, paginatedTasks } = useMemo(() => {
    const total = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
    const paginated = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return { totalPages: total, paginatedTasks: paginated };
  }, [filteredTasks, currentPage]);

  // İstatistikler
  const myTasksStats = useMemo(() => {
    const total = filteredTasks.length;
    if (total === 0) return { notStarted: 0, inProgress: 0, completed: 0, cancelled: 0 };

    const stats = {
      notStarted: filteredTasks.filter(t => t.status === "NotStarted").length,
      inProgress: filteredTasks.filter(t => t.status === "InProgress").length,
      completed: filteredTasks.filter(t => t.status === "Completed").length,
      cancelled: filteredTasks.filter(t => t.status === "Cancelled").length,
    };

    return {
      notStarted: Math.round((stats.notStarted / total) * 100),
      inProgress: Math.round((stats.inProgress / total) * 100),
      completed: Math.round((stats.completed / total) * 100),
      cancelled: Math.round((stats.cancelled / total) * 100),
    };
  }, [filteredTasks]);

  // Event handlers
  const handleFilterChange = useCallback((key, value) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({
      projectName: "",
      processName: "",
      taskName: "",
      status: "",
      startDate: "",
      endDate: ""
    });
    setCurrentPage(1);
  }, []);

  const updateTaskInState = useCallback((taskId, updates) => {
    setMyTasks(prev => prev.map(task => task.id === taskId ? { ...task, ...updates } : task));
  }, []);

  // Geliştirilmiş görev güncelleme fonksiyonu
  const handleUpdateTask = useCallback(async (task) => {
    try {
      const dto = {
        status: task.status,
        startDate: task.startDate ? new Date(task.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: task.assignedUserId,
        endDate: task.endDate ? new Date(task.endDate).toISOString() : null,
        description: task.description || "",
        filePath: task.filePath || [],
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${task.id}`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Görev başarıyla güncellendi");
    } catch (err) {
      console.error("Güncelleme Hatası: ", err.response?.data || err.message);
      alert("Güncelleme hatası: " + (err.response?.data?.message || err.message));
    }
  }, [token, currentUserId]);

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
        updatedByUserId: userObj?.id || 0,
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskToReassign.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyTasks(prev => prev.filter(t => t.id !== taskToReassign.id));
      setAssignModalOpen(false);
      setTaskToReassign(null);
      setSelectedUserId(null);
      alert("Atama başarıyla değiştirildi");
    } catch (err) {
      alert("Atama değiştirilemedi: " + (err.response?.data?.message || err.message));
      console.error("API HATASI:", err);
    }
  }, [taskToReassign, token, userObj]);

  // Chat için yardımcı fonksiyonlar
  const handleOpenTaskChat = useCallback((taskId) => {
    setActiveChatTaskId(taskId);
  }, []);

  const handleCloseChat = useCallback(() => {
    setActiveChatTaskId(null);
  }, []);

  // Utility functions
  const getStatusLabel = (status) => {
    const labels = {
      "NotStarted": "Başlamadı",
      "InProgress": "Devam Ediyor",
      "Completed": "Tamamlandı",
      "Cancelled": "İptal Edildi"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      "NotStarted": "#6c757d",
      "InProgress": "#fd7e14",
      "Completed": "#28a745",
      "Cancelled": "#dc3545"
    };
    return colors[status] || "#6c757d";
  };

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

  // Early returns
  if (!token || !userObj?.id) {
    return (
      <div className="p-8 text-center min-h-[400px] flex items-center justify-center bg-[#f8f9fa]">
        <Stack align="center" spacing="md">
          <IconUser size={64} color="#007bff" />
          <Text size="xl" color="#007bff" weight={500}>Lütfen Giriş Yapın</Text>
          <Text size="md" color="dimmed">Görevlerinizi görüntülemek için sisteme giriş yapmanız gerekmektedir.</Text>
        </Stack>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[400px] flex items-center justify-center bg-[#f8f9fa]">
        <Stack align="center" spacing="md">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <Text size="lg" color="dimmed">Görevleriniz yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] p-0 m-0">
      <div className="w-full">
        <Header
          title="Görevlerim"
          subtitle="Kişisel Görev Dashboard"
          icon={IconCalendarUser}
          userName={userObj?.name || 'Kullanıcı'}
          totalCount={filteredTasks.length}
          stats={myTasksStats}
          showStats={true}
          statsTitle="Görev Durumu İstatistikleri"
        />

        <div className="px-4">
          <FilterAndSearch
            searchFilters={searchFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filtersConfig={[
              { key: "projectName", type: "text", placeholder: "Proje adına göre ara..." },
              { key: "processName", type: "text", placeholder: "Süreç adına göre ara..." },
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

          {/* Chat Toggle Button - Geçici olarak devre dışı */}
          {/* <div className="mb-4 flex justify-end">
            <Button
              leftIcon={<IconMessage size={16} />}
              onClick={() => setShowGlobalChat(!showGlobalChat)}
              variant={showGlobalChat ? "filled" : "outline"}
              color="blue"
            >
              {showGlobalChat ? "Chat'i Gizle" : "Genel Chat"}
            </Button>
          </div> */}

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
                      <Text size="sm" weight={500} className="text-[#212529] leading-[1.4] flex-1">
                        {task.taskDetails?.title || 'Görev Başlığı'}
                      </Text>
                      <div className="flex gap-2">
                        <Badge style={{ backgroundColor: getStatusColor(task.status), color: 'white' }} size="sm">
                          {getStatusLabel(task.status)}
                        </Badge>
                        {/* Task-specific chat button - Geçici olarak devre dışı */}
                        {/* <Tooltip label="Görev Chat">
                          <ActionIcon
                            color="blue"
                            variant={activeChatTaskId === task.id ? "filled" : "light"}
                            onClick={() => handleOpenTaskChat(task.id)}
                          >
                            <IconMessage size={16} />
                          </ActionIcon>
                        </Tooltip> */}
                      </div>
                    </Group>
                    
                    <Group position="apart">
                      <Text size="xs" color="dimmed">👤 Atanan: {task.assignedUserName}</Text>
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
                        <Text size="xs" color="#1976d2" weight={500}>🏢 Proje: {task.projectName}</Text>
                      </Paper>
                      <Paper padding="xs" className="bg-[#f3e5f5]">
                        <Text size="xs" color="#7b1fa2" weight={500}>⚙️ Süreç: {task.processName}</Text>
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
                      onClick={() => handleUpdateTask(task)}
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
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination value={currentPage} onChange={setCurrentPage} total={totalPages} size="md" color="#007bff" />
          </div>
        )}

        {filteredTasks.length === 0 && !loading && (
          <Paper shadow="md" padding="xl" className="text-center mt-8">
            <Text size="lg" color="#007bff" weight={500}>
              {myTasks.length === 0 ? "Size atanmış görev bulunmamaktadır." : "Arama kriterlerinize uygun görev bulunamadı."}
            </Text>
            {myTasks.length > 0 && (
              <Button variant="light" color="#007bff" onClick={clearFilters} className="mt-4">
                Filtreleri Temizle
              </Button>
            )}
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
      >
        {taskToReassign && (
          <Stack spacing="sm">
            <Text size="sm" weight={500}>
              <span className="font-bold">Görev: </span> {taskToReassign.taskDetails?.title}
            </Text>
            <Select
              label="Atamayı Değiştir"
              placeholder="Kullanıcı seçin"
              data={users.map(u => ({ value: String(u.id), label: u.name }))}
              value={selectedUserId}
              onChange={setSelectedUserId}
              withinPortal={false}
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

      {/* Chat Widgets - Geçici olarak devre dışı bırakıldı */}
      {/* TaskChatWidget bileşeni mevcut değilse bu kısımları comment out ediyoruz */}
      
      {/* Global Chat - Genel görüşmeler için */}
      {/* {showGlobalChat && (
        <TaskChatWidget
          taskId="global"
          userId={currentUserId}
          userName={userObj?.name || 'Kullanıcı'}
          apiBaseUrl="http://localhost:5000"
          authToken={token}
          position="bottom-left"
        />
      )} */}

      {/* Task-specific Chat - Belirli görev için */}
      {/* {activeChatTaskId && (
        <TaskChatWidget
          taskId={activeChatTaskId}
          userId={currentUserId}
          userName={userObj?.name || 'Kullanıcı'}
          apiBaseUrl="http://localhost:5000"
          authToken={token}
          position="bottom-right"
          onClose={handleCloseChat}
        />
      )} */}
    </div>
  );
};

export default MyTasks;