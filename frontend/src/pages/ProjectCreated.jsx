import { Button, Checkbox, Divider, Select, Textarea, TextInput } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import 'dayjs/locale/tr';
import axios from 'axios';


const ProjectCreate = () => {
  const [hasEkYapi, setHasEkYapi] = useState(false);

   const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "",
    status: "",
    panelCount: 0,
    panelPower: 0,
    panelBrandId: 1,
    inverterCount: 0,
    inverterPower: 0,
    inverterBrandId: 1,
    hasAdditionalStructure: true,
    additionalPanelCount: 0,
    additionalInverterCount: 0,
    acValue: 0,
    dcValue: 0,
    cityId: 1,
    districtId: 1,
    neighborhoodId: 1,
    ada: "",
    parsel: "",
    projectTypeId: 1,
    createdAt: new Date().toISOString(),
    createdByUserId: 1,
    updatedAt: null,
    updatedByUserId: 0
  });

const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/projects", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Proje kaydedildi:", response.data);
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const citiesOptions =[
    {value: "1", label: "Şanlıurfa"},
    {value: "2", label: "Sakarya"},
    {value: "3", label: "İstanbul"}
  ]
  
  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold  mb-6 text-ivosis-700">Proje Ekle</h2>
      <div className="border rounded-lg p-6 bg-white space-y-8 ">

        {/* GENEL BİLGİLER */}
        <div>
          <h6 className="text-lg font-bold text-ivosis-700 mb-4">Genel Bilgiler</h6>
          <div className="w-full md:w-1/2 space-y-6">

            {/* Proje Adı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.name} onChange={(e) => setFormData({...formData, name:e.currentTarget.value})}/>
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Açıklama
              </label>
              <Textarea placeholder="Açıklama yazın" rows={4} className="w-full"  value={formData.description} onChange={(e) => setFormData({...formData, description:e.currentTarget.value})}/>
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input type="date" className="border rounded-md px-3 py-2 w-full" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate:e.currentTarget.value})}/>
              </div>

              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input type="date" className="border rounded-md px-3 py-2 w-full" value={formData.endDate} onChange={(e) => setFormData({...formData,endDate:e.currentTarget.value})}/>
              </div>
            </div>

            {/* Şehir - Durum - Önem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Durum <span className="text-red-500">*</span>
                </label>
                <Select 
                  placeholder="Durum Seçin" 
                  searchable 
                  clearable 
                  className="w-full" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status:e})}
                  data={[
    { value: "Şanlıurfa", label: "Şanlıurfa" },
    { value: "Sakarya", label: "Sakarya" },
    { value: "İstanbul", label: "İstanbul" },
  ]}/>
              </div>

              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Önem <span className="text-red-500">*</span>
                </label>
                <Select 
                  placeholder="Önem Seçin" 
                  searchable 
                  clearable 
                  className="w-full" 
                  value={formData.priority} 
                  onChange={(e) => setFormData({...formData, priority:e})}
                  data={[
    { value: "low", label: "Düşük" },
    { value: "medium", label: "Orta" },
    { value: "high", label: "Yüksek" },
  ]}/>
              </div>
            </div>

          </div>
        </div>

        <Divider />

        {/* KONUM BİLGİLERİ */}
        <div className="w-full md:w-1/2 space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-6">Konum Bilgileri</h6>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Şehir */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Şehir <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Şehir Seçin"
                searchable
                clearable
                className="w-full"
                
              />
            </div>

            {/* İlçe */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İlçe <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="İlçe Seçin"
                searchable
                clearable
                className="w-full"
                value={formData.districtId}
                onChange={(e) => setFormData({...formData,districtId:e ? Number(e) : null})}
                data={[
   { value: "1", label: "Düşük" },
  { value: "2", label: "Orta" },
  { value: "3", label: "Yüksek" },
  ]}
              />
            </div>

            {/* Mahalle */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Mahalle <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Mahalle Seçin"
                searchable
                clearable
                className="w-full"
                value={formData.neighborhoodId}
                onChange={(e) => setFormData({...formData,neighborhoodId:e ? Number(e) : null})}
                data={[
    { value: "1", label: "Düşük" },
  { value: "2", label: "Orta" },
  { value: "3", label: "Yüksek" },
  ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ada */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Ada <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.ada} onChange={(e) => setFormData({...formData,ada:e.currentTarget.value})}/>
            </div>

            {/* Parsel */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Parsel <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.parsel} onChange={(e) => setFormData({...formData,parsel:e.currentTarget.value})}/>
            </div>
          </div>
        </div>


        <Divider />

        {/* TEKNİK BİLGİLER */}
        <div className="w-full md:w-1/2 space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-6">Teknik Bilgiler</h6>

          {/* Satır 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Panel Sayısı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Sayısı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.panelCount} onChange={(e) => setFormData({...formData,panelCount:e.currentTarget.value})}/>
            </div>

            {/* Panel Gücü */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Gücü <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.panelPower} onChange={(e) => setFormData({...formData,panelPower:e.currentTarget.value})}/>
            </div>

            {/* Panel Markası */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Markası <span className="text-red-500">*</span>
              </label>
              <Select 
                placeholder="Marka Seçin" 
                searchable 
                clearable 
                className="w-full" 
                value={formData.panelBrandId} 
                onChange={(e) => setFormData({...formData,panelBrandId:e ? Number(e) : null})}
                data={[
    { value: "1", label: "Düşük" },
  { value: "2", label: "Orta" },
  { value: "3", label: "Yüksek" },
  ]}/>
            </div>

            {/* DC (kWp) */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                DC (kWp) <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.dcValue} onChange={(e) => setFormData({...formData,dcValue:e.currentTarget.value})}/>
            </div>
          </div>

          {/* Satır 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* İnvertör Sayısı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Sayısı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.inverterCount} onChange={(e) => setFormData({...formData,inverterCount:e.currentTarget.value})}/>
            </div>

            {/* İnvertör Gücü */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Gücü <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.inverterPower} onChange={(e) => setFormData({...formData, inverterPower:e.currentTarget.value})}/>
            </div>

            {/* İnvertör Markası */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Markası <span className="text-red-500">*</span>
              </label>
              <Select 
                placeholder="Marka Seçin" 
                searchable 
                clearable 
                className="w-full" 
                value={formData.inverterBrandId} 
                onChange={(e) => setFormData({...formData,inverterBrandId: e ? Number(e) : null})}
                data={[
                  { value: "1", label: "Düşük" },
  { value: "2", label: "Orta" },
  { value: "3", label: "Yüksek" },
  ]}/>
            </div>

            {/* AC (kWe) */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                AC (kWe) <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.acValue} onChange={(e) => setFormData({...formData,acValue:e.currentTarget.value})}/>
            </div>
          </div>
        </div>


        <Divider />

        {/* EK YAPI BİLGİLERİ */}
        <div className="w-full md:w-1/2 space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-4">Ek Yapı Bilgileri</h6>

          {/* Checkbox */}
          <div className="mb-6">
            <Checkbox
              label="Ek Yapı mı?"
              className="font-semibold"
              checked={hasEkYapi}
              onChange={(event) => setHasEkYapi(event.currentTarget.checked)}
            />
          </div>

          {/* Grid alanlar sadece checkbox işaretliyse görünsün */}
          {hasEkYapi && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panel Sayısı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Panel Sayısı <span className="text-red-500">*</span>
                </label>
                <TextInput className="w-full" />
              </div>

              {/* Panel Gücü */}
              <div>
                <label className='text-natural-800 font-semibold block mb-1'>
                  Panel Gücü <span className='text-red-500'>*</span>
                </label>
                <TextInput className='w-full' />
              </div>

              {/* İnvertör Sayısı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  İnvertör Sayısı <span className="text-red-500">*</span>
                </label>
                <TextInput className="w-full" />
              </div>
            </div>
          )}
        </div>


        {/* SUBMIT BUTTON */}
        <div className="-full md:w-1/2 space-y-6 text-center">
          <Button className="bg-green-500 hover:!bg-green-500" onClick={handleSubmit}>Projeyi Kaydet</Button>
        </div>
      </div>

    </div> //ana div
  );
};

export default ProjectCreate;
