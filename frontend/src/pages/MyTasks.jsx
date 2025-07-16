import { useEffect, useState } from "react";
import axios from "axios";
import { Select, Textarea, Card, Text, Group, Stack, Badge, Button, Progress, TextInput, Pagination, Grid, ActionIcon, Paper, Modal } from "@mantine/core";
import { IconSearch, IconFilter, IconX, IconUser, IconCalendar, IconCalendarUser } from '@tabler/icons-react';

const MyTasks = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [selectedAssignTaskId, setSelectedAssignTaskId] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState(null);

  const [searchFilters, setSearchFilters] = useState({
    projectName: "",
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 550;

  // Login işleminden sonra localStorage'a kaydedilen token ve user bilgilerini al
  const token = localStorage.getItem("token");
  const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const userId = userObj?.id || null;

  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!token) {
        console.error("Token bulunamadı. Lütfen giriş yapın.");
        return;
      }
      setLoading(true);
      try {
        // Kullanıcı bilgisi almaya gerek yok, token üzerinden gelen veri yeterli
        const myTasksRes = await axios.get(
          "http://localhost:5000/api/ProjectTasks/my-tasks",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const tasksData = myTasksRes.data?.data || [];
        if (!Array.isArray(tasksData)) {
          console.error("Beklenen dizi değil:", tasksData);
          setMyTasks([]);
          setFilteredTasks([]);
          return;
        }
        // Her görev için proje, süreç ve görev detaylarını al
        const tasksWithDetails = await Promise.all(
          tasksData.map(async (projectTask) => {
            let projectName = "";
            let processName = "";
            let taskDetails = {};
            try {
              const projectRes = await axios.get(
                `http://localhost:5000/api/projects/${projectTask.projectId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              projectName = projectRes.data.name;
            } catch (error) {
              console.error("Proje bilgisi alınamadı:", error);
              projectName = "Bilinmeyen Proje";
            }
            try {
              const processRes = await axios.get(
                `http://localhost:5000/api/processes/${projectTask.processId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              processName = processRes.data.name;
            } catch (error) {
              console.error("Süreç bilgisi alınamadı:", error);
              processName = "Bilinmeyen Süreç";
            }
            try {
              const taskRes = await axios.get(
                `http://localhost:5000/api/tasks/${projectTask.taskId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              taskDetails = taskRes.data;
            } catch (error) {
              console.error("Görev bilgisi alınamadı:", error);
              taskDetails = { title: "Bilinmeyen Görev", description: "" };
            }
            const assignedUserId = users.find(u => u.id === projectTask.assignedUserId);
            return {
              ...projectTask,
              projectName,
              processName,
              taskDetails,
              assignedUserName: assignedUserId?.name || "Bilinmiyor"
            };
          })
        );

        // Görevleri sıralama
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
        setFilteredTasks(sortedTasks);
      } catch (error) {
        console.error("Görevler alınamadı:", error);
        if (error.response && error.response.status === 401) {
          alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Kullanıcılar alınamadı:", error);
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);



  useEffect(() => {
    applyFilters();
  }, [searchFilters, myTasks]);

  const applyFilters = () => {
    let filtered = myTasks;
    if (searchFilters.projectName) {
      filtered = filtered.filter(task =>
        task.projectName.toLowerCase().includes(searchFilters.projectName.toLowerCase())
      );
    }
    if (searchFilters.processName) {
      filtered = filtered.filter(task =>
        task.processName.toLowerCase().includes(searchFilters.processName.toLowerCase())
      );
    }
    if (searchFilters.taskName) {
      filtered = filtered.filter(task =>
        task.taskDetails.title.toLowerCase().includes(searchFilters.taskName.toLowerCase())
      );
    }
    if (searchFilters.status) {
      filtered = filtered.filter(task => task.status === searchFilters.status);
    }
    if (searchFilters.startDate) {
      filtered = filtered.filter(task =>
        task.startDate && task.startDate.split('T')[0] >= searchFilters.startDate
      );
    }
    if (searchFilters.endDate) {
      filtered = filtered.filter(task =>
        task.endDate && task.endDate.split('T')[0] <= searchFilters.endDate
      );
    }
    setFilteredTasks(filtered);
    // Sayfa numarası geçerli değilse 1'e çek
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setCurrentPage((prev) => Math.min(prev, totalPages || 1));
  };

  const clearFilters = () => {
    setSearchFilters({
      projectName: "",
      processName: "",
      taskName: "",
      status: "",
      startDate: "",
      endDate: ""
    });
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUpdateTask = async (task) => {
    if (!token) {
      alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/projectTasks/${task.id}`,
        {
          status: task.status,
          description: task.description,
          endDate: task.endDate,
          filePath: task.filePath || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Görev başarıyla güncellendi");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      if (error.response && error.response.status === 401) {
        alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
      } else {
        alert("Görev güncellenirken bir hata oluştu");
      }
    }
  };

  const handleFileUpload = async (taskId, file) => {
    if (!token) {
      alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `http://localhost:5000/api/projectTasks/upload/${taskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Görev durumunu güncelle
      setMyTasks(prev =>
        prev.map(task => task.id === taskId ? { ...task, filePath: response.data.filePath } : task)
      );
      alert("Dosya başarıyla yüklendi");
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      if (error.response && error.response.status === 401) {
        alert("Yetkilendirme hatası. Lütfen tekrar giriş yapın.");
      } else {
        alert("Dosya yüklenirken bir hata oluştu");
      }
    }
  };

  const updateTaskInState = (taskId, updates) => {
    setMyTasks(prev =>
      prev.map(task => task.id === taskId ? { ...task, ...updates } : task)
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "NotStarted": return "Başlamadı";
      case "InProgress": return "Devam Ediyor";
      case "Completed": return "Tamamlandı";
      case "Cancelled": return "İptal Edildi";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NotStarted": return "#6c757d";
      case "InProgress": return "#fd7e14";
      case "Completed": return "#28a745";
      case "Cancelled": return "#dc3545";
      default: return "#6c757d";
    }
  };

  const calculateMyTasksStats = () => {
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
  };

  const StatusBar = ({ stats, size = "md", showLabels = true }) => (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text size="xs" className="text-[#6c757d]">Başlamadı: {stats.notStarted}%</Text>
          <Text size="xs" className="text-[#fd7e14]">Devam: {stats.inProgress}%</Text>
          <Text size="xs" className="text-[#28a745]">Tamamlandı: {stats.completed}%</Text>
          <Text size="xs" className="text-[#dc3545]">İptal: {stats.cancelled}%</Text>
        </div>
      )}
      <div className="flex gap-0.5">
        {stats.notStarted > 0 && (
          <div style={{ flex: stats.notStarted }}>
            <Progress value={100} color="#6c757d" size={size} />
          </div>
        )}
        {stats.inProgress > 0 && (
          <div style={{ flex: stats.inProgress }}>
            <Progress value={100} color="#fd7e14" size={size} />
          </div>
        )}
        {stats.completed > 0 && (
          <div style={{ flex: stats.completed }}>
            <Progress value={100} color="#28a745" size={size} />
          </div>
        )}
        {stats.cancelled > 0 && (
          <div style={{ flex: stats.cancelled }}>
            <Progress value={100} color="#dc3545" size={size} />
          </div>
        )}
      </div>
    </div>
  );

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Eğer token veya userId yoksa login mesajı göster
  if (!token || !userId) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <Stack align="center" spacing="md">
          <IconUser size={64} color="#007bff" />
          <Text size="xl" color="#007bff" weight={500}>
            Lütfen Giriş Yapın
          </Text>
          <Text size="md" color="dimmed">
            Görevlerinizi görüntülemek için sisteme giriş yapmanız gerekmektedir.
          </Text>
        </Stack>
      </div>
    );
  }

  if (loading) {
    return (
      <div sclassName="p-8 text-center min-h-[400px] flex items-center justify-center bg-[#f8f9fa]">
        <Stack align="center" spacing="md">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <Text size="lg" color="dimmed">Görevleriniz yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  const myTasksStats = calculateMyTasksStats();

  // Modal içindeki kullanıcı değiştirme işlemini güncelle:
  const handleReassign = async (newUserIdStr) => {
    const newUserId = parseInt(newUserIdStr);
    try {
      await axios.put(
        `http://localhost:5000/api/projectTasks/${taskToReassign.id}`,
        { assignedUserId: newUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newUserName = users.find(u => u.id === newUserId)?.name || "Bilinmiyor";
      setMyTasks(prev =>
        prev.map(t =>
          t.id === taskToReassign.id
            ? { ...t, assignedUserId: newUserId, assignedUserName: newUserName }
            : t
        )
      );
      setFilteredTasks(prev =>
        prev.map(t =>
          t.id === taskToReassign.id
            ? { ...t, assignedUserId: newUserId, assignedUserName: newUserName }
            : t
        )
      );
      setAssignModalOpen(false);
      setTaskToReassign(null);
    } catch (err) {
      alert("Atama değiştirilemedi");
      console.error(err);
    }
  };






  return (
    <div className="min-h-screen bg-[#f8f9fa] p-0 m-0" style={{ height: CARD_HEIGHT }}>
      <div className="w-full">
        {/* Header */}
        <Card
          shadow="lg"
          className="mb-8 text-white rounded-none" style={{ background: 'linear-gradient(135deg,  #24809c 0%, #112d3b 100%)' }}>
          <div className="flex justify-between items-center flex-wrap gap-6">
            <div>
              <Text size="xl" weight={700} className="text-white mb-2">
                <IconCalendarUser size={20} />
                Görevlerim
              </Text>
              <Text size="sm" className="text-white text-opacity-80">
                {currentUser?.name || userObj?.name || 'Kullanıcı'} - Kişisel Görev Dashboard
              </Text>
              <Text size="xs" className="text-white text-opacity-70 mt-1">
                📊 Toplam {filteredTasks.length} görev
              </Text>
            </div>
            <div className="min-w-[300px] flex-1 max-w-[400px]">
              <Text size="sm" weight={500} className="text-white mb-3">
                🎯 Görev Durumu İstatistikleri
              </Text>
              <StatusBar stats={myTasksStats} size="lg" />
            </div>
          </div>
        </Card>
        {/* Search and Filter Section */}
        <div className="px-4">
          <Paper shadow="md" padding="lg" className="mb-6 bg-white px-3">
            <Group position="apart" className="mb-4">
              <Group spacing="xs">
                <IconFilter size={20} color="#23657b" />
                <Text size="md" weight={500} className="text-[#23657b]">
                  Filtreleme ve Arama
                </Text>
              </Group>
              <ActionIcon
                variant="light"
                color="#23657b"
                onClick={clearFilters}
                title="Filtreleri Temizle"
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  placeholder="Proje adına göre ara..."
                  value={searchFilters.projectName}
                  onChange={(e) => handleFilterChange('projectName', e.target.value)}
                  style={{ '& .mantine-TextInput-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  placeholder="Süreç adına göre ara..."
                  value={searchFilters.processName}
                  onChange={(e) => handleFilterChange('processName', e.target.value)}
                  style={{ '& .mantine-TextInput-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  placeholder="Görev adına göre ara..."
                  value={searchFilters.taskName}
                  onChange={(e) => handleFilterChange('taskName', e.target.value)}
                  style={{ '& .mantine-TextInput-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <Select
                  placeholder="Durum seçin..."
                  value={searchFilters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  data={[
                    { value: "", label: "Tümü" },
                    { value: "NotStarted", label: "Başlamadı" },
                    { value: "InProgress", label: "Devam Ediyor" },
                    { value: "Completed", label: "Tamamlandı" },
                    { value: "Cancelled", label: "İptal Edildi" },
                  ]}
                  style={{ '& .mantine-Select-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  leftSection={<IconCalendar size={16} />}
                  type="date"
                  placeholder="Başlangıç tarihi..."
                  value={searchFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  style={{ '& .mantine-TextInput-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <TextInput
                  leftSection={<IconCalendar size={16} />}
                  type="date"
                  placeholder="Bitiş tarihi..."
                  value={searchFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  style={{ '& .mantine-TextInput-input': { borderColor: '#ced4da' } }}
                />
              </Grid.Col>
            </Grid>
          </Paper>
          {/* Task Cards Grid */}
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
                    {/* Task Header */}
                    <Group position="apart" align="flex-start">
                      <Text size="sm" weight={500} className="text-[#212529] leading-[1.4] flex-1">
                        {task.taskDetails?.title || 'Görev Başlığı'}
                      </Text>
                      <Badge
                        style={{
                          backgroundColor: getStatusColor(task.status),
                          color: 'white'
                        }}
                        size="sm"
                      >
                        {getStatusLabel(task.status)}
                      </Badge>
                    </Group>
                    <Group position="apart">
                      <Text size="xs" color="dimmed">
                        👤 Atanan: {task.assignedUserName || "Bilinmiyor"}
                      </Text>
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
                    

                    {/* Project and Process Info */}
                    <Stack spacing="xs">
                      <Paper padding="xs" className="bg-[#e3f2fd]">
                        <Text size="xs" color="#1976d2" weight={500}>
                          🏢 Proje: {task.projectName}
                        </Text>
                      </Paper>
                      <Paper padding="xs" className="bg-[#f3e5f5]">
                        <Text size="xs" color="#7b1fa2" weight={500}>
                          ⚙️ Süreç: {task.processName}
                        </Text>
                      </Paper>
                    </Stack>
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Text size="xs" color="#007bff" className="mb-1">
                          📅 Başlangıç
                        </Text>
                        <input
                          type="date"
                          value={task.startDate?.split("T")[0] || ""}
                          readOnly
                          className="w-full px-2 py-1.5 border border-[#ced4da] rounded text-xs bg-[#f8f9fa] text-[#007bff]"
                        />
                      </div>
                      <div>
                        <Text size="xs" color="#007bff" style={{ marginBottom: '4px' }}>
                          🎯 Bitiş
                        </Text>
                        <input
                          type="date"
                          value={task.endDate?.split("T")[0] || ""}
                          onChange={(e) => updateTaskInState(task.id, { endDate: e.target.value })}
                          className="w-full px-2 py-1.5 border border-[#ced4da] rounded text-xs bg-[#f8f9fa] text-[#007bff]"
                        />
                      </div>
                    </div>
                    {/* Status Select */}
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
                      style={{ '& .mantine-Select-input': { borderColor: '#ced4da' } }}
                    />
                    {/* Description */}
                    <Textarea
                      size="sm"
                      placeholder="Görev notları ve açıklamaları..."
                      value={task.description || ""}
                      onChange={(e) => updateTaskInState(task.id, { description: e.target.value })}
                      minRows={2}
                      maxRows={3}
                      style={{
                        flex: 1,
                        '& .mantine-Textarea-input': { borderColor: '#ced4da' }
                      }}
                    />
                    {/* File Upload */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm flex-shrink-0 text-[#007bff]">📎</span>
                      <input
                        type="file"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          files.forEach((file) => handleFileUpload(task.id, file));
                        }}
                        className="flex-1 text-xs p-1 border border-[#ced4da] rounded"
                      />
                    </div>
                    {/* Update Button */}
                    <Button
                      size="sm"
                      onClick={() => handleUpdateTask(task)}
                      className="border-0 mt-auto"
                      style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)' }}
                    >
                      Görevi Güncelle
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="md"
              color="#007bff"
            />
          </div>
        )}
        {/* No Results */}
        {filteredTasks.length === 0 && !loading && (
          <Paper shadow="md" padding="xl" className="text-center mt-8">
            <Text size="lg" color="#007bff" weight={500}>
              {myTasks.length === 0
                ? "Size atanmış görev bulunmamaktadır."
                : "Arama kriterlerinize uygun görev bulunamadı."
              }
            </Text>
            {myTasks.length > 0 && (
              <Button
                variant="light"
                color="#007bff"
                onClick={clearFilters}
                className="mt-4"
              >
                Filtreleri Temizle
              </Button>
            )}
          </Paper>
        )}
      </div>
       <Modal
      opened={assignModalOpen}
      onClose={() => {
        setAssignModalOpen(false);
        setTaskToReassign(null);
      }}
      title="Atamayı Değiştir"
      centered
      size="sm"
    >
      {taskToReassign && (
        <Stack>
          <Text size="sm" weight={500}>
            Görev: {taskToReassign.taskDetails?.title}
          </Text>
          <Select
            label="Yeni Kullanıcı Seçin"
            placeholder="Kullanıcı seçin"
            data={users.map(u => ({ value: String(u.id), label: u.name }))}
            withinPortal={false}
            onChange={handleReassign}
          />
        </Stack>
      )}
    </Modal>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
        }
      `}</style>
    </div>
  );
};
export default MyTasks;