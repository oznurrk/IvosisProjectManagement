import React, { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "todo",
  });
  const [currentPage, setCurrentPage] = useState("dashboard");

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

  // Veritabanından projeleri çek
  useEffect(() => {
  const token = localStorage.getItem("token"); // Token burada alınır

  axios
    .get("http://localhost:5000/api/projects", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => setProjects(res.data))
    .catch((err) => console.error("Proje çekme hatası:", err));
}, []);

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Proje adı zorunludur.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/projects", formData);
      setProjects((prev) => [...prev, response.data]);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "medium",
        status: "todo",
      });
      setCurrentPage("dashboard");
      alert("Proje başarıyla eklendi.");
    } catch (error) {
      console.error("Proje ekleme hatası:", error);
      alert("Proje eklenemedi.");
    }
  };

  // Liste görünümü
  if (currentPage === "dashboard") {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projeler</h1>
          <button
            className="bg-ivosis-400 text-white px-4 py-2 rounded"
            onClick={() => setCurrentPage("add")}
          >
            Proje Ekle
          </button>
        </div>
        {projects.length === 0 ? (
          <p>Henüz kayıtlı proje yok.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Adı</th>
                <th className="p-2 border">Açıklama</th>
                <th className="p-2 border">Atanan Kullanıcı</th>
                <th className="p-2 border">Başlangıç Tarihi</th>
                <th className="p-2 border">Bitiş Tarihi</th>
                <th className="p-2 border">Öncelik</th>
                <th className="p-2 border">Durum</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{project.name}</td>
                  <td className="p-2 border">{project.description}</td>
                  <td className="p-2 border">{project.assignedUserName}</td>
                  <td className="p-2 border">{project.startDate} </td>
                  <td className="p-2 border">{project.endDate}</td>
                  <td className="p-2 border">
                    {
                      priorityOptions.find((p) => p.value === project.priority)?.label
                    }
                  </td>
                  <td className="p-2 border">
                    {
                      statusOptions.find((s) => s.value === project.status)?.label
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Proje ekleme formu
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Yeni Proje Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Proje Adı *</label>
          <input
            type="text"
            value={formData.name}
            maxLength={250}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Açıklama</label>
          <textarea
            value={formData.description}
            maxLength={500}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            rows="3"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Başlangıç Tarihi</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bitiş Tarihi</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Öncelik</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Durum</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => setCurrentPage("dashboard")}
            className=" bg-red-500 border border-gray-300 px-4 py-2 rounded"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-ivosis-400 text-white px-4 py-2 rounded"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
};

export default Projects;
