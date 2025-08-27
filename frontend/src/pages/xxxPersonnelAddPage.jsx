import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import { 
  IconUserPlus, 
  IconUser, 
  IconBuilding, 
  IconId, 
  IconMapPin, 
  IconPhone,
  IconCheck,
  IconAlertCircle,
  IconCamera,
  IconUpload,
  IconX
} from "@tabler/icons-react";

const PersonnelAddPage = () => {
  const [form, setForm] = useState({
    sicilNo: "",
    name: "",
    surname: "",
    title: "",
    badge: "",
    department: "",
    section: "",
    startDate: "",
    birthPlace: "",
    birthDate: "",
    tcKimlikNo: "",
    educationLevel: "",
    gender: "",
    nationality: "Türk",
    city: "",
    district: "",
    address: "",
    mobilePhone: "",
    email: "",
    salary: "",
    iban: "",
    photo: "",
    workStatus: "Aktif",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "file"

  const token = localStorage.getItem("token");

  const tabs = [
    {
      id: 0,
      title: "Temel Bilgiler",
      icon: IconUser,
      required: ["sicilNo", "name", "surname"],
    },
    {
      id: 1,
      title: "Organizasyon",
      icon: IconBuilding,
      required: [],
    },
    {
      id: 2,
      title: "Kişisel Bilgiler",
      icon: IconId,
      required: [],
    },
    {
      id: 3,
      title: "Adres Bilgileri",
      icon: IconMapPin,
      required: [],
    },
    {
      id: 4,
      title: "İletişim & Mali",
      icon: IconPhone,
      required: [],
    }
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    if (success && typeof success === 'string' && success.length > 0) {
      setSuccess("");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError("Lütfen geçerli bir resim dosyası seçiniz.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setPreviewImage(base64);
        setForm((prev) => ({ ...prev, photo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setForm((prev) => ({ ...prev, photo: url }));
    if (url) {
      setPreviewImage(url);
    } else {
      setPreviewImage(null);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setForm((prev) => ({ ...prev, photo: "" }));
  };

  const validateCurrentTab = () => {
    const currentTab = tabs[activeTab];
    const missingFields = currentTab.required.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Lütfen zorunlu alanları doldurunuz: ${missingFields.join(", ")}`);
      return false;
    }

    // Additional validations
    if (activeTab === 2) {
      if (form.tcKimlikNo && form.tcKimlikNo.length !== 11) {
        setError("TC Kimlik No 11 haneli olmalıdır.");
        return false;
      }
    }

    if (activeTab === 4) {
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
        setError("Geçerli bir e-posta adresi giriniz.");
        return false;
      }
      if (form.iban && form.iban.length > 26) {
        setError("IBAN en fazla 26 karakter olabilir.");
        return false;
      }
    }

    return true;
  };

  const handleNextTab = () => {
  setCompletedTabs(prev => new Set([...prev, activeTab]));
  if (activeTab < tabs.length - 1) {
    setActiveTab(prev => prev + 1);
  }
  setError("");
};

  const handleTabClick = (tabIndex) => {
    if (tabIndex <= activeTab || completedTabs.has(tabIndex)) {
      setActiveTab(tabIndex);
      setError("");
      if (success && typeof success === 'string' && success.length > 0) {
        setSuccess("");
      }
    }
  };

  const canSubmit = () => {
  const requiredFields = ["sicilNo", "name", "surname"];
  const missingFields = requiredFields.filter(field => !form[field]);
  return activeTab === tabs.length - 1 && missingFields.length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (loading) return;

    // Validate all required fields
    const requiredFields = ["sicilNo", "name", "surname"];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Lütfen zorunlu alanları doldurunuz: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const formData = {
        ...form,
        email: form.email?.trim() || null,
        salary: form.salary ? parseFloat(form.salary) : null,
        startDate: form.startDate || null,
        birthDate: form.birthDate || null,
      };

      const response = await axios.post("http://localhost:5000/api/personnel", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let successMessage = "Personel başarıyla eklendi.";
      if (response.data) {
        if (typeof response.data === 'string') {
          successMessage = response.data;
        } else if (response.data.message && typeof response.data.message === 'string') {
          successMessage = response.data.message;
        } else if (response.data.success && typeof response.data.success === 'string') {
          successMessage = response.data.success;
        }
      }

      setSuccess(String(successMessage));
      
      // Reset form
      setForm({
        sicilNo: "",
        name: "",
        surname: "",
        title: "",
        badge: "",
        department: "",
        section: "",
        startDate: "",
        birthPlace: "",
        birthDate: "",
        tcKimlikNo: "",
        educationLevel: "",
        gender: "",
        nationality: "Türk", 
        city: "",
        district: "",
        address: "",
        mobilePhone: "",
        email: "",
        salary: "",
        iban: "",
        photo: "",
        workStatus: "Aktif",
      });
      
      setActiveTab(0);
      setCompletedTabs(new Set());
      setPreviewImage(null);

      setTimeout(() => {
        setSuccess("");
      }, 5000);
      
    } catch (err) {
      console.error(err);
      let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message && typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error && typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        }
      }
      
      setError(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Temel Bilgiler
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Sicil No 
                  </label>
                  <input
                    type="text"
                    value={form.sicilNo}
                    onChange={(e) => handleChange("sicilNo", e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                    placeholder="Sicil numarasını giriniz"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-red-500">*</span> Ad 
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                      placeholder="Adını giriniz"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="text-red-500">*</span> Soyad
                    </label>
                    <input
                      type="text"
                      value={form.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                      placeholder="Soyadını giriniz"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                    placeholder="Ünvanını giriniz"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Yaka
                    </label>
                    <select
                      value={form.badge}
                      onChange={(e) => handleChange("badge", e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                    >
                      <option value="">Seçiniz</option>
                      <option value="BY">Beyaz Yaka</option>
                      <option value="MY">Mavi Yaka</option>
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cinsiyet
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
      {/* Fotoğraf Yükleme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fotoğraf</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Önizleme Kutusu */}
      <div className="w-full bg-gray-50 rounded-2xl p-4 text-center shadow-sm">
        <div className="w-40 h-60 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center mx-auto">
        {previewImage || form.photo ? (
          <img
            src={previewImage || form.photo}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => {
              setPreviewImage(null);
              setForm(prev => ({ ...prev, photo: "" }));
            }}
          />
        ) : (
          <IconUser size={48} className="text-gray-400" />
        )}
      </div>
        <h3 className="text font-bold text-gray-800">
          {form.name || "Ad"} {form.surname || "Soyad"}
        </h3>
        <p className="text-gray-600">{form.title || "Ünvan"}</p>
        <p className="text-sm text-gray-500">Sicil No: {form.sicilNo || "000"}</p>
      </div>
    </div>
    </div>
  </div>
);
           

      case 1: // Organizasyon Bilgileri
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firma
                </label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                >
                  <option value="">Firma Seçiniz</option>
                  <option value="Üretim">Üretim</option>
                  <option value="Enerji">Enerji</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departman
                </label>
                <select
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                >
                  <option value="">Departman Seçiniz</option>
                  <option value="Çelik">Çelik</option>
                  <option value="Enerji">Enerji</option>
                  <option value="Satış Pazarlama">Satış Pazarlama</option>
                  <option value="İnsan Kayakları">İnsan Kayakları</option>
                  <option value="Sevkiyat">Sevkiyat</option>
                  <option value="Satınalma">Satınalma</option>
                  <option value="İdari İşler">İdari İşler</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İşe Giriş Tarihi
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Çalışma Durumu
                </label>
                <select
                  value={form.workStatus}
                  onChange={(e) => handleChange("workStatus", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2: // Kişisel Bilgiler
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={form.tcKimlikNo}
                  onChange={(e) => handleChange("tcKimlikNo", e.target.value)}
                  maxLength="11"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="11 haneli TC Kimlik No"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Doğum Yeri
                </label>
                <input
                  type="text"
                  value={form.birthPlace}
                  onChange={(e) => handleChange("birthPlace", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="Doğum yerini giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uyruk
                </label>
                <select
                  value={form.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                >
                  <option value="TC">TC</option>
                  <option value="SRY">SRY</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div className="relative lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Öğrenim Durumu
                </label>
                <select
                  value={form.educationLevel}
                  onChange={(e) => handleChange("educationLevel", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                >
                  <option value="">Seçiniz</option>
                  <option value="İLKOKUL">İlkokul</option>
                  <option value="ORTAOKUL">Ortaokul</option>
                  <option value="LİSE">Lise</option>
                  <option value="ÖNLİSANS">Ön Lisans</option>
                  <option value="LİSANS">Lisans</option>
                  <option value="YÜKSEK LİSANS">Yüksek Lisans</option>
                  <option value="DOKTORA">Doktora</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3: // Adres Bilgileri
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İl
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="İl adını giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İlçe
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="İlçe adını giriniz"
                />
              </div>

              <div className="relative lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adres Detayı
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="4"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text"
                  placeholder="Detaylı adres bilgilerini giriniz..."
                />
              </div>
            </div>
          </div>
        );

      case 4: // İletişim ve Mali Bilgiler
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cep Telefonu
                </label>
                <input
                  type="tel"
                  value={form.mobilePhone}
                  maxLength="11"
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="0555 123 45 67"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maaş (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="0.00"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={form.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                  maxLength="26"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                  placeholder="TR00 0000 0000 0000 0000 00"
                />
              </div>
            </div>
          </div>
        );

      case 5: // Fotoğraf
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text font-semibold text-gray-800 mb-2">Personel Fotoğrafı</h3>
              <p className="text-gray-600">Personel için profil fotoğrafı ekleyebilirsiniz</p>
            </div>

            {/* Upload Method Selection */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    uploadMethod === "url" 
                      ? "bg-white shadow-sm text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  URL ile Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    uploadMethod === "file" 
                      ? "bg-white shadow-sm text-blue-600 font-medium" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Dosya Yükle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="space-y-4">
                {uploadMethod === "url" ? (
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fotoğraf URL
                    </label>
                    <input
                      type="url"
                      value={form.photo}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fotoğraf Dosyası
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <IconUpload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Fotoğraf yüklemek için tıklayın</p>
                        <p className="text-sm text-gray-500">PNG, JPG, JPEG (Maks. 5MB)</p>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Section */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-xs">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="relative">
                      {previewImage || form.photo ? (
                        <div className="relative">
                          <img
                            src={previewImage || form.photo}
                            alt="Preview"
                            className="w-48 h-48 object-cover rounded-xl mx-auto"
                            onError={() => {
                              setPreviewImage(null);
                              setForm(prev => ({ ...prev, photo: "" }));
                            }}
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                          >
                            <IconX size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center">
                          <div className="text-center">
                            <IconCamera size={48} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Fotoğraf Önizleme</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <h4 className="font-semibold text-gray-800">
                        {form.name || "Ad"} {form.surname || "Soyad"}
                      </h4>
                      <p className="text-gray-600 text-sm">{form.title || "Ünvan"}</p>
                      <p className="text-gray-500 text-xs mt-1">Sicil: {form.sicilNo || "000"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header 
        title="İnsan Kaynakları Yönetimi"
        subtitle="Yeni Personel Kaydı"
        icon={IconUserPlus}
      />

      {/* Progress Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === index;
              const isCompleted = completedTabs.has(index);
              const isAccessible = index <= activeTab || completedTabs.has(index);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(index)}
                  disabled={!isAccessible}
                  className={`
                    flex-shrink-0 min-w-[200px] px-6 py-4 flex items-center justify-center space-x-3 border-b-4 transition-all duration-300
                    ${isActive 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700' 
                      : isCompleted
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100'
                      : isAccessible
                      ? 'border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                      : 'border-transparent bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : isCompleted
                      ? 'bg-green-500 text-white shadow-lg'
                      : isAccessible
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    {isCompleted ? <IconCheck size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{tab.title}</div>
                    {tab.required.length > 0 && (
                      <div className="text-xs opacity-75">
                        <span className="text-red-500">*</span> {tab.required.length} zorunlu alan
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-8">
        {/* Alert Messages */}
        {error && typeof error === 'string' && error.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <IconAlertCircle className="text-red-400 mr-3 flex-shrink-0" size={24} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && typeof success === 'string' && success.length > 0 && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl shadow-sm">
            <div className="flex items-center">
              <IconCheck className="text-green-400 mr-3 flex-shrink-0" size={24} />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        <form className="max-w-6xl mx-auto">
          {/* Section Header */}
         

          {/* Form Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-xl border border-gray-100">
            {renderTabContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={() => setActiveTab(prev => Math.max(prev - 1, 0))}
                disabled={activeTab === 0}
                className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold order-2 sm:order-1"
              >
                ← Önceki Sekme
              </button>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  İptal Et
                </button>

                {activeTab < tabs.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextTab}
                    className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sonraki Sekme →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit()}
                    className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <IconCheck size={20} />
                        <span>Personeli Kaydet</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelAddPage;