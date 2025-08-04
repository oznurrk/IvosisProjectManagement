import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header/Header';
import InvoiceDetailModal from '../components/Invoice/InvoiceDetailModal';
import { 
  IconFileInvoice, 
  IconPlus, 
  IconSearch, 
  IconFilter, 
  IconDownload,
  IconEye,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCurrencyLira,
  IconBuilding
} from '@tabler/icons-react';

const IncomingInvoices = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // API çağrısı simülasyonu
      setTimeout(() => {
        const mockInvoices = [
          {
            id: 1,
            invoiceNumber: 'GF-2024-001',
            customerName: 'ABC Teknoloji A.Ş.',
            customerEmail: 'info@abcteknoloji.com',
            customerPhone: '+90 212 555 0123',
            customerAddress: 'Maslak Mahallesi, Teknoloji Caddesi No:1, Sarıyer/İstanbul',
            invoiceDate: '2024-01-15',
            dueDate: '2024-02-15',
            totalAmount: 25000,
            subtotal: 21186.44,
            taxAmount: 3813.56,
            taxRate: 18,
            status: 'paid',
            items: [
              { description: 'Web Tasarım Hizmeti', quantity: 1, unitPrice: 15000 },
              { description: 'SEO Optimizasyonu', quantity: 1, unitPrice: 6186.44 }
            ],
            notes: 'Web sitesi tasarımı ve SEO optimizasyonu tamamlanmıştır.'
          },
          {
            id: 2,
            invoiceNumber: 'GF-2024-002',
            customerName: 'XYZ İnşaat Ltd.',
            customerEmail: 'muhasebe@xyzinsaat.com',
            customerPhone: '+90 216 444 5678',
            customerAddress: 'Kadıköy Mahallesi, İnşaat Sokak No:15, Kadıköy/İstanbul',
            invoiceDate: '2024-01-20',
            dueDate: '2024-02-20',
            totalAmount: 45000,
            subtotal: 38135.59,
            taxAmount: 6864.41,
            taxRate: 18,
            status: 'pending',
            items: [
              { description: 'Proje Yönetim Sistemi', quantity: 1, unitPrice: 30000 },
              { description: 'Teknik Destek (3 Ay)', quantity: 1, unitPrice: 8135.59 }
            ],
            notes: 'Proje yönetim sistemi kurulumu ve 3 aylık teknik destek dahildir.'
          },
          {
            id: 3,
            invoiceNumber: 'GF-2024-003',
            customerName: 'DEF Eğitim Kurumları',
            customerEmail: 'mali@defegitim.edu.tr',
            customerPhone: '+90 312 333 4567',
            customerAddress: 'Çankaya Mahallesi, Eğitim Caddesi No:25, Çankaya/Ankara',
            invoiceDate: '2024-01-25',
            dueDate: '2024-01-25',
            totalAmount: 18000,
            subtotal: 15254.24,
            taxAmount: 2745.76,
            taxRate: 18,
            status: 'overdue',
            items: [
              { description: 'Öğrenci Bilgi Sistemi', quantity: 1, unitPrice: 12000 },
              { description: 'Eğitim Modülü', quantity: 1, unitPrice: 3254.24 }
            ],
            notes: 'Öğrenci bilgi sistemi ve eğitim modülü entegrasyonu.'
          }
        ];
        setInvoices(mockInvoices);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Faturalar yüklenemedi:', error);
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Ödendi' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Bekliyor' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Gecikmiş' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Filtreleme
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const invoiceDate = new Date(invoice.invoiceDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      switch (dateFilter) {
        case 'week':
          matchesDate = invoiceDate >= sevenDaysAgo;
          break;
        case 'month':
          matchesDate = invoiceDate >= thirtyDaysAgo;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sayfalama
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // İstatistikler
  const stats = [
    { label: 'Toplam Fatura', value: invoices.length, icon: IconFileInvoice },
    { label: 'Ödenen', value: invoices.filter(inv => inv.status === 'paid').length, icon: IconCurrencyLira },
    { label: 'Bekleyen', value: invoices.filter(inv => inv.status === 'pending').length, icon: IconCalendar },
    { label: 'Geciken', value: invoices.filter(inv => inv.status === 'overdue').length, icon: IconCalendar }
  ];

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

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
        title="Gelen Faturalar"
        subtitle="Tedarikçilerden gelen faturaları görüntüleyin ve yönetin"
        stats={stats}
        statsTitle="Fatura Özeti"
        showStats={true}
        actions={
          <button className="bg-ivosis-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-ivosis-700 transition-colors">
            <IconPlus size={20} />
            Yeni Fatura
          </button>
        }
      />

      {/* Filtreler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Fatura no veya müşteri ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="paid">Ödendi</option>
            <option value="pending">Bekliyor</option>
            <option value="overdue">Gecikmiş</option>
          </select>

          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Tüm Tarihler</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <IconDownload size={20} />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Toplam Tutar Kartı 
      <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 text-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Toplam Fatura Tutarı</h3>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <IconCurrencyLira size={48} className="opacity-75" />
        </div>
      </div>
      */}

      {/* Fatura Tablosu */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fatura No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vade Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IconFileInvoice className="h-5 w-5 text-ivosis-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <IconBuilding className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{invoice.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <IconEye size={18} />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Düzenle"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Sil"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, visibleInvoices.length)}</span> arası,{" "}
                  toplam <span className="font-medium">{visibleInvoices.length}</span> kayıt
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

      {/* Detail Modal */}
      <InvoiceDetailModal
        opened={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default IncomingInvoices;