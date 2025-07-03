import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: '',
    status: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Proje adı gerekli';
    if (!formData.description) newErrors.description = 'Açıklama gerekli';
    if (!formData.startDate) newErrors.startDate = 'Başlama tarihi gerekli';
    if (!formData.endDate) newErrors.endDate = 'Bitiş tarihi gerekli';
    else if (formData.endDate < formData.startDate)
      newErrors.endDate = 'Bitiş tarihi başlama tarihinden önce olamaz';
    if (!formData.priority) newErrors.priority = 'Öncelik seçin';
    if (!formData.status) newErrors.status = 'Durum seçin';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const submitForm = async () => {
  setLoading(true);
  setErrorMessage('');
  const token = localStorage.getItem('token'); // Kullanıcı giriş yaptıysa token burada olur

  if (!token) {
    setErrorMessage('❌ Giriş yapmadan proje ekleyemezsiniz.');
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Token buraya ekleniyor
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Kayıt başarısız');
    }

    setSuccessMessage('✅ Proje başarıyla kaydedildi!');
    setTimeout(() => navigate('/projects'), 1500);
  } catch (err) {
    setErrorMessage('❌ Kayıt sırasında bir hata oluştu.');
  } finally {
    setLoading(false);
    setShowConfirm(false);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true); // özel onay kutusu aç
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Yeni Proje Ekle</h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded border border-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Proje Adı */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Proje Adı</label>
          <input
            type="text"
            name="name"
            className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Açıklama</label>
          <textarea
            name="description"
            rows={4}
            className={`w-full border rounded px-3 py-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Tarihler */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Başlama Tarihi</label>
            <input
              type="date"
              name="startDate"
              className={`w-full border rounded px-3 py-2 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.startDate}
              onChange={handleChange}
            />
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              name="endDate"
              className={`w-full border rounded px-3 py-2 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.endDate}
              onChange={handleChange}
            />
            {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Öncelik & Durum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Öncelik</label>
            <select
              name="priority"
              className={`w-full border rounded px-3 py-2 ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Kritik">Kritik</option>
            </select>
            {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Durum</label>
            <select
              name="status"
              className={`w-full border rounded px-3 py-2 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Seçiniz</option>
              <option value="Planlanıyor">Planlanıyor</option>
              <option value="Başladı">Başladı</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Bitti">Bitti</option>
              <option value="İptal">İptal</option>
            </select>
            {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
          </div>
        </div>

        {/* Buton */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>

      {/* Özel Onay Kutusu */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Kaydetmek istiyor musunuz?</h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Vazgeç
              </button>
              <button
                onClick={submitForm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Evet, Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCreate;
