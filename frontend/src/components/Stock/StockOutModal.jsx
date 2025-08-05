import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck, IconAlertTriangle, IconTruck } from "@tabler/icons-react";

const StockOutModal = ({ isOpen, onClose, onSave, stockItems = [] }) => {
  const [form, setForm] = useState({
    itemId: "",
    locationId: "1", // Default location
    quantity: "",
    referenceNumber: "",
    description: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [locations, setLocations] = useState([]); // Lokasyonlar için state

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
      resetForm();
      fetchLocations(); // Lokasyonları yükle
      console.log('StockOutModal açıldı, gelen stockItems:', stockItems);
    }
  }, [isOpen, stockItems]);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/StockLocations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Response'u kontrol et ve array olduğundan emin ol
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

      // Sadece aktif lokasyonları filtrele
      const activeLocations = locationData.filter(loc => loc.isActive !== false);
      setLocations(activeLocations);

      // Eğer lokasyonlar varsa ve form.locationId boşsa, ilk aktif lokasyonu seç
      if (activeLocations.length > 0 && !form.locationId) {
        setForm(prev => ({ ...prev, locationId: activeLocations[0].id.toString() }));
      }

      console.log('Locations loaded:', activeLocations);
    } catch (error) {
      console.error('Lokasyonlar yüklenirken hata:', error);
      // Hata durumunda varsayılan lokasyonlar
      setLocations([
        { id: 1, name: "Ana Depo", code: "MAIN" },
        { id: 2, name: "Yan Depo", code: "SEC" }
      ]);
    }
  };

  const resetForm = () => {
    setForm({
      itemId: "",
      locationId: "1", // Default location
      quantity: "",
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
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemId) newErrors.itemId = "Malzeme seçimi zorunludur";
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = "Geçerli bir miktar giriniz";

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
      
      // Sadece backend'in beklediği minimal alanları gönder
      const stockOutData = {
        stockItemId: parseInt(form.itemId),
        locationId: parseInt(form.locationId),
        movementType: "StockOut",
        quantity: parseFloat(form.quantity),
        unitPrice: 0,
        totalAmount: 0,
        referenceType: "Issue",
        referenceNumber: form.referenceNumber || null,
        description: form.description || null,
        notes: form.notes || null
        // movementDate'i göndermiyoruz - backend otomatik set eder
        // computed column'ları göndermiyoruz
      };
      
      console.log('StockOut API\'ye gönderilecek veri:', stockOutData);
      
      const response = await axios.post("http://localhost:5000/api/StockMovements/stock-out", stockOutData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      resetForm();
      onClose();
      alert('Stok çıkış işlemi başarıyla tamamlandı!');
      if (onSave) onSave();
    } catch (error) {
      console.error("Stok çıkış hatası:", error);
      
      let errorMessage = 'Stok çıkış işlemi başarısız';
      
      if (error.response?.status === 500) {
        if (error.response?.data?.includes?.('computed column') || 
            error.response?.data?.includes?.('AvailableQuantity')) {
          errorMessage = 'Veritabanı yapı hatası. Lütfen sistem yöneticisine başvurun.';
        } else if (error.response?.data?.includes?.('FOREIGN KEY constraint')) {
          errorMessage = 'Lokasyon bilgisi geçersiz. Lütfen sistem yöneticisine başvurun.';
        } else {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert('Hata: ' + errorMessage);
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
                  {Array.isArray(stockItems) && stockItems.length > 0 ? (
                    stockItems.map((item) => (
                      <option key={item.id} value={item.id.toString()}>
                        {item.itemCode} - {item.name} (Mevcut: {item.currentStock || 0} {item.unit || 'Adet'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Yükleniyor...</option>
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
                  step="0.001"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="0.000"
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
                  Lokasyon *
                </label>
                <select
                  value={form.locationId}
                  onChange={(e) => handleChange("locationId", e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.locationId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Lokasyon Seçiniz</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id.toString()}>
                      {location.code} - {location.name}
                      {location.capacity && ` (Kapasite: ${location.capacity} ${location.capacityUnit || ''})`}
                    </option>
                  ))}
                </select>
                {errors.locationId && (
                  <p className="text-red-500 text-xs mt-1">{errors.locationId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referans No
                </label>
                <input
                  type="text"
                  value={form.referenceNumber}
                  onChange={(e) => handleChange("referenceNumber", e.target.value)}
                  placeholder="İş Emri No, Talep No vb."
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
                      İşlem Sonrası Kalan Stok: {(selectedItem.currentStock - parseFloat(form.quantity || 0)).toFixed(3)} {selectedItem.unit}
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

          {/* Açıklama ve Notlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Çıkış açıklaması (max 500 karakter)"
                maxLength="500"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
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