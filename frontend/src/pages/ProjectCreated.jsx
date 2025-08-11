import { Button, Checkbox, Divider, Select, Textarea, TextInput, Modal, MultiSelect } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import 'dayjs/locale/tr';
import axios from 'axios';

const ProjectCreated = () => {
  const [hasEkYapi, setHasEkYapi] = useState(false);
  const [cities, setCities] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [panelBrand, setPanelBrand] = useState([]);
  const [inverterBrand, setInverterBrand] = useState([]);

  // Her adres için ayrı districts ve neighborhood state'leri
  const [addressDistricts, setAddressDistricts] = useState({});
  const [addressNeighborhoods, setAddressNeighborhoods] = useState({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    priority: "Low",
    status: "isPlanned",
    panelCount: 0,
    panelPower: 0,
    panelBrandId: 0,
    inverterCount: 0,
    inverterPower: 0,
    inverterBrandId: 0,
    hasAdditionalStructure: false,
    additionalPanelCount: 0,
    additionalPanelPower: 0,
    additionalInverterCount: 0,
    acValue: 0,
    dcValue: 0,
    CreatedBy: 1,
    projectTypeId: 1,
    address: [
      {
        cityId: 0,
        districtId: 0,
        neighborhoodId: 0,
        cityName: "",
        districtName: "",
        neighborhoodName: "",
        ada: "",
        parsel: ""
      }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [projectTypesRes, panelRes, inverterRes, citiesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/projectTypes", { headers }),
          axios.get("http://localhost:5000/api/panelBrands", { headers }),
          axios.get("http://localhost:5000/api/inverterBrands", { headers }),
          axios.get("http://localhost:5000/api/cities", { headers })
        ]);

        setProjectTypes(projectTypesRes.data.map(i => ({ value: i.id.toString(), label: i.name })));
        setPanelBrand(panelRes.data.map(i => ({ value: i.id.toString(), label: i.name })));
        setInverterBrand(inverterRes.data.map(i => ({ value: i.id.toString(), label: i.name })));
        setCities(citiesRes.data.map(i => ({ value: i.id.toString(), label: i.name })));

      } catch (err) {
        console.error("Veriler alınamadı", err);
      }
    };

    fetchData();
  }, []);

  // Belirli bir adres için ilçeleri getir
  const fetchDistricts = async (cityId, addressIndex) => {
    if (!cityId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/cities/by-districts/${cityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddressDistricts(prev => ({
        ...prev,
        [addressIndex]: res.data.map(i => ({ value: i.id.toString(), label: i.name }))
      }));
    } catch (error) {
      console.error("İlçeler alınamadı", error);
    }
  };

  // Belirli bir adres için mahalleleri getir
  const fetchNeighborhoods = async (districtId, addressIndex) => {
    if (!districtId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/districts/by-neighborhoods/${districtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddressNeighborhoods(prev => ({
        ...prev,
        [addressIndex]: res.data.map(i => ({ value: i.id.toString(), label: i.name }))
      }));
    } catch (error) {
      console.error("Mahalleler alınamadı", error);
    }
  };

  useEffect(() => {
    const count = parseFloat(formData.panelCount) || 0;
    const power = parseFloat(formData.panelPower) || 0;
    const dc = (count * power) / 1000;
    setFormData((prev) => ({ ...prev, dcValue: dc.toFixed(2) }));
  }, [formData.panelCount, formData.panelPower]);

  // Yeni adres ekleme fonksiyonu
  const addNewAddress = () => {
    setFormData({
      ...formData,
      address: [
        ...formData.address,
        {
          cityId: 0,
          districtId: 0,
          neighborhoodId: 0,
          cityName: "",
          districtName: "",
          neighborhoodName: "",
          ada: "",
          parsel: ""
        }
      ]
    });
  };

  // Adres silme fonksiyonu
  const removeAddress = (indexToRemove) => {
    if (formData.address.length > 1) {
      setFormData({
        ...formData,
        address: formData.address.filter((_, index) => index !== indexToRemove)
      });
      
      // İlgili districts ve neighborhoods state'lerini temizle
      setAddressDistricts(prev => {
        const newState = { ...prev };
        delete newState[indexToRemove];
        return newState;
      });
      
      setAddressNeighborhoods(prev => {
        const newState = { ...prev };
        delete newState[indexToRemove];
        return newState;
      });
    }
  };

  // Adres güncelleme fonksiyonu
  const updateAddress = (index, field, value) => {
    const updatedAddresses = formData.address.map((addr, i) => {
      if (i === index) {
        const updatedAddr = { ...addr, [field]: value };
        
        // Şehir değiştiğinde ilçe ve mahalleyi sıfırla
        if (field === 'cityId') {
          updatedAddr.districtId = 0;
          updatedAddr.neighborhoodId = 0;
          // Şehir adını da kaydet
          const selectedCity = cities.find(city => city.value === value.toString());
          updatedAddr.cityName = selectedCity ? selectedCity.label : '';
          updatedAddr.districtName = '';
          updatedAddr.neighborhoodName = '';
          fetchDistricts(value, index);
        }
        
        // İlçe değiştiğinde mahalleyi sıfırla
        if (field === 'districtId') {
          updatedAddr.neighborhoodId = 0;
          // İlçe adını da kaydet
          const selectedDistrict = (addressDistricts[index] || []).find(district => district.value === value.toString());
          updatedAddr.districtName = selectedDistrict ? selectedDistrict.label : '';
          updatedAddr.neighborhoodName = '';
          fetchNeighborhoods(value, index);
        }
        
        // Mahalle değiştiğinde mahalle adını kaydet
        if (field === 'neighborhoodId') {
          const selectedNeighborhood = (addressNeighborhoods[index] || []).find(neighborhood => neighborhood.value === value.toString());
          updatedAddr.neighborhoodName = selectedNeighborhood ? selectedNeighborhood.label : '';
        }
        
        return updatedAddr;
      }
      return addr;
    });
    
    setFormData({ ...formData, address: updatedAddresses });
  };

  const submitProject = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Güncel dcValue hesapla ve formData'ya ekle
      const panelCount = parseFloat(formData.panelCount) || 0;
      const panelPower = parseFloat(formData.panelPower) || 0;
      const dcValue = (panelCount * panelPower) / 1000;

      // Adres verilerini temizle - Backend name alanları istiyor
      const cleanedAddresses = formData.address.map(addr => ({
        cityId: addr.cityId || null,
        districtId: addr.districtId || null,
        neighborhoodId: addr.neighborhoodId || null,
        cityName: addr.cityName || "",
        districtName: addr.districtName || "",
        neighborhoodName: addr.neighborhoodName || "",
        ada: addr.ada || "",
        parsel: addr.parsel || ""
      }));

      // Backend çoklu adres destekliyor - orijinal format
      const updatedFormData = {
        ...formData,
        dcValue: parseFloat(dcValue.toFixed(2)),
        address: cleanedAddresses
      };

      // 🔍 Gönderilecek veriyi kontrol et
      console.log("Gönderilecek veri:", JSON.stringify(updatedFormData, null, 2));
      console.log("Address verisi:", updatedFormData.address);

      await axios.post("http://localhost:5000/api/projects", updatedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccess(true);

      // ✅ Formu sıfırla
      setFormData({
        name: "",
        description: "",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        priority: "Low",
        status: "isPlanned",
        panelCount: 0,
        panelPower: 0,
        panelBrandId: null,
        inverterCount: 0,
        inverterPower: 0,
        inverterBrandId: null,
        hasAdditionalStructure: false,
        additionalPanelCount: 0,
        additionalPanelPower: 0,
        additionalInverterCount: 0,
        acValue: 0,
        dcValue: 0,
        CreatedBy: 1,
        projectTypeId: null,
        address: [
          {
            cityId: 0,
            districtId: 0,
            neighborhoodId: 0,
            cityName: "",
            districtName: "",
            neighborhoodName: "",
            ada: "",
            parsel: ""
          }
        ]
      });

      setHasEkYapi(false);
      setAddressDistricts({});
      setAddressNeighborhoods({});
    } catch (err) {
      console.error("Proje kaydı başarısız:", err);
      
      // Backend'den gelen hata mesajını göster
      if (err.response && err.response.data) {
        console.error("Backend hatası:", err.response.data);
      }
      
      setShowError(true);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleClickSave = () => {
    setShowConfirm(true);
  };
  
  return (
    <div className="py-4 px-4 sm:py-6 sm:px-6 max-w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-ivosis-700">Proje Ekle</h2>
      <div className="border rounded-lg p-4 sm:p-6 bg-white space-y-6 sm:space-y-8">
        
        {/* GENEL BİLGİLER */}
        <div className="space-y-4">
          <h6 className="text-base sm:text-lg font-bold text-ivosis-700">Genel Bilgiler</h6>
          
          {/* Responsive Grid - Mobilde tek sütun, tablette/masaüstünde iki sütun */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sol Sütun - Proje Adı ve Açıklama */}
            <div className="space-y-4 sm:space-y-6">
              {/* Proje Adı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                  <span className="text-red-500">*</span> Proje Adı 
                </label>
                <TextInput
                  className="w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                />
              </div>
              
              {/* Açıklama */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                  Açıklama
                </label>
                <Textarea
                  placeholder="Açıklama yazın"
                  rows={2}
                  className="w-full"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                />
              </div>
            </div>
            
            {/* Sağ Sütun - Diğer Bilgiler */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Tarih Alanları - Mobilde dikey, tablette yatay */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Başlangıç Tarihi */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                    <span className="text-red-500">*</span> Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-3 py-2 w-full text-sm sm:text-base"
                    value={formData.startDate.split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                
                {/* Bitiş Tarihi */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                    <span className="text-red-500">*</span> Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    className="border rounded-md px-3 py-2 w-full text-sm sm:text-base"
                    value={formData.endDate.split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
                {/* Proje Tipi */}
               <div>
  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
    <span className="text-red-500">*</span> Proje Tipi
  </label>
  <MultiSelect
    
    searchable
    clearable
    className="w-full"
    data={[
      { value: "arazi", label: "Arazi" },
      { value: "cati", label: "Çatı" },
      { value: "cephe", label: "Cephe" },
    ]}
    value={formData.projectTypes || []} // çoklu seçim için array
    onChange={(e) => setFormData({ ...formData, projectTypes: e })}
  />
</div>
              </div>

              {/* Select Alanları - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Durum */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                    <span className="text-red-500">*</span> Durum
                  </label>
                  <Select
                    placeholder="Durum Seçin"
                    searchable
                    clearable
                    className="w-full"
                    data={[
                      { value: "isPlanned", label: "Planlanıyor" },
                      { value: "ToDo", label: "Yapılıyor" },
                      { value: "Done", label: "Tamamlandı" },
                      { value: "Canceled", label: "İptal" }
                    ]}
                    value={formData.status ? formData.status.toString() : null}
                    onChange={(e) => setFormData({ ...formData, status: e })}
                  />
                </div>
                
                {/* Önem */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                    <span className="text-red-500">*</span> Önem
                  </label>
                  <Select
                    placeholder="Önem Seçin"
                    searchable
                    clearable
                    className="w-full"
                    data={[
                      { value: "Low", label: "Düşük" },
                      { value: "Medium", label: "Orta" },
                      { value: "High", label: "Yüksek" },
                      { value: "Critical", label: "Kritik" }
                    ]}
                    value={formData.priority ? formData.priority.toString() : null}
                    onChange={(e) => setFormData({ ...formData, priority: e })}
                  />
                </div>
                
                {/* Proje Türü */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                    <span className="text-red-500">*</span> Proje Türü 
                  </label>
                  <Select
                    placeholder="Proje Türü Seçin"
                    searchable
                    clearable
                    className="w-full"
                    data={projectTypes}
                    value={formData.projectTypeId ? formData.projectTypeId.toString() : null}
                    onChange={(e) => setFormData({ ...formData, projectTypeId: Number(e) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Divider />
        
        {/* KONUM BİLGİLERİ - Çoklu Adres Desteği */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h6 className="text-base sm:text-lg font-bold text-ivosis-700">Konum Bilgileri</h6>
            <Button 
              size="sm" 
              className="bg-ivosis-500 hover:!bg-ivosis-600 self-start sm:self-auto"
              onClick={addNewAddress}
            >
              + Adres Ekle
            </Button>
          </div>
          
          {/* Adres Listesi */}
          {formData.address.map((address, index) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center">
                <h6 className="text-sm sm:text-md font-semibold text-ivosis-700">
                  Adres {index + 1}
                </h6>
                {formData.address.length > 1 && (
                  <Button 
                    size="xs" 
                    color="red" 
                    variant="outline"
                    onClick={() => removeAddress(index)}
                  >
                    Sil
                  </Button>
                )}
              </div>
              
              {/* Responsive Grid - Mobilde 1 sütun, tablette 2 sütun, masaüstünde 5 sütun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                {/* Şehir */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm">
                    <span className="text-red-500">*</span> Şehir 
                  </label>
                  <Select
                    placeholder="Şehir Seçin"
                    searchable
                    clearable
                    data={cities}
                    value={address.cityId ? address.cityId.toString() : null}
                    onChange={(value) => updateAddress(index, 'cityId', Number(value))}
                  />
                </div>
                
                {/* İlçe */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm">
                    <span className="text-red-500">*</span> İlçe
                  </label>
                  <Select
                    placeholder="İlçe Seçin"
                    searchable
                    clearable
                    data={addressDistricts[index] || []}
                    value={address.districtId ? address.districtId.toString() : null}
                    onChange={(value) => updateAddress(index, 'districtId', Number(value))}
                  />
                </div>
                
                {/* Mahalle */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm">
                    <span className="text-red-500">*</span> Mahalle
                  </label>
                  <Select
                    placeholder="Mahalle Seçin"
                    searchable
                    clearable
                    data={addressNeighborhoods[index] || []}
                    value={address.neighborhoodId ? address.neighborhoodId.toString() : null}
                    onChange={(value) => updateAddress(index, 'neighborhoodId', Number(value))}
                  />
                </div>
                
                {/* Ada */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm">
                    <span className="text-red-500">*</span> Ada 
                  </label>
                  <TextInput
                    value={address.ada}
                    onChange={(e) => updateAddress(index, 'ada', e.currentTarget.value)}
                  />
                </div>
                
                {/* Parsel */}
                <div>
                  <label className="text-natural-800 font-semibold block mb-1 text-sm">
                    <span className="text-red-500">*</span> Parsel 
                  </label>
                  <TextInput
                    value={address.parsel}
                    onChange={(e) => updateAddress(index, 'parsel', e.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                <div>
                  <label className='text-natural-800 font-semibold block mb-1 text-sm'>
                    <span className='text-red-500'>*</span> Adres
                  </label>
                  <Textarea
                    className='w-96'
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Divider />
        
        {/* TEKNİK BİLGİLER */}
        <div className="space-y-4 sm:space-y-6">
          <h6 className="text-base sm:text-lg font-bold text-ivosis-700">Teknik Bilgiler</h6>
          
          {/* Responsive Grid - Teknik bilgiler için özel düzenleme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-6">
            
            {/* Panel Sayısı */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> Panel Sayısı 
              </label>
              <TextInput
                className="w-full"
                value={formData.panelCount}
                onChange={(e) =>
                  setFormData({ ...formData, panelCount: e.currentTarget.value })
                }
              />
            </div>
            
            {/* Panel Gücü */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> Panel Gücü 
              </label>
              <TextInput
                className="w-full"
                value={formData.panelPower}
                onChange={(e) =>
                  setFormData({ ...formData, panelPower: e.currentTarget.value })
                }
              />
            </div>
            
            {/* Panel Markası */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> Panel Markası 
              </label>
              <Select
                placeholder="Panel Markası Seçin"
                searchable
                clearable
                className="w-full"
                data={panelBrand}
                value={formData.panelBrandId ? formData.panelBrandId.toString() : null}
                onChange={(e) =>
                  setFormData({ ...formData, panelBrandId: Number(e) })
                }
              />
            </div>
            
            {/* DC (kWp) */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
               <span className="text-red-500">*</span> DC (kWp) 
              </label>
              <TextInput className="w-full" value={formData.dcValue} readOnly />
            </div>
            
            {/* İnvertör Sayısı */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                 <span className="text-red-500">*</span> İnvertör Sayısı
              </label>
              <TextInput
                className="w-full"
                value={formData.inverterCount}
                onChange={(e) =>
                  setFormData({ ...formData, inverterCount: e.currentTarget.value })
                }
              />
            </div>
            
            {/* İnvertör Gücü */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> İnvertör Gücü 
              </label>
              <TextInput
                className="w-full"
                value={formData.inverterPower}
                onChange={(e) =>
                  setFormData({ ...formData, inverterPower: e.currentTarget.value })
                }
              />
            </div>
            
            {/* İnvertör Markası */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> İnvertör Markası 
              </label>
              <Select
                placeholder="İnvertör Markası Seçin"
                searchable
                clearable
                className="w-full"
                data={inverterBrand}
                value={formData.inverterBrandId ? formData.inverterBrandId.toString() : null}
                onChange={(e) =>
                  setFormData({ ...formData, inverterBrandId: Number(e) })
                }
              />
            </div>
            
            {/* AC (kWe) */}
            <div className="sm:col-span-1">
              <label className="text-natural-800 font-semibold block mb-1 text-sm">
                <span className="text-red-500">*</span> AC (kWe) 
              </label>
              <TextInput
                className="w-full"
                value={formData.acValue}
                onChange={(e) =>
                  setFormData({ ...formData, acValue: e.currentTarget.value })
                }
              />
            </div>
          </div>
        </div>
        
        <Divider />
        
        {/* EK YAPI BİLGİLERİ */}
        <div className="space-y-4 sm:space-y-6">
          <h6 className="text-base sm:text-lg font-bold text-ivosis-700">Ek Yapı Bilgileri</h6>
          
          {/* Checkbox */}
          <div className="mb-4 sm:mb-6">
            <Checkbox 
              label="Ek Yapı mı?" 
              checked={hasEkYapi} 
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setHasEkYapi(checked);
                setFormData({ ...formData, hasAdditionalStructure: checked });
              }} 
            />
          </div>
          
          {/* Grid alanlar sadece checkbox işaretliyse görünsün */}
          {hasEkYapi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Panel Sayısı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                  Panel Sayısı <span className="text-red-500">*</span>
                </label>
                <TextInput
                  className="w-full"
                  value={formData.additionalPanelCount}
                  onChange={(e) => setFormData({ ...formData, additionalPanelCount: Number(e.currentTarget.value) })}
                />
              </div>
              
              {/* Panel Gücü */}
              <div>
                <label className='text-natural-800 font-semibold block mb-1 text-sm sm:text-base'>
                  Panel Gücü <span className='text-red-500'>*</span>
                </label>
                <TextInput
                  className='w-full'
                  value={formData.additionalPanelPower}
                  onChange={(e) => setFormData({ ...formData, additionalPanelPower: Number(e.currentTarget.value) })}
                />
              </div>
              
              {/* İnvertör Sayısı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1 text-sm sm:text-base">
                  İnvertör Sayısı <span className="text-red-500">*</span>
                </label>
                <TextInput
                  className="w-full"
                  value={formData.additionalInverterCount}
                  onChange={(e) => setFormData({ ...formData, additionalInverterCount: Number(e.currentTarget.value) })}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* KAYDET BUTONU */}
        <div className="w-full flex justify-center sm:justify-end pt-4">
          <Button 
            className="bg-ivosis-500 hover:!bg-ivosis-600 w-full sm:w-auto px-8" 
            onClick={handleClickSave}
          >
            Kaydet
          </Button>
        </div>
      </div>
      
      {/* Onay Modalı */}
      <Modal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Proje Kaydetme Onayı"
        centered
        size="sm"
      >
        <p className="text-sm sm:text-base">Projeyi kaydetmek istiyor musunuz?</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4">
          <Button 
            variant="default" 
            onClick={() => setShowConfirm(false)}
            className="w-full sm:w-auto"
          >
            Hayır
          </Button>
          <Button 
            color="green" 
            onClick={submitProject}
            className="w-full sm:w-auto"
          >
            Evet
          </Button>
        </div>
      </Modal>
      
      {/* Başarı Modalı */}
      <Modal
        opened={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Başarılı"
        centered
        size="sm"
      >
        <p className="text-sm sm:text-base">Proje başarıyla kaydedildi.</p>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => setShowSuccess(false)}
            className="w-full sm:w-auto"
          >
            Tamam
          </Button>
        </div>
      </Modal>
      
      {/* Hata Modalı */}
      <Modal
        opened={showError}
        onClose={() => setShowError(false)}
        title="Hata"
        centered
        size="sm"
      >
        <p className="text-sm sm:text-base">Proje kaydı sırasında bir hata oluştu.</p>
        <div className="flex justify-end mt-4">
          <Button 
            color="red" 
            onClick={() => setShowError(false)}
            className="w-full sm:w-auto"
          >
            Tamam
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectCreated;