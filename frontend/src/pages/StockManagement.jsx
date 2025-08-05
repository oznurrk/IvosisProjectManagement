import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import StockInModal from "../components/Stock/StockInModal";
import StockOutModal from "../components/Stock/StockOutModal";
import { 
  IconPackage, 
  IconPlus, 
  IconTruck, 
  IconScale, 
  IconBarcode, 
  IconCalendar,
  IconFileText,
  IconArrowsExchange,
  IconAlertTriangle,
  IconClipboardList
} from "@tabler/icons-react";

const StockManagement = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [stockStats, setStockStats] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [criticalStockItems, setCriticalStockItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [lowStockRes, criticalStockRes, stockItemsRes, movementsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/StockItems/low-stock", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/StockItems/critical-stock", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/StockItems", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/StockMovements", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      let totalItems = 0;
      let totalValue = 0;
      let inStockCount = 0;
      let outOfStockCount = 0;

      // StockItems verilerini işle - array olduğundan emin ol
      let stockItems = [];
      if (Array.isArray(stockItemsRes.data)) {
        stockItems = stockItemsRes.data;
      } else if (stockItemsRes.data && typeof stockItemsRes.data === 'object') {
        // Eğer data bir object ise, içinde array olup olmadığını kontrol et
        if (stockItemsRes.data.items && Array.isArray(stockItemsRes.data.items)) {
          stockItems = stockItemsRes.data.items;
        } else if (stockItemsRes.data.data && Array.isArray(stockItemsRes.data.data)) {
          stockItems = stockItemsRes.data.data;
        } else if (stockItemsRes.data.stockItems && Array.isArray(stockItemsRes.data.stockItems)) {
          stockItems = stockItemsRes.data.stockItems;
        }
      }

      // Array olduğundan emin olduktan sonra işlemleri yap
      if (Array.isArray(stockItems) && stockItems.length > 0) {
        totalItems = stockItems.length;
        totalValue = stockItems.reduce((sum, item) => {
          const currentStock = Number(item.currentStock) || 0;
          const purchasePrice = Number(item.purchasePrice) || 0;
          return sum + (currentStock * purchasePrice);
        }, 0);
        inStockCount = stockItems.filter(item => (Number(item.currentStock) || 0) > 0).length;
        outOfStockCount = stockItems.filter(item => (Number(item.currentStock) || 0) <= 0).length;
      }

      // StockItems'ı Map'e çevir hızlı erişim için
      const stockItemsMap = new Map();
      stockItems.forEach(item => {
        stockItemsMap.set(item.id, item);
      });

      // Movements verilerini işle ve stockItems ile birleştir
      let movementsData = [];
      if (Array.isArray(movementsRes.data)) {
        movementsData = movementsRes.data;
      } else if (movementsRes.data && typeof movementsRes.data === 'object') {
        if (movementsRes.data.items && Array.isArray(movementsRes.data.items)) {
          movementsData = movementsRes.data.items;
        } else if (movementsRes.data.data && Array.isArray(movementsRes.data.data)) {
          movementsData = movementsRes.data.data;
        } else if (movementsRes.data.movements && Array.isArray(movementsRes.data.movements)) {
          movementsData = movementsRes.data.movements;
        }
      }

      // Movements verilerini stockItems ile birleştir (StockMovements sayfasındaki gibi)
      const enrichedMovements = movementsData.map(movement => {
        const stockItem = stockItemsMap.get(movement.stockItemId);
        return {
          ...movement,
          stockItem: stockItem || null,
          // Fallback alanları
          itemCode: stockItem?.itemCode || movement.itemCode || 'Bilinmiyor',
          itemName: stockItem?.name || movement.itemName || 'Bilinmiyor',
          unit: stockItem?.unit || movement.unit || 'Adet'
        };
      });

      // Son hareketleri tarihe göre sırala ve ilk 10'unu al
      const sortedMovements = enrichedMovements.sort((a, b) => {
        return new Date(b.movementDate) - new Date(a.movementDate);
      });

      // Diğer verileri set et - array olduğundan emin ol
      let lowStockData = [];
      if (Array.isArray(lowStockRes.data)) {
        lowStockData = lowStockRes.data;
      } else if (lowStockRes.data && typeof lowStockRes.data === 'object') {
        if (lowStockRes.data.items && Array.isArray(lowStockRes.data.items)) {
          lowStockData = lowStockRes.data.items;
        } else if (lowStockRes.data.data && Array.isArray(lowStockRes.data.data)) {
          lowStockData = lowStockRes.data.data;
        }
      }

      let criticalStockData = [];
      if (Array.isArray(criticalStockRes.data)) {
        criticalStockData = criticalStockRes.data;
      } else if (criticalStockRes.data && typeof criticalStockRes.data === 'object') {
        if (criticalStockRes.data.items && Array.isArray(criticalStockRes.data.items)) {
          criticalStockData = criticalStockRes.data.items;
        } else if (criticalStockRes.data.data && Array.isArray(criticalStockRes.data.data)) {
          criticalStockData = criticalStockRes.data.data;
        }
      }

      setLowStockItems(lowStockData);
      setCriticalStockItems(criticalStockData);
      setRecentMovements(sortedMovements); // Enriched ve sorted movements'ı set et
      setStockItems(stockItems);

      setStockStats({
        totalItems,
        totalValue,
        lowStockCount: lowStockData.length,
        criticalStockCount: criticalStockData.length,
        inStockCount,
        outOfStockCount
      });

    } catch (error) {
      console.error('Stok verileri yüklenirken hata:', error);
      
      // Mock data fallback
      setStockStats({
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
        inStockCount: 0,
        outOfStockCount: 0
      });
      setRecentMovements([]);
      setLowStockItems([]);
      setCriticalStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY"
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  // Modal handlers
  const handleStockInSuccess = () => {
    // Verileri yeniden yükle
    fetchStockData();
  };

  const handleStockOutSuccess = () => {
    // Verileri yeniden yükle
    fetchStockData();
  };

  const calculateStats = () => {
    if (!Array.isArray(stockItems)) {
      return {
        totalItems: 0,
        lowStockItems: 0,
        criticalStockItems: 0,
        outOfStockItems: 0
      };
    }
  
    const stats = stockItems.reduce((acc, item) => {
      acc.totalItems += 1;
      
      // Stok tükendi kontrolü
      if ((item.currentStock || 0) <= 0) {
        acc.outOfStockItems += 1;
      }
      
      // Kritik stok kontrolü - reorder level'ın altında VEYA kritik malzeme
      const isCriticalStock = (item.currentStock || 0) <= (item.reorderLevel || 0);
      const isCriticalItem = item.isCriticalItem === true;
      
      if (isCriticalStock || isCriticalItem) {
        acc.criticalStockItems += 1;
      }
      
      // Düşük stok kontrolü - minimum stok altında ama kritik seviyenin üstünde
      if ((item.currentStock || 0) <= (item.minimumStock || 0) && (item.currentStock || 0) > (item.reorderLevel || 0)) {
        acc.lowStockItems += 1;
      }
      
      return acc;
    }, {
      totalItems: 0,
      lowStockItems: 0,
      criticalStockItems: 0,
      outOfStockItems: 0
    });
  
    return stats;
  };
  
  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Stok Yönetimi"
          subtitle="Stok Kontrol Merkezi"
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
        subtitle="Stok Kontrol Merkezi"
        icon={IconPackage}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="px-4 space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Toplam Stok */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <IconPackage className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          {/* Düşük Stok */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <IconAlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Düşük Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          {/* Kritik Stok */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <IconAlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kritik Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.criticalStockItems}</p>
              </div>
            </div>
          </div>

          {/* Tükenen Stok */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center">
              <IconCalendar className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tükenen Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <IconClipboardList className="h-5 w-5 mr-2 text-blue-600" />
            Hızlı İşlemler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/stock-cards"
              className="block p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <IconPackage className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Stok Kartları</h4>
                <p className="text-xs opacity-90">Malzeme kartlarını görüntüle</p>
              </div>
            </Link>

            <Link
              to="/stock-movements"
              className="block p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <IconArrowsExchange className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Stok Hareketleri</h4>
                <p className="text-xs opacity-90">Giriş/çıkış işlemlerini takip et</p>
              </div>
            </Link>

            <button 
              onClick={() => setShowStockInModal(true)}
              className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <IconPlus className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Stok Girişi</h4>
                <p className="text-xs opacity-90">Yeni stok ekle</p>
              </div>
            </button>

            <button 
              onClick={() => setShowStockOutModal(true)}
              className="p-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <IconTruck className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Stok Çıkışı</h4>
                <p className="text-xs opacity-90">Stok çıkış işlemi</p>
              </div>
            </button>
          </div>
        </div>

        {/* Son Hareketler ve Düşük Stok Uyarıları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Hareketler */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <IconArrowsExchange className="h-5 w-5 mr-2 text-green-600" />
                Son Hareketler
              </h3>
            </div>
            <div className="p-6">
              {Array.isArray(recentMovements) && recentMovements.length > 0 ? (
                <div className="space-y-3">
                  {recentMovements.slice(0, 5).map((movement, index) => (
                    <div key={movement.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          movement.movementType === 'StockIn' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {movement.stockItem?.name || movement.itemName || 'Bilinmiyor'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {movement.stockItem?.itemCode || movement.itemCode || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          movement.movementType === 'StockIn' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.movementType === 'StockIn' ? '+' : '-'}{movement.quantity || 0}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(movement.movementDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz hareket kaydı bulunmuyor</p>
              )}
              <div className="mt-4">
                <Link 
                  to="/stock-movements"
                  className="text-ivosis-600 hover:text-ivosis-800 text-sm font-medium"
                >
                  Tüm hareketleri görüntüle →
                </Link>
              </div>
            </div>
          </div>

          {/* Düşük Stok Uyarıları */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <IconAlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Düşük Stok Uyarıları
              </h3>
            </div>
            <div className="p-6">
              {Array.isArray(lowStockItems) && lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <IconAlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name || 'Bilinmiyor'}</p>
                          <p className="text-xs text-gray-500">{item.itemCode || '-'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">{item.currentStock || 0} {item.unit || ''}</p>
                        <p className="text-xs text-gray-500">Min: {item.minimumStock || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Düşük stok uyarısı bulunmuyor</p>
              )}
              <div className="mt-4">
                <Link 
                  to="/stock-cards"
                  className="text-ivosis-600 hover:text-ivosis-800 text-sm font-medium"
                >
                  Tüm stok kartlarını görüntüle →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock In Modal */}
      <StockInModal
        isOpen={showStockInModal}
        onClose={() => setShowStockInModal(false)}
        onSave={handleStockInSuccess}
        stockItems={stockItems} // StockItems state'ini geç
      />

      {/* Stock Out Modal */}
      <StockOutModal
        isOpen={showStockOutModal}
        onClose={() => setShowStockOutModal(false)}
        onSave={handleStockOutSuccess}
        stockItems={stockItems} // StockItems state'ini geç
      />
    </div>
  );
};

export default StockManagement;