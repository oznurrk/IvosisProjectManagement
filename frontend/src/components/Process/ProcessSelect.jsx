import { useEffect, useState } from "react";
import { Button, Select, Stack } from "@mantine/core";
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
      <Button>Kaydet</Button>
    </Stack>
  );
};

export default ProcessSelect;
