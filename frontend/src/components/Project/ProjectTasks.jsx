import { useEffect, useState } from "react";
import axios from "axios";
import { Divider, Select, Textarea } from "@mantine/core";

const ProjectTasks = () => {
  const [processName, setProcessName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectTasks, setProjectTasks] = useState([]);
  const [users,setUsers] = useState([]);


  const processId = localStorage.getItem("selectedProcessId");
  const projectId = localStorage.getItem("selectedProjectId");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // process id'sini alma ve id'ye göre process title gösterme
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

    fetchUsers();
  }, [processId, projectId]);

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
    </div>
  );
};

export default ProjectTasks;
