import React, { useState, useEffect } from "react";
import { IconX, IconCheck } from "@tabler/icons-react";



const LotEditModal = ({ isOpen, onClose, lot, onSave }) => {
  const [form, setForm] = useState({
    LotNumber: "",
    Barcode: "",
    InitialWeight: 0,
    CurrentWeight: 0,
    Width: 0,
    Thickness: 0,
    QualityGrade: "",
    StoragePosition: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lot) {
      setForm({
        LotNumber: lot.LotNumber || "",
        Barcode: lot.Barcode || "",
        InitialWeight: lot.InitialWeight || 0,
        CurrentWeight: lot.CurrentWeight || 0,
        Width: lot.Width || 0,
        Thickness: lot.Thickness || 0,
        QualityGrade: lot.QualityGrade || "",
        StoragePosition: lot.StoragePosition || ""
      });
    }
  }, [lot, isOpen]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.LotNumber.trim()) newErrors.LotNumber = "Lot No zorunlu";
    if (!form.InitialWeight || form.InitialWeight < 0) newErrors.InitialWeight = "Geçerli bir ağırlık girin";
    if (!form.CurrentWeight || form.CurrentWeight < 0) newErrors.CurrentWeight = "Geçerli bir ağırlık girin";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      if (onSave) onSave(form);
      setLoading(false);
      onClose();
    }, 800);
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
                    value={form.LotNumber}
                    onChange={e => handleChange("LotNumber", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.LotNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.LotNumber && <p className="text-red-500 text-xs mt-1">{errors.LotNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barkod</label>
                  <input
                    type="text"
                    value={form.Barcode}
                    onChange={e => handleChange("Barcode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Ağırlık (kg) *</label>
                  <input
                    type="number"
                    value={form.InitialWeight}
                    onChange={e => handleChange("InitialWeight", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.InitialWeight ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.InitialWeight && <p className="text-red-500 text-xs mt-1">{errors.InitialWeight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Ağırlık (kg) *</label>
                  <input
                    type="number"
                    value={form.CurrentWeight}
                    onChange={e => handleChange("CurrentWeight", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.CurrentWeight ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.CurrentWeight && <p className="text-red-500 text-xs mt-1">{errors.CurrentWeight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (mm)</label>
                  <input
                    type="number"
                    value={form.Width}
                    onChange={e => handleChange("Width", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalınlık (mm)</label>
                  <input
                    type="number"
                    value={form.Thickness}
                    onChange={e => handleChange("Thickness", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalite</label>
                  <input
                    type="text"
                    value={form.QualityGrade}
                    onChange={e => handleChange("QualityGrade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo Pozisyonu</label>
                  <input
                    type="text"
                    value={form.StoragePosition}
                    onChange={e => handleChange("StoragePosition", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
