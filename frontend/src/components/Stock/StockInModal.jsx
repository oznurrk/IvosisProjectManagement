import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck, IconSearch, IconPackage } from "@tabler/icons-react";

const StockInModal = ({ isOpen, onClose, onSave, stockItems = [] }) => {
  const [form, setForm] = useState({
    itemId: "",
    locationId: "1", // Default location
    quantity: "",
    unitPrice: "",
    referenceNumber: "",
    description: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Tedarikçi listesi
  const suppliers = [
    "ABC Tedarik A.Ş.",
    "XYZ Malzeme Ltd.",
    "DEF Endüstri",
    "GHI Makina",
    "JKL Teknoloji",
    "Diğer"
  ];

  useEffect(() => {
    if (isOpen) {
      resetForm();
      console.log('StockInModal açıldı, gelen stockItems:', stockItems);
    }
  }, [isOpen, stockItems]);

  const resetForm = () => {
    setForm({
      itemId: "",
      locationId: "1", // Default location
      quantity: "",
      unitPrice: "",
      referenceNumber: "",
      description: "",
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
      console.log('Seçilen item:', item);
      if (item) {
        setForm(prev => ({ ...prev, unitPrice: item.purchasePrice?.toString() || "" }));
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemId) newErrors.itemId = "Malzeme seçimi zorunludur";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Geçerli bir miktar giriniz";
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) newErrors.unitPrice = "Geçerli bir birim fiyat giriniz";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Tablo yapısına uygun veri formatı
      const stockInData = {
        stockItemId: parseInt(form.itemId),
        locationId: parseInt(form.locationId),
        movementType: "StockIn",
        quantity: parseFloat(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
        totalAmount: parseFloat(form.quantity) * parseFloat(form.unitPrice),
        referenceType: "Purchase", // Sabit değer
        referenceNumber: form.referenceNumber || null,
        description: form.description || null,
        notes: form.notes || null,
        movementDate: new Date().toISOString()
      };
      
      console.log('StockIn API\'ye gönderilecek veri:', stockInData);
      
      const response = await axios.post("http://localhost:5000/api/StockMovements/stock-in", stockInData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      resetForm();
      onClose();
      alert('Stok giriş işlemi başarıyla tamamlandı!');
      if (onSave) onSave();
      
    } catch (error) {
      console.error("Stok giriş hatası:", error);
      console.error("Hata detayları:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Stok giriş işlemi başarısız';
      
      if (error.response?.status === 400) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ');
          } else {
            errorMessage = errors.toString();
          }
        } else {
          errorMessage = 'Geçersiz veri formatı. Lütfen tüm alanları kontrol edin.';
        }
      } else if (error.response?.status === 500) {
        if (error.response?.data?.includes?.('FOREIGN KEY constraint')) {
          errorMessage = 'Lokasyon bilgisi geçersiz. Lütfen sistem yöneticisine başvurun.';
        } else {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
      }
      
      alert('Hata: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stok Giriş</h2>
              <p className="text-green-100 text-sm">Malzeme stok girişi yapın</p>
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
          
          {/* Debug Bilgisi - Daha detaylı */}
          <div className="bg-gray-100 p-3 rounded text-xs text-gray-600">
            <strong>Debug:</strong><br/>
            StockItems Count: {stockItems.length}<br/>
            Selected Item ID: {form.itemId}<br/>
            Selected Item: {selectedItem ? selectedItem.name : 'None'}<br/>
            Form Valid: {Object.keys(errors).length === 0 ? 'Yes' : 'No'}<br/>
            {Object.keys(errors).length > 0 && `Errors: ${Object.keys(errors).join(', ')}`}
          </div>

          {/* Malzeme Seçimi */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <IconPackage size={20} className="mr-2" />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.itemId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Malzeme Seçiniz</option>
                  {Array.isArray(stockItems) && stockItems.length > 0 ? (
                    stockItems.map((item) => (
                      <option key={item.id} value={item.id.toString()}>
                        {item.itemCode} - {item.name} (Mevcut: {item.currentStock || 0} {item.unit || 'Adet'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Malzeme listesi yükleniyor...</option>
                  )}
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
                    <p><strong>Mevcut Stok:</strong> {selectedItem.currentStock || 0} {selectedItem.unit || 'Adet'}</p>
                    <p><strong>Alış Fiyatı:</strong> {selectedItem.purchasePrice || 0} ₺</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Giriş Bilgileri */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Giriş Detayları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar *
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="0.000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birim Fiyat (₺) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.unitPrice}
                  onChange={(e) => handleChange("unitPrice", e.target.value)}
                  placeholder="0.0000"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.unitPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasyon
                </label>
                <select
                  value={form.locationId}
                  onChange={(e) => handleChange("locationId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="1">Ana Depo</option>
                  <option value="2">Yan Depo</option>
                  <option value="3">Üretim Alanı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referans No
                </label>
                <input
                  type="text"
                  value={form.referenceNumber}
                  onChange={(e) => handleChange("referenceNumber", e.target.value)}
                  placeholder="Fatura No, İrsaliye No vb."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {form.quantity && form.unitPrice && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-800">
                  Toplam Tutar: {(parseFloat(form.quantity || 0) * parseFloat(form.unitPrice || 0)).toFixed(4)} ₺
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Miktar: {form.quantity} × Birim Fiyat: {form.unitPrice} ₺
                </div>
              </div>
            )}
          </div>

          {/* Açıklama ve Notlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Giriş açıklaması (max 500 karakter)"
                maxLength="500"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ek notlar (max 1000 karakter)"
                maxLength="1000"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
                  <span>Stok Girişi Yap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;