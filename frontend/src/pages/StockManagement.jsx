import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import Header from "../components/Header/Header";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      
      const [lowStockRes, criticalStockRes, stockItemsRes, movementsRes] = await Promise.all([
        fetch('http://localhost:5000/api/StockItems/low-stock'),
        fetch('http://localhost:5000/api/StockItems/critical-stock'),
        fetch('http://localhost:5000/api/StockItems'),
        fetch('http://localhost:5000/api/StockMovements')
      ]);

      let totalItems = 0;
      let totalValue = 0;
      let inStockCount = 0;
      let outOfStockCount = 0;

      if (stockItemsRes.ok) {
        const stockItems = await stockItemsRes.json();
        totalItems = stockItems.length;
        totalValue = stockItems.reduce((sum, item) => sum + (item.currentStock * item.purchasePrice || 0), 0);
        inStockCount = stockItems.filter(item => item.currentStock > 0).length;
        outOfStockCount = stockItems.filter(item => item.currentStock <= 0).length;
      }

      if (lowStockRes.ok) {
        const lowStockData = await lowStockRes.json();
        setLowStockItems(lowStockData);
      }

      if (criticalStockRes.ok) {
        const criticalStockData = await criticalStockRes.json();
        setCriticalStockItems(criticalStockData);
      }

      if (movementsRes.ok) {
        const movementsData = await movementsRes.json();
        setRecentMovements(movementsData);
      }

      setStockStats({
        totalItems,
        totalValue,
        lowStockCount: lowStockItems.length,
        criticalStockCount: criticalStockItems.length,
        inStockCount,
        outOfStockCount
      });

    } catch (error) {
      console.error('Stok verileri yüklenirken hata:', error);
      
      // Mock data
      setStockStats({
        totalItems: 145,
        totalValue: 2850000,
        lowStockCount: 8,
        criticalStockCount: 3,
        inStockCount: 134,
        outOfStockCount: 2
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <IconPackage className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{stockStats?.totalItems || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <IconScale className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stokta</p>
                <p className="text-2xl font-semibold text-gray-900">{stockStats?.inStockCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <IconTruck className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Değer</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(stockStats?.totalValue || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <IconBarcode className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Düşük Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <IconAlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kritik Stok</p>
                <p className="text-2xl font-semibold text-gray-900">{criticalStockItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
            <div className="flex items-center">
              <IconCalendar className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stok Tükendi</p>
                <p className="text-2xl font-semibold text-gray-900">{stockStats?.outOfStockCount || 0}</p>
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

            <button className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <IconPlus className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Stok Girişi</h4>
                <p className="text-xs opacity-90">Yeni stok ekle</p>
              </div>
            </button>

            <button className="p-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
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
              {recentMovements.length > 0 ? (
                <div className="space-y-3">
                  {recentMovements.slice(0, 5).map((movement, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          movement.movementType === 'StockIn' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{movement.stockItem?.name}</p>
                          <p className="text-xs text-gray-500">{movement.stockItem?.itemCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          movement.movementType === 'StockIn' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.movementType === 'StockIn' ? '+' : '-'}{movement.quantity}
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
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <IconAlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.itemCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">{item.currentStock} {item.unit}</p>
                        <p className="text-xs text-gray-500">Min: {item.minimumStock}</p>
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
    </div>
  );
};

export default StockManagement;
