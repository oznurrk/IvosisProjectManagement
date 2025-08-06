import { useEffect, useState, useCallback, useMemo } from "react";
import { useOutletContext } from 'react-router-dom';
import axios from "axios";
import { Select, Textarea, Text, Group, Stack, Badge, Button, Grid, Paper, Modal, Card, ActionIcon, Tooltip, Alert } from "@mantine/core";
import { IconUser, IconCalendarUser, IconX, IconDownload, IconAlertCircle, IconFileText } from '@tabler/icons-react';
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";
import PaginationComponent from "../Layout/PaginationComponent";

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
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem("pageSize");
    return stored ? parseInt(stored) : 6;
  });
  
  const [searchFilters, setSearchFilters] = useState({
    projectName: "",
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  // Sabit kart yüksekliği - artırıldı
  const CARD_HEIGHT = 600;

  // Sayfa değişikliği handler'ı
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Sayfa boyutu değişikliği handler'ı
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("pageSize", newPageSize);
    setCurrentPage(1);
  }, []);
  
  // Auth bilgileri
  const token = localStorage.getItem("token");
  const userObj = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }, []);
  const currentUserId = userObj?.id || 1;

  // Dosya kontrolü fonksiyonu
  const validateTaskCompletion = useCallback((task) => {
    const hasFiles = task.fileNames && task.fileNames.length > 0;
    const isCompleting = task.status === "Completed";
    
    if (isCompleting && !hasFiles) {
      return {
        isValid: false,
        message: "Görevi tamamlamak için en az bir dosya eklemelisiniz."
      };
    }
    
    return { isValid: true, message: "" };
  }, []);

  // Validasyon hatalarını güncelle
  const updateValidationError = useCallback((taskId, error) => {
    setValidationErrors(prev => ({
      ...prev,
      [taskId]: error
    }));
  }, []);

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

  // Düzeltilmiş dosya indirme fonksiyonu
  const handleFileDownload = useCallback(async (taskId, fileName) => {
    try {
      console.log('İndirme isteği:', { taskId, fileName });
      
      // Önce dosyanın varlığını kontrol et
      const checkResponse = await axios.get(
        `http://localhost:5000/api/ProjectTasks/${taskId}/files/${encodeURIComponent(fileName)}/stream`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 
        }
      );
      
      if (!checkResponse.data.exists) {
        alert(`Dosya sunucuda bulunamadı: ${fileName}. Dosya taşınmış veya silinmiş olabilir.`);
        return;
      }

      // Dosya varsa indirmeye başla
      const response = await axios.get(
        `http://localhost:5000/api/ProjectTasks/${taskId}/files/${encodeURIComponent(fileName)}/stream`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          timeout: 30000 // 30 saniye timeout
        }
      );

      // Blob'u kontrol et
      if (!response.data || response.data.size === 0) {
        alert(`Dosya içeriği boş: ${fileName}`);
        return;
      }

      // İndirme işlemi
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
      let errorMessage = 'Dosya indirilemedi.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'İndirme zaman aşımına uğradı. Lütfen tekrar deneyin.';
      } else if (error.response?.status === 404) {
        errorMessage = `Dosya bulunamadı: ${fileName}. Dosya silinmiş veya taşınmış olabilir.`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen sistem yöneticisiyle iletişime geçin.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
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

  // Geliştirilmiş çoklu dosya yükleme fonksiyonu - maksimum 10 dosya
  const handleMultipleFileUpload = useCallback(async (taskId, files) => {
    if (!files || files.length === 0) return;

    // Maksimum 10 dosya kontrolü
    if (files.length > 10) {
      alert('Bir seferde en fazla 10 dosya yükleyebilirsiniz.');
      return;
    }

    // Toplam dosya boyutu kontrolü (100MB)
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 100 * 1024 * 1024) {
      alert('Toplam dosya boyutu 100MB\'ı geçemez.');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [taskId]: true }));

    try {
      const currentTask = myTasks.find(task => task.id === taskId);
      if (!currentTask) {
        throw new Error('Task bulunamadı');
      }

      // FormData ile dosya yükleme
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append('files', file);
      });

      // Önce dosyaları yükle
      const uploadResponse = await axios.post(
        `http://localhost:5000/api/ProjectTasks/${taskId}/upload-files`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 1 dakika timeout
        }
      );

      // Başarılı yükleme sonrası task'ı güncelle
      const updatedFilePaths = uploadResponse.data.filePaths || [];
      
      const updateDto = {
        status: currentTask.status,
        startDate: currentTask.startDate ? new Date(currentTask.startDate).toISOString() : new Date().toISOString(),
        assignedUserId: currentTask.assignedUserId,
        endDate: currentTask.endDate ? new Date(currentTask.endDate).toISOString() : null,
        description: currentTask.description || "",
        filePath: [...(currentTask.filePath || []), ...updatedFilePaths],
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskId}`, updateDto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Task'ı yenile
      const refreshedTask = await refreshTaskFiles(taskId);
      if (refreshedTask) {
        setMyTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            const updatedTask = {
              ...task,
              filePath: refreshedTask.filePath,
              fileNames: refreshedTask.fileNames
            };
            updateValidationError(taskId, null);
            return updatedTask;
          }
          return task;
        }));
      }

      alert(`${files.length} dosya başarıyla yüklendi!`);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      let errorMessage = 'Dosya yükleme hatası: ';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Yükleme zaman aşımına uğradı. Lütfen dosya boyutlarını kontrol edin.';
      } else if (error.response?.status === 413) {
        errorMessage += 'Dosyalar çok büyük. Lütfen daha küçük dosyalar seçin.';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [taskId]: false }));
    }
  }, [token, myTasks, currentUserId, refreshTaskFiles, updateValidationError]);

  // Geliştirilmiş dosya silme fonksiyonu
  const handleFileDelete = useCallback(async (taskId, fileName) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinizden emin misiniz?`)) return;

    try {
      // Backend'e dosya silme isteği gönder
      await axios.delete(
        `http://localhost:5000/api/ProjectTasks/${taskId}/files/${encodeURIComponent(fileName)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Task'ı yenile
      const refreshedTask = await refreshTaskFiles(taskId);
      if (refreshedTask) {
        setMyTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            const updatedTask = {
              ...task, 
              filePath: refreshedTask.filePath,
              fileNames: refreshedTask.fileNames
            };
            const validation = validateTaskCompletion(updatedTask);
            updateValidationError(taskId, validation.isValid ? null : validation.message);
            return updatedTask;
          }
          return task;
        }));
        
        alert('Dosya başarıyla silindi!');
      }

    } catch (error) {
      console.error('Dosya silme hatası:', error);
      let errorMessage = 'Dosya silme hatası: ';
      
      if (error.response?.status === 404) {
        errorMessage += 'Dosya zaten silinmiş veya bulunamadı.';
      } else {
        errorMessage += error.response?.data?.message || error.message;
      }
      
      alert(errorMessage);
    }
  }, [token, refreshTaskFiles, validateTaskCompletion, updateValidationError]);

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

  // Sayfalama - pageSize kullanarak dinamik
  const { paginatedTasks } = useMemo(() => {
    const total = Math.ceil(filteredTasks.length / pageSize);
    const paginated = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { totalPages: total, paginatedTasks: paginated };
  }, [filteredTasks, currentPage, pageSize]);

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
    setMyTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        if (updates.status) {
          const validation = validateTaskCompletion(updatedTask);
          updateValidationError(taskId, validation.isValid ? null : validation.message);
        }
        
        return updatedTask;
      }
      return task;
    }));
  }, [validateTaskCompletion, updateValidationError]);

  // Geliştirilmiş görev güncelleme fonksiyonu
  const handleUpdateTask = useCallback(async (task) => {
    try {
      const validation = validateTaskCompletion(task);
      
      if (!validation.isValid) {
        updateValidationError(task.id, validation.message);
        alert(validation.message);
        return;
      }

      updateValidationError(task.id, null);

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
  }, [token, currentUserId, validateTaskCompletion, updateValidationError]);

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
  //Ub533541
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

  const getEndDate = (task) => {
    if (task.endDate) return task.endDate.split("T")[0];
    if (task.startDate) {
      const start = new Date(task.startDate);
      start.setDate(start.getDate() + 15);
      return start.toISOString().split("T")[0];
    }
    return "";
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
          showMenuButton={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
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

          <Grid gutter="lg">
            {paginatedTasks.map((task) => {
              const validationError = validationErrors[task.id];
              const hasFiles = task.fileNames && task.fileNames.length > 0;
              
              return (
                <Grid.Col key={task.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Card
                    withBorder
                    padding="md"
                    style={{ 
                      height: CARD_HEIGHT,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200"
                    shadow="sm"
                    radius="lg"
                  >
                    <div className="flex flex-col h-full">
                      {/* Görev başlığı ve durumu - Sabit alan */}
                      <div>
                        <Group position="apart" align="flex-start">
                          <Text 
                            size="sm" 
                            weight={500} 
                            className="leading-[1.4] flex-1 text-lg"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '60px'
                            }}
                          >
                            {task.taskDetails?.title || 'Görev Başlığı'}
                          </Text>
                          <Badge style={{ backgroundColor: getStatusColor(task.status), color: 'white' }} size="sm">
                            {getStatusLabel(task.status)}
                          </Badge>
                        </Group>
                      </div>

                      {/* Atama işlemleri */}
                      <Group position="apart" className="mb-3">
                        <Text size="xs" color="dimmed" className="truncate">👤 Atanan: {task.assignedUserName}</Text>
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

                      {/* Proje ve Süreç bilgileri - Sabit alan */}
                      <div className="mb-3">
                        <Paper padding="xs" className="bg-[#e3f2fd] mb-2">
                          <Text 
                            size="xs" 
                            color="#1976d2" 
                            weight={500}
                            className="truncate"
                            title={task.projectName}
                          >
                            🏢 Proje: {task.projectName}
                          </Text>
                        </Paper>
                        <Paper padding="xs" className="bg-[#f3e5f5]">
                          <Text 
                            size="xs" 
                            color="#7b1fa2" 
                            weight={500}
                            className="truncate"
                            title={task.processName}
                          >
                            ⚙️ Süreç: {task.processName}
                          </Text>
                        </Paper>
                      </div>

                      {/* Tarihler */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
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

                      {/* Durum seçimi */}
                      <div className="mb-3">
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
                          error={validationError && task.status === "Completed"}
                          styles={{
                            input: {
                              borderColor: validationError && task.status === "Completed" ? '#dc3545' : undefined,
                              backgroundColor: validationError && task.status === "Completed" ? '#f8d7da' : undefined
                            }
                          }}
                        />
                      </div>

                      {/* Açıklama alanı - Sabit yükseklik */}
                      <div className="mb-3">
                        <Textarea
                          size="sm"
                          placeholder="Görev notları ve açıklamaları..."
                          value={task.description || ""}
                          onChange={(e) => updateTaskInState(task.id, { description: e.target.value })}
                          minRows={2}
                          maxRows={2}
                        />
                      </div>

                      {/* Dosya Yönetimi - Esnek alan */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Text size="xs" color="#007bff" weight={500}>📎 Dosyalar</Text>
                            <Badge 
                              size="xs" 
                              color={hasFiles ? "green" : "yellow"} 
                              variant="light"
                            >
                              {task.fileNames?.length || 0}
                            </Badge>
                          </div>
                          {!hasFiles && task.status === "Completed" && (
                            <Tooltip label="Tamamlanmış görevler için dosya gereklidir">
                              <IconAlertCircle size={14} color="#dc3545" />
                            </Tooltip>
                          )}
                        </div>
                        
                        {/* Dosya yükleme input'u */}
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                          onChange={(e) => handleMultipleFileUpload(task.id, e.target.files)}
                          className="w-full text-xs p-1.5 border border-[#ced4da] rounded bg-white hover:bg-gray-50 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
                          disabled={uploadingFiles[task.id]}
                        />
                        
                        {/* Yükleme durumu */}
                        {uploadingFiles[task.id] && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <Text size="xs" color="blue">Dosyalar yükleniyor... (Max 10 dosya)</Text>
                          </div>
                        )}

                        {/* Dosya listesi - Scrollable alan */}
                        {task.fileNames && task.fileNames.length > 0 && (
                          <div className="flex-1 min-h-0 mb-2">
                            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2 space-y-1">
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
                          </div>
                        )}

                        {/* Dosya gerekliliği uyarısı */}
                        {!hasFiles && (
                          <Alert 
                            color="yellow" 
                            variant="light" 
                            className="py-1 mb-2"
                          >
                            <Text size="xs">
                              💡 Görevi "Tamamlandı" olarak işaretlemek için en az bir dosya eklemelisiniz. (Max: 10 dosya, 100MB)
                            </Text>
                          </Alert>
                        )}

                        {/* Güncelleme butonu - Her zaman altta */}
                        <div className="mt-auto">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateTask(task)}
                            className="border-0 w-full"
                            style={{ 
                              background: validationError ? 
                                'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' : 
                                'linear-gradient(135deg, #279ab3 0%, #1d7a8c 100%)'
                            }}
                            loading={uploadingFiles[task.id]}
                            disabled={!!validationError}
                          >
                            {validationError ? 'Dosya Gerekli' : 'Güncelle'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>

        {/* Pagination */}
        <PaginationComponent
          totalItems={filteredTasks.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[6, 9, 12, 15, 18, 24]}
          itemName="görev"
        />

        {filteredTasks.length === 0 && !loading && (
          <Paper shadow="md" padding="xl" className="text-center mt-8 mx-4">
            <Stack align="center" spacing="md">
              <IconCalendarUser size={64} color="#6c757d" />
              <Text size="lg" color="#007bff" weight={500}>
                {myTasks.length === 0 ? "Size atanmış görev bulunmamaktadır." : "Arama kriterlerinize uygun görev bulunamadı."}
              </Text>
              {myTasks.length > 0 && (
                <Button variant="light" color="#007bff" onClick={clearFilters} className="mt-4">
                  Filtreleri Temizle
                </Button>
              )}
            </Stack>
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
              color="blue"
            >
              Atamayı Kaydet
            </Button>
          </Stack>
        )}
      </Modal>
    </div>
  );
};

export default MyTasks;