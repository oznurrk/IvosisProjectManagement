import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck } from "@tabler/icons-react";

const StockEditModal = ({ isOpen, onClose, item, onSave, categories, units }) => {
  const [form, setForm] = useState({
    itemCode: "",
    name: "",
    description: "",
    categoryId: "",
    unitId: "",
    minimumStock: "",
    maximumStock: "",
    reorderLevel: "",
    purchasePrice: "",
    salePrice: "",
    currency: "TRY",
    brand: "",
    model: "",
    specifications: "",
    qualityStandards: "",
    certificateNumbers: "",
    storageConditions: "",
    shelfLife: "",
    isCriticalItem: false,
    isActive: true,
    isDiscontinued: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        itemCode: item.itemCode || "",
        name: item.name || "",
        description: item.description || "",
        categoryId: item.categoryId?.toString() || "",
        unitId: item.unitId?.toString() || "",
        minimumStock: item.minimumStock?.toString() || "",
        maximumStock: item.maximumStock?.toString() || "",
        reorderLevel: item.reorderLevel?.toString() || "",
        purchasePrice: item.purchasePrice?.toString() || "",
        salePrice: item.salePrice?.toString() || "",
        currency: item.currency || "TRY",
        brand: item.brand || "",
        model: item.model || "",
        specifications: item.specifications || "",
        qualityStandards: item.qualityStandards || "",
        certificateNumbers: item.certificateNumbers || "",
        storageConditions: item.storageConditions || "",
        shelfLife: item.shelfLife?.toString() || "",
        isCriticalItem: item.isCriticalItem || false,
        isActive: item.isActive !== false,
        isDiscontinued: item.isDiscontinued || false
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemCode.trim()) newErrors.itemCode = "Stok kodu zorunludur";
    if (!form.name.trim()) newErrors.name = "Malzeme adı zorunludur";
    if (!form.categoryId) newErrors.categoryId = "Kategori zorunludur";
    if (!form.unitId) newErrors.unitId = "Birim zorunludur";
    if (!form.minimumStock || parseFloat(form.minimumStock) < 0) newErrors.minimumStock = "Geçerli bir minimum stok giriniz";
    if (!form.reorderLevel || parseFloat(form.reorderLevel) < 0) newErrors.reorderLevel = "Geçerli bir kritik stok giriniz";
    if (!form.purchasePrice || parseFloat(form.purchasePrice) <= 0) newErrors.purchasePrice = "Geçerli bir alış fiyatı giriniz";

    if (parseFloat(form.reorderLevel) >= parseFloat(form.minimumStock)) {
      newErrors.reorderLevel = "Kritik stok, minimum stoktan küçük olmalıdır";
    }

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
        itemCode: form.itemCode,
        name: form.name,
        description: form.description,
        categoryId: parseInt(form.categoryId),
        unitId: parseInt(form.unitId),
        minimumStock: parseFloat(form.minimumStock),
        maximumStock: parseFloat(form.maximumStock) || parseFloat(form.minimumStock) * 5,
        reorderLevel: parseFloat(form.reorderLevel),
        purchasePrice: parseFloat(form.purchasePrice),
        salePrice: parseFloat(form.salePrice) || parseFloat(form.purchasePrice) * 1.2,
        currency: form.currency,
        brand: form.brand,
        model: form.model,
        specifications: form.specifications,
        qualityStandards: form.qualityStandards,
        certificateNumbers: form.certificateNumbers,
        storageConditions: form.storageConditions,
        shelfLife: parseInt(form.shelfLife) || 0,
        isCriticalItem: form.isCriticalItem,
        isActive: form.isActive,
        isDiscontinued: form.isDiscontinued
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stok Kartı Düzenle</h2>
              <p className="text-ivosis-100 text-sm">Malzeme bilgilerini güncelleyin</p>
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
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Kategori Seçiniz</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim *
                  </label>
                  <select
                    value={form.unitId}
                    onChange={(e) => handleChange("unitId", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.unitId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Birim Seçiniz</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  {errors.unitId && (
                    <p className="text-red-500 text-xs mt-1">{errors.unitId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    placeholder="Marka adı"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    placeholder="Model kodu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Stok Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stok Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stok *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.minimumStock}
                    onChange={(e) => handleChange("minimumStock", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.minimumStock ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.minimumStock && (
                    <p className="text-red-500 text-xs mt-1">{errors.minimumStock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Stok
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.maximumStock}
                    onChange={(e) => handleChange("maximumStock", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kritik Stok *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.reorderLevel}
                    onChange={(e) => handleChange("reorderLevel", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.reorderLevel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.reorderLevel && (
                    <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fiyat Bilgileri */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fiyat Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alış Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => handleChange("purchasePrice", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.purchasePrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satış Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => handleChange("salePrice", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Para Birimi
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  >
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ek Bilgiler */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ek Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Özellikler
                  </label>
                  <textarea
                    value={form.specifications}
                    onChange={(e) => handleChange("specifications", e.target.value)}
                    placeholder="Teknik özellikler..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalite Standartları
                  </label>
                  <input
                    type="text"
                    value={form.qualityStandards}
                    onChange={(e) => handleChange("qualityStandards", e.target.value)}
                    placeholder="ISO 9001, CE, vb."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sertifika Numaraları
                  </label>
                  <input
                    type="text"
                    value={form.certificateNumbers}
                    onChange={(e) => handleChange("certificateNumbers", e.target.value)}
                    placeholder="Sertifika numaraları"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Depolama Koşulları
                  </label>
                  <input
                    type="text"
                    value={form.storageConditions}
                    onChange={(e) => handleChange("storageConditions", e.target.value)}
                    placeholder="Depolama koşulları"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raf Ömrü (Gün)
                  </label>
                  <input
                    type="number"
                    value={form.shelfLife}
                    onChange={(e) => handleChange("shelfLife", e.target.value)}
                    placeholder="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Durum Bilgileri */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Durum Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isCriticalItem}
                    onChange={(e) => handleChange("isCriticalItem", e.target.checked)}
                    className="h-4 w-4 text-ivosis-600 focus:ring-ivosis-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Kritik Malzeme</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="h-4 w-4 text-ivosis-600 focus:ring-ivosis-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Aktif</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isDiscontinued}
                    onChange={(e) => handleChange("isDiscontinued", e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Üretimi Durdu</label>
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Açıklama</h3>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Malzeme hakkında detaylı açıklama..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent resize-none"
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
