import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Text } from "@mantine/core";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Projeler alınamadı:", err));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR");
  };

  const priorityClassMap = {
    Düşük: "bg-blue-500 text-white",
    Orta: "bg-green-500 text-white",
    Yüksek: "bg-orange-500 text-white",
    Kritik: "bg-red-500 text-white",
  };

  const priorityOrderMap = {
    Düşük: 1,
    Orta: 2,
    Yüksek: 3,
    Kritik: 4,
  };

  const getPriorityClass = (priority) =>
    priorityClassMap[priority] || "bg-white text-gray-800";

  const filteredProjects = projects
    .filter((project) => {
      const valuesToSearch = [
        project.name,
        project.description,
        project.startDate,
        project.endDate,
        project.priority,
        project.status,
      ];
      return valuesToSearch.some((field) =>
        field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      let aVal, bVal;

      if (sortField === "priority") {
        aVal = priorityOrderMap[a.priority] || 0;
        bVal = priorityOrderMap[b.priority] || 0;
      } else {
        aVal = new Date(a[sortField]);
        bVal = new Date(b[sortField]);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  return (
    <div className="p-6">
      {/* Arama ve sıralama */}
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <input
          type="text"
          placeholder="Proje adı, açıklama, tarih, öncelik veya durum ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-ivosis-400 rounded-md"
        />

        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 border border-ivosis-400 rounded-md"
          >
            <option value="startDate">Başlama Tarihi</option>
            <option value="endDate">Bitiş Tarihi</option>
            <option value="createdAt">Eklenme Tarihi</option>
            <option value="priority">Öncelik</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-ivosis-400 rounded-md"
          >
            <option value="asc">Artan</option>
            <option value="desc">Azalan</option>
          </select>
        </div>
      </div>

      {/* Kart listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProjects.length === 0 ? (
          <p>Arama sonucu bulunamadı.</p>
        ) : (
          filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projectDetails/${project.id}`}
              className="bg-white border border-ivosis-400 p-4 w-72 flex flex-col gap-1 rounded-xl hover:shadow-[0_0_5px_1px_yellow] !shadow-ivosis-400"
            >
              <div className="flex gap-2 items-center">
                <div>
                  <div className="font-semibold text-natural-950 text-xl">
                    {project.name}
                  </div>
                </div>
              </div>

              <Text
                className="!text-xs text-justify !text-natural-800"
                lineClamp={3}
              >
                {project.description || "Açıklama yok"}
              </Text>

              <div className="flex gap-2 text-xs">
                <div
                  className={`${getPriorityClass(
                    project.priority
                  )} py-1 px-2 rounded-lg`}
                >
                  {project.priority || "-"}
                </div>
                <div className="bg-white text-ivosis-400 py-1 px-2 rounded-lg">
                  {project.status || "-"}
                </div>
              </div>

              <div className="flex justify-between text-sm text-natural-950 font-semibold">
                <div className="flex flex-col items-center">
                  Başlama:
                  <div>{formatDate(project.startDate)}</div>
                </div>
                <div className="flex flex-col items-center">
                  Bitiş:
                  <div>{formatDate(project.endDate)}</div>
                </div>
              </div>

              <div className="text-xs text-right text-gray-500 mt-1 italic">
                Eklendi: {formatDate(project.createdAt)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
