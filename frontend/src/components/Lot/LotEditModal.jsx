import React, { useState, useEffect } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";



const LotEditModal = ({ isOpen, onClose, lot, onSave }) => {
  const [form, setForm] = useState({
    lotNumber: "",
    barcode: "",
    initialWeight: 0,
    currentWeight: 0,
    width: 0,
    thickness: 0,
    qualityGrade: "",
    storagePosition: "",
    blockReason: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lot) {
      setForm({
        lotNumber: lot.lotNumber || "",
        barcode: lot.barcode || "",
        initialWeight: lot.initialWeight || 0,
        currentWeight: lot.currentWeight || 0,
        width: lot.width || 0,
        thickness: lot.thickness || 0,
        qualityGrade: lot.qualityGrade || "",
        storagePosition: lot.storagePosition || "",
        blockReason: lot.blockReason || ""
      });
    }
  }, [lot, isOpen]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.lotNumber.trim()) newErrors.lotNumber = "Lot No zorunlu";
    if (!form.initialWeight || form.initialWeight < 0) newErrors.initialWeight = "Geçerli bir ağırlık girin";
    if (!form.currentWeight || form.currentWeight < 0) newErrors.currentWeight = "Geçerli bir ağırlık girin";
    if (lot?.isBlocked && !form.blockReason.trim()) newErrors.blockReason = "Bloke sebebi zorunlu";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (!onSave) throw new Error("onSave fonksiyonu tanımlı değil!");
      const result = await onSave(form);
      // Eğer onSave false veya hata döndürürse
      if (result === false) {
        alert("Kaydetme işlemi başarısız! (onSave false döndürdü)");
        setLoading(false);
        return;
      }
      onClose();
    } catch (err) {
      alert("Kaydetme sırasında hata: " + (err?.message || err));
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
              <h2 className="text-xl font-bold text-white">Lot Düzenle</h2>
              <p className="text-blue-100 text-sm">Lot bilgilerini güncelleyin</p>
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
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lot Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lot No *</label>
                  <input
                    type="text"
                    value={form.lotNumber}
                    onChange={e => handleChange("lotNumber", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lotNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lotNumber && <p className="text-red-500 text-xs mt-1">{errors.lotNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barkod</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={e => handleChange("barcode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Ağırlık (kg) *</label>
                  <input
                    type="number"
                    value={form.initialWeight}
                    onChange={e => handleChange("initialWeight", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.initialWeight ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.initialWeight && <p className="text-red-500 text-xs mt-1">{errors.initialWeight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Ağırlık (kg) *</label>
                  <input
                    type="number"
                    value={form.currentWeight}
                    onChange={e => handleChange("currentWeight", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.currentWeight ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.currentWeight && <p className="text-red-500 text-xs mt-1">{errors.currentWeight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (mm)</label>
                  <input
                    type="number"
                    value={form.width}
                    onChange={e => handleChange("width", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalınlık (mm)</label>
                  <input
                    type="number"
                    value={form.thickness}
                    onChange={e => handleChange("thickness", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalite</label>
                  <input
                    type="text"
                    value={form.qualityGrade}
                    onChange={e => handleChange("qualityGrade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo Pozisyonu</label>
                  <input
                    type="text"
                    value={form.storagePosition}
                    onChange={e => handleChange("storagePosition", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {/* BlockReason alanı */}
                {lot?.isBlocked && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bloke Sebebi *</label>
                    <input
                      type="text"
                      value={form.blockReason}
                      onChange={e => handleChange("blockReason", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.blockReason ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.blockReason && <p className="text-red-500 text-xs mt-1">{errors.blockReason}</p>}
                  </div>
                )}
              </div>
            </div>
            {/* Butonlar */}
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
        </div>
      </div>
    </div>
  );
};

export default LotEditModal;
