import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Select, Card, Text, Group, Stack, Badge, Button, Grid, Paper, Title, Divider, Modal } from "@mantine/core";
import { IconCalendar, IconUsers, IconEdit } from '@tabler/icons-react';
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";
import PaginationComponent from "../../Layout/PaginationComponent";

const ProjectProcess = ({ onProcessSelect }) => {
  const [projectName, setProjectName] = useState("");
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [processToReassign, setProcessToReassign] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [processAssignModalOpen, setProcessAssignModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    processName: "",
    startDate: "",
    endDate: ""
  });

  // Sayfa boyutu state'i
  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem("pageSize");
    return stored ? parseInt(stored) : 6;
  });
  
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
  }, []);

  // Status helper functions - memoized
  const statusConfig = useMemo(() => ({
    NotStarted: { label: "Başlamadı", color: "#7ed2e2" },
    InProgress: { label: "Devam Ediyor", color: "#ffd43b" },
    Completed: { label: "Tamamlandı", color: "#51cf66" },
    Cancelled: { label: "İptal Edildi", color: "#ff6b6b" }
  }), []);

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
          UpdatedBy: currentUserId,
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

    if (searchFilters.startDate || searchFilters.endDate) {
      filtered = filtered.filter(process => {
        const processDate = process.processCreatedDate ? process.processCreatedDate.split('T')[0] : '';
        const matchesStartDate = !searchFilters.startDate || processDate >= searchFilters.startDate;
        const matchesEndDate = !searchFilters.endDate || processDate <= searchFilters.endDate;
        return matchesStartDate && matchesEndDate;
      });
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
      processName: "", 
      startDate: "", 
      endDate: ""
    });
    setCurrentPage(1);
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
              <div 
                style={{ 
                  height: size === "lg" ? 8 : 6, 
                  backgroundColor: config.color, 
                  width: `${stats[statKey] || 0}%`,
                  borderRadius: 2
                }} 
              />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header
        title="Süreçler"
        subtitle={`${projectName}`}
        icon={IconCalendar}
        stats={projectStats}
        showStats={true}
      />

      <div className="px-4 sm:px-6 py-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            {key:"processName", type:"text", placeholder: "Süreç adına göre ara..."},
            {key:"startDate", type:"date", label:"Başlangıç Tarihi"},
            {key:"endDate", type:"date", label:"Bitiş Tarihi"}
          ]}
        />

        <Grid gutter={{ base: "md", sm: "lg", xl: "xl" }}>
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
                      height: { base: 'auto', sm: 400 },
                      minHeight: 350,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => onProcessSelect(process)}
                  >
                    {/* Header Section - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3 sm:gap-0" style={{ minHeight: '80px' }}>
                      <div className="flex-1 overflow-hidden w-full">
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
                            marginBottom: '8px',
                            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)'
                          }}
                          title={process.processName}
                        >
                          {process.processName}
                        </Title>
                        <Badge 
                          size="lg" 
                          variant="light" 
                          color="blue"
                          className="w-fit"
                        >
                          {completionPercentage}% Tamamlandı
                        </Badge>
                      </div>
                    </div>

                    <Divider color="gray.3" className="mb-4" />

                    {/* Info Section - Responsive */}
                    <div className="flex-1 flex flex-col justify-between">
                      <Stack spacing="sm">
                        <Paper 
                          padding="sm" 
                          radius="md" 
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                        >
                          <Group spacing="xs" align="center">
                            <IconCalendar size={16} />
                            <Text size="sm" color="ivosis.6" weight={500} className="text-xs sm:text-sm">
                              Oluşturulma: {formatDate(process.processCreatedDate)}
                            </Text>
                          </Group>
                        </Paper>

                        <Paper 
                          padding="sm" 
                          radius="md" 
                        >
                          <Group spacing="xs" align="center" position="apart" className="flex-wrap">
                            <Group spacing="xs" className="flex-1 min-w-0">
                              <IconUsers size={16} />
                              <Text 
                                size="sm" 
                                weight={500}
                                className="truncate text-xs sm:text-sm"
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
                              className="flex-shrink-0 mt-2 sm:mt-0"
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
                              <Text size="lg" weight={700} color="#7c3aed" className="text-base sm:text-lg">
                                {totalTasks}
                              </Text>
                              <Text size="xs" color="#7c3aed" className="text-xs sm:text-sm">
                                Toplam Görev
                              </Text>
                            </Group>
                          </Paper>
                        </div>
                      </Stack>

                      {/* Progress Section - Responsive */}
                      <div className="mt-4">
                        <Text size="sm" weight={600} color="#475569" className="mb-3 text-xs sm:text-sm">
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
};

export default ProjectProcess;