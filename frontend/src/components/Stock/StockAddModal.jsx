import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconPlus, IconCheck, IconSearch, IconRefresh } from "@tabler/icons-react";

const StockAddModal = ({ isOpen, onClose, onSave }) => {
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
    isCriticalItem: false
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

      // Sadece StockItems'ı çek, geri kalan her şeyi bundan çıkar
      const itemsRes = await axios.get("http://localhost:5000/api/StockItems", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let stockItemsData = [];
      if (Array.isArray(itemsRes.data)) {
        stockItemsData = itemsRes.data;
      } else if (itemsRes.data && typeof itemsRes.data === 'object') {
        if (itemsRes.data.items && Array.isArray(itemsRes.data.items)) {
          stockItemsData = itemsRes.data.items;
        } else if (itemsRes.data.data && Array.isArray(itemsRes.data.data)) {
          stockItemsData = itemsRes.data.data;
        }
      }
      setExistingItems(stockItemsData);

      // Categories'i direkt stockItems'dan çıkar (listedeki gibi)
      const categoryMap = new Map();
      stockItemsData.forEach(item => {
        const catId = item.categoryId || item.CategoryId;
        const catName = item.category || item.categoryName || item.Category || item.CategoryName;
        
        if (catId && catName) {
          categoryMap.set(catId, catName);
        }
      });
      
      const categoriesArray = Array.from(categoryMap.entries()).map(([id, name]) => ({
        id: parseInt(id),
        name: name
      }));
      
      setCategories(categoriesArray);

      // Units'i direkt stockItems'dan çıkar (listedeki gibi)
      const unitMap = new Map();
      stockItemsData.forEach(item => {
        const unitId = item.unitId || item.UnitId;
        const unitName = item.unit || item.unitName || item.Unit || item.UnitName;
        
        if (unitId && unitName) {
          unitMap.set(unitId, unitName);
        }
      });
      
      const unitsArray = Array.from(unitMap.entries()).map(([id, name]) => ({
        id: parseInt(id),
        name: name
      }));
      
      setUnits(unitsArray);

      // Locations'ı dene, olmasa da sorun değil
      let locationData = [];
      try {
        const locationsRes = await axios.get("http://localhost:5000/api/StockLocations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (Array.isArray(locationsRes.data)) {
          locationData = locationsRes.data;
        }
      } catch (err) {
        locationData = [{ id: 1, name: "Ana Depo", code: "MAIN", isActive: true }];
      }
      
      const activeLocations = locationData.filter(loc => loc.isActive !== false);
      setLocations(activeLocations);


    } catch (error) {
      console.error("Modal verileri yükleme hatası:", error);
      
      // Fallback veriler
      setCategories([
        { id: 1, name: "Genel" },
        { id: 2, name: "Elektronik" },
        { id: 3, name: "Mekanik" },
        { id: 4, name: "Kimyasal" },
        { id: 5, name: "Yedek Parça" }
      ]);
      
      setUnits([
        { id: 1, name: "Adet" },
        { id: 2, name: "Kg" },
        { id: 3, name: "Metre" },
        { id: 4, name: "Litre" },
        { id: 5, name: "Kutu" }
      ]);
      
      setLocations([{ id: 1, name: "Ana Depo", code: "MAIN" }]);
      
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
    
    if (field === "name") {
      setSearchTerm(value);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const selectExistingItem = (item) => {
    setForm(prev => ({
      ...prev,
      name: item.name,
      categoryId: item.categoryId?.toString() || "",
      unitId: item.unitId?.toString() || "",
      purchasePrice: item.purchasePrice?.toString() || "",
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
      name: "Örnek Malzeme",
      categoryId: categories[0]?.id?.toString() || "1",
      minimumStock: "20",
      maximumStock: "500",
      reorderLevel: "5",
      unitId: units[0]?.id?.toString() || "1",
      purchasePrice: "10.50",
      salePrice: "12.60",
      currency: "TRY",
      brand: "Örnek Marka",
      model: "M-001",
      description: "Örnek açıklama",
      specifications: "Örnek özellikler",
      qualityStandards: "ISO 9001",
      certificateNumbers: "CERT-001",
      storageConditions: "Kuru ortam",
      shelfLife: "365",
      isCriticalItem: false
    };
    setForm(prev => ({ ...prev, ...sampleData }));
  };

  const validateForm = () => {
    const newErrors = {};

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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Veri formatını kontrol et ve temizle
      const stockData = {
        itemCode: (form.itemCode || generateItemCode()).trim(),
        name: form.name.trim(),
        description: (form.description || "").trim(),
        categoryId: parseInt(form.categoryId),
        unitId: parseInt(form.unitId),
        minimumStock: parseFloat(form.minimumStock),
        maximumStock: parseFloat(form.maximumStock) || parseFloat(form.minimumStock) * 5,
        reorderLevel: parseFloat(form.reorderLevel),
        purchasePrice: parseFloat(form.purchasePrice),
        salePrice: parseFloat(form.salePrice) || parseFloat(form.purchasePrice) * 1.2,
        currency: form.currency || "TRY",
        brand: (form.brand || "").trim(),
        model: (form.model || "").trim(),
        specifications: (form.specifications || "").trim(),
        qualityStandards: (form.qualityStandards || "").trim(),
        certificateNumbers: (form.certificateNumbers || "").trim(),
        storageConditions: (form.storageConditions || "").trim(),
        shelfLife: parseInt(form.shelfLife) || 0,
        isCriticalItem: Boolean(form.isCriticalItem)
      };
      
      // NaN kontrolü
      if (isNaN(stockData.categoryId) || isNaN(stockData.unitId)) {
        throw new Error('Kategori ve birim seçimi zorunludur');
      }
      

      
      await onSave(stockData);
      

      
      // Form'u sıfırla
      setForm({
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
        isCriticalItem: false
      });
      setSearchTerm("");
      setErrors({});
      
    } catch (error) {
      console.error("Stok kartı ekleme hatası:", error);
      alert('Kaydetme hatası: ' + (error.message || 'Bilinmeyen hata'));
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
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Malzeme adını giriniz veya arayın"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                      Stok Türü *
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => handleChange("categoryId", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ivosis-500 focus:border-transparent ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Kategori Seçiniz</option>
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Kategoriler yükleniyor...</option>
                      )}
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
                      {Array.isArray(units) && units.length > 0 ? (
                        units.map((unit) => (
                          <option key={unit.id} value={unit.id.toString()}>
                            {unit.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Birimler yükleniyor...</option>
                      )}
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
                  <span className="text-sm font-normal text-gray-600 ml-2">(Kritik &lt; Min &lt; Max)</span>
                </h3>
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
                      placeholder="0.0"
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
                      placeholder="0.0"
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
                      placeholder="0.0"
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

              {/* Fiyat Bilgileri 
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
              */}

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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.isCriticalItem}
                    onChange={(e) => handleChange("isCriticalItem", e.target.checked)}
                    className="h-4 w-4 text-ivosis-600 focus:ring-ivosis-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Kritik Malzeme</label>
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