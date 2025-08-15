import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconPlus, IconCheck, IconRefresh } from "@tabler/icons-react";

const initialForm = {
  stockItemId: "",
  lotNumber: "",
  // internalLotNumber: "",
  labelNumber: "",
  // barcode: "",
  initialWeight: "",
  // initialLength: "",
  width: "",
  thickness: "",
  supplierId: "",
  receiptDate: "",
  certificateNumber: "",
  qualityGrade: "",
  testResults: "",
  locationId: "",
  storagePosition: "",
  companyId: "",
  status: "Active",
  blockReason: ""
};

const LotAddModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [stockItems, setStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStockItems([]); // Modal açıldığında eski state'i sıfırla
      setForm(initialForm);
      setError("");
      fetchModalData();
      fetchLocations();
    }
  }, [isOpen]);

  const fetchModalData = async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Stok kalemleri
      const stockRes = await axios.get("http://localhost:5000/api/StockItems", { headers: { Authorization: `Bearer ${token}` } });
      let stockArr = [];
      if (stockRes.data && Array.isArray(stockRes.data.data)) {
        stockArr = stockRes.data.data;
      } else if (stockRes.data && Array.isArray(stockRes.data.items)) {
        stockArr = stockRes.data.items;
      } else if (Array.isArray(stockRes.data)) {
        stockArr = stockRes.data;
      } else if (Array.isArray(stockRes.data.data?.items)) {
        stockArr = stockRes.data.data.items;
      } else {
        // fallback: data bir array ise onu kullan
        if (Array.isArray(stockRes.data)) stockArr = stockRes.data;
      }
      const filtered = Array.isArray(stockArr) ? stockArr.filter(x => x.isActive !== false && x.name) : [];
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr', { sensitivity: 'base' }));
      setStockItems(filtered);

      // Diğer verileri çek (hata olursa stockItems'ı sıfırlama)
      try {
        const locRes = await axios.get("http://localhost:5000/api/StockLocations", { headers: { Authorization: `Bearer ${token}` } });
        setLocations(locRes.data.items || locRes.data.data || locRes.data || []);
      } catch {}
    } catch (err) {
      setStockItems([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const locRes = await axios.get("http://localhost:5000/api/StockLocations", { headers: { Authorization: `Bearer ${token}` } });
      setLocations(locRes.data.items || locRes.data.data || locRes.data || []);
      console.log("Locations fetched:", locRes.data);
    } catch (err) {
      setLocations([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickFill = () => {
    setForm({
      stockItemId: stockItems[0]?.id?.toString() || "",
      lotNumber: "LOT-" + Math.floor(Math.random() * 10000),
      // internalLotNumber: "INT-" + Math.floor(Math.random() * 10000),
      labelNumber: "LBL-" + Math.floor(Math.random() * 10000),
      // barcode: Math.floor(Math.random() * 9000000000000) + 1000000000000,
      initialWeight: "1000",
      // initialLength: "100",
      width: "1000",
      thickness: "10",
      supplierId: suppliers[0]?.id?.toString() || "",
      receiptDate: new Date().toISOString().slice(0, 10),
      certificateNumber: "CERT-" + Math.floor(Math.random() * 1000),
      qualityGrade: "A",
      testResults: "Başarılı",
      locationId: locations[0]?.id?.toString() || "",
      storagePosition: "Raf-1",
      companyId: companies[0]?.id?.toString() || "",
      status: "Active",
      blockReason: ""
    });
  };

  const validateForm = () => {
    // if (!form.lotNumber || !form.internalLotNumber || !form.labelNumber || !form.barcode || !form.initialWeight || !form.initialLength || !form.width || !form.thickness || !form.supplierId || !form.receiptDate || !form.certificateNumber || !form.qualityGrade || !form.testResults || !form.locationId || !form.storagePosition || !form.companyId || !form.stockItemId) {
    //   setError("Tüm alanlar zorunludur.");
    //   return false;
    // }
    if ((form.status === "Blocked") && !form.blockReason) {
      setError("Bloklu durumunda blokaj sebebi zorunludur.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Tüm string olması gereken alanları stringe çevir
      const payload = {
        ...form,
        lotNumber: String(form.lotNumber),
        // internalLotNumber: String(form.internalLotNumber),
        labelNumber: String(form.labelNumber),
        // barcode: String(form.barcode),
        certificateNumber: String(form.certificateNumber),
        qualityGrade: String(form.qualityGrade),
        testResults: String(form.testResults),
        storagePosition: String(form.storagePosition),
        initialWeight: Number(form.initialWeight),
        // initialLength: Number(form.initialLength),
        width: Number(form.width),
        thickness: Number(form.thickness),
        supplierId: Number(form.supplierId),
        locationId: Number(form.locationId),
        companyId: Number(form.companyId),
        stockItemId: Number(form.stockItemId),
        status: form.status,
        blockReason: form.status === "Blocked" ? form.blockReason : ""
      };
      await onSave({ createDto: payload });
    } catch (err) {
      setError("Kayıt başarısız: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><IconPlus size={20} className="text-white" /> Lot Ekle</h2>
            <p className="text-green-100 text-sm">Yeni lot kaydı oluşturun</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <IconRefresh size={14} className="mr-1 inline" />
              Örnek Veri
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
        {dataLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Veriler yükleniyor...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum *</label>
                  <select name="status" value={form.status} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="Active">Aktif</option>
                    <option value="Blocked">Bloklu</option>
                    <option value="Quarantined">Karantinada</option>
                    <option value="Reserved">Rezerve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok Kartı *</label>
                  <select name="stockItemId" value={form.stockItemId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="">Stok Kartı Seç</option>
                    {stockItems.map((s, i) => {
                      return <option key={s.id} value={s.id}>{s.name}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lot No *</label>
                  <input name="lotNumber" value={form.lotNumber} onChange={handleChange} required placeholder="Lot No" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Lot No *</label>
                  <input name="internalLotNumber" value={form.internalLotNumber} onChange={handleChange} required placeholder="Internal Lot No" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiket No *</label>
                  <input name="labelNumber" value={form.labelNumber} onChange={handleChange} required placeholder="Etiket No" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barkod *</label>
                  <input name="barcode" value={form.barcode} onChange={handleChange} required placeholder="Barkod" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Ağırlık (kg) *</label>
                  <input name="initialWeight" value={form.initialWeight} onChange={handleChange} type="number" required placeholder="Başlangıç Ağırlık (kg)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Uzunluk (m) *</label>
                  <input name="initialLength" value={form.initialLength} onChange={handleChange} type="number" required placeholder="Başlangıç Uzunluk (m)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (mm) *</label>
                  <input name="width" value={form.width} onChange={handleChange} type="number" required placeholder="Genişlik (mm)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalınlık (mm) *</label>
                  <input name="thickness" value={form.thickness} onChange={handleChange} type="number" required placeholder="Kalınlık (mm)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>
            {/* Tedarikçi ve Diğer Bilgiler */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tedarik ve Depolama</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi *</label>
                  <select name="supplierId" value={form.supplierId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Tedarikçi Seç</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geliş Tarihi *</label>
                  <input name="receiptDate" value={form.receiptDate} onChange={handleChange} type="date" required placeholder="Geliş Tarihi" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo *</label>
                  <select name="locationId" value={form.locationId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Depo Seç</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo Pozisyonu *</label>
                  <input name="storagePosition" value={form.storagePosition} onChange={handleChange} required placeholder="Depo Pozisyonu" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Firma *</label>
                  <select name="companyId" value={form.companyId} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Firma Seç</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* Sertifika, Kalite ve Blokaj Bilgileri */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sertifika & Kalite</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sertifika No *</label>
                  <input name="certificateNumber" value={form.certificateNumber} onChange={handleChange} required placeholder="Sertifika No" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalite *</label>
                  <input name="qualityGrade" value={form.qualityGrade} onChange={handleChange} required placeholder="Kalite" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Sonucu *</label>
                  <input name="testResults" value={form.testResults} onChange={handleChange} required placeholder="Test Sonucu" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                </div>
                {form.status === "Blocked" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blokaj Sebebi *</label>
                    <input name="blockReason" value={form.blockReason} onChange={handleChange} required placeholder="Blokaj sebebini giriniz" className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>
                )}
              </div>
            </div>
            {/* Hata mesajları */}
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            {/* Butonlar */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
);
};

export default LotAddModal;
