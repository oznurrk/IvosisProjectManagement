import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Text,
  Badge,
  Card,
  Group,
  Stack,
  Divider,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  Pagination,
} from "@mantine/core";
import {
  IconCalendar,
  IconMapPin,
  IconBolt,
  IconSolarPanel,
  IconCpu,
  IconPlus,
  IconInfoCircle,
} from "@tabler/icons-react";
import ProjectDetails from "./ProjectDetails";
import ProjectFilters from "../components/Project/ProjectFilters";
import { useNavigate } from "react-router-dom";
import ProjectCartSelectModal from "../components/Project/ProjectCartSelectModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const pageSize = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [projectRes, cityRes, districtRes, typeRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/cities", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/districts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/projectTypes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProjects(projectRes.data);
        setCities(cityRes.data);
        setDistricts(districtRes.data);
        setProjectTypes(typeRes.data);
      } catch (err) {
        console.error("Veriler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR");
  };

  const getCityName = (id) => cities.find((c) => c.id === id)?.name || `Şehir ID: ${id}`;
  const getDistrictName = (id) => districts.find((d) => d.id === id)?.name || `İlçe ID: ${id}`;
  const getProjectTypeName = (id) => projectTypes.find((p) => p.id === id)?.name || `Tür ID: ${id}`;

  const priorityConfig = {
    Low: { color: "blue", label: "Düşük" },
    Medium: { color: "green", label: "Orta" },
    High: { color: "orange", label: "Yüksek" },
    Critical: { color: "red", label: "Kritik" },
  };

  const statusConfig = {
    Active: { color: "blue", label: "Planlama" },
    Passive: { color: "yellow", label: "Devam Ediyor" },
    Completed: { color: "green", label: "Tamamlandı" },
    Cancelled: { color: "red", label: "İptal Edildi" },
  };

  const priorityOrderMap = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

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

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const pagedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCardClick = (projectId) => {
    setSelectedProjectId(projectId);
    setModalOpen(true);
  };

  const InfoItem = ({ icon: Icon, label, value, color = "gray" }) => (
    <Group gap="xs" wrap="wrap">
      <Icon size={16} color={color} />
      <Stack gap={0}>
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text size="sm" fw={600}>
          {value}
        </Text>
      </Stack>
    </Group>
  );

  const PowerCard = ({ title, value, unit, icon: Icon }) => (
    <Card withBorder padding="sm" radius="md" bg="gray.0">
      <Group gap="xs" justify="space-between" wrap="wrap">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={500}>
            {title}
          </Text>
          <Group gap="xs">
            <Text size="lg" fw={700} c="dark">
              {value || 0}
            </Text>
            <Text size="sm" c="dimmed">
              {unit}
            </Text>
          </Group>
        </Stack>
        <Icon size={24} color="var(--mantine-color-blue-6)" />
      </Group>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 relative min-h-96">
        <LoadingOverlay visible={loading} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <ProjectFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
        <div>
          <Text size="xl" fw={700} c="dark">
            Projeler
          </Text>
          <Text size="sm" c="dimmed">
            {filteredProjects.length} proje bulundu
          </Text>
        </div>
        <button
          onClick={() => navigate("/projectCreated")}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <IconPlus size={20} />
          Yeni Proje Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pagedProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Text size="lg" c="dimmed">
              Arama sonucu bulunamadı.
            </Text>
          </div>
        ) : (
          pagedProjects.map((project) => (
            <Card
    key={project.id}
    onClick={() => handleCardClick(project.id)}
    className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200"
    withBorder
    shadow="sm"
    radius="lg"
    padding="lg"
  >
    <Card.Section withBorder inheritPadding py="sm">
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text size="lg" fw={700} c="dark" lineClamp={1}>
            {project.name}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {project.description || "Açıklama yok"}
          </Text>
          <InfoItem
            icon={IconInfoCircle}
            label="Proje Türü"
            value={getProjectTypeName(project.projectTypeId)}
            color="indigo"
          />
        </Stack>
        <Tooltip label="Detayları görüntüle">
          <ActionIcon variant="light" color="blue" size="sm">
            <IconInfoCircle size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card.Section>

    <Stack gap="md" mt="md">
      <Group justify="space-between">
        <Badge
          color={statusConfig[project.status]?.color || "gray"}
          variant="light"
          size="sm"
        >
          {statusConfig[project.status]?.label || project.status || "Belirsiz"}
        </Badge>
        <Badge
          color={priorityConfig[project.priority]?.color || "gray"}
          variant="filled"
          size="sm"
        >
          {priorityConfig[project.priority]?.label || project.priority || "-"}
        </Badge>
      </Group>

      <Group grow>
        <InfoItem
          icon={IconCalendar}
          label="Başlama"
          value={formatDate(project.startDate)}
          color="green"
        />
        <InfoItem
          icon={IconCalendar}
          label="Bitiş"
          value={formatDate(project.endDate)}
          color="red"
        />
      </Group>

      <Group grow>
        <PowerCard
          title="DC Gücü"
          value={project.dcValue}
          unit="kWp"
          icon={IconBolt}
        />
        <PowerCard
          title="AC Gücü"
          value={project.acValue}
          unit="kWe"
          icon={IconBolt}
        />
      </Group>

      <Group grow>
        <InfoItem
          icon={IconSolarPanel}
          label="Panel"
          value={`${project.panelCount} adet / ${project.panelPower} W`}
          color="orange"
        />
        <InfoItem
          icon={IconCpu}
          label="İnverter"
          value={`${project.inverterCount} adet / ${project.inverterPower} kW`}
          color="purple"
        />
      </Group>

      {project.hasAdditionalStructure && (
        <Card withBorder padding="sm" radius="md" bg="blue.0">
          <Text size="xs" fw={600} c="blue" mb="xs">
            EK YAPI BİLGİLERİ
          </Text>
          <Group grow>
            <InfoItem
              icon={IconSolarPanel}
              label="Panel"
              value={`${project.additionalPanelCount} / ${project.additionalPanelPower} W`}
              color="blue"
            />
            <InfoItem
              icon={IconCpu}
              label="İnverter"
              value={`${project.additionalInverterCount} adet`}
              color="blue"
            />
          </Group>
          <InfoItem
            icon={IconBolt}
            label="DC Gücü"
            value={`${project.additionalDcValue || "-"} kW`}
            color="blue"
          />
        </Card>
      )}

      <Divider />

      <Stack gap="xs">
        <InfoItem
          icon={IconMapPin}
          label="Lokasyon"
          value={`${getCityName(project.address?.cityId)} / ${getDistrictName(project.address?.districtId)}`}
          color="teal"
        />
        <Group grow>
          <InfoItem
            icon={IconMapPin}
            label="Ada / Parsel"
            value={`${project.address?.ada || "-"} / ${project.address?.parsel || "-"}`}
            color="gray"
          />
        </Group>
      </Stack>

      <Text size="xs" c="dimmed" ta="right" fs="italic">
        Eklendi: {formatDate(project.createdAt)}
      </Text>
    </Stack>
  </Card>
          ))
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-10">
          <Pagination total={totalPages} page={currentPage} onChange={setCurrentPage} />
        </div>
      )}
      <Text size="sm" c="dimmed">
  Toplam Sayfa: {totalPages} | Bu sayfada gösterilen proje sayısı: {pagedProjects.length}
</Text>
    </div>
  );
};

export default Projects;
