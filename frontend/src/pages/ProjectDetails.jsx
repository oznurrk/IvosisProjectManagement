import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Modal,
  Divider,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Select,
  Box,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

const ProjectDetails = ({ opened, onClose, projectId: propProjectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processes, setProcesses] = useState([]);
  const [assignedEngineers, setAssignedEngineers] = useState({});
  const [users, setUsers] = useState([]);
  const [selectingProcessId, setSelectingProcessId] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const projectId = propProjectId || localStorage.getItem("selectedProjectId");

  useEffect(() => {
    if (!opened || !projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/Projects/${projectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProject(res.data);
      } catch (err) {
        setError("Proje bilgileri alınırken hata oluştu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    localStorage.setItem("selectedProjectId", projectId);
    fetchProject();
  }, [opened, projectId]);

  useEffect(() => {
    const fetchProcesses = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/processes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProcesses(res.data);
      } catch (err) {
        console.error("Süreç verileri alınamadı:", err);
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedUsers = res.data.map((user) => ({
          value: user.id.toString(),
          label: user.name,
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Kullanıcı Listesi alınamadı:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleAssignEngineer = (processId, userId) => {
    setAssignedEngineers((prev) => ({
      ...prev,
      [processId]: userId || null,
    }));
    setSelectingProcessId(null);
  };

  const handleSaveAssignments = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const payloads = Object.entries(assignedEngineers)
      .filter(([_, userId]) => userId)
      .map(([processId, userId]) => ({
        projectId: Number(projectId),
        processId: Number(processId),
        assignedUserId: Number(userId),
        taskId: null,
        status: null,
        startDate: null,
        endDate: null,
        description: null,
        filePath: null,
        createdAt: null,
        createdByUserId: null,
        updatedAt: null,
        updatedByUserId: null,
      }));

    try {
      setSaving(true);
      await Promise.all(
        payloads.map((payload) =>
          axios.post("http://localhost:5000/api/projectTasks", payload, {
            headers,
          })
        )
      );
      alert("Atamalar başarıyla kaydedildi.");
      onClose(); // modal kapatılır
    } catch (err) {
      console.error("Atamalar kaydedilirken hata oluştu:", err);
      alert("Atamalar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const renderProcessCard = (proc, isChild = false) => {
    const selectedUserId = assignedEngineers[proc.id];
    const selectedUser = users.find((u) => u.value === selectedUserId);

    return (
      <Card
        key={proc.id}
        shadow="sm"
        radius="md"
        withBorder
        style={{
          marginBottom: 12,
          marginLeft: isChild ? 24 : 0,
          borderLeft: isChild ? "3px solid #ccc" : undefined,
        }}
      >
        <Group position="apart" align="start">
          <Box>
            <Text fw={500}>
              {isChild ? "↳ " : ""}
              {proc.name}
            </Text>
            {selectedUser && (
              <Text size="sm" c="dimmed" mt={4}>
                Atanan Sorumlu: <strong>{selectedUser.label}</strong>
              </Text>
            )}
          </Box>

          <Button
            size="xs"
            variant="light"
            onClick={() => setSelectingProcessId(proc.id)}
          >
            {selectedUser ? "Atamayı Düzenle" : "Mühendis Ata"}
          </Button>
        </Group>

        {selectingProcessId === proc.id && (
          <Select
            data={users}
            placeholder="Bir mühendis seçin"
            value={selectedUserId || null}
            onChange={(val) => handleAssignEngineer(proc.id, val)}
            searchable
            clearable
            mt="sm"
          />
        )}
      </Card>
    );
  };

  const renderProcessTree = () => {
    const parents = processes.filter((p) => p.parentProcessId === null);
    const children = processes.filter((p) => p.parentProcessId !== null);

    return parents.map((parent) => {
      const childProcesses = children.filter(
        (c) => c.parentProcessId === parent.id
      );
      return (
        <div key={parent.id}>
          {renderProcessCard(parent)}
          {childProcesses.map((child) => renderProcessCard(child, true))}
        </div>
      );
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      scrollAreaComponent="div"
      title={
        <Text size="lg" fw={700}>
          {project?.name || "Proje Detayları"}
        </Text>
      }
      classNames={{
        body: "p-4 sm:p-6",
      }}
    >
      <Divider my="sm" size="xs" color="gray" />

      {loading ? (
        <Text>Yükleniyor...</Text>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : (
        <>
          <Stack spacing="md">{renderProcessTree()}</Stack>

          <Button
            mt="lg"
            fullWidth
            onClick={handleSaveAssignments}
            loading={saving}
          >
            Atamaları Kaydet
          </Button>
        </>
      )}
    </Modal>
  );
};

export default ProjectDetails;
