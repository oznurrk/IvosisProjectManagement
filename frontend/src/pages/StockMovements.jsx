
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchStockMovements,
  updateStockMovement,
  deleteStockMovement,
  fetchStockItems,
  fetchStockLocations,
  stockIn,
  stockOut,
  stockTransfer
} from "../services/api";
import Header from "../components/Header/Header";
import { 
  IconArrowsExchange, 
  IconArrowUp, 
  IconArrowDown, 
  IconRefresh, 
  IconTransfer,
  IconPlus,
  IconMinus,
  IconEdit
} from "@tabler/icons-react";
import StockInModal from "../components/Stock/StockInModal";
import StockOutModal from "../components/Stock/StockOutModal";
import StockTransferModal from "../components/Stock/StockTransferModal";
import FilterAndSearch from "../Layout/FilterAndSearch";


const StockMovements = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [movements, setMovements] = useState([]); // Başlangıç değeri empty array
  const [stockItems, setStockItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showStockTransferModal, setShowStockTransferModal] = useState(false);

  const [editMovement, setEditMovement] = useState(null);
  const [editModalType, setEditModalType] = useState(null); // 'in' | 'out' | 'transfer'

  // --- HAREKET GÜNCELLEME ---
  const handleUpdateMovement = async (formData, oldMovement) => {
    try {
      const token = localStorage.getItem("token");
      // Sadece güncellenebilir alanları gönder
      const updateData = {
        stockItemId: formData.stockItemId,
        locationId: formData.locationId || oldMovement.locationId || 1,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice ?? oldMovement.unitPrice ?? 0,
        totalAmount: formData.totalAmount ?? oldMovement.totalAmount ?? 0,
        referenceType: formData.referenceType || oldMovement.referenceType || null,
        referenceNumber: formData.referenceNumber || oldMovement.referenceNumber || null,
        description: formData.description || oldMovement.description || null,
        notes: formData.notes || oldMovement.notes || null
      };
      // Hareket türüne göre endpoint
      await updateStockMovement(oldMovement.id, updateData);
      await fetchAllData();
      setEditMovement(null);
      setEditModalType(null);
      setShowStockInModal(false);
      setShowStockOutModal(false);
      setShowStockTransferModal(false);
      alert('Hareket başarıyla güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- HAREKET SİLME ---
  const handleDeleteMovement = async (movement) => {
    if (!window.confirm('Bu hareketi silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem("token");
      await deleteStockMovement(movement.id);
      await fetchAllData();
      alert('Hareket başarıyla silindi!');
    } catch (error) {
      alert('Silme işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  // --- HAREKET DÜZENLEME ---
  const handleEditMovement = (movement) => {
    // Hareket türüne göre modalı aç
    if (movement.movementType === 'IN' || movement.movementType === 'StockIn') {
      setEditModalType('in');
      setShowStockInModal(true);
    } else if (movement.movementType === 'OUT' || movement.movementType === 'StockOut') {
      setEditModalType('out');
      setShowStockOutModal(true);
    } else if (movement.movementType === 'TRANSFER' || movement.movementType === 'Transfer') {
      setEditModalType('transfer');
      setShowStockTransferModal(true);
    } else {
      alert('Bu hareket türü düzenlenemiyor.');
      return;
    }
    setEditMovement(movement);
  };

  const [searchFilters, setSearchFilters] = useState({
    search: "", // Genel arama - hem malzeme adı hem stok kodu
    movementType: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    fetchAllData();
    fetchLocations();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [movementsRes, stockItemsRes] = await Promise.all([
        fetchStockMovements(),
        fetchStockItems(),
      ]);

      // Movements verilerini set et - array olduğundan emin ol
      let movementData = [];
      if (Array.isArray(movementsRes.data)) {
        movementData = movementsRes.data;
      } else if (movementsRes.data && typeof movementsRes.data === 'object') {
        if (movementsRes.data.items && Array.isArray(movementsRes.data.items)) {
          movementData = movementsRes.data.items;
        } else if (movementsRes.data.data && Array.isArray(movementsRes.data.data)) {
          movementData = movementsRes.data.data;
        } else if (movementsRes.data.movements && Array.isArray(movementsRes.data.movements)) {
          movementData = movementsRes.data.movements;
        }
      }
      
      // StockItems verilerini set et
      let stockData = [];
      if (Array.isArray(stockItemsRes.data)) {
        stockData = stockItemsRes.data;
      } else if (stockItemsRes.data && typeof stockItemsRes.data === 'object') {
        if (stockItemsRes.data.items && Array.isArray(stockItemsRes.data.items)) {
          stockData = stockItemsRes.data.items;
        } else if (stockItemsRes.data.data && Array.isArray(stockItemsRes.data.data)) {
          stockData = stockItemsRes.data.data;
        } else if (stockItemsRes.data.stockItems && Array.isArray(stockItemsRes.data.stockItems)) {
          stockData = stockItemsRes.data.stockItems;
        }
      }
      
      // StockItems'ı Map'e çevir hızlı erişim için
      const stockItemsMap = new Map();
      stockData.forEach(item => {
        stockItemsMap.set(item.id, item);
      });
      
      // Movements verilerini stockItems ile birleştir
      const enrichedMovements = movementData.map(movement => {
        const stockItem = stockItemsMap.get(movement.stockItemId);
        return {
          ...movement,
          stockItem: stockItem || null,
          // Fallback alanları
          itemCode: stockItem?.itemCode || movement.itemCode,
          itemName: stockItem?.name || movement.itemName,
          unit: stockItem?.unit || movement.unit
        };
      });
      
      
      setMovements(enrichedMovements);
      setStockItems(stockData);

    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      setMovements([]);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetchStockLocations();
      let locationData = [];
      if (Array.isArray(res.data)) {
        locationData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        if (res.data.items && Array.isArray(res.data.items)) {
          locationData = res.data.items;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          locationData = res.data.data;
        } else if (res.data.locations && Array.isArray(res.data.locations)) {
          locationData = res.data.locations;
        }
      }
      console.log('StockLocations API response:', locationData);
      setLocations(locationData.filter(loc => loc.isActive !== false));
    } catch (err) {
      setLocations([{ id: 1, name: "Ana Depo", code: "MAIN", isActive: true }]);
    }
  };

  const handleStockIn = async (stockInData) => {
    if (!stockInData.referenceNumber || stockInData.referenceNumber.trim() === "") {
      alert("Lütfen Referans No alanını doldurun. Stok girişi için Referans No zorunludur.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Sadece gerekli alanları gönder, computed column'ları çıkar
      const cleanData = {
        stockItemId: stockInData.stockItemId,
        locationId: stockInData.locationId || 1,
        movementType: "StockIn",
        quantity: stockInData.quantity,
        unitPrice: stockInData.unitPrice,
        totalAmount: stockInData.totalAmount,
        referenceType: "Purchase",
        referenceNumber: stockInData.referenceNumber,
        description: stockInData.description || null,
        notes: stockInData.notes || null
        // movementDate, availableQuantity gibi alanları göndermiyoruz
      };
      const response = await stockIn(cleanData);
      await fetchAllData();
      setShowStockInModal(false);
      window.location.reload();
      // alert('Stok girişi başarıyla kaydedildi!');
    } catch (error) {
      console.error('Stok girişi hatası:', error);
      let errorMessage = 'Stok girişi kaydedilemedi';
      if (error.response?.status === 500) {
        if (error.response?.data?.includes?.('computed column') || 
            error.response?.data?.includes?.('AvailableQuantity')) {
          errorMessage = 'Veritabanı yapı hatası. Sistem yöneticisine başvurun.';
        } else if (error.response?.data?.includes?.('FOREIGN KEY constraint')) {
          errorMessage = 'Veritabanı bağlantı hatası. Sistem yöneticisine başvurun.';
        } else {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert('Hata: ' + errorMessage);
    }
  };

  const handleStockOut = async (stockOutData) => {
    try {
      const token = localStorage.getItem("token");
      
      // Sadece gerekli alanları gönder, computed column'ları çıkar
      const cleanData = {
        stockItemId: stockOutData.stockItemId,
        locationId: stockOutData.locationId || 1,
        movementType: "StockOut",
        quantity: stockOutData.quantity,
        unitPrice: 0,
        totalAmount: 0,
        referenceType: "Issue",
        referenceNumber: stockOutData.referenceNumber || null,
        description: stockOutData.description || null,
        notes: stockOutData.notes || null
        // movementDate, availableQuantity gibi alanları göndermiyoruz
      };
      

      
      const response = await stockOut(cleanData);

      await fetchAllData();
      setShowStockOutModal(false);
      window.location.reload();
      // alert('Stok çıkışı başarıyla kaydedildi!');
    } catch (error) {
      console.error('Stok çıkışı hatası:', error);
      let errorMessage = 'Stok çıkışı kaydedilemedi';
      
      if (error.response?.status === 500) {
        if (error.response?.data?.includes?.('computed column') || 
            error.response?.data?.includes?.('AvailableQuantity')) {
          errorMessage = 'Veritabanı yapı hatası. Sistem yöneticisine başvurun.';
        } else if (error.response?.data?.includes?.('FOREIGN KEY constraint')) {
          errorMessage = 'Veritabanı bağlantı hatası. Sistem yöneticisine başvurun.';
        } else {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert('Hata: ' + errorMessage);
    }
  };

  const handleStockTransfer = async (transferData) => {
    try {
      const token = localStorage.getItem("token");
      const cleanData = {
        stockItemId: transferData.stockItemId,
        fromLocationId: transferData.fromLocationId,
        toLocationId: transferData.toLocationId,
        quantity: transferData.quantity,
        description: transferData.description || null,
        movementType: "Transfer"
      };
      await stockTransfer(cleanData);
      await fetchAllData();
      setShowStockTransferModal(false);
      window.location.reload();
      // alert('Transfer işlemi başarıyla kaydedildi!');
    } catch (error) {
      alert('Transfer işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'));
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
      movementType: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentPage(1);
  };

  const visibleItems = Array.isArray(movements) ? movements.filter((movement) => {
    // Genel arama - hem malzeme adı hem stok kodu
    const searchMatch = !searchFilters.search || 
      (movement.stockItem?.name || movement.itemName || "").toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      (movement.stockItem?.itemCode || movement.itemCode || "").toLowerCase().includes(searchFilters.search.toLowerCase());
    
    // Hareket türü filtresi - boşsa true, varsa eşleşme kontrolü
    const typeMatch = !searchFilters.movementType || movement.movementType === searchFilters.movementType;

    // Tarih aralığı filtresi
    let dateMatch = true;
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      const movementDate = new Date(movement.movementDate || movement.createdAt);
      
      if (searchFilters.dateFrom && searchFilters.dateTo) {
        const fromDate = new Date(searchFilters.dateFrom);
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = movementDate >= fromDate && movementDate <= toDate;
      } else if (searchFilters.dateFrom) {
        const fromDate = new Date(searchFilters.dateFrom);
        dateMatch = movementDate >= fromDate;
      } else if (searchFilters.dateTo) {
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = movementDate <= toDate;
      }
    }

    return searchMatch && typeMatch && dateMatch;
  }).sort((a, b) => {
    return new Date(b.movementDate || b.createdAt) - new Date(a.movementDate || a.createdAt);
  }) : [];

  const totalPages = Math.ceil(visibleItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMovements = visibleItems.slice(startIndex, startIndex + itemsPerPage);

  const getMovementIcon = (type) => {
    switch (type) {
      case "IN":
      case "StockIn":
        return <IconArrowUp className="h-5 w-5 text-green-500" />;
      case "OUT":
      case "StockOut":
        return <IconArrowDown className="h-5 w-5 text-red-500" />;
      case "TRANSFER":
      case "Transfer":
        return <IconTransfer className="h-5 w-5 text-blue-500" />;
      case "ADJUSTMENT":
      case "Adjustment":
        return <IconRefresh className="h-5 w-5 text-yellow-500" />;
      default:
        return <IconArrowsExchange className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMovementTypeName = (type) => {
    switch (type) {
      case "IN":
      case "StockIn":
        return "Stok Girişi";
      case "OUT":
      case "StockOut":
        return "Stok Çıkışı";
      case "TRANSFER":
      case "Transfer":
        return "Transfer";
      case "ADJUSTMENT":
      case "Adjustment":
        return "Düzeltme";
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case "IN":
      case "StockIn":
        return "bg-green-100 text-green-800";
      case "OUT":
      case "StockOut":
        return "bg-red-100 text-red-800";
      case "TRANSFER":
      case "Transfer":
        return "bg-blue-100 text-blue-800";
      case "ADJUSTMENT":
      case "Adjustment":
        return "bg-yellow-100 text-yellow-800";
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

  const formatReferenceNumber = (refNumber) => {
    if (!refNumber) return "-";
    
    // Eğer zaten formatlanmış ise olduğu gibi döndür
    if (refNumber.includes('/')) return refNumber;
    
    // Yeni format: GG/AA/YYYY-XXXX (gün başta, ay ortada)
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    
    return `${day}/${month}/${year}-${refNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Stok Hareketleri" 
          subtitle="Stok Giriş/Çıkış Takibi" 
          icon={IconArrowsExchange}
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
        title="Stok Hareketleri"
        subtitle="Stok Giriş/Çıkış Takibi"
        icon={IconArrowsExchange}
        totalCount={`${visibleItems.length} hareket kaydı`}
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
            { key: "search", type: "text", placeholder: "Malzeme Adı veya Stok Kodu Ara..." },
            {
              key: "movementType",
              type: "select",
              placeholder: "Hareket Türü",
              options: [
                { value: "", label: "Tüm Hareketler" },
                { value: "IN", label: "Stok Girişi" },
                { value: "OUT", label: "Stok Çıkışı" },
                { value: "TRANSFER", label: "Transfer" },
                { value: "ADJUSTMENT", label: "Düzeltme" }
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

      {/* Hareketler Tablosu */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentMovements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {movements.length === 0 ? "Henüz stok hareketi bulunmuyor." : "Filtreleme kriterlerine uygun hareket bulunamadı."}
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
                      Hareket
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Stok Kodu
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Malzeme Adı
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Lokasyon
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Miktar
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Referans No
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMovements.map((movement, index) => {
                    const rowNumber = startIndex + index + 1;
                    return (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        {/* Sıra Numarası */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-ivosis-100 text-ivosis-800">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* Hareket */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-3">
                            {getMovementIcon(movement.movementType)}
                            <div className="min-w-0 flex-1 text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 whitespace-nowrap ${getMovementTypeColor(movement.movementType)}`}>
                                {getMovementTypeName(movement.movementType)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Stok Kodu */}
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          <div className="text-center">
                            {movement.stockItem?.itemCode || movement.itemCode || 'Bilinmiyor'}
                          </div>
                          {movement.stockItemId && (
                            <div className="text-xs text-gray-500 text-center">
                              Item ID: {movement.stockItemId}
                            </div>
                          )}
                        </td>

                        {/* Malzeme Adı */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="font-medium text-center">
                            {movement.stockItem?.name || movement.itemName || 'Bilinmiyor'}
                          </div>
                          {movement.stockItem?.category && (
                            <div className="text-xs text-gray-500 text-center">
                              {movement.stockItem.category}
                            </div>
                          )}
                        </td>

                        {/* Lokasyon */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {movement.location?.name || movement.locationName || 'Ana Depo'}
                          </div>
                          {movement.locationId && (
                            <div className="text-xs text-gray-500 text-center">
                              Lokasyon ID: {movement.locationId}
                            </div>
                          )}
                        </td>

                        {/* Miktar */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            <span className={movement.movementType === "OUT" ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                              {movement.movementType === "OUT" ? "-" : "+"}{movement.quantity || 0}
                            </span>
                            <span className="text-gray-500 ml-1">
                              {movement.stockItem?.unit || movement.unit || 'Adet'}
                            </span>
                          </div>
                        </td>

                        {/* Tarih */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {formatDate(movement.movementDate)}
                          </div>
                        </td>

                        {/* Referans No */}
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="text-center">
                            {formatReferenceNumber(movement.referenceNumber)}
                          </div>
                        </td>

                        {/* Açıklama */}
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate text-center">
                            {movement.description || movement.notes || "-"}
                          </div>
                        </td>

                        {/* Düzenle/Sil Butonları */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-2 text-center">
                            <button
                              onClick={() => handleEditMovement(movement)}
                              className="text-ivosis-600 hover:text-ivosis-900 transition-colors"
                              title="Düzenle"
                              type="button"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovement(movement)}
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

      {/* Stok Giriş/Çıkış Modalları */}
      <StockInModal
        isOpen={showStockInModal}
        onClose={() => { setShowStockInModal(false); setEditMovement(null); setEditModalType(null); }}
        onSubmit={editMovement ? (data) => handleUpdateMovement(data, editMovement) : handleStockIn}
        stockItems={Array.isArray(stockItems) ? stockItems : []}
        initialValues={editModalType === 'in' ? editMovement : undefined}
      />
      <StockOutModal
        isOpen={showStockOutModal}
        onClose={() => { setShowStockOutModal(false); setEditMovement(null); setEditModalType(null); }}
        onSubmit={editMovement ? (data) => handleUpdateMovement(data, editMovement) : handleStockOut}
        stockItems={Array.isArray(stockItems) ? stockItems : []}
        initialValues={editModalType === 'out' ? editMovement : undefined}
      />
      <StockTransferModal
        isOpen={showStockTransferModal}
        onClose={() => { setShowStockTransferModal(false); setEditMovement(null); setEditModalType(null); }}
        onSubmit={editMovement ? (data) => handleUpdateMovement(data, editMovement) : handleStockTransfer}
        stockItems={Array.isArray(stockItems) ? stockItems : []}
        locations={Array.isArray(locations) ? locations : []}
        initialValues={editModalType === 'transfer' ? editMovement : undefined}
      />

      {/* Stok Hareketi Ekle - Responsive FAB Butonları */}
      <div className="fixed bottom-4 right-4 flex flex-row items-end space-x-2 z-50 md:bottom-6 md:right-6 md:space-x-4">
        {/* Stok Girişi */}
        <div className="relative group">
          <button
            onClick={() => setShowStockInModal(true)}
            className="bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
          >
            <IconPlus className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <span className="absolute bottom-14 right-1/2 translate-x-1/2 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Stok Girişi
          </span>
        </div>
        {/* Stok Çıkışı */}
        <div className="relative group">
          <button
            onClick={() => setShowStockOutModal(true)}
            className="bg-red-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300"
          >
            <IconMinus className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <span className="absolute bottom-14 right-1/2 translate-x-1/2 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Stok Çıkışı
          </span>
        </div>
        {/* Stok Transferi */}
        <div className="relative group">
          <button
            onClick={() => setShowStockTransferModal(true)}
            className="bg-blue-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
          >
            <IconTransfer className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <span className="absolute bottom-14 right-1/2 translate-x-1/2 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Stok Transferi
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockMovements;