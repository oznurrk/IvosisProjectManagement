import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Stack, Group, Divider } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProjectDetails = ({ opened, onClose, projectId }) => {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [existingProcessIds, setExistingProcessIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!opened) return;

    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const [procRes, userRes, existingTasksRes] = await Promise.all([
          axios.get("http://localhost:5000/api/processes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/projectTasks/by-project/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProcesses(procRes.data.map((p) => ({ value: p.id.toString(), label: p.name })));
        setUsers(userRes.data.map((u) => ({ value: u.id.toString(), label: u.name })));

        const existingProcesses = existingTasksRes.data.map(task => task.processId.toString());
        const uniqueExistingProcesses = [...new Set(existingProcesses)];
        setExistingProcessIds(uniqueExistingProcesses);

        setAssignments([{ processId: null, userId: null, id: Date.now() }]);
      } catch (err) {
        console.error("Veri alınırken hata:", err);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [opened, projectId]);

  const updateAssignment = (id, field, value) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      { processId: null, userId: null, id: Date.now() },
    ]);
  };

  const canSave = assignments.every((a) => a.processId && a.userId);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);

    try {
      const allPayloads = [];

      for (const { processId, userId } of assignments) {
        const taskRes = await axios.get(
          `http://localhost:5000/api/tasks/by-process/${processId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const taskList = taskRes.data;
        if (!Array.isArray(taskList) || taskList.length === 0) continue;

        const payloads = taskList.map((task) => ({
          projectId: parseInt(projectId),
          processId: parseInt(processId),
          taskId: parseInt(task.id),
          assignedUserId: parseInt(userId),
          status: "ToDo",
          startDate: new Date().toISOString(),
          endDate: null,
          description: task.description || "",
          filePath: null,
          createdAt: new Date().toISOString(),
          createdByUserId: 1,
          updatedAt: null,
          updatedByUserId: null,
        }));

        allPayloads.push(...payloads);
      }

      if (allPayloads.length === 0) {
        setShowError(true);
        return;
      }

      const promises = allPayloads.map((payload) =>
        axios.post("http://localhost:5000/api/projectTasks", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(promises);

      // 🌟 Proje ID’yi kaydet ve yönlendir
      localStorage.setItem("selectedProjectId", projectId);
      setShowSuccess(true);
    } catch (err) {
      console.error("Görev atanırken hata:", err);
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };

  const usedProcessIds = assignments.map((a) => a.processId).filter(Boolean);
  const allUnavailableProcessIds = [...usedProcessIds, ...existingProcessIds];

  const availableProcesses = processes.filter(
    (p) => !allUnavailableProcessIds.includes(p.value)
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Proje Süreçleri ve Atamalar"
        size="lg"
        centered
        scrollAreaComponent="div"
      >
        <Stack spacing="md">
          {assignments.map(({ id, processId, userId }, index) => (
            <Group key={id} grow>
              <Select
                label={index === 0 ? "Süreç Seçin" : undefined}
                placeholder="Süreç Seçin"
                data={processId ? processes : availableProcesses}
                value={processId}
                onChange={(val) => updateAssignment(id, "processId", val)}
                searchable
                clearable
                required
              />
              <Select
                label={index === 0 ? "Mühendis Seçin" : undefined}
                placeholder="Mühendis Seçin"
                data={users}
                value={userId}
                onChange={(val) => updateAssignment(id, "userId", val)}
                searchable
                clearable
                required
              />
            </Group>
          ))}

          <Button
            disabled={
              assignments.length === 0 ||
              !assignments[assignments.length - 1].processId ||
              !assignments[assignments.length - 1].userId
            }
            onClick={addAssignment}
          >
            Süreç Ekle
          </Button>

          <Divider />

          <Button
            fullWidth
            color="blue"
            disabled={!canSave}
            loading={saving}
            onClick={handleSave}
          >
            Süreci Başlat
          </Button>
        </Stack>
      </Modal>

      {/* Başarı Modalı */}
      <Modal
        opened={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
          navigate("/projectTasks");
        }}
        title="Başarılı"
        centered
      >
        <p>Süreçler başarıyla oluşturuldu.</p>
        <div className="flex justify-end mt-4">
          <Button onClick={() => {
            setShowSuccess(false);
            onClose();
            navigate("/projectTasks");
          }}>Tamam</Button>
        </div>
      </Modal>

      {/* Hata Modalı */}
      <Modal
        opened={showError}
        onClose={() => setShowError(false)}
        title="Hata"
        centered
      >
        <p>Görev atanırken bir hata oluştu. Lütfen tekrar deneyin.</p>
        <div className="flex justify-end mt-4">
          <Button color="red" onClick={() => setShowError(false)}>Tamam</Button>
        </div>
      </Modal>
    </>
  );
};

export default ProjectDetails;
