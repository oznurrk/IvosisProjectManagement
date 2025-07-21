import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Select, Textarea, Text, Group, Stack, Badge, Button, Pagination, Grid, Paper, Modal, Card } from "@mantine/core";
import { IconUser, IconCalendarUser } from '@tabler/icons-react';
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";

const MyTasks = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToReassign, setTaskToReassign] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  const [searchFilters, setSearchFilters] = useState({
    projectName: "",
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 500;

  // Auth bilgileri
  const token = localStorage.getItem("token");
  const userObj = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }, []);
  const currentUserId = userObj?.id || 1;

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
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
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

  const handleUpdateTask = useCallback(async (task) => {
    try {
      const dto = {
        status: task.status,
        startDate: task.startDate,
        assignedUserId: task.assignedUserId,
        endDate: task.endDate || null,
        description: task.description,
        filePath: task.filePath || null,
        updatedByUserId: currentUserId
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${task.id}`, dto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Görev başarıyla güncellendi");
    } catch (err) {
      console.error("Güncelleme Hatası: ", err.response?.data || err.message);
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
        filePath: taskToReassign.filePath || null,
        updatedByUserId: userObj?.id || 0,
      };

      await axios.put(`http://localhost:5000/api/projectTasks/${taskToReassign.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyTasks(prev => prev.filter(t => t.id !== taskToReassign.id));
      setAssignModalOpen(false);
      setTaskToReassign(null);
      setSelectedUserId(null);
    } catch (err) {
      alert("Atama değiştirilemedi");
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
                      <Badge style={{ backgroundColor: getStatusColor(task.status), color: 'white' }} size="sm">
                        {getStatusLabel(task.status)}
                      </Badge>
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
                      maxRows={3}
                      style={{ flex: 1 }}
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-sm flex-shrink-0 text-[#007bff]">📎</span>
                      <input
                        type="file"
                        onChange={(e) => updateTaskInState(task.id, {description: e.target.value})}
                        className="flex-1 text-xs p-1 border border-[#ced4da] rounded"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleUpdateTask(task)}
                      className="border-0 mt-auto"
                      style={{ background: 'linear-gradient(135deg, #279ab3 0%, #1d7a8c 100%)' }}
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
    </div>
  );
};

export default MyTasks;