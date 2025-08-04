import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck, IconAlertTriangle, IconTruck } from "@tabler/icons-react";

const StockOutModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    reason: "",
    destination: "",
    requestedBy: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const reasons = [
    "Üretim Talebi",
    "Proje Kullanımı", 
    "Bakım Onarım",
    "Satış",
    "Transfer",
    "Fire/Kayıp",
    "Diğer"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [itemsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/StockItems", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const items = itemsRes.data;
      setStockItems(items);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const resetForm = () => {
    setForm({
      itemId: "",
      quantity: "",
      reason: "",
      destination: "",
      requestedBy: "",
      notes: ""
    });
    setSelectedItem(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (field === "itemId") {
      const item = stockItems.find(i => i.id.toString() === value);
      setSelectedItem(item);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemId) newErrors.itemId = "Malzeme seçimi zorunludur";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Geçerli bir miktar giriniz";
    if (!form.reason) newErrors.reason = "Çıkış nedeni zorunludur";

    // Stok kontrolü
    if (selectedItem && parseFloat(form.quantity) > selectedItem.currentStock) {
      newErrors.quantity = `Yetersiz stok! Mevcut: ${selectedItem.currentStock} ${selectedItem.unit}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      const stockOutData = {
        stockItemId: parseInt(form.itemId),
        quantity: parseFloat(form.quantity),
        reason: form.reason,
        destination: form.destination,
        requestedBy: form.requestedBy,
        notes: form.notes
      };
      
      const response = await axios.post("http://localhost:5000/api/StockMovements/stock-out", stockOutData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      resetForm();
      onClose();
      alert('Stok çıkış işlemi başarıyla tamamlandı!');
      if (onSave) onSave();
    } catch (error) {
      console.error("Stok çıkış hatası:", error);
      alert('Hata: ' + (error.response?.data?.message || 'Stok çıkış işlemi başarısız'));
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = () => {
    if (!selectedItem || !form.quantity) return "";
    
    const remaining = selectedItem.currentStock - parseFloat(form.quantity);
    
    if (remaining < selectedItem.reorderLevel) return "text-red-600 bg-red-50";
    if (remaining < selectedItem.minimumStock) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stok Çıkış</h2>
              <p className="text-red-100 text-sm">Malzeme stok çıkışı yapın</p>
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
              <IconTruck size={20} className="mr-2" />
              Malzeme Bilgileri
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Malzeme *
                </label>
                <select
                  value={form.itemId}
                  onChange={(e) => handleChange("itemId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.itemId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Malzeme Seçiniz</option>
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} - {item.name} (Mevcut: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
                {errors.itemId && (
                  <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>
                )}
              </div>

              {selectedItem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Seçilen Malzeme</h4>
                  <div className="text-sm text-blue-700">
                    <p><strong>Kod:</strong> {selectedItem.itemCode}</p>
                    <p><strong>Ad:</strong> {selectedItem.name}</p>
                    <p><strong>Kategori:</strong> {selectedItem.category}</p>
                    <p><strong>Mevcut Stok:</strong> {selectedItem.currentStock} {selectedItem.unit}</p>
                    <p><strong>Minimum Stok:</strong> {selectedItem.minimumStock} {selectedItem.unit}</p>
                    <p><strong>Kritik Stok:</strong> {selectedItem.reorderLevel} {selectedItem.unit}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Çıkış Bilgileri */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Çıkış Detayları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çıkış Nedeni *
                </label>
                <select
                  value={form.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Neden Seçiniz</option>
                  {reasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varış Yeri / Kullanım Alanı
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  placeholder="Örn: Üretim Hattı 1, Proje A, vb."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Talep Eden
                </label>
                <input
                  type="text"
                  value={form.requestedBy}
                  onChange={(e) => handleChange("requestedBy", e.target.value)}
                  placeholder="Adı Soyadı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stok Durumu Uyarısı */}
            {selectedItem && form.quantity && (
              <div className={`mt-4 p-4 border rounded-lg ${getStockStatusColor()}`}>
                <div className="flex items-center">
                  <IconAlertTriangle size={20} className="mr-2" />
                  <div>
                    <div className="font-semibold">
                      İşlem Sonrası Kalan Stok: {(selectedItem.currentStock - parseFloat(form.quantity || 0)).toFixed(1)} {selectedItem.unit}
                    </div>
                    {(selectedItem.currentStock - parseFloat(form.quantity || 0)) < selectedItem.reorderLevel && (
                      <div className="text-sm mt-1">
                        ⚠️ Kritik stok seviyesinin altına düşecek!
                      </div>
                    )}
                    {(selectedItem.currentStock - parseFloat(form.quantity || 0)) < selectedItem.minimumStock && 
                     (selectedItem.currentStock - parseFloat(form.quantity || 0)) >= selectedItem.reorderLevel && (
                      <div className="text-sm mt-1">
                        ⚠️ Minimum stok seviyesinin altına düşecek!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Çıkış ile ilgili notlar..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
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
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  <span>Stok Çıkışı Yap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutModal;