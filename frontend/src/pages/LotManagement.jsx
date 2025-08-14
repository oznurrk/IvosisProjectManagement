
import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";
import { IconPackage, IconEdit, IconLock, IconLockOpen, IconTrash, IconEye } from "@tabler/icons-react";
import LotEditModal from "../components/Lot/LotEditModal";
import LotViewModal from "../components/Lot/LotViewModal";
import LotDeleteModal from "../components/Lot/LotDeleteModal";



const columns = [
  { key: "Id", label: "Id" },
  { key: "StockItemId", label: "StockItemId" },
  { key: "LotNumber", label: "Lot No" },
  { key: "InternalLotNumber", label: "Internal Lot No" },
  { key: "Barcode", label: "Barkod" },
  { key: "InitialWeight", label: "Başlangıç Ağırlık (kg)" },
  { key: "CurrentWeight", label: "Mevcut Ağırlık (kg)" },
  { key: "InitialLength", label: "Başlangıç Uzunluk (m)" },
  { key: "CurrentLength", label: "Mevcut Uzunluk (m)" },
  { key: "Width", label: "Genişlik (mm)" },
  { key: "Thickness", label: "Kalınlık (mm)" },
  { key: "SupplierId", label: "Tedarikçi" },
  { key: "ReceiptDate", label: "Geliş Tarihi" },
  { key: "CertificateNumber", label: "Sertifika No" },
  { key: "QualityGrade", label: "Kalite" },
  { key: "TestResults", label: "Test Sonucu" },
  { key: "LocationId", label: "Depo" },
  { key: "StoragePosition", label: "Depo Pozisyonu" },
  { key: "Status", label: "Durum" },
  { key: "IsBlocked", label: "Bloklu" },
  { key: "BlockReason", label: "Blok Sebebi" },
  { key: "CreatedAt", label: "Oluşturma Tarihi" },
  { key: "CreatedBy", label: "Oluşturan" },
  { key: "CompanyId", label: "Firma" },
  { key: "Actions", label: "İşlemler" }
];

const LotManagement = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Filtreler StockMovements tarzı
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      search: "",
      status: "",
      dateFrom: "",
      dateTo: ""
    });
  };


  useEffect(() => {
    // Fetch lots from API with Authorization header
    const fetchLots = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/StockLot", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLots(response.data);
      } catch (error) {
        console.error("Lot verileri alınamadı:", error);
      }
    };
    fetchLots();
  }, []);


  // Filtreleme: Lot No/Barkod, Durum, Geliş Tarihi aralığı
  const filteredLots = lots.filter(lot => {
    const searchMatch =
      !searchFilters.search ||
      lot.LotNumber.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      lot.Barcode?.toLowerCase().includes(searchFilters.search.toLowerCase());
    const statusMatch = !searchFilters.status ||
      (searchFilters.status === "Active" && lot.Status === "Active") ||
      (searchFilters.status === "Blocked" && lot.Status === "Blocked");
    let dateMatch = true;
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      const lotDate = new Date(lot.ReceiptDate);
      if (searchFilters.dateFrom && searchFilters.dateTo) {
        const fromDate = new Date(searchFilters.dateFrom);
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = lotDate >= fromDate && lotDate <= toDate;
      } else if (searchFilters.dateFrom) {
        const fromDate = new Date(searchFilters.dateFrom);
        dateMatch = lotDate >= fromDate;
      } else if (searchFilters.dateTo) {
        const toDate = new Date(searchFilters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = lotDate <= toDate;
      }
    }
    return searchMatch && statusMatch && dateMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        title="Lot Yönetimi"
        subtitle="Lot Takip ve Yönetim"
        icon={IconPackage}
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />
      <div className="px-4 py-6">
        {/* Filtreleme */}
        <div className="px-4 mb-6">
          <FilterAndSearch
            searchFilters={searchFilters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            filtersConfig={[
              { key: "search", type: "text", placeholder: "Lot No veya Barkod Ara..." },
              {
                key: "status",
                type: "select",
                placeholder: "Durum",
                options: [
                  { value: "", label: "Tümü" },
                  { value: "Active", label: "Aktif" },
                  { value: "Blocked", label: "Bloklu" }
                ]
              },
              {
                key: "dateFrom",
                type: "date",
                placeholder: "Geliş Başlangıç Tarihi"
              },
              {
                key: "dateTo",
                type: "date",
                placeholder: "Geliş Bitiş Tarihi"
              }
            ]}
          />
        </div>
        {/* Tablo */}
        <div className="bg-white rounded-lg shadow overflow-x-auto" style={{ position: 'relative' }}>
          <table className="min-w-full" style={{ tableLayout: 'fixed' }}>
            {/* Remove fixed colgroup, let all columns be flexible */}
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={
                      col.key === "Id"
                        ? "px-4 py-3 text-right text-xs font-medium text-ivosis-700 uppercase tracking-wider"
                        : "px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider"
                    }
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLots.map((lot, idx) => (
                <tr key={lot.Id} className="hover:bg-gray-50">
                  {columns.map((col) => {
                    if (col.key === "Id") {
                      return (
                        <td key={col.key} className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-ivosis-100 text-ivosis-800">
                              {lot.Id}
                            </span>
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "Actions") {
                      return (
                        <td key={col.key} className="px-4 py-2 text-center flex items-center justify-center gap-2">
                          {/* İncele (göz) */}
                          <button
                            className="text-gray-600 hover:text-blue-600"
                            title="İncele"
                            onClick={() => { setSelectedLot(lot); setShowViewModal(true); }}
                          >
                            <IconEye size={18} />
                          </button>
                          {/* Düzenle (kalem) */}
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Düzenle"
                            onClick={() => { setSelectedLot(lot); setShowEditModal(true); }}
                          >
                            <IconEdit size={16} />
                          </button>
                          {/* Sil (çöp) */}
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Sil"
                            onClick={() => { setSelectedLot(lot); setShowDeleteModal(true); }}
                          >
                            <IconTrash size={16} />
                          </button>
                        </td>
                      );
                    }
                    if (col.key === "IsBlocked") {
                      return (
                        <td key={col.key} className="px-4 py-2 text-center">
                          {lot.IsBlocked ? (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Bloklu</span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Aktif</span>
                          )}
                        </td>
                      );
                    }
                    if (col.key === "ReceiptDate" || col.key === "CreatedAt" || col.key === "UpdatedAt") {
                      return (
                        <td key={col.key} className="px-4 py-2 text-center">
                          {lot[col.key] ? new Date(lot[col.key]).toLocaleDateString("tr-TR") : "-"}
                        </td>
                      );
                    }
                    return (
                      <td key={col.key} className="px-4 py-2 text-center">
                        {lot[col.key] ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modallar */}
      <LotEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        lot={selectedLot}
        onSave={() => setShowEditModal(false)}
      />
      <LotViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        lot={selectedLot}
      />
      <LotDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        lot={selectedLot}
        onDelete={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default LotManagement;
