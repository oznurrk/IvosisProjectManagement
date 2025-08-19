import React, { useState } from "react";
import axios from "axios";

const SupplierAddModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    companyName: "",
    taxNumber: "",
    taxOffice: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    website: "",
    paymentTerms: 30,
    creditLimit: 10000,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/Suppliers", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.response?.data?.errors && Object.values(err.response.data.errors).flat().join(", ")) ||
        "Tedarikçi eklenemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Tedarikçi Ekle</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">X</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-100px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı *</label>
              <input type="text" value={form.companyName} onChange={e => handleChange("companyName", e.target.value)} required className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi No *</label>
              <input type="text" value={form.taxNumber} onChange={e => handleChange("taxNumber", e.target.value)} required className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
              <input type="text" value={form.taxOffice} onChange={e => handleChange("taxOffice", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input type="text" value={form.address} onChange={e => handleChange("address", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input type="text" value={form.city} onChange={e => handleChange("city", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input type="text" value={form.district} onChange={e => handleChange("district", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
              <input type="text" value={form.postalCode} onChange={e => handleChange("postalCode", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Kişi</label>
              <input type="text" value={form.contactPerson} onChange={e => handleChange("contactPerson", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input type="text" value={form.contactPhone} onChange={e => handleChange("contactPhone", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input type="email" value={form.contactEmail} onChange={e => handleChange("contactEmail", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Web Sitesi</label>
              <input type="text" value={form.website} onChange={e => handleChange("website", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vade (gün)</label>
              <input type="number" value={form.paymentTerms} onChange={e => handleChange("paymentTerms", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kredi Limiti</label>
              <input type="number" value={form.creditLimit} onChange={e => handleChange("creditLimit", e.target.value)} className="w-full px-3 py-2 border rounded-lg border-gray-300" />
            </div>
            <div className="flex items-center mt-2">
              <input type="checkbox" checked={form.isActive} onChange={e => handleChange("isActive", e.target.checked)} className="mr-2" />
              <span className="text-sm">Aktif</span>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">İptal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center space-x-2">
              {loading ? <span>Kaydediliyor...</span> : <span>Kaydet</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierAddModal;
