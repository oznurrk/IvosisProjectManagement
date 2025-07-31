import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header/Header";
import { IconPackage, IconPlus, IconTruck, IconScale, IconBarcode, IconCalendar } from "@tabler/icons-react";
import FilterAndSearch from "../Layout/FilterAndSearch";
import StockAddModal from "../components/Stock/StockAddModal";
import StockEditModal from "../components/Stock/StockEditModal";

const StockManagement = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchFilters, setSearchFilters] = useState({
    stockCode: "",
    materialName: "",
    lotNumber: "",
    supplier: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  // Mock data - Backend olmadığı için
  const mockStocks = [
    {
      id: 1,
      stockCode: "STK-2025-001",
      materialName: "Çelik Bobin A1",
      lotNumber: "LOT-2025-001",
      weight: 2500,
      unit: "Kg",
      supplier: "ABC Çelik San. Tic. Ltd. Şti.",
      arrivalDate: "2025-01-15",
      labelNumber: "LBL-001",
      waybillNumber: "İRS-2025-001",
      status: "Stokta",
      location: "A-01-001",
      unitPrice: 45,
      totalPrice: 112500,
      notes: "Kalite kontrolü tamamlandı",
      createdDate: "2025-01-15",
      updatedDate: "2025-01-15"
    },
    {
      id: 2,
      stockCode: "STK-2025-002",
      materialName: "Alüminyum Bobin B2",
      lotNumber: "LOT-2025-002",
      weight: 1800,
      unit: "Kg",
      supplier: "XYZ Metal San. A.Ş.",
      arrivalDate: "2025-01-20",
      labelNumber: "LBL-002",
      waybillNumber: "İRS-2025-002",
      status: "Satıldı",
      location: "B-02-003",
      unitPrice: 65,
      totalPrice: 117000,
      notes: "Müşteri özel siparişi",
      saleDate: "2025-01-25",
      saleCustomer: "DEF İnşaat Ltd. Şti.",
      createdDate: "2025-01-20",
      updatedDate: "2025-01-25"
    },
    {
      id: 3,
      stockCode: "STK-2025-003",
      materialName: "Paslanmaz Çelik Bobin C3",
      lotNumber: "LOT-2025-003",
      weight: 3200,
      unit: "Kg",
      supplier: "GHI Paslanmaz Ltd.",
      arrivalDate: "2025-01-22",
      labelNumber: "LBL-003",
      waybillNumber: "İRS-2025-003",
      status: "Rezerve",
      location: "C-03-002",
      unitPrice: 85,
      totalPrice: 272000,
      notes: "Özel kalite sertifikası mevcut",
      reserveCustomer: "JKL Makina San.",
      reserveDate: "2025-01-28",
      createdDate: "2025-01-22",
      updatedDate: "2025-01-28"
    }
  ];

  useEffect(() => {
    // localStorage'dan veri yükle
    const savedStocks = localStorage.getItem('ivosis_stocks');
    if (savedStocks) {
      try {
        const parsedStocks = JSON.parse(savedStocks);
        setStocks(parsedStocks);
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        // Hata durumunda mock data kullan
        setStocks(mockStocks);
        setLoading(false);
      }
    } else {
      // İlk kullanımda mock data kullan
      setTimeout(() => {
        setStocks(mockStocks);
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setShowEditModal(true);
  };

  const handleViewDetails = (stock) => {
    setSelectedStock(stock);
    setShowDetailModal(true);
  };

  const handleAddStock = (newStock) => {
    const stockWithId = {
      ...newStock,
      id: Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };
    const updatedStocks = [stockWithId, ...stocks];
    setStocks(updatedStocks);
    // localStorage'a kaydet
    localStorage.setItem('ivosis_stocks', JSON.stringify(updatedStocks));
    setShowAddModal(false);
  };

  const handleUpdateStock = (updatedStock) => {
    const updatedStocks = stocks.map(stock => 
      stock.id === updatedStock.id 
        ? { ...updatedStock, updatedDate: new Date().toISOString().split('T')[0] }
        : stock
    );
    setStocks(updatedStocks);
    // localStorage'a kaydet
    localStorage.setItem('ivosis_stocks', JSON.stringify(updatedStocks));
    setShowEditModal(false);
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
      stockCode: "",
      materialName: "",
      lotNumber: "",
      supplier: "",
      status: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentPage(1);
  };

  const visibleStocks = stocks.filter((stock) => {
    const stockCodeMatch = stock.stockCode.toLowerCase().includes(searchFilters.stockCode.toLowerCase());
    const materialMatch = stock.materialName.toLowerCase().includes(searchFilters.materialName.toLowerCase());
    const lotMatch = stock.lotNumber.toLowerCase().includes(searchFilters.lotNumber.toLowerCase());
    const supplierMatch = stock.supplier.toLowerCase().includes(searchFilters.supplier.toLowerCase());
    const statusMatch = !searchFilters.status || stock.status === searchFilters.status;
    
    let dateMatch = true;
    if (searchFilters.dateFrom && searchFilters.dateTo) {
      const stockDate = new Date(stock.arrivalDate);
      const fromDate = new Date(searchFilters.dateFrom);
      const toDate = new Date(searchFilters.dateTo);
      dateMatch = stockDate >= fromDate && stockDate <= toDate;
    }

    return stockCodeMatch && materialMatch && lotMatch && supplierMatch && statusMatch && dateMatch;
  });

  // Pagination
  const totalPages = Math.ceil(visibleStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStocks = visibleStocks.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY"
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Stokta":
        return "bg-green-100 text-green-800";
      case "Satıldı":
        return "bg-blue-100 text-blue-800";
      case "Rezerve":
        return "bg-yellow-100 text-yellow-800";
      case "İade":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalStats = () => {
    // Sadece stokta olan ve rezerve olanları topla (satılanları sayma)
    const activeStocks = stocks.filter(s => s.status === "Stokta" || s.status === "Rezerve");
    
    const totalWeight = activeStocks.reduce((sum, stock) => {
      // Tüm ağırlıkları kg cinsinden topla
      const weightInKg = stock.unit === "Ton" ? stock.weight * 1000 : stock.weight;
      return sum + weightInKg;
    }, 0);
    
    const totalValue = activeStocks.reduce((sum, stock) => sum + stock.totalPrice, 0);
    const stockCount = stocks.filter(s => s.status === "Stokta").length;
    const soldCount = stocks.filter(s => s.status === "Satıldı").length;
    const reserveCount = stocks.filter(s => s.status === "Rezerve").length;

    return { totalWeight, totalValue, stockCount, soldCount, reserveCount };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Stok Yönetimi" 
          subtitle="Bobin Stok Takibi" 
          icon={IconPackage}
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
        title="Stok Yönetimi"
        subtitle="Bobin Stok Takibi"
        icon={IconPackage}
        totalCount={`${visibleStocks.length} kayıt (${stats.stockCount} stokta, ${stats.reserveCount} rezerve, ${stats.soldCount} satıldı)`}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* İstatistik Kartları */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <IconPackage className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.stockCount + stats.reserveCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <IconScale className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Ağırlık</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalWeight.toFixed(1)} KG</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <IconTruck className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Değer</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <IconBarcode className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stokta</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.stockCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <IconCalendar className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Satıldı</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.soldCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreleme alanı */}
      <div className="px-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            { key: "stockCode", type: "text", placeholder: "Stok Kodu..." },
            { key: "materialName", type: "text", placeholder: "Malzeme Adı..." },
            { key: "lotNumber", type: "text", placeholder: "Lot Numarası..." },
            { key: "supplier", type: "text", placeholder: "Tedarikçi..." },
            {
              key: "status",
              type: "select",
              placeholder: "Durum",
              options: [
                { value: "", label: "Tümü" },
                { value: "Stokta", label: "Stokta" },
                { value: "Satıldı", label: "Satıldı" },
                { value: "Rezerve", label: "Rezerve" },
                { value: "İade", label: "İade" }
              ]
            },
            { key: "dateFrom", type: "date", placeholder: "Başlangıç Tarihi" },
            { key: "dateTo", type: "date", placeholder: "Bitiş Tarihi" }
          ]}
        />
      </div>

      {/* Actions */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
          </div>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold h-8"
          >
            <IconPlus size={20} />
            Stok Ekle
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Kodu
                  </th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Malzeme Adı
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot No
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ağırlık
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tedarikçi
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giriş Tarihi
                  </th>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Fiyat
                  </th>
                  <th className="w-36 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {stock.stockCode}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {stock.materialName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Etiket: {stock.labelNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {stock.lotNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {stock.weight} {stock.unit}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {stock.supplier}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(stock.arrivalDate)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stock.status)}`}>
                        {stock.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(stock.totalPrice)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(stock)}
                        className="text-ivosis-500 hover:text-ivosis-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handleEdit(stock)}
                        className="text-ivosis-700 hover:text-ivosis-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs"
                      >
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                    <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, visibleStocks.length)}</span> arası,{" "}
                    toplam <span className="font-medium">{visibleStocks.length}</span> kayıt
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
        onSave={handleAddStock}
      />

      {/* Edit Modal */}
      <StockEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        stock={selectedStock}
        onSave={handleUpdateStock}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {selectedStock.materialName}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Stok Kodu: {selectedStock.stockCode}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="p-6 space-y-6">
                
                {/* Temel Bilgiler */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Stok Kodu</label>
                      <p className="text-gray-900 font-medium">{selectedStock.stockCode}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Lot Numarası</label>
                      <p className="text-gray-900 font-medium">{selectedStock.lotNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Etiket Numarası</label>
                      <p className="text-gray-900 font-medium">{selectedStock.labelNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Ağırlık</label>
                      <p className="text-gray-900 font-medium">{selectedStock.weight} {selectedStock.unit}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Durum</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStock.status)}`}>
                        {selectedStock.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Lokasyon</label>
                      <p className="text-gray-900 font-medium">{selectedStock.location}</p>
                    </div>
                  </div>
                </div>

                {/* Tedarikçi Bilgileri */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tedarikçi Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Tedarikçi</label>
                      <p className="text-gray-900">{selectedStock.supplier}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">İrsaliye Numarası</label>
                      <p className="text-gray-900">{selectedStock.waybillNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Giriş Tarihi</label>
                      <p className="text-gray-900">{formatDate(selectedStock.arrivalDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Fiyat Bilgileri */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Fiyat Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Birim Fiyat</label>
                      <p className="text-green-700 font-semibold text-lg">{formatCurrency(selectedStock.unitPrice)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Toplam Fiyat</label>
                      <p className="text-green-700 font-semibold text-lg">{formatCurrency(selectedStock.totalPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Satış/Rezervasyon Bilgileri */}
                {(selectedStock.status === "Satıldı" || selectedStock.status === "Rezerve") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {selectedStock.status === "Satıldı" ? "Satış Bilgileri" : "Rezervasyon Bilgileri"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          {selectedStock.status === "Satıldı" ? "Müşteri" : "Rezerve Eden"}
                        </label>
                        <p className="text-gray-900">
                          {selectedStock.status === "Satıldı" ? selectedStock.saleCustomer : selectedStock.reserveCustomer}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          {selectedStock.status === "Satıldı" ? "Satış Tarihi" : "Rezerve Tarihi"}
                        </label>
                        <p className="text-gray-900">
                          {formatDate(selectedStock.status === "Satıldı" ? selectedStock.saleDate : selectedStock.reserveDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notlar */}
                {selectedStock.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Notlar</h3>
                    <p className="text-gray-900">{selectedStock.notes}</p>
                  </div>
                )}

                {/* Sistem Bilgileri */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistem Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Oluşturulma Tarihi</label>
                      <p className="text-gray-900">{formatDate(selectedStock.createdDate)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Son Güncelleme</label>
                      <p className="text-gray-900">{formatDate(selectedStock.updatedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
