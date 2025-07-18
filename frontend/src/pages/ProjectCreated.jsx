import { Button, Checkbox, Divider, Select, Textarea, TextInput, Modal } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import 'dayjs/locale/tr';
import axios from 'axios';

const ProjectCreated = () => {
  const [hasEkYapi, setHasEkYapi] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhood, setNeighborhood] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [panelBrand, setPanelBrand] = useState([]);
  const [inverterBrand, setInverterBrand] = useState([]);

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
    createdByUserId: 1,
    projectTypeId: 1,
    address: {
      cityId: 0,
      districtId: 0,
      neighborhoodId: 0,
      ada: "",
      parsel: ""
    }
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

  useEffect(() => {
    if (!formData.address.cityId) return;
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5000/api/cities/by-districts/${formData.address.cityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setDistricts(res.data.map(i => ({ value: i.id.toString(), label: i.name })));
    }).catch(console.error);
  }, [formData.address.cityId]);

  useEffect(() => {
    if (!formData.address.districtId) return;
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5000/api/districts/by-neighborhoods/${formData.address.districtId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setNeighborhood(res.data.map(i => ({ value: i.id.toString(), label: i.name })));
    }).catch(console.error);
  }, [formData.address.districtId]);

  useEffect(() => {
    const count = parseFloat(formData.panelCount) || 0;
    const power = parseFloat(formData.panelPower) || 0;
    const dc = (count * power) / 1000;
    setFormData((prev) => ({ ...prev, dcValue: dc.toFixed(2) }));
  }, [formData.panelCount, formData.panelPower]);

  const submitProject = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Güncel dcValue hesapla ve formData'ya ekle
      const panelCount = parseFloat(formData.panelCount) || 0;
      const panelPower = parseFloat(formData.panelPower) || 0;
      const dcValue = (panelCount * panelPower) / 1000;

      const updatedFormData = {
        ...formData,
        dcValue: parseFloat(dcValue.toFixed(2)),
      };

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
        createdByUserId: 1,
        projectTypeId: null,
        address: {
          cityId: null,
          districtId: null,
          neighborhoodId: null,
          ada: "",
          parsel: ""
        }
      });

      setHasEkYapi(false);
      setDistricts([]);
      setNeighborhood([]);
    } catch (err) {
      console.error("Proje kaydı başarısız:", err);
      setShowError(true);
    } finally {
      setShowConfirm(false);
    }
  };



  const handleClickSave = () => {
    setShowConfirm(true);
  };
  
  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold  mb-6 text-ivosis-700">Proje Ekle</h2>
      <div className="border rounded-lg p-6 bg-white space-y-8 ">
        {/* GENEL BİLGİLER */}
        <h6 className="text-lg font-bold text-ivosis-700 mb-4">Genel Bilgiler</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol Sütun - Proje Adı ve Açıklama */}
          <div className="space-y-6">
            {/* Proje Adı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <TextInput
                className="w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
              />
            </div>
            {/* Açıklama */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Açıklama
              </label>
              <Textarea
                placeholder="Açıklama yazın"
                rows={2}
                className="w-full h-full"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
              />
            </div>
          </div>
          {/* Sağ Sütun - Diğer Bilgiler */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/*Başlangıç Tarihi*/}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 w-full"
                  value={formData.startDate.split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              {/* Bitiş Tarihi */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2 w-full"
                  value={formData.endDate.split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Durum */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Durum <span className="text-red-500">*</span>
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
              {/*Önem */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Önem <span className="text-red-500">*</span>
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
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Proje Türü <span className="text-red-500">*</span>
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
        <Divider />
        <h6 className="text-lg font-bold text-ivosis-700 mb-4">Konum Bilgileri</h6>
        <div className="grid grid-cols-5 gap-6 mb-6">
          {/* Şehir */}
          <div>
            <label className="text-natural-800 font-semibold block mb-1">
              Şehir <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Şehir Seçin"
              searchable
              clearable
              data={cities}
              value={formData.address?.cityId ? formData.address.cityId.toString() : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, cityId: Number(e), districtId: 0, neighborhoodId: 0 },
                })
              }
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
              data={districts}
              value={formData.address?.districtId ? formData.address.districtId.toString() : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, districtId: Number(e), neighborhoodId: 0 },
                })
              }
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
              data={neighborhood}
              value={formData.address?.neighborhoodId ? formData.address.neighborhoodId.toString() : null}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, neighborhoodId: Number(e) },
                })
              }
            />
          </div>
          {/* Ada */}
          <div>
            <label className="text-natural-800 font-semibold block mb-1">
              Ada <span className="text-red-500">*</span>
            </label>
            <TextInput
              value={formData.address.ada}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, ada: e.currentTarget.value },
                })
              }
            />
          </div>
          {/* Parsel */}
          <div>
            <label className="text-natural-800 font-semibold block mb-1">
              Parsel <span className="text-red-500">*</span>
            </label>
            <TextInput
              value={formData.address.parsel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, parsel: e.currentTarget.value },
                })
              }
            />
          </div>
        </div>
        <Divider />
        {/* TEKNİK BİLGİLER */}
        <div className="w-full space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-6">Teknik Bilgiler</h6>
          <div className="grid grid-cols-8 gap-6 mb-6">
            {/* Panel Sayısı */}
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Sayısı <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Gücü <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Markası <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                DC (kWp) <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" value={formData.dcValue} readOnly />
            </div>
            {/* İnvertör Sayısı */}
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Sayısı <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Gücü <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Markası <span className="text-red-500">*</span>
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
            <div className="col-span-1">
              <label className="text-natural-800 font-semibold block mb-1">
                AC (kWe) <span className="text-red-500">*</span>
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
        <div className="w-full md:w-1/2 space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-4">Ek Yapı Bilgileri</h6>
          {/* Checkbox */}
          <div className="mb-6">
            <Checkbox label="Ek Yapı mı?" checked={hasEkYapi} onChange={(e) => {
              const checked = e.currentTarget.checked;
              setHasEkYapi(checked);
              setFormData({ ...formData, hasAdditionalStructure: checked });
            }} />
          </div>
          {/* Grid alanlar sadece checkbox işaretliyse görünsün */}
          {hasEkYapi && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panel Sayısı */}
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
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
                <label className='text-natural-800 font-semibold block mb-1'>
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
                <label className="text-natural-800 font-semibold block mb-1">
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
        <div className="w-full flex justify-end">
          <Button className="bg-green-500 hover:!bg-green-600" onClick={handleClickSave}>
            Projeyi Kaydet
          </Button>
        </div>
      </div>
      {/* Onay Modalı */}
      <Modal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Proje Kaydetme Onayı"
        centered
      >
        <p>Projeyi kaydetmek istiyor musunuz?</p>
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="default" onClick={() => setShowConfirm(false)}>Hayır</Button>
          <Button color="green" onClick={submitProject}>Evet</Button>
        </div>
      </Modal>
      {/* Başarı Modalı */}
      <Modal
        opened={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Başarılı"
        centered
      >
        <p>Proje başarıyla kaydedildi.</p>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowSuccess(false)}>Tamam</Button>
        </div>
      </Modal>
      {/* Hata Modalı */}
      <Modal
        opened={showError}
        onClose={() => setShowError(false)}
        title="Hata"
        centered
      >
        <p>Proje kaydı sırasında bir hata oluştu.</p>
        <div className="flex justify-end mt-4">
          <Button color="red" onClick={() => setShowError(false)}>Tamam</Button>
        </div>
      </Modal>
    </div> //ana div
  );
};

export default ProjectCreated;
