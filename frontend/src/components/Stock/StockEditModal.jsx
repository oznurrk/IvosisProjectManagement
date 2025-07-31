import React, { useState, useEffect } from "react";
import { IconX, IconCheck, IconAlertCircle } from "@tabler/icons-react";

const StockEditModal = ({ isOpen, onClose, stock, onSave }) => {
  const [form, setForm] = useState({
    stockCode: "",
    materialName: "",
    lotNumber: "",
    weight: "",
    unit: "Kg",
    supplier: "",
    arrivalDate: "",
    labelNumber: "",
    waybillNumber: "",
    location: "",
    unitPrice: "",
    totalPrice: "",
    notes: "",
    status: "Stokta",
    saleCustomer: "",
    saleDate: "",
    reserveCustomer: "",
    reserveDate: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const materialOptions = [
    "Çelik Bobin A1",
    "Çelik Bobin A2",
    "Alüminyum Bobin B1",
    "Alüminyum Bobin B2",
    "Paslanmaz Çelik Bobin C1",
    "Paslanmaz Çelik Bobin C2",
    "Galvaniz Çelik Bobin D1",
    "Bakır Bobin E1"
  ];

  const supplierOptions = [
    "ABC Çelik San. Tic. Ltd. Şti.",
    "XYZ Metal San. A.Ş.",
    "GHI Paslanmaz Ltd.",
    "JKL Alüminyum San.",
    "MNO Galvaniz A.Ş.",
    "PQR Bakır San. Ltd."
  ];

  const locationOptions = [
    "A-01-001", "A-01-002", "A-01-003",
    "B-02-001", "B-02-002", "B-02-003",
    "C-03-001", "C-03-002", "C-03-003",
    "D-04-001", "D-04-002", "D-04-003"
  ];

  const statusOptions = [
    { value: "Stokta", label: "Stokta" },
    { value: "Satıldı", label: "Satıldı" },
    { value: "Rezerve", label: "Rezerve" },
    { value: "İade", label: "İade" }
  ];

  useEffect(() => {
    if (stock && isOpen) {
      setForm({
        stockCode: stock.stockCode || "",
        materialName: stock.materialName || "",
        lotNumber: stock.lotNumber || "",
        weight: stock.weight?.toString() || "",
        unit: stock.unit || "Kg",
        supplier: stock.supplier || "",
        arrivalDate: stock.arrivalDate || "",
        labelNumber: stock.labelNumber || "",
        waybillNumber: stock.waybillNumber || "",
        location: stock.location || "",
        unitPrice: stock.unitPrice?.toString() || "",
        totalPrice: stock.totalPrice?.toString() || "",
        notes: stock.notes || "",
        status: stock.status || "Stokta",
        saleCustomer: stock.saleCustomer || "",
        saleDate: stock.saleDate || "",
        reserveCustomer: stock.reserveCustomer || "",
        reserveDate: stock.reserveDate || ""
      });
    }
  }, [stock, isOpen]);

  const handleChange = (field, value) => {
    const newForm = { ...form, [field]: value };
    
    // Otomatik hesaplama
    if (field === 'weight' || field === 'unitPrice' || field === 'unit') {
      const weight = parseFloat(field === 'weight' ? value : newForm.weight) || 0;
      const unitPrice = parseFloat(field === 'unitPrice' ? value : newForm.unitPrice) || 0;
      const unit = field === 'unit' ? value : newForm.unit;
      // Eğer ton seçiliyse kg'a çevir
      const weightInKg = unit === "Ton" ? weight * 1000 : weight;
      newForm.totalPrice = (weightInKg * unitPrice).toString();
    }
    
    // Durum değişikliğinde ilgili alanları temizle
    if (field === 'status') {
      if (value !== 'Satıldı') {
        newForm.saleCustomer = "";
        newForm.saleDate = "";
      }
      if (value !== 'Rezerve') {
        newForm.reserveCustomer = "";
        newForm.reserveDate = "";
      }
    }
    
    setForm(newForm);
    
    // Hata temizle
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.materialName.trim()) newErrors.materialName = "Malzeme adı zorunludur";
    if (!form.weight || parseFloat(form.weight) <= 0) newErrors.weight = "Geçerli bir ağırlık giriniz";
    if (!form.supplier.trim()) newErrors.supplier = "Tedarikçi zorunludur";
    if (!form.arrivalDate) newErrors.arrivalDate = "Giriş tarihi zorunludur";
    if (!form.waybillNumber.trim()) newErrors.waybillNumber = "İrsaliye numarası zorunludur";
    if (!form.location.trim()) newErrors.location = "Lokasyon zorunludur";
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) newErrors.unitPrice = "Geçerli bir birim fiyat giriniz";

    // Durum bazlı validasyonlar
    if (form.status === 'Satıldı') {
      if (!form.saleCustomer.trim()) newErrors.saleCustomer = "Müşteri bilgisi zorunludur";
      if (!form.saleDate) newErrors.saleDate = "Satış tarihi zorunludur";
    }

    if (form.status === 'Rezerve') {
      if (!form.reserveCustomer.trim()) newErrors.reserveCustomer = "Rezerve eden bilgisi zorunludur";
      if (!form.reserveDate) newErrors.reserveDate = "Rezerve tarihi zorunludur";
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
        ...stock,
        ...form,
        weight: parseFloat(form.weight),
        unitPrice: parseFloat(form.unitPrice),
        totalPrice: parseFloat(form.totalPrice)
      };
      
      await onSave(stockData);
      
    } catch (error) {
      console.error("Stok güncelleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !stock) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stok Düzenle</h2>
              <p className="text-blue-100 text-sm">{stock.stockCode}</p>
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
                    Stok Kodu
                  </label>
                  <input
                    type="text"
                    value={form.stockCode}
                    onChange={(e) => handleChange("stockCode", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Malzeme Adı *
                  </label>
                  <select
                    value={form.materialName}
                    onChange={(e) => handleChange("materialName", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.materialName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Malzeme Seçiniz</option>
                    {materialOptions.map((material) => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                  {errors.materialName && (
                    <p className="text-red-500 text-xs mt-1">{errors.materialName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lot Numarası
                  </label>
                  <input
                    type="text"
                    value={form.lotNumber}
                    onChange={(e) => handleChange("lotNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiket Numarası
                  </label>
                  <input
                    type="text"
                    value={form.labelNumber}
                    onChange={(e) => handleChange("labelNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ağırlık *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                        errors.weight ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <select
                      value={form.unit}
                      onChange={(e) => handleChange("unit", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    >
                      <option value="Kg">Kg</option>
                      <option value="Ton">Ton</option>
                    </select>
                  </div>
                  {errors.weight && (
                    <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasyon *
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Lokasyon Seçiniz</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Durum Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Durum Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                {/* Satış Bilgileri */}
                {form.status === 'Satıldı' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Müşteri *
                      </label>
                      <input
                        type="text"
                        value={form.saleCustomer}
                        onChange={(e) => handleChange("saleCustomer", e.target.value)}
                        placeholder="Müşteri adı"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                          errors.saleCustomer ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.saleCustomer && (
                        <p className="text-red-500 text-xs mt-1">{errors.saleCustomer}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Satış Tarihi *
                      </label>
                      <input
                        type="date"
                        value={form.saleDate}
                        onChange={(e) => handleChange("saleDate", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                          errors.saleDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.saleDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.saleDate}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Rezervasyon Bilgileri */}
                {form.status === 'Rezerve' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rezerve Eden *
                      </label>
                      <input
                        type="text"
                        value={form.reserveCustomer}
                        onChange={(e) => handleChange("reserveCustomer", e.target.value)}
                        placeholder="Rezerve eden"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                          errors.reserveCustomer ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.reserveCustomer && (
                        <p className="text-red-500 text-xs mt-1">{errors.reserveCustomer}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rezerve Tarihi *
                      </label>
                      <input
                        type="date"
                        value={form.reserveDate}
                        onChange={(e) => handleChange("reserveDate", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                          errors.reserveDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.reserveDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.reserveDate}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tedarikçi Bilgileri */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tedarikçi Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tedarikçi *
                  </label>
                  <select
                    value={form.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.supplier ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Tedarikçi Seçiniz</option>
                    {supplierOptions.map((supplier) => (
                      <option key={supplier} value={supplier}>{supplier}</option>
                    ))}
                  </select>
                  {errors.supplier && (
                    <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giriş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={(e) => handleChange("arrivalDate", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.arrivalDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.arrivalDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.arrivalDate}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İrsaliye Numarası *
                  </label>
                  <input
                    type="text"
                    value={form.waybillNumber}
                    onChange={(e) => handleChange("waybillNumber", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.waybillNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.waybillNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.waybillNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fiyat Bilgileri */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fiyat Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(e) => handleChange("unitPrice", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                      errors.unitPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.unitPrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toplam Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.totalPrice}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Otomatik hesaplanır</p>
                </div>
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notlar</h3>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="İsteğe bağlı notlar..."
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
