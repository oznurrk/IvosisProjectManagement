import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { 
  IconClipboardList, 
  IconArrowUp, 
  IconArrowDown, 
  IconClock, 
  IconCheck,
  IconX,
  IconPlus,
  IconEdit,
  IconEye
} from "@tabler/icons-react";
import Header from "../Header/Header";
import FilterAndSearch from "../../Layout/FilterAndSearch";

const Demands = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [demands, setDemands] = useState([]); // Başlangıç değeri empty array
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [searchFilters, setSearchFilters] = useState({
    search: "", // Genel arama - talep numarası, proje adı, başlık
    statusCode: "",
    priorityCode: "",
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
      
      const demandsRes = await axios.get("http://localhost:5000/api/demand", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API yanıtını konsola yazdır - debug için
      console.log('API Yanıtı:', demandsRes.data);
      
      // Demands verilerini set et - doğru yapıya göre
      let demandData = [];
      
      if (demandsRes.data && demandsRes.data.success && demandsRes.data.data) {
        if (Array.isArray(demandsRes.data.data.items)) {
          demandData = demandsRes.data.data.items;
          console.log('API\'den gelen kayıt sayısı:', demandData.length);
        } else if (Array.isArray(demandsRes.data.data)) {
          demandData = demandsRes.data.data;
          console.log('Data array\'i kullanılıyor:', demandData.length);
        }
      } else if (Array.isArray(demandsRes.data)) {
        // Fallback: Direkt array gelirse
        demandData = demandsRes.data;
        console.log('Direkt array kullanılıyor:', demandData.length);
      }
      
      console.log('Final demandData:', demandData);
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

  // --- TALEP SİLME ---
  const handleDeleteDemand = async (demand) => {
    if (!window.confirm('Bu talebi silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/demand/${demand.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllData();
      alert('Talep başarıyla silindi!');
    } catch (error) {
      alert('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- TALEP ONAYLAMA ---
  const handleApproveDemand = async (demand) => {
    if (!window.confirm('Bu talebi onaylamak istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/demand/${demand.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllData();
      alert('Talep başarıyla onaylandı!');
    } catch (error) {
      alert('Onaylama işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- TALEP REDDETME ---
  const handleRejectDemand = async (demand) => {
    const notes = window.prompt('Red sebebini giriniz:');
    if (notes === null) return; // Kullanıcı cancel'a bastı
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/demand/${demand.id}/reject`, {
        rejectionNotes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAllData();
      alert('Talep başarıyla reddedildi!');
    } catch (error) {
      alert('Red işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
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
      statusCode: "",
      priorityCode: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentPage(1);
  };

  const visibleItems = Array.isArray(demands) ? demands.filter((demand) => {
    // Genel arama - talep numarası, proje adı, başlık
    const searchMatch = !searchFilters.search || 
      (demand.demandNumber || "").toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      (demand.projectName || "").toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      (demand.title || "").toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      (demand.companyName || "").toLowerCase().includes(searchFilters.search.toLowerCase());
    
    // Durum filtresi
    const statusMatch = !searchFilters.statusCode || demand.statusCode === searchFilters.statusCode;
    
    // Öncelik filtresi
    const priorityMatch = !searchFilters.priorityCode || demand.priorityCode === searchFilters.priorityCode;

    // Tarih aralığı filtresi
    let dateMatch = true;
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      const demandDate = new Date(demand.requestedDate || demand.createdAt);
      
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

    return searchMatch && statusMatch && priorityMatch && dateMatch;
  }).sort((a, b) => {
    return new Date(b.requestedDate || b.createdAt) - new Date(a.requestedDate || a.createdAt);
  }) : [];

  const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDemands = visibleItems.slice(startIndex, startIndex + itemsPerPage);

  const getStatusIcon = (statusCode) => {
    switch (statusCode) {
      case "DRAFT":
        return <IconEdit className="h-5 w-5 text-gray-500" />;
      case "PENDING":
        return <IconClock className="h-5 w-5 text-yellow-500" />;
      case "REVIEWING":
        return <IconEye className="h-5 w-5 text-blue-500" />;
      case "APPROVED":
        return <IconCheck className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <IconX className="h-5 w-5 text-red-500" />;
      case "IN_PROGRESS":
        return <IconArrowUp className="h-5 w-5 text-blue-500" />;
      case "COMPLETED":
        return <IconCheck className="h-5 w-5 text-green-600" />;
      default:
        return <IconClipboardList className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (statusCode) => {
    switch (statusCode) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEWING":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priorityCode) => {
    switch (priorityCode) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "NORMAL":
        return "bg-blue-100 text-blue-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priorityCode) => {
    switch (priorityCode) {
      case "LOW":
        return <IconArrowDown className="h-4 w-4 text-gray-500" />;
      case "NORMAL":
        return <div className="h-4 w-4 rounded-full bg-blue-500"></div>;
      case "HIGH":
        return <IconArrowUp className="h-4 w-4 text-orange-500" />;
      case "URGENT":
        return <IconArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
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

  const formatCurrency = (amount, currency = 'TRY') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Talep Yönetimi" 
          subtitle="Talep Takip ve Onay Sistemi" 
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
        title="Talep Yönetimi"
        subtitle="Talep Takip ve Onay Sistemi"
        icon={IconClipboardList}
        totalCount={`${visibleItems.length} `}
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
            { key: "search", type: "text", placeholder: "Talep No, Proje Adı veya Başlık Ara..." },
            {
              key: "statusCode",
              type: "select",
              placeholder: "Durum",
              options: [
                { value: "", label: "Tüm Durumlar" },
                { value: "DRAFT", label: "Taslak" },
                { value: "PENDING", label: "Beklemede" },
                { value: "REVIEWING", label: "İncelemede" },
                { value: "APPROVED", label: "Onaylandı" },
                { value: "REJECTED", label: "Reddedildi" },
                { value: "IN_PROGRESS", label: "İşlemde" },
                { value: "COMPLETED", label: "Tamamlandı" }
              ]
            },
            {
              key: "priorityCode",
              type: "select",
              placeholder: "Öncelik",
              options: [
                { value: "", label: "Tüm Öncelikler" },
                { value: "LOW", label: "Düşük" },
                { value: "NORMAL", label: "Normal" },
                { value: "HIGH", label: "Yüksek" },
                { value: "URGENT", label: "Acil" }
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

      {/* Talepler Tablosu */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentDemands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {demands.length === 0 ? "Henüz talep bulunmuyor." : "Filtreleme kriterlerine uygun talep bulunamadı."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Talep No
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Proje
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Öncelik
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Talep Tarihi
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Gerekli Tarih
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Bütçe
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Firma
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDemands.map((demand, index) => {
                    const rowNumber = startIndex + index + 1;
                    return (
                      <tr key={demand.id} className="hover:bg-gray-50">
                        {/* Sıra Numarası */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-ivosis-100 text-ivosis-800">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* Talep No */}
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          <div className="text-center">
                            {demand.demandNumber}
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            ID: {demand.id}
                          </div>
                        </td>

                        {/* Proje */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="font-medium text-center">
                            {demand.projectName || 'Bilinmiyor'}
                          </div>
                          {demand.projectId && (
                            <div className="text-xs text-gray-500 text-center">
                              Proje ID: {demand.projectId}
                            </div>
                          )}
                        </td>

                        {/* Başlık */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate text-center" title={demand.title}>
                            {demand.title}
                          </div>
                          {demand.description && (
                            <div className="text-xs text-gray-500 text-center max-w-xs truncate" title={demand.description}>
                              {demand.description}
                            </div>
                          )}
                        </td>

                        {/* Durum */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {getStatusIcon(demand.statusCode)}
                            <div className="text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(demand.statusCode)}`}>
                                {demand.statusName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Öncelik */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {getPriorityIcon(demand.priorityCode)}
                            <div className="text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getPriorityColor(demand.priorityCode)}`}>
                                {demand.priorityName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Talep Tarihi */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {formatDate(demand.requestedDate)}
                          </div>
                        </td>

                        {/* Gerekli Tarih */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {formatDate(demand.requiredDate)}
                          </div>
                          {demand.requiredDate && new Date(demand.requiredDate) < new Date() && (
                            <div className="text-xs text-red-500 text-center">
                              Süresi Geçmiş
                            </div>
                          )}
                        </td>

                        {/* Bütçe */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center font-medium">
                            {formatCurrency(demand.estimatedBudget, demand.currency)}
                          </div>
                          {demand.totalEstimatedAmount > 0 && (
                            <div className="text-xs text-gray-500 text-center">
                              Gerçek: {formatCurrency(demand.totalEstimatedAmount, demand.currency)}
                            </div>
                          )}
                        </td>

                        {/* Firma */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {demand.companyName || '-'}
                          </div>
                          {demand.companyCode && (
                            <div className="text-xs text-gray-500 text-center">
                              {demand.companyCode}
                            </div>
                          )}
                        </td>

                        {/* İşlemler */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            {/* Görüntüle/Detay */}
                            <button
                              onClick={() => {/* Detay modalı açılacak */}}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Detayları Görüntüle"
                              type="button"
                            >
                              <IconEye className="w-4 h-4" />
                            </button>
                            
                            {/* Düzenle */}
                            <button
                              onClick={() => {/* Düzenleme modalı açılacak */}}
                              className="text-ivosis-600 hover:text-ivosis-900 transition-colors"
                              title="Düzenle"
                              type="button"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>

                            {/* Onay/Red butonları - sadece beklemedeki talepler için */}
                            {demand.statusCode === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveDemand(demand)}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Onayla"
                                  type="button"
                                >
                                  <IconCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectDemand(demand)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Reddet"
                                  type="button"
                                >
                                  <IconX className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* Sil */}
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
          )}

          {/* Pagination ve Sayfa başına seçim her zaman görünür */}
          <div className="bg-white px-4 py-3 flex flex-col items-center justify-center border-t border-gray-200">
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
              {/* Pagination mobilde */}
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
              {/* Masaüstü: Pagination ve Sayfa başına seçim yan yana */}
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
                {/* Sayfa başına gösterilecek kayıt sayısı seçimi */}
                <div className="flex items-center">
                  <label htmlFor="itemsPerPageBottom" className="mr-2 text-sm text-gray-700">Sayfa başına:</label>
                  <select
                    id="itemsPerPageBottom"
                    value={itemsPerPage}
                    onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {[5, 10, 15, 20].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yeni Talep Ekleme FAB Butonu */}
      <div className="fixed bottom-4 right-4 flex flex-row items-end space-x-2 z-50 md:bottom-6 md:right-6">
        <div className="relative group">
          <button
            onClick={() => {/* Yeni talep modalı açılacak */}}
            className="bg-ivosis-500 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-ivosis-600 transition-all duration-300"
          >
            <IconPlus className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <span className="absolute bottom-16 right-1/2 translate-x-1/2 px-4 py-2 text-sm bg-gray-100 text-black rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Yeni Talep Ekle
          </span>
        </div>
      </div>
    </div>
  );
};

export default Demands;