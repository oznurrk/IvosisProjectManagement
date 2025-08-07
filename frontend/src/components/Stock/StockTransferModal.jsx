import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck, IconTransfer } from "@tabler/icons-react";

const StockTransferModal = ({ isOpen, onClose, onSubmit, stockItems = [], initialValues }) => {
  const [form, setForm] = useState({
    stockItemId: "",
    fromLocationId: "",
    toLocationId: "",
    quantity: "",
    description: ""
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setForm({
          stockItemId: initialValues?.stockItemId?.toString() || initialValues?.itemId?.toString() || "",
          fromLocationId: initialValues?.fromLocationId?.toString() || "",
          toLocationId: initialValues?.toLocationId?.toString() || "",
          quantity: initialValues?.quantity?.toString() || "",
          description: initialValues?.description || ""
        });
        const item = stockItems.find(i => i.id.toString() === (initialValues?.stockItemId?.toString() || initialValues?.itemId?.toString()));
        setSelectedItem(item || null);
      } else {
        setForm({ stockItemId: "", fromLocationId: "", toLocationId: "", quantity: "", description: "" });
        setSelectedItem(null);
      }
      fetchLocations();
    }
  }, [isOpen, stockItems, initialValues]);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/StockLocations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let locationData = [];
      if (Array.isArray(response.data)) {
        locationData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.items && Array.isArray(response.data.items)) {
          locationData = response.data.items;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          locationData = response.data.data;
        }
      }
      const activeLocations = locationData.filter(loc => loc.isActive !== false);
      setLocations(activeLocations);
    } catch (error) {
      setLocations([
        { id: 1, name: "Ana Depo", code: "MAIN" },
        { id: 2, name: "Yan Depo", code: "SEC" }
      ]);
    }
  };

  // Kaynak lokasyondaki mevcut stok miktarını bul
  const getSourceStock = () => {
    if (!selectedItem || !form.fromLocationId) return null;
    // Eğer item'in stokları lokasyon bazlı ise burada kontrol edebilirsin
    // Şu an sadece item.currentStock kullanılıyor
    return selectedItem.currentStock || 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    // Miktar değişirse stok kontrolü yap
    if (field === "quantity" && selectedItem && form.fromLocationId) {
      const sourceStock = getSourceStock();
      if (parseFloat(value) > sourceStock) {
        setErrors(prev => ({ ...prev, quantity: `Yetersiz stok! Mevcut: ${sourceStock} ${selectedItem.unit || ''}` }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.stockItemId) newErrors.stockItemId = "Malzeme seçiniz";
    if (!form.fromLocationId) newErrors.fromLocationId = "Kaynak lokasyon seçiniz";
    if (!form.toLocationId) newErrors.toLocationId = "Hedef lokasyon seçiniz";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Geçerli miktar giriniz";
    if (form.fromLocationId === form.toLocationId) newErrors.toLocationId = "Farklı lokasyon seçiniz";
    // Stok kontrolü
    const sourceStock = getSourceStock();
    if (selectedItem && form.fromLocationId && parseFloat(form.quantity) > sourceStock) {
      newErrors.quantity = `Yetersiz stok! Mevcut: ${sourceStock} ${selectedItem.unit || ''}`;
    }
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stok Transfer</h2>
              <p className="text-blue-100 text-sm">Malzeme transfer işlemi yapın</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-100px)] overflow-y-auto">
          {/* Malzeme Seçimi */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <IconTransfer size={20} className="mr-2" />
              Malzeme Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Malzeme *</label>
                <select
                  value={form.stockItemId}
                  onChange={e => handleChange("stockItemId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stockItemId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Malzeme Seçiniz</option>
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>{item.itemCode} - {item.name} (Mevcut: {item.currentStock || 0} {item.unit || 'Adet'})</option>
                  ))}
                </select>
                {errors.stockItemId && (
                  <p className="text-red-500 text-xs mt-1">{errors.stockItemId}</p>
                )}
              </div>

              {selectedItem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Seçilen Malzeme</h4>
                  <div className="text-sm text-blue-700">
                    <p><strong>Kod:</strong> {selectedItem.itemCode}</p>
                    <p><strong>Ad:</strong> {selectedItem.name}</p>
                    <p><strong>Kategori:</strong> {selectedItem.category || ""}</p>
                    <p><strong>Mevcut Stok:</strong> {selectedItem.currentStock || 0} {selectedItem.unit || 'Adet'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Bilgileri */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer Detayları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kaynak Lokasyon *</label>
                <select
                  value={form.fromLocationId}
                  onChange={e => handleChange("fromLocationId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fromLocationId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Kaynak Seçiniz</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.code ? `${loc.code} - ` : ""}{loc.name}</option>
                  ))}
                </select>
                {errors.fromLocationId && (
                  <p className="text-red-500 text-xs mt-1">{errors.fromLocationId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Lokasyon *</label>
                <select
                  value={form.toLocationId}
                  onChange={e => handleChange("toLocationId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.toLocationId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Hedef Seçiniz</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.code ? `${loc.code} - ` : ""}{loc.name}</option>
                  ))}
                </select>
                {errors.toLocationId && (
                  <p className="text-red-500 text-xs mt-1">{errors.toLocationId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miktar *</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => handleChange("quantity", e.target.value)}
                  placeholder="0.000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                  min="0"
                  max={getSourceStock() || undefined}
                />
                {selectedItem && form.fromLocationId && (
                  <p className="text-xs text-blue-700 mt-1">Kaynak lokasyondaki mevcut stok: <strong>{getSourceStock()} {selectedItem.unit || ''}</strong></p>
                )}
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Transfer açıklaması (max 500 karakter)"
                maxLength="500"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Transfer Ediliyor...</span>
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
      </div>
    </div>
  );
};

export default StockTransferModal;
