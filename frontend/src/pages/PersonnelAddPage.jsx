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
  IconAlertCircle
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
    },
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    // Success mesajını temizle - sadece string kontrolü ile
    if (success && typeof success === 'string' && success.length > 0) {
      setSuccess("");
    }
  };

  const validateCurrentTab = () => {
    const currentTab = tabs[activeTab];
    const missingFields = currentTab.required.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Lütfen zorunlu alanları doldurunuz: ${missingFields.join(", ")}`);
      return false;
    }

    // Additional validations
    if (activeTab === 0) {
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
    if (validateCurrentTab()) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
      // Son sekmeye geçerken otomatik submit'i önle
      if (activeTab < tabs.length - 1) {
        setActiveTab(prev => prev + 1);
      }
      setError("");
    }
  };

  const handleTabClick = (tabIndex) => {
    if (tabIndex <= activeTab || completedTabs.has(tabIndex)) {
      setActiveTab(tabIndex);
      setError("");
      // Tab değişirken success mesajını temizle - sadece string kontrolü ile
      if (success && typeof success === 'string' && success.length > 0) {
        setSuccess("");
      }
    }
  };

  const canSubmit = () => {
    // Son sekmede olmalı ve geçerli olmalı
    return activeTab === tabs.length - 1 && validateCurrentTab();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit()) {
      setError("Lütfen tüm sekmeleri tamamlayınız.");
      return;
    }

    setLoading(true);

    try {
      const formData = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : null,
        startDate: form.startDate || null,
        birthDate: form.birthDate || null,
      };

      const response = await axios.post("http://localhost:5000/api/personnel", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // API response'u düzgün handle et
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

      // Success mesajını 5 saniye sonra temizle
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Sicil No 
                </label>
                <input
                  type="text"
                  value={form.sicilNo}
                  onChange={(e) => handleChange("sicilNo", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Sicil numarasını giriniz"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Ad 
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Soyadını giriniz"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ünvan
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Ünvanını giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Yaka
                </label>
                <select
                  value={form.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Seçiniz</option>
                  <option value="Beyaz Yaka">Beyaz Yaka</option>
                  <option value="Mavi Yaka">Mavi Yaka</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cinsiyet
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Seçiniz</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Organizasyon Bilgileri
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bölüm
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Bölüm adını giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departman
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Departman adını giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İşe Giriş Tarihi
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Çalışma Durumu
                </label>
                <select
                  value={form.workStatus}
                  onChange={(e) => handleChange("workStatus", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={form.tcKimlikNo}
                  onChange={(e) => handleChange("tcKimlikNo", e.target.value)}
                  maxLength="11"
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Doğum yerini giriniz"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Uyruk
                </label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Uyruğunu giriniz"
                />
              </div>

              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Öğrenim Durumu
                </label>
                <select
                  value={form.educationLevel}
                  onChange={(e) => handleChange("educationLevel", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Seçiniz</option>
                  <option value="İlkokul">İlkokul</option>
                  <option value="Ortaokul">Ortaokul</option>
                  <option value="Lise">Lise</option>
                  <option value="Ön Lisans">Ön Lisans</option>
                  <option value="Lisans">Lisans</option>
                  <option value="Yüksek Lisans">Yüksek Lisans</option>
                  <option value="Doktora">Doktora</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3: // Adres Bilgileri
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İl
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="İlçe adını giriniz"
                />
              </div>

              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adres Detayı
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="3"
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Detaylı adres bilgilerini giriniz..."
                />
              </div>
            </div>
          </div>
        );

      case 4: // İletişim ve Mali Bilgiler
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cep Telefonu
                </label>
                <input
                  type="tel"
                  value={form.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="TR00 0000 0000 0000 0000 00"
                />
              </div>

              <div className="relative md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fotoğraf URL
                </label>
                <input
                  type="url"
                  value={form.photo}
                  onChange={(e) => handleChange("photo", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="İnsan Kaynakları Yönetimi"
        subtitle="Yeni Personel Kaydı"
        icon={IconUserPlus}
      />

      {/* Progress Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
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
                    flex-1 min-w-48 px-4 py-3 flex items-center justify-center space-x-2 border-b-4 transition-all duration-300
                    ${isActive 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : isCompleted
                      ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                      : isAccessible
                      ? 'border-transparent hover:bg-gray-100 text-gray-600'
                      : 'border-transparent bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    p-1.5 rounded-full
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {isCompleted ? <IconCheck size={14} /> : <Icon size={14} />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{tab.title}</div>
                    {tab.required.length > 0 && (
                      <div className="text-xs opacity-75">{tab.required.length} zorunlu alan</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Alert Messages */}
        {error && typeof error === 'string' && error.length > 0 && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <IconAlertCircle className="text-red-400 mr-3" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {success && typeof success === 'string' && success.length > 0 && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <IconCheck className="text-green-400 mr-3" size={20} />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {tabs[activeTab].title}
            </h2>
            <p className="text-gray-600">
              {tabs[activeTab].required.length > 0 
                ? `Bu sekmede ${tabs[activeTab].required.length} zorunlu alan bulunmaktadır.`
                : 'Bu sekmede opsiyonel bilgileri girebilirsiniz.'
              }
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mt-3 rounded-full"></div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            {renderTabContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center py-4 border-t border-gray-200 bg-white rounded-lg px-6 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab(prev => Math.max(prev - 1, 0))}
              disabled={activeTab === 0}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Önceki
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                İptal
              </button>

              {activeTab < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-md"
                >
                  Sonraki →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canSubmit()}
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} />
                      <span>Personeli Kaydet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelAddPage;

