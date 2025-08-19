import React, { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { fetchStockLots } from "../services/api";
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
  IconClipboardList,
  IconSunElectricity
} from "@tabler/icons-react";

const ProductionDashboard = () => {
  const outletContext = useOutletContext();
  const isMobile = outletContext?.isMobile || false;
  const setIsMobileMenuOpen = outletContext?.setIsMobileMenuOpen || (() => {});
  const [prodStats, setProdStats] = useState(null);
  const [recentLots, setRecentLots] = useState([]);
  const [lowLots, setLowLots] = useState([]);
  const [criticalLots, setCriticalLots] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductionData();
  }, []);

  const fetchProductionData = async () => {
    try {
      setLoading(true);

      // Lot ve üretimle ilgili API'ler burada
      const lotsData = await fetchStockLots();
      const lotsArr = Array.isArray(lotsData.items) ? lotsData.items : [];

      // Son lot hareketleri (örnek: son eklenen 5 lot)
      const sortedLots = lotsArr.sort((a, b) => new Date(b.createdAt || b.lotDate) - new Date(a.createdAt || a.lotDate));

      // Düşük ve kritik lotlar (örnek: miktarı az olanlar)
      const lowLotsData = lotsArr.filter(lot => (Number(lot.quantity) || 0) < 10 && (Number(lot.quantity) || 0) > 0);
      const criticalLotsData = lotsArr.filter(lot => (Number(lot.quantity) || 0) === 0);

      setLowLots(lowLotsData);
      setCriticalLots(criticalLotsData);
      setRecentLots(sortedLots);
      setLots(lotsArr);

      setProdStats({
        totalLots: lotsArr.length,
        lowLots: lowLotsData.length,
        criticalLots: criticalLotsData.length,
      });
    } catch (error) {
      setProdStats({ totalLots: 0, lowLots: 0, criticalLots: 0 });
      setRecentLots([]);
      setLowLots([]);
      setCriticalLots([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header 
          title="Üretim"
          subtitle="Üretim Kontrol Merkezi"
          icon={IconSunElectricity}
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
        title="Üretim"
        subtitle="Üretim Kontrol Merkezi"
        icon={IconSunElectricity}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      <div className="px-4 space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Toplam Lot */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <IconPackage className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Lot</p>
                <p className="text-2xl font-semibold text-gray-900">{prodStats?.totalLots || 0}</p>
              </div>
            </div>
          </div>

          {/* Düşük Lot */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <IconAlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Düşük Lot</p>
                <p className="text-2xl font-semibold text-gray-900">{prodStats?.lowLots || 0}</p>
              </div>
            </div>
          </div>

          {/* Kritik Lot */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <IconAlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kritik Lot</p>
                <p className="text-2xl font-semibold text-gray-900">{prodStats?.criticalLots || 0}</p>
              </div>
            </div>
          </div>

          {/* Rezerve Edilmiş Lot (dummy) */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <div className="flex items-center">
              <IconCalendar className="h-8 w-8 text-gray-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rezerve Lot</p>
                <p className="text-2xl font-semibold text-gray-900">-</p>
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
              to="/lot-management"
              className="block p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <IconPackage className="h-8 w-8 mx-auto mb-2" />
                <h4 className="text-sm font-medium">Lot Yönetimi</h4>
                <p className="text-xs opacity-90">Lotları görüntüle ve yönet</p>
              </div>
            </Link>
            {/* Diğer hızlı işlemler eklenebilir */}
          </div>
        </div>

        {/* Son Lotlar ve Düşük Lot Uyarıları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Lotlar */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <IconArrowsExchange className="h-5 w-5 mr-2 text-green-600" />
                Son Lotlar
              </h3>
            </div>
            <div className="p-6">
              {Array.isArray(recentLots) && recentLots.length > 0 ? (
                <div className="space-y-3">
                  {recentLots.slice(0, 5).map((lot, index) => (
                    <div key={lot.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          (Number(lot.quantity) || 0) > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {lot.lotNumber || 'Bilinmiyor'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lot.stockItemName || lot.stockItemId || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          (Number(lot.quantity) || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lot.quantity || 0}
                        </p>
                        <p className="text-xs text-gray-500">{lot.lotDate ? new Date(lot.lotDate).toLocaleDateString("tr-TR") : '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Henüz lot kaydı bulunmuyor</p>
              )}
              <div className="mt-4">
                <Link 
                  to="/lot-management"
                  className="text-ivosis-600 hover:text-ivosis-800 text-sm font-medium"
                >
                  Tüm lotları görüntüle →
                </Link>
              </div>
            </div>
          </div>

          {/* Düşük Lot Uyarıları */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <IconAlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Düşük Lot Uyarıları
              </h3>
            </div>
            <div className="p-6">
              {Array.isArray(lowLots) && lowLots.length > 0 ? (
                <div className="space-y-3">
                  {lowLots.slice(0, 5).map((lot, index) => (
                    <div key={lot.id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <IconAlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lot.lotNumber || 'Bilinmiyor'}</p>
                          <p className="text-xs text-gray-500">{lot.stockItemName || lot.stockItemId || '-'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">{lot.quantity || 0}</p>
                        <p className="text-xs text-gray-500">Min: 10</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Düşük lot uyarısı bulunmuyor</p>
              )}
              <div className="mt-4">
                <Link 
                  to="/lot-management"
                  className="text-ivosis-600 hover:text-ivosis-800 text-sm font-medium"
                >
                  Tüm lotları görüntüle →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
