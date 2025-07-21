

  import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  Select, Textarea, Card, Text, Group, Stack, Badge, Button, 
  Progress, Pagination, Grid, Paper, Title, Divider, 
  Modal
} from "@mantine/core";
import { IconCalendar, IconArrowLeft, IconUsers, IconClock } from '@tabler/icons-react';
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";

const ProjectTasks = () => {
  const [projectName, setProjectName] = useState("");
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [taskToReassign, setTaskToReassign] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 500;
  
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
        `http://localhost:5000/api/projectTasks/by-project/${projectId}`,
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

          // Process bilgisi      // process tablosundan değil processTask tablosundan tarihi alacak.
          try {
            const processRes = await axios.get(
              `http://localhost:5000/api/processes/${processId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            processName = processRes.data.name;
            processCreatedDate = processRes.data.createdAt;
            console.log("Gelen Tarih: ", processCreatedDate)
          } catch (err) {
            console.error(`Process ${processId} alınamadı:`, err);
          }

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
                return { ...task, task: taskRes.data };
              } catch (err) {
                console.error(`Task ${task.taskId} alınamadı:`, err);
                return { ...task, task: { title: "Bilinmeyen Görev" } };
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
        filePath: task.filePath || null,
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
      filePath: taskToReassign.filePath || null,
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
      <div className="min-h-screen bg-white">
        <Header
          title="Süreçler"
          subtitle={`${projectName} Projesine Ait Süreçler`}
          icon={IconCalendar}
          stats={projectStats}
          showStats={true}
        />

        <div className="px-4">
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

          <Grid gutter="lg">
            {filteredProcesses.map((process) => {
              const processStats = calculateStatusStats(process.tasks);
              return (
                <Grid.Col key={process.processId} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Card
                    withBorder
                    padding="lg"
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg"
                    style={{ height: 280 }}
                    onClick={() => setSelectedProcess(process)}
                  >
                    <Stack spacing="md" style={{ height: '100%' }}>
                      <div>
                        <Title order={4} className="text-[#112d3b] mb-2">
                          {process.processName}
                        </Title>
                        <Text size="sm" color="#7ed2e2">
                          📅 Oluşturulma: {formatDate(process.processCreatedDate)}
                        </Text>
                      </div>

                      <Divider />

                      <Stack spacing="xs">
                        <Group spacing="xs">
                          <IconUsers size={16} color="#279ab3" />
                          <Text size="sm" color="#279ab3">
                            Atanan: {process.assignedUser}
                          </Text>
                        </Group>
                        
                        <Group spacing="xs">
                          <Text size="sm" color="#279ab3">
                            Toplam Görev: {process.tasks.length}
                          </Text>
                        </Group>

                        <Group spacing="xs">
                          <IconClock size={16} color="#51cf66" />
                          <Text size="sm" color="#51cf66">
                            Tamamlanan: {process.tasks.filter(t => t.status === 'Completed').length}
                          </Text>
                        </Group>
                      </Stack>

                      <div className="mt-auto">
                        <Text size="sm" weight={500} color="#279ab3" className="mb-2">
                          İlerleme Durumu
                        </Text>
                        <StatusBar stats={processStats} size="sm" showLabels={false} />
                      </div>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>

          {filteredProcesses.length === 0 && (
            <Paper shadow="md" padding="xl" className="text-center mt-8">
              <Text size="lg" color="#279ab3" weight={500}>
                Arama kriterlerinize uygun süreç bulunamadı.
              </Text>
              <Button variant="light" color="#279ab3" onClick={clearFilters} className="mt-4">
                Filtreleri Temizle
              </Button>
            </Paper>
          )}
        </div>
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
                      onClick={() => handleComplete(task)}
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