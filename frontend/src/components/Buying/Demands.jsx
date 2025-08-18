import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { 
  IconClipboardList, 
  IconEdit,
  IconPlus,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconFlag
} from "@tabler/icons-react";
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";

const Demands = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [searchFilters, setSearchFilters] = useState({
    search: "", // Genel arama - talep numarası, başlık
    statusId: "",
    priorityId: "",
    isApproved: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get("http://localhost:5000/api/demond", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Demands verilerini set et - array olduğundan emin ol
      let demandData = [];
      if (Array.isArray(response.data)) {
        demandData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.items && Array.isArray(response.data.items)) {
          demandData = response.data.items;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          demandData = response.data.data;
        } else if (response.data.demands && Array.isArray(response.data.demands)) {
          demandData = response.data.demands;
        }
      }
      
      setDemands(demandData);

    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      setDemands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDemand = async (demand) => {
    if (!window.confirm('Bu talebi silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/demond/${demand.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllData();
      alert('Talep başarıyla silindi!');
    } catch (error) {
      alert('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditDemand = (demand) => {
    // Düzenleme modalı açılacak
    console.log('Düzenlenecek talep:', demand);
    // TODO: Düzenleme modalı implementasyonu
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchFilters({
      search: "",
      statusId: "",
      priorityId: "",
      isApproved: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentPage(1);
  };

  const visibleItems = Array.isArray(demands) ? demands.filter((demand) => {
    // Genel arama - talep numarası ve başlık
    const searchMatch = !searchFilters.search || 
      (demand.DemandNumber || "").toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      (demand.Title || "").toLowerCase().includes(searchFilters.search.toLowerCase());
    
    // Durum filtresi
    const statusMatch = !searchFilters.statusId || demand.StatusId == searchFilters.statusId;
    
    // Öncelik filtresi
    const priorityMatch = !searchFilters.priorityId || demand.PriorityId == searchFilters.priorityId;
    
    // Onay durumu filtresi
    const approvalMatch = !searchFilters.isApproved || 
      (searchFilters.isApproved === "true" && demand.IsApproved === true) ||
      (searchFilters.isApproved === "false" && demand.IsApproved === false);

    // Tarih aralığı filtresi
    let dateMatch = true;
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      const demandDate = new Date(demand.RequestedDate || demand.CreatedAt);
      
      if (searchFilters.dateFrom && searchFilters.dateTo) {
        const fromDate = new Date(searchFilters.dateFrom);
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = demandDate >= fromDate && demandDate <= toDate;
      } else if (searchFilters.dateFrom) {
        const fromDate = new Date(searchFilters.dateFrom);
        dateMatch = demandDate >= fromDate;
      } else if (searchFilters.dateTo) {
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = demandDate <= toDate;
      }
    }

    return searchMatch && statusMatch && priorityMatch && approvalMatch && dateMatch;
  }).sort((a, b) => {
    return new Date(b.CreatedAt) - new Date(a.CreatedAt);
  }) : [];

  const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDemands = visibleItems.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (statusId) => {
    switch (statusId) {
      case 1:
        return <IconClock className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <IconAlertCircle className="h-4 w-4 text-blue-500" />;
      case 3:
        return <IconCheck className="h-4 w-4 text-green-500" />;
      case 4:
        return <IconX className="h-4 w-4 text-red-500" />;
      default:
        return <IconClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-green-100 text-green-800";
      case 4:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priorityId) => {
    switch (priorityId) {
      case 1:
        return <IconFlag className="h-4 w-4 text-green-500" />;
      case 2:
        return <IconFlag className="h-4 w-4 text-yellow-500" />;
      case 3:
        return <IconFlag className="h-4 w-4 text-red-500" />;
      default:
        return <IconFlag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priorityId) => {
    switch (priorityId) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return "-";
    const formattedAmount = new Intl.NumberFormat('tr-TR').format(amount);
    return `${formattedAmount} ${currency || 'TL'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Talepler" 
          subtitle="Talep Yönetimi" 
          icon={IconClipboardList}
          showMenuButton={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        title="Talepler"
        subtitle="Talep Yönetimi"
        icon={IconClipboardList}
        totalCount={`${visibleItems.length} talep`}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Filtreleme */}
      <div className="px-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            { key: "search", type: "text", placeholder: "Talep Numarası veya Başlık Ara..." },
            {
              key: "statusId",
              type: "select",
              placeholder: "Durum",
              options: [
                { value: "", label: "Tüm Durumlar" },
                { value: "1", label: "Beklemede" },
                { value: "2", label: "İncelemede" },
                { value: "3", label: "Onaylandı" },
                { value: "4", label: "Reddedildi" }
              ]
            },
            {
              key: "priorityId",
              type: "select",
              placeholder: "Öncelik",
              options: [
                { value: "", label: "Tüm Öncelikler" },
                { value: "1", label: "Düşük" },
                { value: "2", label: "Orta" },
                { value: "3", label: "Yüksek" }
              ]
            },
            {
              key: "isApproved",
              type: "select",
              placeholder: "Onay Durumu",
              options: [
                { value: "", label: "Tümü" },
                { value: "true", label: "Onaylanmış" },
                { value: "false", label: "Onaylanmamış" }
              ]
            },
            {
              key: "dateFrom",
              type: "date",
              placeholder: "Başlangıç Tarihi"
            },
            {
              key: "dateTo",
              type: "date", 
              placeholder: "Bitiş Tarihi"
            }
          ]}
        />
      </div>

      {/* Talepler Tablosu - Responsive */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentDemands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {demands.length === 0 ? "Henüz talep bulunmuyor." : "Filtreleme kriterlerine uygun talep bulunamadı."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Talep No</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Başlık</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Proje ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Şirket ID</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Durum</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Öncelik</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Talep Tarihi</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Gerekli Tarih</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Onay</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">Bütçe</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDemands.map((demand, index) => {
                      const rowNumber = startIndex + index + 1;
                      return (
                        <tr key={demand.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-ivosis-100 text-ivosis-800">
                                {rowNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900 text-center">
                            {demand.DemandNumber || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate text-center font-medium">
                              {demand.Title || '-'}
                            </div>
                            {demand.Description && (
                              <div className="text-xs text-gray-500 max-w-xs truncate text-center">
                                {demand.Description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">
                            {demand.ProjectId || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">
                            {demand.CompanyId || '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              {getStatusIcon(demand.StatusId)}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(demand.StatusId)}`}>
                                Durum {demand.StatusId || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              {getPriorityIcon(demand.PriorityId)}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(demand.PriorityId)}`}>
                                Öncelik {demand.PriorityId || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">
                            {formatDate(demand.RequestedDate)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">
                            {formatDate(demand.RequiredDate)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {demand.IsApproved ? (
                              <div className="flex flex-col items-center">
                                <IconCheck className="h-5 w-5 text-green-500" />
                                <span className="text-xs text-green-600">Onaylandı</span>
                                {demand.ApprovedDate && (
                                  <span className="text-xs text-gray-500">{formatDate(demand.ApprovedDate)}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <IconX className="h-5 w-5 text-red-500" />
                                <span className="text-xs text-red-600">Beklemede</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-center">
                            {formatCurrency(demand.EstimatedBudget, demand.Currency)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => handleEditDemand(demand)}
                                className="text-ivosis-600 hover:text-ivosis-900 transition-colors"
                                title="Düzenle"
                                type="button"
                              >
                                <IconEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDemand(demand)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Sil"
                                type="button"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {currentDemands.map((demand, index) => {
                  const rowNumber = startIndex + index + 1;
                  return (
                    <div key={demand.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold bg-ivosis-100 text-ivosis-800">
                            {rowNumber}
                          </span>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {demand.DemandNumber || 'Talep #' + demand.id}
                          </h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditDemand(demand)}
                            className="text-ivosis-600 hover:text-ivosis-900"
                            title="Düzenle"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDemand(demand)}
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">
                          {demand.Title || 'Başlıksız Talep'}
                        </p>
                        
                        {demand.Description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {demand.Description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(demand.StatusId)}`}>
                            {getStatusIcon(demand.StatusId)}
                            <span className="ml-1">Durum {demand.StatusId || '-'}</span>
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(demand.PriorityId)}`}>
                            {getPriorityIcon(demand.PriorityId)}
                            <span className="ml-1">Öncelik {demand.PriorityId || '-'}</span>
                          </span>
                          
                          {demand.IsApproved ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <IconCheck className="w-3 h-3 mr-1" />
                              Onaylandı
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              <IconX className="w-3 h-3 mr-1" />
                              Beklemede
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>Proje ID: {demand.ProjectId || '-'}</div>
                          <div>Şirket ID: {demand.CompanyId || '-'}</div>
                          <div>Talep Tarihi: {formatDate(demand.RequestedDate)}</div>
                          <div>Gerekli Tarih: {formatDate(demand.RequiredDate)}</div>
                        </div>
                        
                        {demand.EstimatedBudget && (
                          <div className="text-sm font-medium text-gray-900">
                            Bütçe: {formatCurrency(demand.EstimatedBudget, demand.Currency)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex flex-col items-center justify-center border-t border-gray-200">
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
              {/* Mobile Pagination */}
              <div className="flex justify-center sm:hidden">
                {totalPages > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </>
                )}
              </div>
              
              {/* Desktop: Pagination ve Sayfa başına seçim */}
              <div className="hidden sm:flex flex-row items-center justify-center w-full gap-4">
                <p className="text-sm text-gray-700 mb-0">
                  <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, visibleItems.length)}</span> arası, toplam <span className="font-medium">{visibleItems.length}</span> kayıt
                </p>
                {totalPages > 1 && (
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px justify-center">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Önceki
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-ivosis-50 border-ivosis-500 text-ivosis-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                )}
                
                {/* Sayfa başına gösterilecek kayıt sayısı */}
                <div className="flex items-center">
                  <label htmlFor="itemsPerPageBottom" className="mr-2 text-sm text-gray-700">Sayfa başına:</label>
                  <select
                    id="itemsPerPageBottom"
                    value={itemsPerPage}
                    onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {[5, 10, 15, 20, 30, 50].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pagination - Ayrı Görünüm */}
      <div className="px-4 py-3 sm:hidden">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, visibleItems.length)}</span> arası, toplam <span className="font-medium">{visibleItems.length}</span> kayıt
            </p>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Önceki
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Sayfa başına:</label>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 10, 15, 20, 30, 50].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Yeni Talep Ekle - Responsive FAB Butonu */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <div className="relative group">
          <button
            onClick={() => console.log('Yeni talep ekleme modalı açılacak')}
            className="bg-ivosis-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-ivosis-600 transition-all duration-300 transform hover:scale-110"
          >
            <IconPlus className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <span className="absolute bottom-16 right-1/2 translate-x-1/2 px-3 py-2 text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Yeni Talep Ekle
          </span>
        </div>
      </div>
    </div>
  );
};

export default Demands;