import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Divider } from "@mantine/core";
import ProcessSelect from "../components/Process/ProcessSelect";

const ProjectDetails = ({ opened, onClose, projectId: propProjectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // projectId hem prop'tan hem localStorage'tan alınabilir
  const projectId = propProjectId || localStorage.getItem("selectedProjectId");

  useEffect(() => {
    if (!opened || !projectId) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/Projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(res.data);
      } catch (err) {
        setError("Proje bilgileri alınırken hata oluştu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // localStorage'a yedek olarak projectId yaz
    localStorage.setItem("selectedProjectId", projectId);

    fetchProject();
  }, [opened, projectId]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <h2 className="text-xl sm:text-2xl font-bold text-natural-950">
          {project?.name || "Proje Detayları"}
        </h2>
      }
      size="xl"
      centered
      scrollAreaComponent="div"
      classNames={{
        body: "p-4 sm:p-6",
      }}
    >
      <Divider my="sm" size="xs" color="natural.7" />

      {loading ? (
        <p>Yükleniyor...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {/* Process Seçimi */}
          <div className="w-full">
            <ProcessSelect
              onSelect={(id) => console.log("Seçilen Process ID:", id)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectDetails;
