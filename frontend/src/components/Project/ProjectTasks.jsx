import { useEffect, useState } from "react";
import axios from "axios";
import ProjectTasksCreated from "./ProjectTasksCreated";
import { Divider, Select, Textarea, TextInput } from "@mantine/core";

const ProjectTasks = () => {
  const [projectName, setProjectName] = useState("");
  const [projectTasks, setProjectTasks] = useState([]);
  const [users,setUsers] = useState([]);


  const processId = localStorage.getItem("selectedProcessId");
  const projectId = localStorage.getItem("selectedProjectId");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Process adı alınamadı:", error);
        setProcessName("Bilinmeyen Süreç");
      }
    };

    // project id'sini alma ve id'ye göre project name gösterme
    const fetchProjectName = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectName(res.data.name);
      } catch (error) {
        console.error("Proje adı alınamadı:", error);
        setProjectName("Bilinmeyen Proje");
      }
    };

    // alınan process id'ye göre taskları gösterme
    const fetchProcessTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/Tasks/by-process/${processId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjectTasks(res.data);
      } catch (error) {
        console.error("Görevler alınamadı:", error);
        setProjectTasks([]);
      }
    };

    // görev atanacak kullanıcıyı seçmek için combobox'a kullanıcıları atama
    const fetchUsers = async () => {
      try{
        const res = await axios.get("http://localhost:5000/api/users",{
          headers: {Authorization: `Bearer ${token}`},
        });
        setUsers(res.data);
      }catch(error){
        console.error("Kullanıcılar Alınmadı",error);
        setUsers([]);
      }
    };

    if (processId) {
      fetchProcessName();
      fetchProcessTasks();
    }

    if (projectId) {
      fetchProjectName();
    }

<<<<<<< HEAD
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
                  <span className="font-bold text-blue-400">Süreç: </span> 
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
=======
    fetchUsers();
  }, [processId, projectId]);
>>>>>>> 48a1e6c9af1b6d7e98d853008e022eb084767591

  return (
    <div className="p-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-ivosis-600 mb-6 ">{projectName}</h1>
      <div className="text-2xl md:text-3xl font-semibold text-ivosis-600 mb-6">
        {processName}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projectTasks.length === 0 ? (
          <div className="text-gray-500">Bu sürece ait görev bulunamadı.</div>
        ) : (
          projectTasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
              <Divider size="md" />
              {/*durum ve açıklama */}
              <div className="flex flex-row gap-x-8">
              <Select
                label="Durum"
                data={[
                  { value: "pending", label: "Beklemede" },
                  { value: "in_progress", label: "Devam Ediyor" },
                  { value: "completed", label: "Tamamlandı" },
                ]}
                className="w-40 text-natural-800"
              />
              <Textarea
                label="Açıklama"
                placeholder="Açıklama Girin"
                className="w-80 text-natural-800"
              />
              </div>
              {/*başlangıç bitiş tarihi */}
              <div className="flex flex-row gap-x-8">
                <div className="flex flex-col">
                  <label className="text-natural-800 font-semibold">Başlangıç tarihi</label>
                  <input type="date" className="border py-1"/>
                </div>
              </div>
            </div>
          ))
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