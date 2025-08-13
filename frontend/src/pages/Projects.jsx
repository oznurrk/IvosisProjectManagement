import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from 'react-router-dom';
import axios from "axios";
import { Text, Badge, Card, Group, Stack, Divider, LoadingOverlay, ActionIcon, Tooltip } from "@mantine/core";
import { IconCalendar, IconMapPin, IconBolt, IconSolarPanel, IconCpu, IconPlus, IconInfoCircle, IconSunElectricity } from "@tabler/icons-react";
import ProjectCartSelectModal from "../components/Project/ProjectCartSelectModal";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProjectProcessSelectModal from "../components/Project/ProjectProcessSelectModal";
import FilterAndSearch from "../Layout/FilterAndSearch";
import ProjectUpdateModal from "../components/Project/ProjectUpdateModal";
import PaginationComponent from "../Layout/PaginationComponent";

const Projects = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Yeni filtreleme state (Processes tarzı)
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    description: "",
    status: "", // NotStarted, InProgress, Completed, Cancelled veya boş
  });

  const [pageSize, setPageSize] = useState(() => {
    const stored = localStorage.getItem("pageSize");
    return stored ? parseInt(stored) : 4; // Varsayılan sayfa boyutu
  })

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
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
  }, [token]);

  // Filtreleri uygula (Processes tarzı)
  const filteredProjects = projects
    .filter((project) => {
      // İsim filtre
      if (
        searchFilters.name &&
        !project.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      ) {
        return false;
      }

      // Açıklama filtre
      if (
        searchFilters.description &&
        !(project.description || "")
          .toLowerCase()
          .includes(searchFilters.description.toLowerCase())
      ) {
        return false;
      }

      // Durum filtre (status)
      if (searchFilters.status && project.status !== searchFilters.status) {
        return false;
      }

      return true;
    });

  // Pagination için güncellenmiş hesaplamalar
  const pagedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Yardımcı fonksiyonlar
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR");
  };

  const getCityName = (id) => cities.find((c) => c.id === id)?.name || `Şehir ID: ${id}`;
  const getDistrictName = (id) => districts.find((d) => d.id === id)?.name || `İlçe ID: ${id}`;
  const getProjectTypeName = (id) =>
    projectTypes.find((p) => p.id === id)?.name || `Tür ID: ${id}`;

  // Adres bilgilerini al - API'den address olarak geliyor
  const getProjectAddresses = (project) => {
    // Önce address array'ini kontrol et
    if (project.address && Array.isArray(project.address) && project.address.length > 0) {
      return project.address;
    }
    
    // Eğer addresses varsa onu kullan (eski yapı için uyumluluk)
    if (project.addresses && Array.isArray(project.addresses) && project.addresses.length > 0) {
      return project.addresses;
    }
    
    return [];
  };

  /*
  // Adres bilgilerini formatla
  const formatAddresses = (project) => {
    const addresses = getProjectAddresses(project);
    
    if (addresses.length === 0) {
      return "Adres bilgisi yok";
    }

    if (addresses.length === 1) {
      const addr = addresses[0];
      const cityName = addr.cityName || getCityName(addr.cityId);
      const districtName = addr.districtName || getDistrictName(addr.districtId);
      return `${cityName} / ${districtName}`;
    }

    // Birden fazla adres varsa
    return `${addresses.length} farklı lokasyon`;
  };

  // Ada/Parsel bilgilerini formatla
  const formatAdaParsels = (project) => {
    const addresses = getProjectAddresses(project);
    
    if (addresses.length === 0) {
      return "-";
    }

    if (addresses.length === 1) {
      const addr = addresses[0];
      return `${addr.ada || "-"} / ${addr.parsel || "-"}`;
    }

    // Birden fazla adres varsa, ilk birkaçını göster
    const validAdaParsels = addresses
      .filter(addr => addr.ada || addr.parsel)
      .slice(0, 2)
      .map(addr => `${addr.ada || "-"}/${addr.parsel || "-"}`)
      .join(", ");
    
    if (validAdaParsels) {
      return addresses.length > 2 ? `${validAdaParsels}...` : validAdaParsels;
    }
    return "-";
  };
*/
  // Çoklu adres detaylarını gösteren bileşen
  const AddressDetails = ({ project }) => {
    const addresses = getProjectAddresses(project);
    
    if (addresses.length === 0) {
      return (
        <InfoItem
          icon={IconMapPin}
          label="Lokasyon"
          value="Adres bilgisi yok"
          color="gray"
        />
      );
    }

    if (addresses.length === 1) {
      const addr = addresses[0];
      const cityName = addr.cityName || getCityName(addr.cityId);
      const districtName = addr.districtName || getDistrictName(addr.districtId);
      
      return (
        <>
          <InfoItem
            icon={IconMapPin}
            label="Lokasyon"
            value={`${cityName} / ${districtName}`}
            color="teal"
          />
          <InfoItem
            icon={IconMapPin}
            label="Ada / Parsel"
            value={`${addr.ada || "-"} / ${addr.parsel || "-"}`}
            color="gray"
          />
          {addr.neighborhoodName && (
            <Text size="xs" c="dimmed">
              Mahalle: {addr.neighborhoodName}
            </Text>
          )}
        </>
      );
    }

    // Birden fazla adres varsa
    return (
      <Card>
        <Text size="xs" fw={600} c="natural.9" mb="xs">
          Adres Bilgileri ({addresses.length} Adres)
        </Text>
        <Stack>
          {addresses.slice(0, 3).map((addr, index) => {
            const cityName = addr.cityName || getCityName(addr.cityId);
            const districtName = addr.districtName || getDistrictName(addr.districtId);
            
            return (
              <Group key={index} justify="space-between" wrap="wrap">
                <Text size="xs" c="natural.9">
                  {index + 1}. {cityName} / {districtName}
                  {addr.neighborhoodName && ` (${addr.neighborhoodName})`}
                </Text>
                <Text size="xs" c="dimmed">
                  {addr.ada || "-"}/{addr.parsel || "-"}
                </Text>
              </Group>
            );
          })}
          {addresses.length > 3 && (
            <Text size="xs" c="dimmed" fs="italic">
              +{addresses.length - 3} adres daha...
            </Text>
          )}
        </Stack>
      </Card>
    );
  };

  const priorityConfig = {
    Low: { color: "blue", label: "Düşük" },
    Medium: { color: "green", label: "Orta" },
    High: { color: "orange", label: "Yüksek" },
    Critical: { color: "red", label: "Kritik" },
  };

  const statusConfig = {
    NotStarted: { color: "blue", label: "Başlamadı" },
    InProgress: { color: "yellow", label: "Devam Ediyor" },
    Completed: { color: "green", label: "Tamamlandı" },
    Cancelled: { color: "red", label: "İptal Edildi" },
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // filtre değişince sayfa 1'e dönsün
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      description: "",
      status: "",
    });
  };

  const handleCardClick = (projectId) => {
    setSelectedProjectId(projectId);
    setModalOpen(true);
  };

  // Pagination handler'ları
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("pageSize", newPageSize);
    setCurrentPage(1);
  })

  // UI için küçük yardımcı bileşenler
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

  const calculateProjectStats = () => {
    const total = projects.length;
    const count = (status) => projects.filter((p) => p.status === status).length;

    return {
      notStarted: total === 0 ? 0 : Math.round((count("NotStarted") / total) * 100),
      inProgress: total === 0 ? 0 : Math.round((count("InProgress") / total) * 100),
      completed: total === 0 ? 0 : Math.round((count("Completed") / total) * 100),
      cancelled: total === 0 ? 0 : Math.round((count("Cancelled") / total) * 100),
    };
  };

  return (
    <div className="bg-[#f8f9fa] p-0 m-0">
      <Header
        title="Projeler"
        subtitle="Tüm Projeler"
        icon={IconSunElectricity}
        userName={localStorage.getItem("userName") || undefined}
        totalCount={projects.length}
        stats={calculateProjectStats()}
        showStats={true}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Filtreleme alanı */}
      <div className="px-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            { key: "name", type: "text", placeholder: "Proje adına göre ara..." },
            { key: "description", type: "text", placeholder: "Açıklamaya göre ara..." },
            {
              key: "status",
              type: "select",
              placeholder: "Durum seçin...",
              options: [
                { value: "", label: "Tümü" },
                { value: "NotStarted", label: "Başlamadı" },
                { value: "InProgress", label: "Devam Ediyor" },
                { value: "Completed", label: "Tamamlandı" },
                { value: "Cancelled", label: "İptal Edildi" },
              ],
            },
            { key: "startDate", type: "date" },
            { key: "endDate", type: "date" },
          ]}
        />
      </div>
    
      {/* yeni proje butonu 
      <div className="flex justify-end mb-5 px-4">
        <button
          onClick={() => navigate("/projectCreated")}
          className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 h-8 text-white px-6 py-3 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          <IconPlus size={20} />
          Ekle
        </button>
      </div>
*/}
      {/* Proje kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
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
                  <Stack gap="xs" className="flex-1">
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
                  <PowerCard title="DC Gücü" value={project.dcValue} unit="kWp" icon={IconBolt} />
                  <PowerCard title="AC Gücü" value={project.acValue} unit="kWe" icon={IconBolt} />
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

                {/* Güncellenmiş adres gösterimi */}
                <Stack gap="xs">
                  <AddressDetails project={project} />
                </Stack>

                <Text size="xs" c="dimmed" ta="right" fs="italic">
                  Eklendi: {formatDate(project.createdAt)}
                </Text>
              </Stack>
            </Card>
          ))
        )}

        <div className="fixed bottom-4 right-4 flex flex-row items-end space-x-2 z-50 md:bottom-6 md:right-6 md:space-x-4">
          <div className="relative group">
            <button
              onClick={() => navigate("/projectCreated")}
              className="bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300">
                <IconPlus className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <span className="absolute bottom-14 right-1/2 translate-x-1/2 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Proje Ekle
              </span>
          </div>
        </div>
      </div>

      {/* Yeni Pagination Component'i kullan */}
      <PaginationComponent
        totalItems={filteredProjects.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[4, 8, 12, 16, 20]}
        itemName="proje"
      />

      {/* Modal'lar */}
      <ProjectCartSelectModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={selectedProjectId}
        onShowDetails={() => {
          setModalOpen(false);
          setDetailsModalOpen(true);
        }}
      />
      <ProjectProcessSelectModal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        projectId={selectedProjectId}
      />
      <ProjectUpdateModal
        opened={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        projectId={selectedProjectId}
      />
    </div>
  );
};

export default Projects;