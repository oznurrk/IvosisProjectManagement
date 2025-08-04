import React, { useState, useEffect } from "react";
import { IconX, IconCheck, IconSearch, IconPackage } from "@tabler/icons-react";

const StockInModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    unitPrice: "",
    supplier: "",
    invoiceNumber: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [itemsRes] = await Promise.all([
        fetch('http://localhost:5000/api/StockItems')
      ]);

      if (itemsRes.ok) {
        const items = await itemsRes.json();
        setStockItems(items);
      }

      setSuppliers([
        "ABC Çelik San. Tic. Ltd. Şti.",
        "XYZ Metal San. A.Ş.", 
        "GHI Paslanmaz Ltd.",
        "JKL Alüminyum San.",
        "MNO Galvaniz A.Ş."
      ]);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const resetForm = () => {
    setForm({
      itemId: "",
      quantity: "",
      unitPrice: "",
      supplier: "",
      invoiceNumber: "",
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
      const stockInData = {
        stockItemId: parseInt(form.itemId),
        quantity: parseFloat(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
        totalPrice: parseFloat(form.quantity) * parseFloat(form.unitPrice),
        supplier: form.supplier,
        referenceNumber: form.invoiceNumber,
        notes: form.notes
      };
      
      const response = await fetch('http://localhost:5000/api/StockMovements/stock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockInData)
      });

      if (response.ok) {
        resetForm();
        onClose();
        alert('Stok giriş işlemi başarıyla tamamlandı!');
        if (onSave) onSave();
      } else {
        const errorData = await response.json();
        alert('Hata: ' + (errorData.message || 'Stok giriş işlemi başarısız'));
      }
      
    } catch (error) {
      console.error("Stok giriş hatası:", error);
      alert('Bağlantı hatası: ' + error.message);
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
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="0.0"
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
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) => handleChange("unitPrice", e.target.value)}
                  placeholder="0.00"
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
                  Tedarikçi
                </label>
                <select
                  value={form.supplier}
                  onChange={(e) => handleChange("supplier", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Tedarikçi Seçiniz</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fatura No
                </label>
                <input
                  type="text"
                  value={form.invoiceNumber}
                  onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                  placeholder="Fatura numarası"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {form.quantity && form.unitPrice && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-800">
                  Toplam Tutar: {(parseFloat(form.quantity || 0) * parseFloat(form.unitPrice || 0)).toFixed(2)} ₺
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
              placeholder="Giriş ile ilgili notlar..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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