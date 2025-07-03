import { useEffect, useState } from "react";
import { Select, Stack } from "@mantine/core";
import axios from "axios";

const ProcessSelect = ({ onTaskSelect }) => {
  const [processes, setProcesses] = useState([]);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Process verilerini al
  useEffect(() => {
    const fetchProcesses = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/processes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProcesses(res.data);
      } catch (err) {
        console.error("Process verileri alınamadı:", err);
      }
    };

    fetchProcesses();
  }, []);

  // Task'ları getir (process seçilince)
  useEffect(() => {
    if (!selectedProcessId) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tasks/byProcess/${selectedProcessId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Task verileri alınamadı:", err);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [selectedProcessId]);

  // Process seçeneklerini sırala ve girintili göster
  const getProcessOptions = () => {
    const options = [];
    const parents = processes.filter((p) => p.parentProcessId === null);
    const children = processes.filter((p) => p.parentProcessId === 5);

    parents.forEach((proc) => {
      options.push({ value: proc.id.toString(), label: proc.name });

      if (proc.id === 5) {
        children.forEach((child) => {
          options.push({ value: child.id.toString(), label: `↳ ${child.name}` });
        });
      }
    });

    return options;
  };

  return (
    <Stack spacing="sm">
      {/* Process Seçimi */}
      <Select
        label="Süreç Seç"
        placeholder="Bir süreç seçin"
        data={getProcessOptions()}
        value={selectedProcessId}
        onChange={(value) => {
          setSelectedProcessId(value);
          setSelectedTaskId(null); // task resetle
        }}
        searchable
        clearable
      />

      
    </Stack>
  );
};

export default ProcessSelect;
