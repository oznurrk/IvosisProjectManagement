// src/components/Personnel/PersonnelEditModal.jsx
import React, { useState, useEffect } from "react";

const PersonnelEditModal = ({ isOpen, onClose, personnel, onSave }) => {
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personnel) {
      setForm({
        sicilNo: personnel.sicilNo || "",
        name: personnel.name || "",
        surname: personnel.surname || "",
        title: personnel.title || "",
        badge: personnel.badge || "",
        department: personnel.department || "",
        section: personnel.section || "",
        startDate: personnel.startDate ? personnel.startDate.split('T')[0] : "",
        birthPlace: personnel.birthPlace || "",
        birthDate: personnel.birthDate ? personnel.birthDate.split('T')[0] : "",
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
      });
    }
  }, [personnel]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.sicilNo || !form.name || !form.surname) {
      setError("Sicil No, Ad ve Soyad alanları zorunludur.");
      return false;
    }

    if (form.tcKimlikNo && form.tcKimlikNo.length !== 11) {
      setError("TC Kimlik No 11 haneli olmalıdır.");
      return false;
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      setError("Geçerli bir e-posta adresi giriniz.");
      return false;
    }

    if (form.iban && form.iban.length > 26) {
      setError("IBAN en fazla 26 karakter olabilir.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
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

      await onSave(personnel.id, formData);
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("Güncelleme sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Personel Düzenle - {personnel?.name} {personnel?.surname}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Temel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sicil No *
                </label>
                <input
                  type="text"
                  value={form.sicilNo}
                  onChange={(e) => handleChange("sicilNo", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={form.surname}
                  onChange={(e) => handleChange("surname", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ünvan
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yaka
                </label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cinsiyet
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organizasyon Bilgileri */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Organizasyon Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bölüm
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departman
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giriş Tarihi
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Durumu
                </label>
                <select
                  value={form.workStatus}
                  onChange={(e) => handleChange("workStatus", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğum Yeri
                </label>
                <input
                  type="text"
                  value={form.birthPlace}
                  onChange={(e) => handleChange("birthPlace", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğum Tarihi
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TC Kimlik No
                </label>
                <input
                  type="text"
                  value={form.tcKimlikNo}
                  onChange={(e) => handleChange("tcKimlikNo", e.target.value)}
                  maxLength="11"
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öğrenim Durumu
                </label>
                <select
                  value={form.educationLevel}
                  onChange={(e) => handleChange("educationLevel", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uyruk
                </label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Adres Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İl
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İlçe
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* İletişim ve Mali Bilgiler */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">İletişim ve Mali Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cep Telefonu
                </label>
                <input
                  type="tel"
                  value={form.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maaş
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={form.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                  maxLength="26"
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fotoğraf URL
                </label>
                <input
                  type="url"
                  value={form.photo}
                  onChange={(e) => handleChange("photo", e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelEditModal;