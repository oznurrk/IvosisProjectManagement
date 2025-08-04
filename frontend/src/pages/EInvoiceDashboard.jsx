import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header/Header';
import { 
  IconTruck, 
  IconPackage, 
  IconScale, 
  IconBarcode,
  IconCheck,
  IconClock,
  IconBuilding,
  IconPlus,
  IconRefresh,
  IconFileText,
  IconCalendar,
  IconWeight,
  IconClipboardList,
  IconBoxSeam
} from '@tabler/icons-react';

const EInvoiceDashboard = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      todayDeliveries: 0,
      totalTonnage: 0,
      pendingDeliveries: 0,
      completedDeliveries: 0
    },
    recentDeliveries: [],
    stockCards: [],
    todayActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        const mockData = {
          stats: {
            todayDeliveries: 8,
            totalTonnage: 145.5,
            pendingDeliveries: 3,
            completedDeliveries: 5
          },
          recentDeliveries: [
            {
              id: 1,
              irsaliyeNo: 'IRS-2024-001',
              supplierName: 'Bobin Tedarik A.Ş.',
              stockCard: 'Kraft Bobin 120gr',
              lotNumber: 'LOT-240115-001',
              tonnage: 25.5,
              status: 'completed',
              date: '2024-01-15',
              time: '14:30'
            },
            {
              id: 2,
              irsaliyeNo: 'IRS-2024-002',
              supplierName: 'Kağıt Fabrikası Ltd.',
              stockCard: 'Bristol Bobin 200gr',
              lotNumber: 'LOT-240115-002',
              tonnage: 18.2,
              status: 'pending',
              date: '2024-01-15',
              time: '15:45'
            },
            {
              id: 3,
              irsaliyeNo: 'IRS-2024-003',
              supplierName: 'Ambalaj Malzeme A.Ş.',
              stockCard: 'Karton Bobin 350gr',
              lotNumber: 'LOT-240115-003',
              tonnage: 32.8,
              status: 'completed',
              date: '2024-01-15',
              time: '16:20'
            }
          ],
          stockCards: [
            { id: 1, name: 'SİYAH SAC', currentStock: 156.5, unit: 'Ton' },
            { id: 2, name: 'MAGNELİSE SAC', currentStock: 89.2, unit: 'Ton' },
            { id: 3, name: 'PREGALVANİZ SAC', currentStock: 234.8, unit: 'Ton' },          ],
          todayActivity: [
            { id: 1, action: 'Gelen mal kaydedildi', detail: 'LOT-240115-001 - 25.5 Ton', time: '14:30' },
            { id: 2, action: 'İrsaliye beklemede', detail: 'IRS-2024-002 - Kağıt Fabrikası', time: '15:45' },
            { id: 3, action: 'Stok güncellendi', detail: 'Karton Bobin 350gr +32.8 Ton', time: '16:20' },
          ]
        };
        setDashboardData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
      setLoading(false);
    }
  };

  const formatTonnage = (tonnage) => {
    return `${tonnage.toFixed(1)} Ton`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Tamamlandı', icon: IconCheck },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Bekliyor', icon: IconClock }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const statCards = [
    {
      title: 'Bugünkü Teslimatlar',
      value: dashboardData.stats.todayDeliveries,
      icon: IconTruck,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      unit: 'Adet'
    },
    {
      title: 'Toplam Tonaj (Bugün)',
      value: formatTonnage(dashboardData.stats.totalTonnage),
      icon: IconScale,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      unit: ''
    },
    {
      title: 'Bekleyen İrsaliyeler',
      value: dashboardData.stats.pendingDeliveries,
      icon: IconClock,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      unit: 'Adet'
    },
    {
      title: 'Tamamlanan',
      value: dashboardData.stats.completedDeliveries,
      icon: IconCheck,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      unit: 'Adet'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ivosis-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="Gelen Mal İrsaliye Sistemi"
        subtitle="Fabrikaya gelen bobinlerin irsaliye takibi ve stok yönetimi"
        showStats={false}
        actions={
          <div className="flex items-center gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
              <IconRefresh size={20} />
              Yenile
            </button>
            <button className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-ivosis-700 hover:to-ivosis-800 transition-all shadow-md">
              <IconPlus size={20} />
              Yeni İrsaliye
            </button>
          </div>
        }
      />

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                  {card.unit && <p className="text-xs text-gray-500">{card.unit}</p>}
                </div>
                <div className={`p-3 rounded-xl ${card.color} shadow-lg`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Son İrsaliyeler */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IconFileText size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Son Gelen İrsaliyeler</h3>
              </div>
              <button className="text-ivosis-600 hover:text-ivosis-700 text-sm font-medium bg-ivosis-50 px-3 py-1 rounded-lg hover:bg-ivosis-100 transition-colors">
                Tümünü Gör
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.recentDeliveries.map((delivery) => (
              <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
                      <IconTruck size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{delivery.irsaliyeNo}</p>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <IconBuilding size={14} className="text-gray-400" />
                        <p className="text-sm text-gray-600">{delivery.supplierName}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <IconBoxSeam size={12} />
                          <span>{delivery.stockCard}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <IconBarcode size={12} />
                          <span>{delivery.lotNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatTonnage(delivery.tonnage)}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                      <IconCalendar size={12} className="mr-1" />
                      {delivery.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Stok Kartları */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <IconPackage size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Stok Kartları</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {dashboardData.stockCards.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-500">Mevcut Stok</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatTonnage(stock.currentStock)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bugünkü Aktiviteler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <IconClipboardList size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Bugünkü Aktiviteler</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.todayActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.detail}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EInvoiceDashboard;