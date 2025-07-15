import { useEffect, useState } from "react";
import axios from "axios";
import {
  Divider,
  Select,
  Textarea,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Button,
  Progress,
  TextInput,
  Pagination,
  Grid,
  ActionIcon,
  Paper
} from "@mantine/core";
import { IconSearch, IconFilter, IconX, IconUser, IconCalendar } from '@tabler/icons-react';

const MyTasks = () => {
const [currentUser, setCurrentUser] = useState(null);
const [myTasks, setMyTasks] = useState([]);
const [filteredTasks, setFilteredTasks] = useState([]);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [searchFilters, setSearchFilters] = useState({
  projectName: "",
  processName: "",
  taskName: "",
  status: "",
  startDate: "",
  endDate: ""
});

const ITEMS_PER_PAGE = 6;
const CARD_HEIGHT = 450;

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

          return {
            ...projectTask,
            projectName,
            processName,
            taskDetails,
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
          <Text size="xs" style={{ color: '#6c757d' }}>Başlamadı: {stats.notStarted}%</Text>
          <Text size="xs" style={{ color: '#fd7e14' }}>Devam: {stats.inProgress}%</Text>
          <Text size="xs" style={{ color: '#28a745' }}>Tamamlandı: {stats.completed}%</Text>
          <Text size="xs" style={{ color: '#dc3545' }}>İptal: {stats.cancelled}%</Text>
        </div>
      )}
      <div style={{ display: 'flex', gap: 2 }}>
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
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <Text size="lg" color="dimmed">Görevleriniz yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  const myTasksStats = calculateMyTasksStats();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: 0,
      margin: 0
    }}>
      <div style={{ width: '100%' }}>

        {/* Header */}
        <Card
          shadow="lg"
          style={{
            marginBottom: '32px',
            background: 'linear-gradient(135deg,  #24809c 0%, #112d3b 100%)',
            color: 'white',
            borderRadius: 0
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div>
              <Text size="xl" weight={700} style={{ color: 'white', marginBottom: '8px' }}>
                <IconUser size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Benim Görevlerim
              </Text>
              <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {currentUser?.name || userObj?.name || 'Kullanıcı'} - Kişisel Görev Dashboard
              </Text>
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                📊 Toplam {filteredTasks.length} görev
              </Text>
            </div>
            <div style={{ minWidth: '300px', flex: 1, maxWidth: '400px' }}>
              <Text size="sm" weight={500} style={{ color: 'white', marginBottom: '12px' }}>
                🎯 Görev Durumu İstatistikleri
              </Text>
              <StatusBar stats={myTasksStats} size="lg" />
            </div>
          </div>
        </Card>

        {/* Search and Filter Section */}
        <Paper shadow="md" padding="lg" style={{ marginBottom: '24px', backgroundColor: 'white', paddingLeft: 12, paddingRight: 12 }}>
          <Group position="apart" style={{ marginBottom: '16px' }}>
            <Group spacing="xs">
              <IconFilter size={20} color="#007bff" />
              <Text size="md" weight={500} style={{ color: '#007bff' }}>
                Filtreleme ve Arama
              </Text>
            </Group>
            <ActionIcon
              variant="light"
              color="#007bff"
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
                style={{
                  height: CARD_HEIGHT,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderColor: '#dee2e6',
                  borderWidth: '1px',
                  transition: 'all 0.2s ease'
                }}
                className="task-card"
              >
                <Stack spacing="sm" style={{ height: '100%' }}>
                  {/* Task Header */}
                  <Group position="apart" align="flex-start">
                    <Text size="sm" weight={500} style={{
                      color: '#212529',
                      lineHeight: '1.4',
                      flex: 1
                    }}>
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

                  {/* Project and Process Info */}
                  <Stack spacing="xs">
                    <Paper padding="xs" style={{ backgroundColor: '#e3f2fd' }}>
                      <Text size="xs" color="#1976d2" weight={500}>
                        🏢 Proje: {task.projectName}
                      </Text>
                    </Paper>
                    <Paper padding="xs" style={{ backgroundColor: '#f3e5f5' }}>
                      <Text size="xs" color="#7b1fa2" weight={500}>
                        ⚙️ Süreç: {task.processName}
                      </Text>
                    </Paper>
                  </Stack>

                  {/* Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <Text size="xs" color="#007bff" style={{ marginBottom: '4px' }}>
                        📅 Başlangıç
                      </Text>
                      <input
                        type="date"
                        value={task.startDate?.split("T")[0] || ""}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '12px',
                          backgroundColor: '#f8f9fa',
                          color: '#007bff'
                        }}
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
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#007bff'
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Select */}
                  <Select
                    size="sm"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, color: '#007bff' }}>📎</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        files.forEach((file) => handleFileUpload(task.id, file));
                      }}
                      style={{
                        flex: 1,
                        fontSize: '12px',
                        padding: '4px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  {/* Update Button */}
                  <Button
                    size="sm"
                    onClick={() => handleUpdateTask(task)}
                    style={{
                      background: 'linear-gradient(135deg,   #2d6a4f 0%, #1b4332 100%)',
                      border: 'none',
                      marginTop: 'auto'
                    }}
                  >
                    Görevi Güncelle
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
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
          <Paper shadow="md" padding="xl" style={{ textAlign: 'center', marginTop: '32px' }}>
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
                style={{ marginTop: '16px' }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </Paper>
        )}
      </div>

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