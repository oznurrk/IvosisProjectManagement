import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from 'react-router-dom';
import axios from "axios";
import { Card, Text, Group, Stack, Badge, Button, Grid, Paper, Divider } from "@mantine/core";
import {   IconSettings, IconPlus, IconLoader, IconEdit } from '@tabler/icons-react';
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";
import ProcessAddModal from "../components/Process/ProcessAddModal";
import TaskListModal from "../components/Tasks/TaskListModal";
import PaginationComponent from "../Layout/PaginationComponent";

const Processes = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [taskModalOpened, setTaskModalOpened] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [pageSize, setPageSize] = useState(9); // Varsayılan sayfa boyutu
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    description: "",
    type: "" // "main" for ana süreç, "sub" for alt süreç, "" for all
  });

  const ITEMS_PER_PAGE = 9;
  const token = localStorage.getItem("token");

   // Sayfa değişikliği handler'ı
    const handlePageChange = useCallback((page) => {
      setCurrentPage(page);
    }, []);
  
    // Sayfa boyutu değişikliği handler'ı
    const handlePageSizeChange = useCallback((newPageSize) => {
      setPageSize(newPageSize);
      setCurrentPage(1); // Sayfa boyutu değiştiğinde ilk sayfaya dön
    }, []);
    

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      // Tüm süreçleri getir
      const processesRes = await axios.get(
        `http://localhost:5000/api/processes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Her süreç için parent process bilgisini ekle
      const processesWithParentInfo = await Promise.all(
        processesRes.data.map(async (process) => {
          let parentProcessName = null;

          if (process.ParentProcessId) {
            try {
              const parentRes = await axios.get(
                `http://localhost:5000/api/processes/${process.ParentProcessId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              parentProcessName = parentRes.data.name;
            } catch (error) {
              console.error(`Parent process bulunamadı: ${process.ParentProcessId}`, error);
              parentProcessName = "Bilinmeyen Süreç";
            }
          }
          return {
            ...process,
            parentProcessName,
            isMainProcess: !process.ParentProcessId
          };
        })
      );

      // Ana süreçler önce gelecek şekilde sırala
      const sortedProcesses = processesWithParentInfo.sort((a, b) => {
        if (a.isMainProcess && !b.isMainProcess) return -1;
        if (!a.isMainProcess && b.isMainProcess) return 1;
        return a.name.localeCompare(b.name);
      });

      setProcesses(sortedProcesses);
      setFilteredProcesses(sortedProcesses);
    } catch (error) {
      console.error("Süreçler alınamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProcesses();
    }
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [searchFilters, processes]);

  const applyFilters = () => {
    let filtered = processes;

    if (searchFilters.name) {
      filtered = filtered.filter(process =>
        process.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    if (searchFilters.description) {
      filtered = filtered.filter(process =>
        process.description && process.description.toLowerCase().includes(searchFilters.description.toLowerCase())
      );
    }

    if (searchFilters.type) {
      if (searchFilters.type === "main") {
        filtered = filtered.filter(process => process.isMainProcess);
      } else if (searchFilters.type === "sub") {
        filtered = filtered.filter(process => !process.isMainProcess);
      }
    }

    setFilteredProcesses(filtered);

    // Sayfa numarası geçerli değilse 1'e çek
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setCurrentPage((prev) => Math.min(prev, totalPages || 1));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      description: "",
      type: ""
    });
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Modal'dan yeni süreç eklendiğinde çalışacak fonksiyon
  const handleProcessAdded = (newProcess) => {
    // Süreçleri yeniden yükle
    fetchProcesses();
  };

  // Düzenle butonu için handler
  const handleEditProcess = (process) => {
    setSelectedProcess(process);
    setTaskModalOpened(true);
  };

  const formatDate = (dateString) => {
    if (
      !dateString ||
      dateString === "0001-01-01T00:00:00" ||
      dateString.startsWith("0001")
    ) {
      return "Tarih yok";
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Tarih yok";
    }

    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getProcessTypeInfo = (process) => {
    if (process.isMainProcess) {
      return {
        label: "Ana Süreç",
        color: "#0066cc",
        bgColor: "#e6f3ff",
        icon: "🏢"
      };
    } else {
      return {
        label: `Alt Süreç`,
        color: "#7b1fa2",
        bgColor: "#f3e5f5",
        icon: "🔗"
      };
    }
  };

  // Pagination
  /*
  const paginatedProcesses = filteredProcesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
*/
  const {paginatedProcesses} = useMemo(() => {
    const total = Math.ceil(filteredProcesses.length / pageSize);
    const paginated = filteredProcesses.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return {totalPages: total, paginatedProcesses: paginated};
  }, [filteredProcesses, currentPage, pageSize]);

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <Stack align="center" spacing="md">
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e9ecef',
            borderTop: '3px solid #6c5ce7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <Text size="lg" color="dimmed">Süreçler yükleniyor...</Text>
        </Stack>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-0 m-0">
      <div className="w-full">

        {/* Header */}
        <Header
          title="Süreçler"
          subtitle="Süreç Yönetimi"
          icon={IconLoader}
          userName={localStorage.getItem("userName") || undefined}
          totalCount={processes.length}
          showMenuButton={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <div className="px-4 py-0">
          {/* Search and Filter Section*/}
          <FilterAndSearch
            searchFilters={searchFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filtersConfig={[
              {key: "name", type: "text", placeholder: "Süreç adına göre ara..." },
              {key: "description", type:"text",placeholder: "Açıklamaya göre ara..."}
            ]}
          />
          <div className="flex justify-end mb-5">
            <button
              onClick={() => setModalOpened(true)} // Modal'ı aç
              className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 h-8 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <IconPlus size={20} />
              Ekle
            </button>
          </div>
          {/* Process Cards Grid */}
          <Grid gutter="lg">
            {paginatedProcesses.map((process) => {
              const typeInfo = getProcessTypeInfo(process);

              return (
                <Grid.Col key={process.id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Card
                    className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200"
                    withBorder
                    shadow="sm"
                    radius="lg"
                    padding="lg"
                  >
                    <Stack spacing="md" className="h-full">
                      {/* Process Header */}
                      <Group position="apart" align="flex-start">
                        <div className="flex-1">
                          <Text size="md" weight={600} className="text-[#2d3748] leading-snug mb-2 font-bold">
                            {process.name}
                          </Text>
                          <Badge
                            style={{
                              backgroundColor: typeInfo.bgColor,
                              color: typeInfo.color,
                              border: `1px solid ${typeInfo.color}`
                            }}
                            variant="light"
                            size="sm"
                          >
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                        </div>
                      </Group>

                      {/* Parent Process Info */}
                      {!process.isMainProcess && (
                        <Paper padding="xs" className="bg-[#f8f9fa] border-l-4 border-[#7b1fa2]">
                          <Text size="xs" color="#7b1fa2" weight={500}>
                            🔗 Bağlı Süreç: {process.parentProcessName}
                          </Text>
                        </Paper>
                      )}

                      {/* Description */}
                      <div style={{ flex: 1 }}>
                        <Text size="xs" color="#24809c" weight={500} className="mb-1.5">
                          📝 Açıklama:
                        </Text>
                        <Text size="sm" color="#4a5568" className="leading-[1.5] overflow-hidden text-ellipsis min-h-[60px]"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}>
                          {process.description || 'Açıklama bulunmamaktadır.'}
                        </Text>
                      </div>

                      <Divider />

                      {/* Action Buttons */}
                      <Group spacing="xs" className="mt-2">
                        <Button
                          size="xs"
                          variant="light"
                          color="#24809c"
                          leftSection={<IconSettings size={14} />}
                          className="flex-1"
                          onClick={() => handleEditProcess(process)}
                        >
                          Detaylar
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          color="#24809c"
                          className="flex-1"
                          leftSection={<IconEdit size={14} />}
                          
                        >
                          Düzenle
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>
        {/* Pagination */}
        <PaginationComponent
          totalItems={filteredProcesses.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[6, 9, 12, 15, 18, 24]}
          itemName="görev"
        />

        {/* No Results */}
        {filteredProcesses.length === 0 && !loading && (
          <Paper shadow="md" padding="xl" className="text-center mt-8">
            <Text size="lg" color="#6c5ce7" weight={500}>
              {processes.length === 0
                ? "Henüz süreç bulunmamaktadır."
                : "Arama kriterlerinize uygun süreç bulunamadı."
              }
            </Text>
            {processes.length > 0 && (
              <Button
                variant="light"
                color="#6c5ce7"
                onClick={clearFilters}
                className="mt-4"
              >
                Filtreleri Temizle
              </Button>
            )}
          </Paper>
        )}
      </div>

      {/* Add Process Modal */}
      <ProcessAddModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onProcessAdded={handleProcessAdded}
        processes={processes}
      />

      {/* Task List Modal */}
      <TaskListModal
        opened={taskModalOpened}
        onClose={() => setTaskModalOpened(false)}
        process={selectedProcess}
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .process-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Processes;