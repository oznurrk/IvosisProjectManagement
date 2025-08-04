import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import { 
  IconCards, 
  IconPlus, 
  IconPackage, 
  IconAlertTriangle,
  IconCertificate,
  IconCurrency,
  IconTool,
  IconStar,
  IconShield,
  IconCalendar,
  IconThermometer
} from "@tabler/icons-react";
import FilterAndSearch from "../Layout/FilterAndSearch";
import StockAddModal from "../components/Stock/StockAddModal";
import StockEditModal from "../components/Stock/StockEditModal";

const StockCards = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [stockItems, setStockItems] = useState([]); // Başlangıç değeri empty array
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [searchFilters, setSearchFilters] = useState({
    itemCode: "",
    name: "",
    category: "",
    brand: "",
    isCriticalItem: "",
    status: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [stockItemsRes, categoriesRes, unitsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/StockItems", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/StockItems", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/StockItems", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // StockItems verilerini set et - array olduğundan emin ol
      let stockData = [];
      if (Array.isArray(stockItemsRes.data)) {
        stockData = stockItemsRes.data;
      } else if (stockItemsRes.data && typeof stockItemsRes.data === 'object') {
        // Eğer data bir object ise, içinde array olup olmadığını kontrol et
        if (stockItemsRes.data.items && Array.isArray(stockItemsRes.data.items)) {
          stockData = stockItemsRes.data.items;
        } else if (stockItemsRes.data.data && Array.isArray(stockItemsRes.data.data)) {
          stockData = stockItemsRes.data.data;
        } else if (stockItemsRes.data.stockItems && Array.isArray(stockItemsRes.data.stockItems)) {
          stockData = stockItemsRes.data.stockItems;
        }
      }
      setStockItems(stockData);

      // Categories verilerini çıkar ve set et
      const categoryData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const uniqueCategories = [...new Set(categoryData.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories.map((cat, index) => ({ id: index + 1, name: cat })));

      // Units verilerini çıkar ve set et
      const unitData = Array.isArray(unitsRes.data) ? unitsRes.data : [];
      const uniqueUnits = [...new Set(unitData.map(item => item.unit).filter(Boolean))];
      setUnits(uniqueUnits.map((unit, index) => ({ id: index + 1, name: unit })));

    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      // Hata durumunda boş arrayler set et
      setStockItems([]);
      setCategories([]);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockCard = async (newStockCard) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post("http://localhost:5000/api/StockItems", newStockCard, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStockItems(prev => [response.data, ...prev]);
      setShowAddModal(false);
      alert('Stok kartı başarıyla eklendi!');
    } catch (error) {
      console.error('Stok kartı eklenirken hata:', error);
      
      let errorMessage = 'Stok kartı eklenirken hata oluştu!';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join(', ');
      }
      
      alert('Hata: ' + errorMessage);
    }
  };

  const handleEditStockCard = async (updatedStockCard) => {
    try {
      const token = localStorage.getItem("token");
      
      const updateData = {
        itemCode: updatedStockCard.itemCode,
        name: updatedStockCard.name,
        description: updatedStockCard.description || "",
        categoryId: updatedStockCard.categoryId,
        unitId: updatedStockCard.unitId,
        minimumStock: updatedStockCard.minimumStock,
        maximumStock: updatedStockCard.maximumStock || updatedStockCard.minimumStock * 5,
        reorderLevel: updatedStockCard.reorderLevel,
        purchasePrice: updatedStockCard.purchasePrice,
        salePrice: updatedStockCard.salePrice,
        currency: updatedStockCard.currency || "TRY",
        brand: updatedStockCard.brand || "",
        model: updatedStockCard.model || "",
        specifications: updatedStockCard.specifications || "",
        qualityStandards: updatedStockCard.qualityStandards || "",
        certificateNumbers: updatedStockCard.certificateNumbers || "",
        storageConditions: updatedStockCard.storageConditions || "",
        shelfLife: updatedStockCard.shelfLife || 0,
        isCriticalItem: updatedStockCard.isCriticalItem,
        isActive: updatedStockCard.isActive !== false,
        isDiscontinued: updatedStockCard.isDiscontinued || false
      };

      const response = await axios.put(`http://localhost:5000/api/StockItems/${updatedStockCard.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStockItems(prev => prev.map(item => 
        item.id === response.data.id ? response.data : item
      ));
      setShowEditModal(false);
      setSelectedItem(null);
      alert('Stok kartı başarıyla güncellendi!');
    } catch (error) {
      console.error('Stok kartı güncellenirken hata:', error);
      alert('Güncelleme hatası: ' + (error.response?.data?.message || 'Stok kartı güncellenemedi'));
    }
  };

  const handleDeleteStockCard = async (id) => {
    // ID'nin geçerli olduğunu kontrol et
    if (!id) {
      console.error('Geçersiz ID:', id);
      alert('Hata: Geçersiz kayıt ID\'si');
      return;
    }

    const confirmDelete = window.confirm(
      'Bu stok kartını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve tüm stok hareketleri de silinecektir.'
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const apiUrl = `http://localhost:5000/api/StockItems/${id}`;

      const response = await axios.delete(apiUrl, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // State'i güncelle
      const initialLength = stockItems.length;
      
      setStockItems(prev => {
        const filteredItems = prev.filter(item => {
          const shouldKeep = item.id !== id && item.id !== parseInt(id);
          if (!shouldKeep) {
          }
          return shouldKeep;
        });
        return filteredItems;
      });

      // Sayfa sıfırlama kontrolü
      setTimeout(() => {
        setStockItems(current => {
          const newVisibleItems = current.filter(item => {
            const codeMatch = (item.itemCode || "").toLowerCase().includes(searchFilters.itemCode.toLowerCase());
            const nameMatch = (item.name || "").toLowerCase().includes(searchFilters.name.toLowerCase());
            const categoryMatch = !searchFilters.category || (item.category || "").toLowerCase().includes(searchFilters.category.toLowerCase());
            const brandMatch = !searchFilters.brand || (item.brand || "").toLowerCase().includes(searchFilters.brand.toLowerCase());
            const criticalMatch = searchFilters.isCriticalItem === "" || item.isCriticalItem.toString() === searchFilters.isCriticalItem;
            const statusMatch = !searchFilters.status || getStockStatus(item) === searchFilters.status;
            return codeMatch && nameMatch && categoryMatch && brandMatch && criticalMatch && statusMatch;
          });
          
          const newTotalPages = Math.ceil(newVisibleItems.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
          return current;
        });
      }, 100);

      alert('Stok kartı başarıyla silindi!');
      
    } catch (error) {
      console.error('Stok kartı silinirken hata:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      let errorMessage = 'Stok kartı silinemedi';
      if (error.response?.status === 401) {
        errorMessage = 'Yetkiniz bulunmuyor. Lütfen tekrar giriş yapın.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Kayıt bulunamadı veya zaten silinmiş';
      } else if (error.response?.status === 400) {
        errorMessage = 'Geçersiz istek. Kayıt silinemez.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
      }
      
      alert('Silme hatası: ' + errorMessage);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
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
      itemCode: "",
      name: "",
      category: "",
      brand: "",
      isCriticalItem: "",
      status: ""
    });
    setCurrentPage(1);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Bilinmiyor';
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Adet';
  };

  const visibleItems = Array.isArray(stockItems) ? stockItems.filter((item) => {
    const codeMatch = (item.itemCode || "").toLowerCase().includes(searchFilters.itemCode.toLowerCase());
    const nameMatch = (item.name || "").toLowerCase().includes(searchFilters.name.toLowerCase());
    const categoryMatch = !searchFilters.category || (item.category || "").toLowerCase().includes(searchFilters.category.toLowerCase());
    const brandMatch = !searchFilters.brand || (item.brand || "").toLowerCase().includes(searchFilters.brand.toLowerCase());
    const criticalMatch = searchFilters.isCriticalItem === "" || item.isCriticalItem.toString() === searchFilters.isCriticalItem;
    const statusMatch = !searchFilters.status || getStockStatus(item) === searchFilters.status;

    return codeMatch && nameMatch && categoryMatch && brandMatch && criticalMatch && statusMatch;
  }) : [];

  const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = visibleItems.slice(startIndex, startIndex + itemsPerPage);

  const getStockStatus = (item) => {
    if (item.currentStock <= item.reorderLevel) return "Kritik";
    if (item.currentStock <= item.minimumStock) return "Düşük";
    return "Normal";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Kritik":
        return "bg-red-100 text-red-800";
      case "Düşük":
        return "bg-yellow-100 text-yellow-800";
      case "Normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Stok Kartları" 
          subtitle="Malzeme Stok Kartları Yönetimi" 
          icon={IconCards}
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
        title="Stok Kartları"
        subtitle="Malzeme Stok Kartları Yönetimi"
        icon={IconCards}
        totalCount={`${visibleItems.length} stok kartı`}
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
            { key: "itemCode", type: "text", placeholder: "Stok Kodu..." },
            { key: "name", type: "text", placeholder: "Malzeme Adı..." },
            { key: "brand", type: "text", placeholder: "Marka..." },
            {
              key: "category",
              type: "text",
              placeholder: "Kategori..."
            },
            {
              key: "isCriticalItem",
              type: "select",
              placeholder: "Kritik Malzeme",
              options: [
                { value: "", label: "Tümü" },
                { value: "true", label: "Kritik" },
                { value: "false", label: "Normal" }
              ]
            },
            {
              key: "status",
              type: "select",
              placeholder: "Stok Durumu",
              options: [
                { value: "", label: "Tümü" },
                { value: "Normal", label: "Normal" },
                { value: "Düşük", label: "Düşük Stok" },
                { value: "Kritik", label: "Kritik Stok" }
              ]
            }
          ]}
        />
      </div>

      {/* Actions */}
      <div className="px-4 mb-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold"
          >
            <IconPlus size={20} />
            Ekle
          </button>
        </div>
      </div>

      {/* Stok Kartları Liste */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {stockItems.length === 0 ? "Henüz stok kartı bulunmuyor." : "Filtreleme kriterlerine uygun kart bulunamadı."}
              </p>
              {stockItems.length === 0 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-ivosis-600 text-white px-6 py-2 rounded-lg hover:bg-ivosis-700 transition-colors"
                >
                  İlk Stok Kartını Ekle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Malzeme Bilgileri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok Kodu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mevcut Stok
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min/Kritik Stok
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat Bilgileri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {/* Malzeme Bilgileri */}
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <IconPackage className="h-8 w-8 text-ivosis-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                {item.brand && (
                                  <>
                                    <IconStar size={12} className="mr-1" />
                                    {item.brand}
                                    {item.model && ` - ${item.model}`}
                                  </>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stok Kodu */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.itemCode}
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {getCategoryName(item.categoryId)}
                          </div>
                        </td>

                        {/* Mevcut Stok */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <span className={`font-medium ${
                              status === "Kritik" ? "text-red-600" : 
                              status === "Düşük" ? "text-yellow-600" : "text-green-600"
                            }`}>
                              {item.currentStock || 0}
                            </span>
                            <span className="text-gray-500 ml-1">
                              {getUnitName(item.unitId)}
                            </span>
                          </div>
                        </td>

                        {/* Min/Kritik Stok */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            <div>Min: {item.minimumStock} {getUnitName(item.unitId)}</div>
                            <div className="text-xs text-gray-500">
                              Kritik: {item.reorderLevel} {getUnitName(item.unitId)}
                            </div>
                          </div>
                        </td>

                        {/* Fiyat Bilgileri */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {item.purchasePrice > 0 && (
                              <div>
                                Alış: {formatCurrency(item.purchasePrice, item.currency)}
                              </div>
                            )}
                            {item.salePrice > 0 && (
                              <div className="text-xs text-gray-500">
                                Satış: {formatCurrency(item.salePrice, item.currency)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Durum */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            {item.isCriticalItem && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                <IconAlertTriangle size={10} className="mr-1" />
                                Kritik
                              </span>
                            )}
                          </div>
                        </td>

                        {/* İşlemler */}
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-ivosis-600 hover:text-ivosis-900 transition-colors"
                              title="Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteStockCard(item.id);
                              }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
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
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, visibleItems.length)}</span> arası,{" "}
                    toplam <span className="font-medium">{visibleItems.length}</span> kayıt
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <StockAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStockCard}
        categories={categories}
        units={units}
        stockItems={Array.isArray(stockItems) ? stockItems : []}
      />

      {/* Edit Modal */}
      <StockEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleEditStockCard}
        categories={categories}
        units={units}
        stockItems={Array.isArray(stockItems) ? stockItems : []}
      />
    </div>
  );
};

export default StockCards;