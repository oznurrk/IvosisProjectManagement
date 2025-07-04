import { useEffect, useState } from "react";
import axios from "axios";

const ProjectTasks = () => {
  const [processName, setProcessName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectTasks, setProjectTasks] = useState([]);

  const processId = localStorage.getItem("selectedProcessId");
  const projectId = localStorage.getItem("selectedProjectId"); // proje kartında kaydetmiş olmalısın

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Proje kartında seçilen sürecin id'sini tutma ve adını gösterme
    const fetchProcessName = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/processes/${processId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProcessName(res.data.name);
      } catch (error) {
        console.error("Process adı alınamadı:", error);
        setProcessName("Bilinmeyen Süreç");
      }
    };

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

    // seçilen sürecin id'sine göre taskları getirme
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

    if (processId) {
      fetchProcessName();
      fetchProcessTasks();
    }

    if (projectId) {
      fetchProjectName();
    }
  }, [processId, projectId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <div className="p-4">
      <h2 className="text-md font-bold text-gray-800 mb-4">Seçilen Süreç</h2>
      <div className="text-4xl text-ivosis-600 mb-6">{processName}</div>

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
              {/*
              <p className="text-sm text-gray-600 mb-2">
                {task.description || "Açıklama girilmemiş."}
              </p>
              <div className="text-xs text-gray-500">
                <p>Oluşturulma: {formatDate(task.createdAt)}</p>
                <p>Oluşturan: {task.createdByUserId}</p>
                {task.updatedAt && (
                  <p>Güncelleme: {formatDate(task.updatedAt)}</p>
                )}
              </div>

              ProjectTasks tablosunda task'ların altında görünecekler:
                -AssignedUserId
                -Status
                -StartDate
                -EndDate
              */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectTasks;
