import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
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
import FilterAndSearch from "../Layout/FilterAndSearch";
import StockInModal from "../components/Stock/StockInModal";
import StockOutModal from "../components/Stock/StockOutModal";

const StockMovements = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [movements, setMovements] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    stockItemId: "",
    movementType: "",
    dateFrom: "",
    dateTo: "",
    referenceNumber: ""
  });

  useEffect(() => {
    fetchMovements();
    fetchStockItems();
  }, []);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockMovements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMovements(data);
      } else {
        console.error("Stok hareketleri yetkisiz erişim:", response.status);
        // Mock data fallback
        setMovements([
          {
            id: 1,
            stockItemId: 1,
            stockItem: { itemCode: 'ITM-001', name: 'Siyah Sac 2mm', unit: 'Ton' },
            locationId: 1,
            location: { name: 'DEPO-A-01' },
            movementType: 'StockIn',
            quantity: 25.5,
            unitPrice: 150.00,
            referenceType: 'Invoice',
            referenceId: 1,
            referenceNumber: 'INV-2024-001',
            description: 'Tedarikçiden gelen mal',
            notes: 'Kalite kontrolden geçti',
            movementDate: '2024-01-15T14:30:00'
          },
          {
            id: 2,
            stockItemId: 2,
            stockItem: { itemCode: 'ITM-002', name: 'Galvaniz Sac 1.5mm', unit: 'Ton' },
            locationId: 2,
            location: { name: 'DEPO-B-02' },
            movementType: 'StockOut',
            quantity: 18.2,
            unitPrice: 180.00,
            referenceType: 'Order',
            referenceId: 2,
            referenceNumber: 'ORD-2024-002',
            description: 'Müşteri siparişi',
            notes: 'Sevkiyat tamamlandı',
            movementDate: '2024-01-15T15:45:00'
          }
        ]);
      }
    } catch (error) {
      console.error('Stok hareketleri yüklenirken hata:', error);
      // Mock data fallback
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockItems', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response);
      
      
      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      } else {
        console.error("StockItems yetkisiz erişim:", response.status);
      }
    } catch (error) {
      console.error('Stok kalemleri yüklenirken hata:', error);
    }
  };
  
  const handleStockIn = async (stockInData) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockMovements/stock-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockInData)
      });
  
      if (response.ok) {
        const result = await response.json();
        await fetchMovements(); // Listeyi yenile
        setShowStockInModal(false);
        alert('Stok girişi başarıyla kaydedildi!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Stok girişi kaydedilemedi');
      }
    } catch (error) {
      console.error('Stok giriş hatası:', error);
      alert('Hata: ' + error.message);
    }
  };
  
  const handleStockOut = async (stockOutData) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5000/api/StockMovements/stock-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockOutData)
      });
  
      if (response.ok) {
        const result = await response.json();
        await fetchMovements(); // Listeyi yenile
        setShowStockOutModal(false);
        alert('Stok çıkışı başarıyla kaydedildi!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Stok çıkışı kaydedilemedi');
      }
    } catch (error) {
      console.error('Stok çıkış hatası:', error);
      alert('Hata: ' + error.message);
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
      stockItemId: "",
      movementType: "",
      dateFrom: "",
      dateTo: "",
      referenceNumber: ""
    });
    setCurrentPage(1);
  };

  const visibleMovements = movements.filter((movement) => {
    const itemMatch = !searchFilters.stockItemId || movement.stockItemId === parseInt(searchFilters.stockItemId);
    const typeMatch = !searchFilters.movementType || movement.movementType === searchFilters.movementType;
    const referenceMatch = (movement.referenceNumber || "").toLowerCase().includes(searchFilters.referenceNumber.toLowerCase());
    
    let dateMatch = true;
    if (searchFilters.dateFrom && searchFilters.dateTo) {
      const movementDate = new Date(movement.movementDate);
      const fromDate = new Date(searchFilters.dateFrom);
      const toDate = new Date(searchFilters.dateTo);
      dateMatch = movementDate >= fromDate && movementDate <= toDate;
    }

    return itemMatch && typeMatch && referenceMatch && dateMatch;
  });

  const totalPages = Math.ceil(visibleMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMovements = visibleMovements.slice(startIndex, startIndex + itemsPerPage);

  const getMovementIcon = (type) => {
    switch (type) {
      case "StockIn":
        return <IconArrowUp className="h-5 w-5 text-green-500" />;
      case "StockOut":
        return <IconArrowDown className="h-5 w-5 text-red-500" />;
      case "Transfer":
        return <IconTransfer className="h-5 w-5 text-blue-500" />;
      case "Adjustment":
        return <IconRefresh className="h-5 w-5 text-yellow-500" />;
      default:
        return <IconArrowsExchange className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMovementTypeName = (type) => {
    switch (type) {
      case "StockIn":
        return "Stok Girişi";
      case "StockOut":
        return "Stok Çıkışı";
      case "Transfer":
        return "Transfer";
      case "Adjustment":
        return "Düzeltme";
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case "StockIn":
        return "bg-green-100 text-green-800";
      case "StockOut":
        return "bg-red-100 text-red-800";
      case "Transfer":
        return "bg-blue-100 text-blue-800";
      case "Adjustment":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("tr-TR");
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
        totalCount={`${visibleMovements.length} hareket kaydı`}
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
            { key: "stockItemId", type: "select", placeholder: "Stok Kalemi", options: stockItems.map(item => ({ value: item.id, label: item.name })) },
            {
              key: "movementType",
              type: "select",
              placeholder: "Hareket Tipi",
              options: [
                { value: "", label: "Tümü" },
                { value: "StockIn", label: "Stok Girişi" },
                { value: "StockOut", label: "Stok Çıkışı" },
                { value: "Transfer", label: "Transfer" },
                { value: "Adjustment", label: "Düzeltme" }
              ]
            },
            { key: "dateFrom", type: "date", placeholder: "Başlangıç Tarihi" },
            { key: "dateTo", type: "date", placeholder: "Bitiş Tarihi" },
            { key: "referenceNumber", type: "text", placeholder: "Referans No..." }
          ]}
        />
      </div>

      {/* Hareketler Tablosu */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hareket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Kodu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Malzeme Adı
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasyon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referans No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {getMovementIcon(movement.movementType)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(movement.movementType)}`}>
                          {getMovementTypeName(movement.movementType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {movement.stockItem?.itemCode}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {movement.stockItem?.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {movement.location?.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={movement.movementType === "StockOut" ? "text-red-600" : "text-green-600"}>
                        {movement.movementType === "StockOut" ? "-" : "+"}{movement.quantity} {movement.stockItem?.unit}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(movement.movementDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {movement.referenceNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {movement.description || "-"}
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
                    <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, visibleMovements.length)}</span> arası,{" "}
                    toplam <span className="font-medium">{visibleMovements.length}</span> kayıt
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

      {/* Stok Giriş/Çıkış Modalları */}
      <StockInModal
        isOpen={showStockInModal}
        onClose={() => setShowStockInModal(false)}
        onSubmit={handleStockIn}
        stockItems={stockItems}
      />
      <StockOutModal
        isOpen={showStockOutModal}
        onClose={() => setShowStockOutModal(false)}
        onSubmit={handleStockOut}
        stockItems={stockItems}
      />

      {/* Stok Hareketi Ekle */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <button
          onClick={() => setShowStockInModal(true)}
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
        >
          <IconPlus className="h-6 w-6" />
        </button>
        <button
          onClick={() => setShowStockOutModal(true)}
          className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600"
        >
          <IconMinus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default StockMovements;