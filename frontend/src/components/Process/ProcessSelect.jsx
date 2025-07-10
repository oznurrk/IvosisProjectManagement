import { useEffect, useState } from "react";
import { Button, Select, Stack } from "@mantine/core";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProcessSelect = () => {
  const [processes, setProcesses] = useState([]);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const navigate = useNavigate();

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

  // Seçenekleri oluştur
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

  // Butona tıklandığında yönlendir
  const handleStartProcess = () => {
    if (!selectedProcessId) return;

    // Seçilen process ID'yi sakla
    localStorage.setItem("selectedProcessId", selectedProcessId);

    // Sayfaya yönlendir
    navigate("/projectTasks");
  };

  return (
    <Stack spacing="sm">
      <Select
        label="Süreç Seç"
        placeholder="Bir süreç seçin"
        data={getProcessOptions()}
        value={selectedProcessId}
        onChange={(value) => setSelectedProcessId(value)}
        searchable
        clearable
      />

      <Button
        color="green.6"
        onClick={handleStartProcess}
        disabled={!selectedProcessId}
      >
        Süreci Başlat
      </Button>
    </Stack>
  );
};

export default ProcessSelect;
