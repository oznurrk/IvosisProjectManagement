// Bu bileşen props olarak processId alacak ve modal içeriğini sayfa gibi gösterecek
import { useEffect, useState } from "react";
import {
  Card, Text, Stack, Group, Badge, TextInput,
  Select, Textarea, FileInput, Button, Divider, ScrollArea,
  Grid
} from "@mantine/core";
import { IconFolder, IconFile, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import ProjectProcessSelectModal from "./ProjectProcessSelectModal";

const ProjectProcessTaskSelectModal = ({ projectId, processId }) => {
  const [tasks, setTasks] = useState([]);
  const [processName, setProcessName] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectTasksRes = await axios.get(
          `http://localhost:5000/api/projectTasks/by-project/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const filtered = projectTasksRes.data.filter(t => t.processId === parseInt(processId));
        if (filtered.length === 0) return;

        const taskWithNames = await Promise.all(
          filtered.map(async (task) => {
            let taskName = "Bilinmeyen Görev";
            try {
              const res = await axios.get(`http://localhost:5000/api/tasks/${task.taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              taskName = res.data.title;
            } catch { }

            return { ...task, task: { title: taskName } };
          })
        );

        // process adı
        try {
          const processRes = await axios.get(`http://localhost:5000/api/processes/${processId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProcessName(processRes.data.name);
        } catch { }

        // kullanıcı
        try {
          const userId = filtered.find(t => t.assignedUserId)?.assignedUserId;
          if (userId) {
            const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedUser(userRes.data.name);
          }
        } catch { }

        setTasks(taskWithNames);
      } catch (err) {
        console.error("Görevler alınamadı", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && processId) {
      fetchData();
    }
  }, [projectId, processId]);

  const updateTaskField = (taskId, field, value) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, [field]: value } : t)
    );
  };

  const handleUpdate = async (task) => {
    try {
      await axios.put(
        `http://localhost:5000/api/projectTasks/${task.id}`,
        {
          status: task.status,
          description: task.description,
          endDate: task.endDate,
          filePath: task.filePath || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Görev güncellendi");
    } catch (err) {
      console.error("Güncelleme hatası", err);
    }
  };

  const handleFileUpload = async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `http://localhost:5000/api/projectTasks/upload/${taskId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );
      updateTaskField(taskId, "filePath", res.data.filePath);
    } catch (err) {
      console.error("Dosya yüklenemedi", err);
    }
  };

  if (loading) return <Text align="center">Yükleniyor...</Text>;

  return (
    <div className="p-4">
      <Text size="lg" weight={600} className="mb-4 text-[#112d3b]">
        {processName} Sürecine Ait Görevler ({assignedUser})
      </Text>
      <Grid>
        {tasks.map(task => (
          <Grid.Col span={{ base: 12, md: 6 }} key={task.id}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack spacing="xs">
                <Group position="apart">
                  <Text weight={500} color="#112d3b">{task.task.title}</Text>
                  <Badge>{task.status}</Badge>
                </Group>

                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    type="date"
                    label="Başlangıç"
                    value={task.startDate?.split("T")[0] || ""}
                    readOnly
                  />
                  <TextInput
                    type="date"
                    label="Bitiş"
                    value={task.endDate?.split("T")[0] || ""}
                    onChange={(e) => updateTaskField(task.id, "endDate", e.target.value)}
                  />
                </div>

                <Select
                  label="Durum"
                  value={task.status}
                  onChange={(value) => updateTaskField(task.id, "status", value)}
                  data={[
                    { value: "NotStarted", label: "Başlamadı" },
                    { value: "InProgress", label: "Devam Ediyor" },
                    { value: "Completed", label: "Tamamlandı" },
                    { value: "Cancelled", label: "İptal Edildi" },
                  ]}
                />

                <Textarea
                  label="Açıklama"
                  value={task.description || ""}
                  onChange={(e) => updateTaskField(task.id, "description", e.target.value)}
                />

                <Text size="sm">Dosya Yükle</Text>
                <input
                  type="file"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    files.forEach(f => handleFileUpload(task.id, f));
                  }}
                />

                <Button onClick={() => handleUpdate(task)} variant="filled" color="teal">
                  Güncelle
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default ProjectProcessTaskSelectModal;
