import React, { useState } from "react";
import { IconX, IconCheck, IconTransfer } from "@tabler/icons-react";

const StockTransferModal = ({ isOpen, onClose, onSubmit, stockItems = [], locations = [] }) => {
  const [form, setForm] = useState({
    stockItemId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.stockItemId) newErrors.stockItemId = "Malzeme seçiniz";
    if (!form.fromLocationId) newErrors.fromLocationId = "Kaynak lokasyon seçiniz";
    if (!form.toLocationId) newErrors.toLocationId = "Hedef lokasyon seçiniz";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Geçerli miktar giriniz";
    if (form.fromLocationId === form.toLocationId) newErrors.toLocationId = "Farklı lokasyon seçiniz";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({ stockItemId: "", fromLocationId: "", toLocationId: "", quantity: "", description: "" });
      onClose();
    } catch (err) {
      alert("Transfer işlemi başarısız: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Stok Transferi</h2>
            <p className="text-blue-100 text-sm">Malzeme transfer işlemi</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <IconX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Malzeme *</label>
            <select value={form.stockItemId} onChange={e => handleChange("stockItemId", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stockItemId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Malzeme Seçiniz</option>
              {stockItems.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.itemCode})</option>
              ))}
            </select>
            {errors.stockItemId && <p className="text-red-500 text-xs mt-1">{errors.stockItemId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kaynak Lokasyon *</label>
              <select value={form.fromLocationId} onChange={e => handleChange("fromLocationId", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fromLocationId ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Kaynak Seçiniz</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              {errors.fromLocationId && <p className="text-red-500 text-xs mt-1">{errors.fromLocationId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Lokasyon *</label>
              <select value={form.toLocationId} onChange={e => handleChange("toLocationId", e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.toLocationId ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Hedef Seçiniz</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              {errors.toLocationId && <p className="text-red-500 text-xs mt-1">{errors.toLocationId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Miktar *</label>
            <input type="number" value={form.quantity} onChange={e => handleChange("quantity", e.target.value)} placeholder="0" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
          </div>
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">İptal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Transfer Ediliyor...</span></>) : (<><IconTransfer size={16} /><span>Kaydet</span></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransferModal;
