import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
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
  const [stockItems, setStockItems] = useState([]);
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
    fetchStockItems();
    fetchCategories();
    fetchUnits();
  }, []);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockItems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error('Stok kartları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockItems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const items = await response.json();
        const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories.map((cat, index) => ({ id: index + 1, name: cat })));
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockItems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const items = await response.json();
        const uniqueUnits = [...new Set(items.map(item => item.unit).filter(Boolean))];
        setUnits(uniqueUnits.map((unit, index) => ({ id: index + 1, name: unit })));
      }
    } catch (error) {
      console.error('Units yüklenirken hata:', error);
    }
  };

  const handleAddStockCard = async (newStockCard) => {
    try {
      console.log('API\'ye gönderilen veri:', newStockCard);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockItems', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStockCard)
      });

      console.log('API Response Status:', response.status);

      if (response.ok) {
        const addedItem = await response.json();
        setStockItems(prev => [addedItem, ...prev]);
        setShowAddModal(false);
        alert('Stok kartı başarıyla eklendi!');
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('API Error Response:', errorData);
        
        let errorMessage = 'Stok kartı eklenirken hata oluştu!';
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData && errorData.errors) {
          errorMessage = Object.values(errorData.errors).join(', ');
        }
        
        alert('Hata: ' + errorMessage);
      }
    } catch (error) {
      console.error('Stok kartı eklenirken hata:', error);
      alert('Bağlantı hatası: ' + error.message);
    }
  };

  const handleEditStockCard = async (updatedStockCard) => {
    try {
      const token = localStorage.getItem("token");
      
      // PUT işlemi için backend'in beklediği format
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

      const response = await fetch(`http://localhost:5000/api/StockItems/${updatedStockCard.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setStockItems(prev => prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
        setShowEditModal(false);
        setSelectedItem(null);
        alert('Stok kartı başarıyla güncellendi!');
      } else {
        const errorData = await response.json().catch(() => null);
        alert('Güncelleme hatası: ' + (errorData?.message || 'Stok kartı güncellenemedi'));
      }
    } catch (error) {
      console.error('Stok kartı güncellenirken hata:', error);
      alert('Güncelleme hatası: ' + error.message);
    }
  };

  const handleDeleteStockCard = async (id) => {
    const confirmDelete = window.confirm(
      'Bu stok kartını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve tüm stok hareketleri de silinecektir.'
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/StockItems/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setStockItems(prev => prev.filter(item => item.id !== id));
        alert('Stok kartı başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert('Silme hatası: ' + (errorData.message || 'Stok kartı silinemedi'));
      }
    } catch (error) {
      console.error('Stok kartı silinirken hata:', error);
      alert('Bağlantı hatası: ' + error.message);
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

  const visibleItems = stockItems.filter((item) => {
    const codeMatch = (item.itemCode || "").toLowerCase().includes(searchFilters.itemCode.toLowerCase());
    const nameMatch = (item.name || "").toLowerCase().includes(searchFilters.name.toLowerCase());
    const categoryMatch = !searchFilters.category || (item.category || "").toLowerCase().includes(searchFilters.category.toLowerCase());
    const brandMatch = !searchFilters.brand || (item.brand || "").toLowerCase().includes(searchFilters.brand.toLowerCase());
    const criticalMatch = searchFilters.isCriticalItem === "" || item.isCriticalItem.toString() === searchFilters.isCriticalItem;
    const statusMatch = !searchFilters.status || getStockStatus(item) === searchFilters.status;

    return codeMatch && nameMatch && categoryMatch && brandMatch && criticalMatch && statusMatch;
  });

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
            Stok Kartı Ekle
          </button>
        </div>
      </div>

      {/* Stok Kartları Grid */}
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => {
            const status = getStockStatus(item);
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <IconPackage className="h-8 w-8 text-ivosis-500" />
                      <div className="ml-3">
                        <h3 className="text-sm font-semibold text-gray-900">{item.itemCode}</h3>
                        <p className="text-xs text-gray-500">{getCategoryName(item.categoryId)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      {item.isCriticalItem && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          <IconAlertTriangle size={12} className="mr-1" />
                          Kritik
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Malzeme Adı */}
                  <h4 className="text-lg font-medium text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
                    {item.name}
                  </h4>

                  {/* Marka & Model */}
                  {(item.brand || item.model) && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        {item.brand && (
                          <div className="flex items-center">
                            <IconStar size={14} className="text-gray-400 mr-1" />
                            <span className="text-gray-600">{item.brand}</span>
                          </div>
                        )}
                        {item.model && (
                          <span className="text-gray-500 text-xs">{item.model}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stok Bilgileri */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Mevcut Stok:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.currentStock || 0} {getUnitName(item.unitId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Min. Stok:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.minimumStock} {getUnitName(item.unitId)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Sipariş Seviyesi:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.reorderLevel} {getUnitName(item.unitId)}
                      </span>
                    </div>
                  </div>

                  {/* Fiyat Bilgileri */}
                  {(item.purchasePrice > 0 || item.salePrice > 0) && (
                    <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                      <div className="space-y-1">
                        {item.purchasePrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Alış:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.purchasePrice, item.currency)}
                            </span>
                          </div>
                        )}
                        {item.salePrice > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Satış:</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.salePrice, item.currency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ek Bilgiler */}
                  <div className="space-y-2 mb-4">
                    {item.qualityStandards && (
                      <div className="flex items-center text-xs text-gray-600">
                        <IconShield size={12} className="mr-1" />
                        <span className="truncate">Kalite: {item.qualityStandards}</span>
                      </div>
                    )}
                    {item.certificateNumbers && (
                      <div className="flex items-center text-xs text-gray-600">
                        <IconCertificate size={12} className="mr-1" />
                        <span className="truncate">Sertifika: {item.certificateNumbers}</span>
                      </div>
                    )}
                    {item.shelfLife > 0 && (
                      <div className="flex items-center text-xs text-gray-600">
                        <IconCalendar size={12} className="mr-1" />
                        <span>Raf Ömrü: {item.shelfLife} gün</span>
                      </div>
                    )}
                    {item.storageConditions && (
                      <div className="flex items-center text-xs text-gray-600">
                        <IconThermometer size={12} className="mr-1" />
                        <span className="truncate">Depolama: {item.storageConditions}</span>
                      </div>
                    )}
                  </div>

                  {/* Açıklama */}
                  {item.description && (
                    <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                  )}

                  {/* Kritik Stok Uyarısı */}
                  {status === "Kritik" && (
                    <div className="mb-4 flex items-center text-red-600 bg-red-50 p-2 rounded-lg">
                      <IconAlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-xs font-medium">Acil stok ihtiyacı!</span>
                    </div>
                  )}

                  {/* Düzenleme ve Silme Butonları */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 text-center text-sm text-ivosis-600 hover:text-ivosis-800 font-medium transition-colors duration-200 py-2 border border-ivosis-200 rounded-lg hover:bg-ivosis-50"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteStockCard(item.id)}
                        className="flex-1 text-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 py-2 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
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
        )}
      </div>

      {/* Add Modal */}
      <StockAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddStockCard}
        categories={categories}
        units={units}
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
      />
    </div>
  );
};

export default StockCards;