import { useEffect, useState } from "react";
import axios from "axios";
import {
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
import { IconSearch, IconFilter, IconX, IconCalendar } from '@tabler/icons-react';
import Header from "../Header/Header";

const ProjectTasks = () => {
  const [projectName, setProjectName] = useState("");
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    processName: "",
    taskName: "",
    status: "",
    startDate: "",
    endDate: ""
  });

  const ITEMS_PER_PAGE = 6;
  const CARD_HEIGHT = 400;

  const projectId = localStorage.getItem("selectedProjectId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProjectData = async () => {
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

        const grouped = {};
        for (const task of projectTasksRes.data) {
          const processId = task.processId;
          if (!grouped[processId]) grouped[processId] = [];
          grouped[processId].push(task);
        }

        const result = await Promise.all(
          Object.entries(grouped).map(async ([processId, tasks]) => {
            let processName = "";
            let assignedUser = "";

            try {
              const processRes = await axios.get(
                `http://localhost:5000/api/processes/${processId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              processName = processRes.data.name;
            } catch { }

            try {
              const firstAssigned = tasks.find(t => t.assignedUserId);
              if (firstAssigned) {
                const userRes = await axios.get(
                  `http://localhost:5000/api/users/${firstAssigned.assignedUserId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                assignedUser = userRes.data.name;
              }
            } catch { }

            const tasksWithNames = await Promise.all(
              tasks.map(async (task) => {
                try {
                  const t = await axios.get(
                    `http://localhost:5000/api/tasks/${task.taskId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  return { ...task, task: t.data };
                } catch {
                  return { ...task, task: { title: "Bilinmeyen Görev" } };
                }
              })
            );

            // Sort tasks by order if available
            const sortedTasks = tasksWithNames.sort((a, b) =>
              (a.task.order || 0) - (b.task.order || 0)
            );

            return {
              processId,
              processName,
              assignedUser,
              tasks: sortedTasks,
            };
          })
        );

        setProjectProcesses(result);
        setFilteredProcesses(result);
      } catch (err) {
        console.error("Veriler alınamadı", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProjectData();
  }, [projectId, token]);

  useEffect(() => {
    applyFilters();
  }, [searchFilters, projectProcesses]);

  const applyFilters = () => {
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

    setFilteredProcesses(filtered);

    // Sayfa numarası geçerli değilse 1'e çek
    const totalFilteredItems = filtered.flatMap(p => p.tasks).length;
    const totalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE);
    setCurrentPage((prev) => Math.min(prev, totalPages || 1));
  };

  const clearFilters = () => {
    setSearchFilters({
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

  const handleComplete = async (task) => {
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
    } catch (err) {
      console.error("Güncelleme hatası", err);
    }
  };

  const handleFileUpload = async (taskId, file) => {
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

      // Update the task with the new file path
      setProjectProcesses(prev =>
        prev.map(p => ({
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, filePath: response.data.filePath } : t)
        }))
      );
    } catch (err) {
      console.error("Dosya yükleme hatası", err);
    }
  };

  const updateTaskInState = (taskId, updates) => {
    setProjectProcesses(prev =>
      prev.map(p => ({
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }))
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
      case "NotStarted": return "#7ed2e2";
      case "InProgress": return "#7ed2e2";
      case "Completed": return "#7ed2e2";
      case "Cancelled": return "#7ed2e2";
      default: return "#7ed2e2";
    }
  };

  const calculateStatusStats = (tasks) => {
    const total = tasks.length;
    if (total === 0) return { notStarted: 100, inProgress: 0, completed: 0, cancelled: 0 };

    const stats = {
      notStarted: tasks.filter(t => t.status === "NotStarted").length,
      inProgress: tasks.filter(t => t.status === "InProgress").length,
      completed: tasks.filter(t => t.status === "Completed").length,
      cancelled: tasks.filter(t => t.status === "Cancelled").length,
    };

    return {
      notStarted: Math.round((stats.notStarted / total) * 100),
      inProgress: Math.round((stats.inProgress / total) * 100),
      completed: Math.round((stats.completed / total) * 100),
      cancelled: Math.round((stats.cancelled / total) * 100),
    };
  };

  const calculateProjectStats = () => {
    const allTasks = filteredProcesses.flatMap(p => p.tasks);
    return calculateStatusStats(allTasks);
  };

  const StatusBar = ({ stats, size = "md", showLabels = true }) => (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text size="xs" style={{ color: '#7ed2e2' }}>Başlamadı: {stats.notStarted}%</Text>
          <Text size="xs" style={{ color: '#7ed2e2' }}>Devam: {stats.inProgress}%</Text>
          <Text size="xs" style={{ color: '#7ed2e2' }}>Tamamlandı: {stats.completed}%</Text>
          <Text size="xs" style={{ color: '#7ed2e2' }}>İptal: {stats.cancelled}%</Text>
        </div>
      )}
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1 }}>
          <Progress value={stats.notStarted} color="#7ed2e2" size={size} />
        </div>
        <div style={{ flex: 1 }}>
          <Progress value={stats.inProgress} color="yellow" size={size} />
        </div>
        <div style={{ flex: 1 }}>
          <Progress value={stats.completed} color="green" size={size} />
        </div>
        <div style={{ flex: 1 }}>
          <Progress value={stats.cancelled} color="red" size={size} />
        </div>
      </div>
    </div>
  );

  // Pagination
  const allTasks = filteredProcesses.flatMap(process =>
    process.tasks.map(task => ({ ...task, processName: process.processName, assignedUser: process.assignedUser }))
  );

  const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = allTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="p-8 text-center min-h-[400px] flex items-center justify-center bg-[#effafc]">
        <Stack align="center" spacing="md">
          <div className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: '3px solid #d6f3f7',
              borderTop: '3px solid #279ab3',
            }} />
          <Text size="lg" color="dimmed">Yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  const projectStats = calculateProjectStats();

  return (
    <div className="min-h-screen bg-white p-0 m-0">
      <div className="w-full">  {/* maxWidth kaldırıldı */}

        {/* Header */}
        <Header
          title="Görevler"
          subtitle={`${projectName} Projesine Ait Tüm Görevler`}
          icon={IconCalendar}
          stats={projectStats}
          showStats={true}
        />

        {/* Search and Filter Section */}
        <Paper shadow="md" padding="lg" className="mb-6 bg-white pl-3 pr-3">
          <Group position="apart" className="mb-4">
            <Group spacing="xs">
              <IconFilter size={20} color="#279ab3" />
              <Text size="md" weight={500} className="text-[#279ab3]">
                Filtreleme ve Arama
              </Text>
            </Group>
            <ActionIcon
              variant="light"
              color="#279ab3"
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
                placeholder="Süreç adına göre ara..."
                value={searchFilters.processName}
                onChange={(e) => handleFilterChange('processName', e.target.value)}
                style={{ '& .mantine-TextInput-input': { borderColor: '#b3e6ee' } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                leftSection={<IconSearch size={16} />}
                placeholder="Görev adına göre ara..."
                value={searchFilters.taskName}
                onChange={(e) => handleFilterChange('taskName', e.target.value)}
                style={{ '& .mantine-TextInput-input': { borderColor: '#b3e6ee' } }}
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
                style={{ '& .mantine-Select-input': { borderColor: '#b3e6ee' } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
              <TextInput
                type="date"
                placeholder="Başlangıç tarihi..."
                value={searchFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={{ '& .mantine-TextInput-input': { borderColor: '#b3e6ee' } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 6 }}>
              <TextInput
                type="date"
                placeholder="Bitiş tarihi..."
                value={searchFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={{ '& .mantine-TextInput-input': { borderColor: '#b3e6ee' } }}
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
                className="flex flex-col bg-white border transition-all duration-200 ease-linear"
                style={{
                  height: CARD_HEIGHT,
                  borderColor: '#b3e6ee',
                }}
              >
                <Stack spacing="sm" style={{ height: '100%' }}>
                  {/* Task Header */}
                  <Group position="apart" align="flex-start">
                    <Text size="sm" weight={500} className="flex-1"
                      style={{
                        color: '#112d3b',
                        lineHeight: 1.4,
                      }}>
                      {task.task?.title}
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

                  {/* Process Info */}
                  <Paper padding="xs" style={{ backgroundColor: '#effafc' }}>
                    <Group spacing="xs">
                      <Text size="xs" color="#279ab3" weight={500}>
                        📋 {task.processName}
                      </Text>
                      <Text size="xs" color="#7ed2e2">
                        👤 {task.assignedUser}
                      </Text>
                    </Group>
                  </Paper>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Text size="xs" color="#279ab3" className="mb-1">
                        📅 Başlangıç
                      </Text>
                      <input
                        type="date"
                        value={task.startDate?.split("T")[0] || ""}
                        readOnly
                        className="w-full rounded text-xs py-[6px] px-2"
                        style={{
                          border: '1px solid #b3e6ee',
                          backgroundColor: '#f8f9fa',
                          color: '#279ab3',
                        }}
                      />
                    </div>
                    <div>
                      <Text size="xs" color="#279ab3" className="mb-1">
                        🎯 Bitiş
                      </Text>
                      <input
                        type="date"
                        value={task.endDate?.split("T")[0] || ""}
                        onChange={(e) => updateTaskInState(task.id, { endDate: e.target.value })}
                        className="w-full rounded text-xs py-[6px] px-2"
                        style={{
                          border: '1px solid #b3e6ee',
                          color: '#279ab3',
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
                    style={{ '& .mantine-Select-input': { borderColor: '#b3e6ee' } }}
                  />

                  {/* Description */}
                  <Textarea
                    size="sm"
                    placeholder="Görev açıklaması..."
                    value={task.description || ""}
                    onChange={(e) => updateTaskInState(task.id, { description: e.target.value })}
                    minRows={2}
                    maxRows={3}
                    style={{
                      flex: 1,
                      '& .mantine-Textarea-input': { borderColor: '#b3e6ee' }
                    }}
                  />

                  {/* File Upload */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0"
                      style={{ color: '#279ab3' }}>📎</span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        files.forEach((file) => handleFileUpload(task.id, file));
                      }}
                      className="flex-1 text-xs p-1 rounded"
                      style={{ border: '1px solid #b3e6ee' }}
                    />
                  </div>

                  {/* Update Button */}
                  <Button
                    size="sm"
                    onClick={() => handleComplete(task)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="md"
              color="#279ab3"
            />
          </div>
        )}

        {/* No Results */}
        {filteredProcesses.length === 0 && (
          <Paper shadow="md" padding="xl" className="text-center mt-8">
            <Text size="lg" color="#279ab3" weight={500}>
              Arama kriterlerinize uygun görev bulunamadı.
            </Text>
            <Button
              variant="light"
              color="#279ab3"
              onClick={clearFilters}
              className="mt-4"
            >
              Filtreleri Temizle
            </Button>
          </Paper>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProjectTasks;

