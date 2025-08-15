
import { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header/Header";
import FilterAndSearch from "../Layout/FilterAndSearch";
import { IconPackage, IconEdit, IconLock, IconLockOpen, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import LotEditModal from "../components/Lot/LotEditModal";
import LotViewModal from "../components/Lot/LotViewModal";
import LotDeleteModal from "../components/Lot/LotDeleteModal";
import LotAddModal from "../components/Lot/LotAddModal";

// API: Lot güncelle (PUT)
const updateLot = async (id, data) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`http://localhost:5000/api/StockLot/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  });
  return response.data;
};

// API: Lot sil (DELETE)
const deleteLot = async (id) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`http://localhost:5000/api/StockLot/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  });
  return response.data;
};


const LotManagement = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  // Lot ekleme işlemi
  const handleAddLot = async (form) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/StockLot", form, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      // Eklemeden sonra lotları güncelle
      const response = await axios.get("http://localhost:5000/api/StockLot", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      setLots(Array.isArray(response.data.items) ? response.data.items : []);
      setShowAddModal(false);
    } catch (err) {
      alert("Lot eklenemedi! " + (err?.response?.data?.message || ""));
      throw err;
    }
  };

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({ ...prev, [key]: value }));
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
    const fetchLots = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/StockLot", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        });
        setLots(Array.isArray(response.data.items) ? response.data.items : []);
      } catch (error) {
        setLots([]);
      }
    };
    fetchLots();
  }, []);

  // Tek bir lotu API'den çek
  function pascalToCamel(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(pascalToCamel);
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      acc[camelKey] = pascalToCamel(obj[key]);
      return acc;
    }, {});
  }

  const fetchLotById = async (id) => {
    setLoadingModal(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/StockLot/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      if (!response.data || Object.keys(response.data).length === 0) {
        alert("Lot verisi bulunamadı veya null döndü.");
        setSelectedLot(null);
        return;
      }
      setSelectedLot(pascalToCamel(response.data));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Lot verisi eksik, silinmiş veya hatalı. (API 400: Data is Null)");
      } else {
        alert("Lot detayı alınamadı veya null veri döndü.");
      }
      setSelectedLot(null);
    } finally {
      setLoadingModal(false);
    }
  };

  // Filtreleme: Lot No/Barkod, Durum, Geliş Tarihi aralığı (camelCase ile)
  const filteredLots = Array.isArray(lots) ? lots.filter(lot => {
    const searchMatch =
      !searchFilters.search ||
      lot.lotNumber?.toLowerCase().includes(searchFilters.search.toLowerCase()) ||
      lot.barcode?.toLowerCase().includes(searchFilters.search.toLowerCase());
    const statusMatch = !searchFilters.status ||
      (searchFilters.status === "Active" && lot.status === "Active") ||
      (searchFilters.status === "Blocked" && lot.status === "Blocked");
    let dateMatch = true;
    if (searchFilters.dateFrom || searchFilters.dateTo) {
      const lotDate = lot.receiptDate ? new Date(lot.receiptDate) : null;
      if (lotDate) {
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
    }
    return searchMatch && statusMatch && dateMatch;
  }) : [];

  const columns = [
    { key: "id", label: "ID", align: "center", type: "number" },
    { key: "receiptDate", label: "Tarih", align: "left", type: "date" },
    { key: "lotNumber", label: "Lot No", align: "left", type: "string" },
    { key: "labelNumber", label: "Etiket No", align: "left", type: "string" },
    { key: "stockItemName", label: "Malzeme", align: "left", type: "string" },
    { key: "thickness", label: "Kalınlık (mm)", align: "right", type: "number" },
    { key: "width", label: "Genişlik (mm)", align: "right", type: "number" },
    { key: "currentWeight", label: "Tonaj (kg)", align: "right", type: "number" },
    { key: "supplierName", label: "Gönderen Firma", align: "left", type: "string" },
    { key: "qualityGrade", label: "Kalite", align: "left", type: "string" },
    { key: "isBlocked", label: "Durumu", align: "center", type: "string" },
    { key: "plannedProject", label: "Planlanan Proje", align: "left", type: "string" },
    { key: "usedProject", label: "Kullanılan Proje", align: "left", type: "string" },
    { key: "Actions", label: "İşlemler", align: "center", type: "string" }
  ];

  // Lot güncelleme işlemi
  const handleEditSave = async (form) => {
    if (!selectedLot) return;
    try {
      // Eksik zorunlu alanları selectedLot'tan tamamla
      const mergedForm = { ...selectedLot, ...form };
      await updateLot(selectedLot.id, mergedForm);
      // Güncel lotları tekrar çek
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/StockLot", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      setLots(Array.isArray(response.data.items) ? response.data.items : []);
    } catch (err) {
      alert("Lot güncellenemedi!");
    }
    setShowEditModal(false);
  };

  // Lot silme işlemi
  const handleDelete = async () => {
    if (!selectedLot) return;
    try {
      await deleteLot(selectedLot.id);
      setLots((prev) => prev.filter((l) => l.id !== selectedLot.id));
    } catch (err) {
      alert("Lot silinemedi!");
    }
    setShowDeleteModal(false);
  };

  return (
    <div>
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
                    { value: "Blocked", label: "Bloklu" },
                    { value: "Quarantined", label: "Karantinada" },
                    { value: "Reserved", label: "Rezerve" }
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
                        col.align === "right"
                          ? "px-4 py-3 text-right text-xs font-medium text-ivosis-700 uppercase tracking-wider"
                          : col.align === "center"
                          ? "px-4 py-3 text-center text-xs font-medium text-ivosis-700 uppercase tracking-wider"
                          : "px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider"
                      }
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLots.map((lot, idx) => (
                  <tr key={lot.id || idx} className="hover:bg-gray-50">
                    {columns.map((col) => {
                      if (col.key === "id") {
                        return (
                          <td key={col.key} className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-ivosis-100 text-ivosis-800">
                                {idx + 1}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      if (col.key === "Actions") {
                        return (
                          <td key={col.key} className="px-4 py-2 text-center flex items-center justify-center gap-2">
                            {/* ...butonlar... */}
                            <button
                              className="text-gray-600 hover:text-blue-600"
                              title="İncele"
                              onClick={async () => {
                                await fetchLotById(lot.id);
                                setShowViewModal(true);
                              }}
                              disabled={loadingModal}
                            >
                              <IconEye size={18} />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Düzenle"
                              onClick={async () => {
                                await fetchLotById(lot.id);
                                setShowEditModal(true);
                              }}
                              disabled={loadingModal}
                            >
                              <IconEdit size={16} />
                            </button>
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
                      if (col.key === "isBlocked") {
                        return (
                          <td key={col.key} className="px-4 py-2 text-center">
                            {lot.isBlocked ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Bloklu</span>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Aktif</span>
                            )}
                          </td>
                        );
                      }
                      // Planlanan Proje ve Kullanılan Proje için örnek render (API'den geliyorsa lot.plannedProject, lot.usedProject)
                      if (col.key === "plannedProject") {
                        return (
                          <td key={col.key} className="px-4 py-2 text-left">
                            {lot.plannedProject ?? "-"}
                          </td>
                        );
                      }
                      if (col.key === "usedProject") {
                        return (
                          <td key={col.key} className="px-4 py-2 text-left">
                            {lot.usedProject ?? "-"}
                          </td>
                        );
                      }
                      if (col.key === "receiptDate" || col.key === "CreatedAt" || col.key === "updatedAt") {
                        return (
                          <td key={col.key} className="px-4 py-2 text-left">
                            {lot[col.key] ? new Date(lot[col.key]).toLocaleDateString("tr-TR") : "-"}
                          </td>
                        );
                      }
                      // Diğer kolonlar için hizalama
                      let tdClass = "px-4 py-2 ";
                      if (col.align === "right") tdClass += "text-right";
                      else if (col.align === "center") tdClass += "text-center";
                      else tdClass += "text-left";
                      return (
                        <td key={col.key} className={tdClass}>
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
      </div>
      {/* Modallar */}
      <LotAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddLot}
      />
      <LotEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        lot={selectedLot}
        onSave={handleEditSave}
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
        onDelete={handleDelete}
      />
      {/* Sağ altta yuvarlak plus butonu */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200"
        title="Lot Ekle"
        onClick={() => setShowAddModal(true)}
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <IconPlus size={32} />
      </button>
    </div>
  );
};

export default LotManagement;
