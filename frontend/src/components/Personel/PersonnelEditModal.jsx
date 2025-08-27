// src/components/Personnel/PersonnelEditModal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconUser,
  IconBuilding,
  IconId,
  IconMapPin,
  IconPhone,
  IconCheck,
  IconAlertCircle,
  IconCamera,
  IconUpload,
  IconX,
  IconEdit
} from "@tabler/icons-react";
import { TextInput } from "@mantine/core";
import axios from "axios";

// Onay modali komponenti
const ConfirmationModal = ({ isOpen, onClose, onConfirm, personnelName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Değişiklikleri Kaydet
          </h3>
          <p className="text-gray-600 mb-6">
            <span className="font-semibold">{personnelName}</span> için yapılan değişiklikleri kaydetmek istediğinize emin misiniz?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
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
        </div>
      </div>
    </div>
  );
};

const PersonnelEditModal = ({ isOpen, onClose, personnel, mode = "add" }) => {
  const navigate = useNavigate();
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
    nationality: "",
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  useEffect(() => {
  if (mode === "edit" && personnel) {
    const formData = {
      sicilNo: personnel.sicilNo || "",
      name: personnel.name || "",
      surname: personnel.surname || "",
      title: personnel.title || "",
      badge: personnel.badge || "",
      department: personnel.department || "",
      section: personnel.section || "",
      startDate: personnel.startDate ? personnel.startDate.split("T")[0] : "",
      birthPlace: personnel.birthPlace || "",
      birthDate: personnel.birthDate ? personnel.birthDate.split("T")[0] : "",
      tcKimlikNo: personnel.tcKimlikNo || "",
      educationLevel: personnel.educationLevel || "",
      gender: personnel.gender || "",
      nationality: personnel.nationality || "",
      city: personnel.city || "",
      district: personnel.district || "",
      address: personnel.address || "",
      mobilePhone: personnel.mobilePhone || "",
      email: personnel.email || "",
      salary: personnel.salary ? personnel.salary.toString() : "",
      iban: personnel.iban || "",
      photo: personnel.photo || "",
      workStatus: personnel.workStatus || "Aktif",
    };

    setForm(formData);

    if (personnel.photo) {
      setPreviewImage(personnel.photo);
    }

    // Reset states
    setActiveTab(0);
    setCompletedTabs(new Set());
    setError("");
    setSuccess("");
  } else if (mode === "add") {
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
      nationality: "",
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
    setPreviewImage(null);

    // Reset states
    setActiveTab(0);
    setCompletedTabs(new Set());
    setError("");
    setSuccess("");
  }
}, [mode, personnel]);


  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
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
    if (validateCurrentTab()) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
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
      setSuccess("");
    }
  };

  const canSubmit = () => {
    const requiredFields = ["sicilNo", "name", "surname"];
    const missingFields = requiredFields.filter(field => !form[field]);
    return activeTab === tabs.length - 1 && missingFields.length === 0;
  };

  const handleUpdateClick = () => {
    if (!validateCurrentTab()) {
      return;
    }
    setShowConfirmModal(true);
  };

const handleConfirmUpdate = async () => {
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
    }

    const updateData = {
      sicilNo: form.sicilNo,
      name: form.name,
      surname: form.surname,
      title: form.title || null,
      badge: form.badge || null,
      department: form.department || null,
      section: form.section || null,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      birthPlace: form.birthPlace || null,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
      tcKimlikNo: form.tcKimlikNo || null,
      educationLevel: form.educationLevel || null,
      gender: form.gender || null,
      nationality: form.nationality || null,
      city: form.city || null,
      district: form.district || null,
      address: form.address || null,
      mobilePhone: form.mobilePhone || null,
      email: form.email || null,
      salary: form.salary ? parseFloat(form.salary) : 0,
      iban: form.iban || null,
      photo: form.photo || null,
      workStatus: form.workStatus,
    };

    const response = await axios.put(
      `/api/Personnel/${personnel.id}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSuccess("Personel bilgileri başarıyla güncellendi.");

    setTimeout(() => {
      setShowConfirmModal(false);
      onClose();
      navigate("/users");
    }, 1500);
  } catch (err) {
    console.error("Update error:", err);

    if (
      err.response?.status === 401 ||
      err.message.includes("Oturum süreniz dolmuş") ||
      err.message.includes("token")
    ) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    const errorMessage =
      err.response?.data?.message || err.message || "Güncelleme sırasında bir hata oluştu.";
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Temel Bilgiler
        return (
          <div className="space-y-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Sicil No
                  </label>
                  <input
                    type="text"
                    value={form.sicilNo}
                    onChange={(e) => handleChange("sicilNo", e.target.value)}
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
                      placeholder="Adını giriniz"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ">
                      <span className="text-red-500">*</span> Soyad
                    </label>
                    <input
                      type="text"
                      value={form.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm h-13"
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
                      className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-13 text-sm"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                {/* Fotoğraf Yükleme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fotoğraf</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
                  />
                  <div className="mt-2">
                    <input
                      type="url"
                      value={form.photo}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full h-8 border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      placeholder="veya fotoğraf URL'si giriniz"
                    />
                  </div>
                </div>

                {/* Önizleme Kutusu - Flex ile büyütüldü */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 text-center shadow-sm border-2 border-gray-100 min-h-[280px] flex flex-col justify-center">
                  <div className="w-40 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center mx-auto shadow-lg border-4 border-white">
                    {previewImage || form.photo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewImage || form.photo}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setPreviewImage(null);
                            setForm(prev => ({ ...prev, photo: "" }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <IconUser size={48} className="mx-auto mb-2" />
                        <p className="text-xs">Fotoğraf</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {form.name || "Ad"} {form.surname || "Soyad"}
                    </h3>
                    <p className="text-gray-600">{form.title || "Ünvan"}</p>
                    <p className="text-sm text-gray-500">Sicil No: {form.sicilNo || "000"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Organizasyon Bilgileri
        return (
          <div className="space-y-6 h-full flex flex-col ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Firma
                </label>
                <select
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Çalışma Durumu
                </label>
                <select
                  value={form.workStatus}
                  onChange={(e) => handleChange("workStatus", e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
          <div className="space-y-6 h-full flex flex-col ">
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-13"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-13"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-13"
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
          <div className="space-y-6 h-full flex flex-col ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  İl
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Detaylı adres bilgilerini giriniz..."
                />
              </div>
            </div>
          </div>
        );

      case 4: // İletişim ve Mali Bilgiler
        return (
          <div className="space-y-6 h-full flex flex-col ">
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
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
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-12"
                  placeholder="TR00 0000 0000 0000 0000 00"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        {/* Sabit boyutlu modal container */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">

          {/* Header - sabit yükseklik */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <IconEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Personel Düzenle
                </h2>
                <p className="text-blue-100 text-sm">
                  {personnel?.name} {personnel?.surname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <IconX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Tabs - sabit yükseklik */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-shrink-0">
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
                      flex-shrink-0 min-w-[180px] px-4 py-3 flex items-center justify-center space-x-2 border-b-4 transition-all duration-300
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
                      p-1.5 rounded-full transition-all duration-300
                      ${isActive
                        ? 'bg-blue-500 text-white shadow-lg'
                        : isCompleted
                          ? 'bg-green-500 text-white shadow-lg'
                          : isAccessible
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {isCompleted ? <IconCheck size={14} /> : <Icon size={14} />}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs">{tab.title}</div>
                      {tab.required.length > 0 && (
                        <div className="text-xs opacity-75">
                          <span className="text-red-500">*</span> {tab.required.length} zorunlu
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area - flex-1 ile kalan alanı kaplar */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 h-full flex flex-col">

              {/* Alert Messages */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm flex-shrink-0">
                  <div className="flex items-center">
                    <IconAlertCircle className="text-red-400 mr-3 flex-shrink-0" size={20} />
                    <p className="text-red-700 font-medium text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl shadow-sm flex-shrink-0">
                  <div className="flex items-center">
                    <IconCheck className="text-green-400 mr-3 flex-shrink-0" size={20} />
                    <p className="text-green-700 font-medium text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Form Content - flex-1 ile genişletildi */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6  flex-1 min-h-0">
                {renderTabContent()}
              </div>

              {/* Navigation Buttons - sabit yükseklik */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mt-6 shadow-lg border border-gray-100 flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab(prev => Math.max(prev - 1, 0))}
                    disabled={activeTab === 0}
                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm order-2 sm:order-1"
                  >
                    ← Önceki
                  </button>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
                    >
                      İptal
                    </button>

                    {activeTab < tabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextTab}
                        className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                      >
                        Sonraki →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleUpdateClick}
                        disabled={loading || !canSubmit()}
                        className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 text-sm"
                      >
                        <IconCheck size={16} />
                        <span>Güncelle</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onay Modali */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        personnelName={`${form.name} ${form.surname}`}
        loading={loading}
      />
    </>
  );
};

export default PersonnelEditModal;