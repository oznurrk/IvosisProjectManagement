/*import React, { useEffect, useState } from "react";
import { useParams} from "react-router-dom";
import axios from "axios";
import { Divider } from "@mantine/core";

const priorityOptions = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "critical", label: "Kritik" },
];

const statusOptions = [
  { value: "todo", label: "Yapılacak" },
  { value: "inprogress", label: "Devam Ediyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
];

const ProjectDetails = () => {
  const {id } = useParams();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form durumları sadece düzenlenebilir alanlar için
  const [formData, setFormData] = useState({
    endDate: "",
    priority: "medium",
    status: "todo",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/Projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(res.data);
        setFormData({
          endDate: res.data.endDate || "",
          priority: res.data.priority || "medium",
          status: res.data.status || "todo",
        });
      } catch (err) {
        setError("Proje bilgileri alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleEditClick = () => {
    if (isEditing) {
      // Kaydetme işlemi
      saveChanges();
    } else {
      setIsEditing(true);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/Projects/${id}`,
        {
          ...project,
          endDate: formData.endDate,
          priority: formData.priority,
          status: formData.status,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject({
        ...project,
        endDate: formData.endDate,
        priority: formData.priority,
        status: formData.status,
      });
      setIsEditing(false);
      alert("Proje başarıyla güncellendi.");
    } catch (err) {
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!project) return <div className="p-6">Proje bulunamadı.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-8">
      
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        <p className="mb-4 text-gray-700">{project.description || "Açıklama yok"}</p>
        <p><strong>Başlama Tarihi:</strong> {new Date(project.startDate).toLocaleDateString("tr-TR")}</p>
      </div>

    
      <div className="bg-white p-6 rounded shadow flex flex-col gap-4">
        <label>
          <span className="font-semibold">Bitiş Tarihi:</span>
          {isEditing ? (
            <input
              type="date"
              value={formData.endDate ? formData.endDate.slice(0, 10) : ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-1 border rounded px-3 py-2 w-full"
            />
          ) : (
            <span className="ml-2">{project.endDate ? new Date(project.endDate).toLocaleDateString("tr-TR") : "-"}</span>
          )}
        </label>

        <label>
          <span className="font-semibold">Öncelik:</span>
          {isEditing ? (
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="mt-1 border rounded px-3 py-2 w-full"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <span className="ml-2">{priorityOptions.find((p) => p.value === project.priority)?.label || "-"}</span>
          )}
        </label>

        <label>
          <span className="font-semibold">Durum:</span>
          {isEditing ? (
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 border rounded px-3 py-2 w-full"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <span className="ml-2">{statusOptions.find((s) => s.value === project.status)?.label || "-"}</span>
          )}
        </label>

        <button
          onClick={handleEditClick}
          className="self-end bg-ivosis-400 text-white px-6 py-2 rounded hover:bg-ivosis-500 transition"
          disabled={loading}
        >
          {isEditing ? "Kaydet" : "Düzenle"}
        </button>
      </div>
      <Divider size="xs" color="natural.7" />
      <div>
        asdasdasdasdasdasdasdasdasda
      </div>
    </div>
  );
};

export default ProjectDetails;
*/


import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Divider } from "@mantine/core";
import ProcessSelect from "../components/Process/ProcessSelect";





const ProjectDetails = ({ opened, onClose, projectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  
  useEffect(() => {
    if (!opened || !projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/Projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProject(res.data);
        
      } catch (err) {
        setError("Proje bilgileri alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [opened, projectId]);

  const handleEditClick = () => {
    if (isEditing) saveChanges();
    else setIsEditing(true);
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/Projects/${projectId}`,
        {
          ...project
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProject({
        ...project
      });

      setIsEditing(false);
      alert("Proje başarıyla güncellendi.");
    } catch {
      alert("Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<h2 className="text-2xl font-bold text-natural-950">
      {project?.name || "Proje Detayları"}
    </h2>}
      size="xl"
      centered
    >
      <Divider  my="sm" size="xs" color="natural.7"  />
      <ProcessSelect onSelect={(id) => console.log("Seçilen Process ID:", id)} />

    </Modal>
  );
};

export default ProjectDetails;
