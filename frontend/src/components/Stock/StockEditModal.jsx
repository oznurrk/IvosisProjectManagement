import React, { useState, useEffect } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";

const StockEditModal = ({ isOpen, onClose, item, onSave }) => {
  const [form, setForm] = useState({
    itemCode: "",
    itemName: "",
    category: "",
    currentStock: "",
    minStock: "",
    criticalStock: "",
    unit: "Adet",
    unitPrice: "",
    location: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        itemCode: item.itemCode || "",
        itemName: item.itemName || "",
        category: item.category || "",
        currentStock: item.currentStock?.toString() || "",
        minStock: item.minStock?.toString() || "",
        criticalStock: item.criticalStock?.toString() || "",
        unit: item.unit || "Adet",
        unitPrice: item.unitPrice?.toString() || "",
        location: item.location || "",
        description: item.description || ""
      });
    }
  }, [item]);

  const categoryOptions = [
    "Elektrik Malzemeleri",
    "Mekanik Parçalar", 
    "Elektronik Bileşenler",
    "Güvenlik Ekipmanları",
    "Diğer"
  ];

  const locationOptions = [
    "DEPO-A-01", "DEPO-A-02", "DEPO-A-03",
    "DEPO-B-01", "DEPO-B-02", "DEPO-B-03", 
    "DEPO-C-01", "DEPO-C-02", "DEPO-C-03"
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemCode.trim()) newErrors.itemCode = "Stok kodu zorunludur";
    if (!form.itemName.trim()) newErrors.itemName = "Malzeme adı zorunludur";
    if (!form.category.trim()) newErrors.category = "Kategori zorunludur";
    if (!form.currentStock || parseFloat(form.currentStock) < 0) newErrors.currentStock = "Geçerli bir stok miktarı giriniz";
    if (!form.minStock || parseFloat(form.minStock) < 0) newErrors.minStock = "Geçerli bir minimum stok giriniz";
    if (!form.criticalStock || parseFloat(form.criticalStock) < 0) newErrors.criticalStock = "Geçerli bir kritik stok giriniz";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const stockData = {
        ...item,
        ...form,
        currentStock: parseFloat(form.currentStock),
        minStock: parseFloat(form.minStock),
        criticalStock: parseFloat(form.criticalStock),
        unitPrice: parseFloat(form.unitPrice) || 0
      };
      
      await onSave(stockData);
    } catch (error) {
      console.error("Stok güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Stok Kartı Düzenle</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Temel Bilgiler */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Kodu *
                  </label>
                  <input
                    type="text"
                    value={form.itemCode}
                    onChange={(e) => handleChange("itemCode", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.itemCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.itemCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.itemCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Malzeme Adı *
                  </label>
                  <input
                    type="text"
                    value={form.itemName}
                    onChange={(e) => handleChange("itemName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.itemName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.itemName && (
                    <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Kategori Seçiniz</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => handleChange("unit", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  >
                    <option value="Adet">Adet</option>
                    <option value="Kg">Kg</option>
                    <option value="Lt">Lt</option>
                    <option value="M">M</option>
                    <option value="M2">M²</option>
                    <option value="M3">M³</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stok Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stok Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Stok *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.currentStock}
                    onChange={(e) => handleChange("currentStock", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.currentStock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.currentStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stok *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.minStock}
                    onChange={(e) => handleChange("minStock", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.minStock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kritik Stok *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.criticalStock}
                    onChange={(e) => handleChange("criticalStock", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.criticalStock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.criticalStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.criticalStock}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Diğer Bilgiler */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Diğer Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => handleChange("unitPrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasyon
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  >
                    <option value="">Lokasyon Seçiniz</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent resize-none"
                  />
                </div>
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
                className="px-6 py-2 bg-gradient-to-r from-ivosis-600 to-ivosis-700 text-white rounded-lg hover:from-ivosis-700 hover:to-ivosis-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    <span>Güncelle</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockEditModal;
