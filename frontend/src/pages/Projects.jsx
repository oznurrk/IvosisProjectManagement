import React, { useEffect, useState } from "react";
import axios from "axios";
import { Text } from "@mantine/core";
import ProjectDetails from "./ProjectDetails";
import ProjectFilters from "../components/Project/ProjectFilters";
import { useNavigate } from "react-router-dom"; // ekle


const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate(); 
  

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

  const handleCardClick = (projectId) => {
    setSelectedProjectId(projectId);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Arama & filtre bileşeni */}
      <ProjectFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="flex justify-end my-4">
        <button
          onClick={() => navigate("/projectCreated")}
          className="bg-ivosis-500 text-white px-4 py-2 rounded shadow hover:bg-ivosis-600 transition"
        >
          + Yeni Proje Ekle
        </button>
      </div>

      {/* Proje Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {filteredProjects.length === 0 ? (
          <p className="text-gray-600">Arama sonucu bulunamadı.</p>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleCardClick(project.id)}
              className="cursor-pointer bg-white border border-ivosis-400 p-4 w-full max-w-xs flex flex-col gap-1 rounded-xl hover:shadow-[0_0_5px_1px_yellow] !shadow-ivosis-400 transition-shadow"
            >
              <div className="flex gap-2 items-center">
                <div className="font-semibold text-natural-950 text-xl">
                  {project.name}
                </div>
              </div>

              <Text className="!text-xs text-justify !text-natural-800" lineClamp={3}>
                {project.description || "Açıklama yok"}
              </Text>

              <div className="flex gap-2 text-xs">
                <div className={`${getPriorityClass(project.priority)} py-1 px-2 rounded-lg`}>
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
                Eklendi: {formatDate(project.CreatedAt)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <ProjectDetails
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default Projects;
