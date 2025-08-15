import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconCheck, IconSearch, IconPackage } from "@tabler/icons-react";

// /api/Unit'ten birimleri çeken custom hook kodu doğrudan burada:
function useUnits() {
  const [units, setUnits] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/Unit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) {
          setUnits(res.data);
        } else if (res.data && Array.isArray(res.data.items)) {
          setUnits(res.data.items);
        } else if (res.data && Array.isArray(res.data.data)) {
          setUnits(res.data.data);
        } else {
          setUnits([]);
        }
      } catch (err) {
        setError(err);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  return { units, loading, error };
}


const StockInModal = ({ isOpen, onClose, onSave, stockItems = [], initialValues }) => {
  const [form, setForm] = useState({
    itemId: initialValues?.itemId?.toString() || initialValues?.stockItemId?.toString() || "",
    locationId: initialValues?.locationId?.toString() || "1",
    quantity: initialValues?.quantity?.toString() || "",
    unitId: initialValues?.unitId?.toString() || "",
    referenceNumber: initialValues?.referenceNumber || "",
    description: initialValues?.description || "",
    notes: initialValues?.notes || "",
    lotWidth: initialValues?.lotWidth || "",
    lotThickness: initialValues?.lotThickness || "",
    lotSupplier: initialValues?.lotSupplier || "",
    lotLabel: initialValues?.lotLabel || "",
    lotNumber: initialValues?.lotNumber || "",
    labelNumber: initialValues?.labelNumber || initialValues?.lotLabel || "",
    initialWeight: initialValues?.initialWeight || "",
    width: initialValues?.width || "",
    thickness: initialValues?.thickness || "",
    receiptDate: initialValues?.receiptDate || "",
    certificateNumber: initialValues?.certificateNumber || "",
    qualityGrade: initialValues?.qualityGrade || "",
    testResults: initialValues?.testResults || "",
    storagePosition: initialValues?.storagePosition || "",
    blockReason: initialValues?.blockReason || "",
    supplierId: initialValues?.supplierId?.toString() || "",
    companyId: initialValues?.companyId?.toString() || "",
    status: initialValues?.status || "Active",
    createdBy: Number(localStorage.getItem('userId')) || ""
  });
  // Birim listesini çek
  const { units, loading: unitsLoading } = useUnits();
  // Dummy örnek supplier ve company listesi (gerçek API'den çekmek daha iyi)
  const supplierList = [
    { id: 1, name: "ABC Tedarik A.Ş." },
    { id: 2, name: "XYZ Malzeme Ltd." },
    { id: 3, name: "DEF Endüstri" }
  ];
  const companyList = [
    { id: 1, name: "Firma 1" },
    { id: 2, name: "Firma 2" },
    { id: 3, name: "Firma 3" }
  ];

  // Lokasyonlar için state
  const [locations, setLocations] = useState([]);

  // Helper to get category name from categoryId and categories prop
  const getCategoryName = (categoryId, item) => {
    if (item?.category) return item.category;
    if (!categoryId || !Array.isArray(stockItems)) return "Kategori Yok";
    // Try to find category name from stockItems array
    const found = stockItems.find(i => {
      return (
        i.categoryId === categoryId ||
        i.categoryId === parseInt(categoryId) ||
        i.categoryId?.toString() === categoryId?.toString() ||
        i.category?.toString() === categoryId?.toString()
      );
    });
    if (found && found.category) return found.category;
    // Try to find categoryName or CategoryName
    if (found && (found.categoryName || found.CategoryName)) return found.categoryName || found.CategoryName;
    return "Bilinmiyor";
  };

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
      if (initialValues) {
        setForm({
          itemId: initialValues?.itemId?.toString() || initialValues?.stockItemId?.toString() || "",
          locationId: initialValues?.locationId?.toString() || "1",
          quantity: initialValues?.quantity?.toString() || "",
          unitId: initialValues?.unitId?.toString() || "",
          referenceNumber: initialValues?.referenceNumber || "",
          description: initialValues?.description || "",
          notes: initialValues?.notes || "",
          lotWidth: initialValues?.lotWidth || "",
          lotThickness: initialValues?.lotThickness || "",
          lotSupplier: initialValues?.lotSupplier || "",
          lotLabel: initialValues?.lotLabel || "",
          lotNumber: initialValues?.lotNumber || "",
          labelNumber: initialValues?.labelNumber || initialValues?.lotLabel || "",
          initialWeight: initialValues?.initialWeight || "",
          width: initialValues?.width || "",
          thickness: initialValues?.thickness || "",
          receiptDate: initialValues?.receiptDate || "",
          certificateNumber: initialValues?.certificateNumber || "",
          qualityGrade: initialValues?.qualityGrade || "",
          testResults: initialValues?.testResults || "",
          storagePosition: initialValues?.storagePosition || "",
          blockReason: initialValues?.blockReason || "",
          supplierId: initialValues?.supplierId?.toString() || "",
          companyId: initialValues?.companyId?.toString() || "",
          status: initialValues?.status || "Active",
          createdBy: Number(localStorage.getItem('userId')) || ""
        });
        const item = stockItems.find(i => i.id.toString() === (initialValues?.itemId?.toString() || initialValues?.stockItemId?.toString()));
        setSelectedItem(item || null);
      } else {
        resetForm();
        setSelectedItem(null);
      }
      fetchLocations();
      console.log('StockInModal açıldı, gelen stockItems:', stockItems);
    }
  }, [isOpen, stockItems]);

  // Lokasyonları backend'den çek
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/StockLocations", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      // Sadece aktif lokasyonlar
      const activeLocations = locationData.filter(loc => loc.isActive !== false);
      setLocations(activeLocations);
      // Eğer lokasyonlar varsa ve form.locationId boşsa, ilk aktif lokasyonu seç
      if (activeLocations.length > 0 && !form.locationId) {
        setForm(prev => ({ ...prev, locationId: activeLocations[0].id.toString() }));
      }
    } catch (error) {
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
      unitId: "",
      referenceNumber: "",
      description: "",
      notes: "",
      lotWidth: "",
      lotThickness: "",
      lotSupplier: "",
      lotLabel: "",
      lotNumber: "",
      labelNumber: "",
      initialWeight: "",
      width: "",
      thickness: "",
      receiptDate: "",
      certificateNumber: "",
      qualityGrade: "",
      testResults: "",
      storagePosition: "",
      blockReason: "",
      supplierId: "",
      companyId: "",
      status: "Active",
      createdBy: Number(localStorage.getItem('userId')) || ""
    });
    setSelectedItem(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setForm(prev => {
      let updated = { ...prev, [field]: value };
      // Eğer status değişiyorsa, isBlocked ve blockReason'u da güncelle
      if (field === "status") {
        updated.isBlocked = value === "Blocked";
        if (value !== "Blocked") {
          updated.blockReason = "";
        }
      }
      // createdBy alanı değiştirilmeye çalışılırsa, localStorage'dan güncelle
      if (field === "createdBy") {
        updated.createdBy = Number(localStorage.getItem('userId')) || "";
      }
      return updated;
    });

    if (field === "itemId") {
      const item = stockItems.find(i => i.id.toString() === value);
      setSelectedItem(item);
      if (item) {
        setForm(prev => ({ ...prev, unitPrice: item.purchasePrice?.toString() || "" }));
        // Debug: Tüm olası lot tracking property'lerini ve tiplerini göster
        console.log('Seçilen item:', item);
        console.log('HasLotTracking:', item.HasLotTracking, typeof item.HasLotTracking);
        console.log('hasLotTracking:', item.hasLotTracking, typeof item.hasLotTracking);
        console.log('lotTracking:', item.lotTracking, typeof item.lotTracking);
        console.log('has_lot_tracking:', item.has_lot_tracking, typeof item.has_lot_tracking);
        // Tüm property isimlerini de göster
        console.log('Tüm property isimleri:', Object.keys(item));
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
    if (!form.unitId) newErrors.unitId = "Birim seçimi zorunludur";
    if (!form.locationId) newErrors.locationId = "Lokasyon seçimi zorunludur";
    if (!form.supplierId) newErrors.supplierId = "Tedarikçi seçimi zorunludur";
    if (!form.companyId) newErrors.companyId = "Firma seçimi zorunludur";

    // Lot bilgileri validasyonu sadece hasLotTracking aktifse (true, 1 veya '1')
    const HasLotTracking = !!(selectedItem && (selectedItem.HasLotTracking === true || selectedItem.HasLotTracking === 1 || selectedItem.HasLotTracking === '1' || selectedItem.HasLotTracking === 'true'));
    if (HasLotTracking) {
      if (!form.initialWeight || parseFloat(form.initialWeight) <= 0) newErrors.initialWeight = "Başlangıç ağırlık zorunlu";
      if (!form.width || parseFloat(form.width) <= 0) newErrors.width = "Genişlik zorunlu";
      if (!form.thickness || parseFloat(form.thickness) <= 0) newErrors.thickness = "Kalınlık zorunlu";
      if (!form.lotNumber) newErrors.lotNumber = "Lot numarası zorunlu";
      if (!form.labelNumber) newErrors.labelNumber = "Etiket numarası zorunlu";
      if (!form.receiptDate) newErrors.receiptDate = "Geliş tarihi zorunlu";
      if (!form.storagePosition) newErrors.storagePosition = "Depo pozisyonu zorunlu";
      if (!form.certificateNumber) newErrors.certificateNumber = "Sertifika numarası zorunlu";
      if (!form.qualityGrade) newErrors.qualityGrade = "Kalite zorunlu";
      if (!form.testResults) newErrors.testResults = "Test sonucu zorunlu";
      if (form.status === "Blocked" && !form.blockReason) newErrors.blockReason = "Blokaj sebebi zorunlu";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userIdRaw = localStorage.getItem('userId');
    const userId = userIdRaw !== null && userIdRaw !== '' && !isNaN(Number(userIdRaw)) && Number(userIdRaw) !== 0 ? Number(userIdRaw) : undefined;
    try {
      const token = localStorage.getItem("token");
      const formWithUser = { ...form, createdBy: userId };
      // Sadece giriş bilgileri (lot takibi yoksa)
      const hasLotTracking = !!(selectedItem && (selectedItem.HasLotTracking === true || selectedItem.HasLotTracking === 1 || selectedItem.HasLotTracking === '1' || selectedItem.HasLotTracking === 'true'));
      const stockInData = {
        stockItemId: parseInt(formWithUser.itemId),
        locationId: parseInt(formWithUser.locationId),
        MovementType: "IN",
        quantity: parseFloat(formWithUser.quantity),
        unitId: parseInt(formWithUser.unitId),
        referenceType: "Purchase",
        referenceId: 0,
        referenceNumber: formWithUser.referenceNumber || "",
        description: formWithUser.description || "",
        notes: formWithUser.notes || "",
        movementDate: new Date().toISOString(),
        HasLotTracking: hasLotTracking
      };

      if (hasLotTracking) {
        // Lot bilgileriyle birlikte gönder
        stockInData.Width = formWithUser.lotWidth && formWithUser.lotWidth !== "" ? parseFloat(formWithUser.lotWidth) : "";
        stockInData.Thickness = formWithUser.lotThickness && formWithUser.lotThickness !== "" ? parseFloat(formWithUser.lotThickness) : "";
        stockInData.LotNumber = formWithUser.lotNumber && formWithUser.lotNumber !== "" ? formWithUser.lotNumber : "";
        stockInData.LabelNumber = formWithUser.lotLabel && formWithUser.lotLabel !== "" ? formWithUser.lotLabel : "";
        stockInData.LotSupplier = formWithUser.lotSupplier && formWithUser.lotSupplier !== "" ? formWithUser.lotSupplier : "";

        // StockLot API için lotData objesi (gerekli alanlar)
        const lotData = {
          stockItemId: parseInt(formWithUser.itemId),
          lotNumber: String(formWithUser.lotNumber),
          internalLotNumber: "INTERNAL-" + Date.now(),
          labelNumber: String(formWithUser.labelNumber),
          barcode: "BARCODE-" + Date.now(),
          initialWeight: Number(formWithUser.initialWeight),
          currentWeight: Number(formWithUser.initialWeight),
          initialLength: 1.0,
          currentLength: 1.0,
          width: Number(formWithUser.width),
          thickness: Number(formWithUser.thickness),
          supplierId: Number(formWithUser.supplierId),
          receiptDate: formWithUser.receiptDate ? String(formWithUser.receiptDate) : null,
          certificateNumber: String(formWithUser.certificateNumber),
          qualityGrade: String(formWithUser.qualityGrade),
          testResults: String(formWithUser.testResults),
          locationId: Number(formWithUser.locationId),
          storagePosition: String(formWithUser.storagePosition),
          status: formWithUser.status,
          isBlocked: formWithUser.status === "Blocked",
          blockReason: formWithUser.status === "Blocked" ? String(formWithUser.blockReason) : null,
          ...(userId !== undefined ? { createdBy: userId } : {}),
          companyId: Number(formWithUser.companyId)
        };

        // Lot alanları için required kontrolü
        let requiredFields = [
          { key: 'stockItemId', value: lotData.stockItemId },
          { key: 'status', value: lotData.status },
          { key: 'isBlocked', value: lotData.isBlocked },
          { key: 'locationId', value: lotData.locationId },
          { key: 'companyId', value: lotData.companyId },
          { key: 'supplierId', value: lotData.supplierId },
          { key: 'lotNumber', value: lotData.lotNumber },
          { key: 'initialWeight', value: lotData.initialWeight },
          { key: 'currentWeight', value: lotData.currentWeight },
          { key: 'receiptDate', value: lotData.receiptDate },
          { key: 'createdBy', value: lotData.createdBy },
        ];
        const missing = requiredFields.filter(f => {
          if (f.key === 'createdBy') {
            return f.value === undefined || f.value === null || f.value === '';
          }
          return f.value === undefined || f.value === null || f.value === '' || Number.isNaN(f.value) || f.value === 0;
        });
        if (missing.length > 0) {
          alert('Zorunlu alan(lar) eksik veya hatalı: ' + missing.map(f => f.key).join(', '));
          setLoading(false);
          return;
        }

        // Önce StockLot'a POST at
        const lotRes = await axios.post("http://localhost:5000/api/StockLot", lotData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (onSave && lotRes.data) {
          onSave(lotRes.data);
        }
      }

      // Lot takibi yoksa sadece giriş bilgileri gönderilecek
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
              {/*  
              {selectedItem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Seçilen Malzeme</h4>
                  <div className="text-sm text-blue-700">
                    <p><strong>Kod:</strong> {selectedItem.itemCode}</p>
                    <p><strong>Ad:</strong> {selectedItem.name}</p>
                    <p><strong>Kategori:</strong> {getCategoryName(selectedItem.categoryId, selectedItem)}</p>
                    <p><strong>Mevcut Stok:</strong> {selectedItem.currentStock || 0} {selectedItem.unit || 'Adet'}</p>
                    <p><strong>Alış Fiyatı:</strong> {selectedItem.purchasePrice || 0} ₺</p>
                  </div>
                </div>
              )}
                */}
            </div>
          </div>

        {/* Giriş Bilgileri */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Giriş Detayları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Miktar *</label>
              <input
                type="number"
                step="0.001"
                value={form.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="0.000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.quantity && (<p className="text-red-500 text-xs mt-1">{errors.quantity}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birim *</label>
              <select
                value={form.unitId}
                onChange={e => handleChange("unitId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.unitId ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Birim Seçiniz</option>
                {unitsLoading ? (
                  <option disabled>Yükleniyor...</option>
                ) : (
                  units && units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))
                )}
              </select>
              {errors.unitId && (<p className="text-red-500 text-xs mt-1">{errors.unitId}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi *</label>
              <select
                value={form.supplierId}
                onChange={e => handleChange("supplierId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Tedarikçi Seçiniz</option>
                {supplierList.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Firma *</label>
              <select
                value={form.companyId}
                onChange={e => handleChange("companyId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Firma Seçiniz</option>
                {companyList.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokasyon</label>
              <select
                value={form.locationId}
                onChange={(e) => handleChange("locationId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Lokasyon Seçiniz</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id.toString()}>
                    {location.code} - {location.name}
                    {location.capacity && ` (Kapasite: ${location.capacity} ${location.capacityUnit || ''})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Referans No</label>
              <input
                type="text"
                value={form.referenceNumber}
                onChange={(e) => handleChange("referenceNumber", e.target.value)}
                placeholder="Fatura No, İrsaliye No vb."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Lot Bilgileri: Sadece HasLotTracking aktifse göster */}
          {!!(selectedItem && (selectedItem.HasLotTracking === true || selectedItem.HasLotTracking === 1 || selectedItem.HasLotTracking === '1' || selectedItem.HasLotTracking === 'true')) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-4">Lot Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Ağırlık (kg) *</label>
                  <input
                    type="number"
                    value={form.initialWeight || ""}
                    onChange={e => handleChange("initialWeight", e.target.value)}
                    placeholder="Başlangıç Ağırlık (kg)"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.initialWeight ? 'border-red-500' : ''}`}
                  />
                  {errors.initialWeight && (<p className="text-red-500 text-xs mt-1">{errors.initialWeight}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (mm) *</label>
                  <input
                    type="number"
                    value={form.width || ""}
                    onChange={e => handleChange("width", e.target.value)}
                    placeholder="Genişlik (mm)"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.width ? 'border-red-500' : ''}`}
                  />
                  {errors.width && (<p className="text-red-500 text-xs mt-1">{errors.width}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalınlık (mm) *</label>
                  <input
                    type="number"
                    value={form.thickness || ""}
                    onChange={e => handleChange("thickness", e.target.value)}
                    placeholder="Kalınlık (mm)"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.thickness ? 'border-red-500' : ''}`}
                  />
                  {errors.thickness && (<p className="text-red-500 text-xs mt-1">{errors.thickness}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum *</label>
                  <select
                    value={form.status || "Active"}
                    onChange={e => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Active">Aktif</option>
                    <option value="Blocked">Bloklu</option>
                    <option value="Quarantined">Karantinada</option>
                    <option value="Reserved">Rezerve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lot No *</label>
                  <input
                    type="text"
                    value={form.lotNumber || ""}
                    onChange={e => handleChange("lotNumber", e.target.value)}
                    placeholder="Lot No"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.lotNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.lotNumber && (<p className="text-red-500 text-xs mt-1">{errors.lotNumber}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiket No *</label>
                  <input
                    type="text"
                    value={form.labelNumber || form.lotLabel || ""}
                    onChange={e => handleChange("labelNumber", e.target.value)}
                    placeholder="Etiket No"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.labelNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.labelNumber && (<p className="text-red-500 text-xs mt-1">{errors.labelNumber}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tedarikçi *</label>
                  <select
                    value={form.supplierId}
                    onChange={e => handleChange("supplierId", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.supplierId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Tedarikçi Seçiniz</option>
                    {supplierList.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                  {errors.supplierId && (<p className="text-red-500 text-xs mt-1">{errors.supplierId}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geliş Tarihi *</label>
                  <input
                    type="date"
                    value={form.receiptDate || ""}
                    onChange={e => handleChange("receiptDate", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.receiptDate ? 'border-red-500' : ''}`}
                  />
                  {errors.receiptDate && (<p className="text-red-500 text-xs mt-1">{errors.receiptDate}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo *</label>
                  <select
                    value={form.locationId}
                    onChange={e => handleChange("locationId", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.locationId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Depo Seç</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id.toString()}>{location.name}</option>
                    ))}
                  </select>
                  {errors.locationId && (<p className="text-red-500 text-xs mt-1">{errors.locationId}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Depo Pozisyonu *</label>
                  <input
                    type="text"
                    value={form.storagePosition || ""}
                    onChange={e => handleChange("storagePosition", e.target.value)}
                    placeholder="Depo Pozisyonu"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.storagePosition ? 'border-red-500' : ''}`}
                  />
                  {errors.storagePosition && (<p className="text-red-500 text-xs mt-1">{errors.storagePosition}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Firma *</label>
                  <select
                    value={form.companyId}
                    onChange={e => handleChange("companyId", e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.companyId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Firma Seçiniz</option>
                    {companyList.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                  {errors.companyId && (<p className="text-red-500 text-xs mt-1">{errors.companyId}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sertifika No *</label>
                  <input
                    type="text"
                    value={form.certificateNumber || ""}
                    onChange={e => handleChange("certificateNumber", e.target.value)}
                    placeholder="Sertifika No"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.certificateNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.certificateNumber && (<p className="text-red-500 text-xs mt-1">{errors.certificateNumber}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kalite *</label>
                  <input
                    type="text"
                    value={form.qualityGrade || ""}
                    onChange={e => handleChange("qualityGrade", e.target.value)}
                    placeholder="Kalite"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.qualityGrade ? 'border-red-500' : ''}`}
                  />
                  {errors.qualityGrade && (<p className="text-red-500 text-xs mt-1">{errors.qualityGrade}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Sonucu *</label>
                  <input
                    type="text"
                    value={form.testResults || ""}
                    onChange={e => handleChange("testResults", e.target.value)}
                    placeholder="Test Sonucu"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${errors.testResults ? 'border-red-500' : ''}`}
                  />
                  {errors.testResults && (<p className="text-red-500 text-xs mt-1">{errors.testResults}</p>)}
                </div>
                {form.status === "Blocked" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blokaj Sebebi *</label>
                    <input
                      type="text"
                      value={form.blockReason || ""}
                      onChange={e => handleChange("blockReason", e.target.value)}
                      placeholder="Blokaj sebebini giriniz"
                      className={`w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.blockReason ? 'border-red-500' : ''}`}
                    />
                    {errors.blockReason && (<p className="text-red-500 text-xs mt-1">{errors.blockReason}</p>)}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Toplam tutar kaldırıldı, birim fiyat yok */}
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
                  <span>Kaydet</span>
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