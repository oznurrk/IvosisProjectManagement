import React, { useState, useEffect } from "react";
import { IconX, IconPlus, IconCheck, IconSearch, IconRefresh } from "@tabler/icons-react";

const StockAddModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    itemCode: "",
    itemName: "",
    categoryId: "",
    currentStock: "",
    maxStock: "",
    minStock: "",
    criticalStock: "",
    unitId: "",
    unitPrice: "",
    salePrice: "",
    location: "",
    description: "",
    supplier: "",
    barcode: "",
    brand: "",
    model: "",
    specifications: "",
    qualityStandards: "",
    certificateNumbers: "",
    storageConditions: "",
    shelfLife: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const [existingItems, setExistingItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchModalData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = existingItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, existingItems]);

  const fetchModalData = async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [itemsRes] = await Promise.all([
        fetch('http://localhost:5000/api/StockItems', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (itemsRes.ok) {
        const items = await itemsRes.json();
        setExistingItems(items);
        
        // StockItems'dan categories çıkar
        const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories.map((cat, index) => ({ id: index + 1, name: cat })));
        
        // StockItems'dan units çıkar
        const uniqueUnits = [...new Set(items.map(item => item.unit).filter(Boolean))];
        setUnits(uniqueUnits.map((unit, index) => ({ id: index + 1, name: unit })));
      } else {
        console.error("Modal verileri yetkisiz erişim:", itemsRes.status);
      }

      // Suppliers ve locations için API endpoint varsa buraya ekle
      setSuppliers([]);
      setLocations([]);

    } catch (error) {
      console.error("Modal verileri yükleme hatası:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const generateItemCode = (prefix = "STK") => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${randomNum}`;
  };

  const generateBarcode = () => {
    return Math.floor(Math.random() * 9000000000000) + 1000000000000;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (field === "itemName") {
      setSearchTerm(value);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const selectExistingItem = (item) => {
    setForm(prev => ({
      ...prev,
      itemName: item.name,
      categoryId: item.categoryId?.toString() || "",
      unitId: item.unitId?.toString() || "",
      unitPrice: item.purchasePrice?.toString() || "",
      salePrice: item.salePrice?.toString() || "",
      description: item.description || "",
      brand: item.brand || "",
      model: item.model || ""
    }));
    setSearchTerm(item.name);
    setShowSuggestions(false);
  };

  const handleQuickFill = () => {
    const sampleData = {
      itemCode: generateItemCode(),
      itemName: "Örnek Malzeme",
      categoryId: categories[0]?.id?.toString() || "1",
      currentStock: "100",
      maxStock: "500",
      minStock: "20",
      criticalStock: "5",
      unitId: units[0]?.id?.toString() || "1",
      unitPrice: "10.50",
      salePrice: "12.60",
      location: locations[0] || "DEPO-A-01",
      supplier: suppliers[0] || "",
      barcode: generateBarcode().toString(),
      brand: "Örnek Marka",
      model: "M-001",
      description: "Örnek açıklama",
      specifications: "Örnek özellikler",
      qualityStandards: "ISO 9001",
      certificateNumbers: "CERT-001",
      storageConditions: "Kuru ortam",
      shelfLife: "365"
    };
    setForm(prev => ({ ...prev, ...sampleData }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.itemName.trim()) newErrors.itemName = "Malzeme adı zorunludur";
    if (!form.categoryId) newErrors.categoryId = "Kategori zorunludur";
    if (!form.unitId) newErrors.unitId = "Birim zorunludur";
    if (!form.currentStock || parseFloat(form.currentStock) < 0) newErrors.currentStock = "Geçerli bir stok miktarı giriniz";
    if (!form.minStock || parseFloat(form.minStock) < 0) newErrors.minStock = "Geçerli bir minimum stok giriniz";
    if (!form.criticalStock || parseFloat(form.criticalStock) < 0) newErrors.criticalStock = "Geçerli bir kritik stok giriniz";
    if (!form.unitPrice || parseFloat(form.unitPrice) <= 0) newErrors.unitPrice = "Geçerli bir birim fiyat giriniz";

    if (parseFloat(form.criticalStock) >= parseFloat(form.minStock)) {
      newErrors.criticalStock = "Kritik stok, minimum stoktan küçük olmalıdır";
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
        itemCode: form.itemCode || generateItemCode(),
        name: form.itemName,
        description: form.description || "",
        categoryId: parseInt(form.categoryId),
        unitId: parseInt(form.unitId),
        minimumStock: parseFloat(form.minStock),
        maximumStock: parseFloat(form.maxStock) || parseFloat(form.currentStock) * 5,
        reorderLevel: parseFloat(form.criticalStock),
        purchasePrice: parseFloat(form.unitPrice),
        salePrice: parseFloat(form.salePrice) || parseFloat(form.unitPrice) * 1.2,
        currency: "TRY",
        brand: form.brand || "",
        model: form.model || "",
        specifications: form.specifications || "",
        qualityStandards: form.qualityStandards || "",
        certificateNumbers: form.certificateNumbers || "",
        storageConditions: form.storageConditions || "",
        shelfLife: parseInt(form.shelfLife) || 0,
        isCriticalItem: parseFloat(form.currentStock) <= parseFloat(form.criticalStock)
      };
      
      console.log('Gönderilen veri:', stockData);
      
      await onSave(stockData);
      
      setForm({
        itemCode: "",
        itemName: "",
        categoryId: "",
        currentStock: "",
        maxStock: "",
        minStock: "",
        criticalStock: "",
        unitId: "",
        unitPrice: "",
        salePrice: "",
        location: "",
        description: "",
        supplier: "",
        barcode: "",
        brand: "",
        model: "",
        specifications: "",
        qualityStandards: "",
        certificateNumbers: "",
        storageConditions: "",
        shelfLife: ""
      });
      setSearchTerm("");
      
    } catch (error) {
      console.error("Stok kartı ekleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Yeni Stok Kartı Ekle</h2>
              <p className="text-ivosis-100 text-sm">Detaylı malzeme bilgileri</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <IconRefresh size={14} className="mr-1 inline" />
                Örnek Veri
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {dataLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ivosis-600"></div>
              <span className="ml-2 text-gray-600">Veriler yükleniyor...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Kodu
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={form.itemCode}
                        onChange={(e) => handleChange("itemCode", e.target.value)}
                        placeholder="Otomatik oluşturulacak"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange("itemCode", generateItemCode())}
                        className="px-3 py-2 bg-ivosis-100 text-ivosis-700 rounded-lg hover:bg-ivosis-200 transition-colors"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Malzeme Adı * <IconSearch size={14} className="inline ml-1 text-gray-400" />
                    </label>
                    <input
                      type="text"
                      value={form.itemName}
                      onChange={(e) => handleChange("itemName", e.target.value)}
                      placeholder="Malzeme adını giriniz veya arayın"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                        errors.itemName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.itemName && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                    )}
                    
                    {/* Malzeme önerileri */}
                    {showSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredItems.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => selectExistingItem(item)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.itemCode} • {item.category}</div>
                          </div>
                        ))}
                      </div>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Stok Bilgileri
                  <span className="text-sm font-normal text-gray-600 ml-2">(Kritik &lt; Min &lt; Mevcut)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Stok *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.currentStock}
                      onChange={(e) => handleChange("currentStock", e.target.value)}
                      placeholder="0.0"
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
                      Maksimum Stok
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.maxStock}
                      onChange={(e) => handleChange("maxStock", e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    />
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
                      placeholder="0.0"
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
                      placeholder="0.0"
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

              {/* Tedarikçi ve Lokasyon */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tedarikçi ve Lokasyon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tedarikçi
                    </label>
                    <select
                      value={form.supplier}
                      onChange={(e) => handleChange("supplier", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    >
                      <option value="">Tedarikçi Seçiniz</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier} value={supplier}>{supplier}</option>
                      ))}
                    </select>
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
                      {locations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barkod
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={form.barcode}
                        onChange={(e) => handleChange("barcode", e.target.value)}
                        placeholder="Barkod numarası"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange("barcode", generateBarcode().toString())}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alış Fiyatı (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.unitPrice}
                      onChange={(e) => handleChange("unitPrice", e.target.value)}
                      placeholder="0.00"
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
                      Satış Fiyatı (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.salePrice}
                      onChange={(e) => handleChange("salePrice", e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent"
                    />
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

              {/* Açıklama */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAddModal;