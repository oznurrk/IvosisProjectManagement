import { useState, useEffect, useRef } from "react";
import { Modal, TextInput, Textarea,  Button, Group, Stack, Alert } from "@mantine/core";
import { IconAlertCircle, IconPlus} from '@tabler/icons-react';
import axios from "axios";

const ProcessAddModal = ({ opened, onClose, onProcessAdded, processes = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentProcessId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null);

  const token = localStorage.getItem("token");

  // Modal açıldığında form'u temizle
  useEffect(() => {
    if (opened) {
      setFormData({
        name: "",
        description: "",
        parentProcessId: ""
      });
      setError(null);
      setTimeout(() => {
        nameInputRef.current?.focus(); // Süreç adı input'una odaklan
      }, 100); // 100ms gecikme ile odaklan
    }
  }, [opened]);
/*
  // Ana süreçleri select için hazırla
  const parentProcessOptions = processes
    .filter(process => process.isMainProcess) // Sadece ana süreçler
    .map(process => ({
      value: process.id.toString(),
      label: process.name
    }));

  // "Ana Süreç" seçeneğini başa ekle
  
  const allProcessOptions = [
    { value: "", label: "Ana Süreç (Üst süreç yok)" },
    ...parentProcessOptions
  ];
    */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Hata varsa temizle
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Süreç adı zorunludur.");
      return false;
    }
    if (formData.name.trim().length < 3) {
      setError("Süreç adı en az 3 karakter olmalıdır.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        ParentProcessId: formData.parentProcessId || null
      };

      const response = await axios.post(
        "http://localhost:5000/api/processes",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Başarılı kayıt sonrası
      onProcessAdded(response.data); // Parent component'e yeni süreç bilgisini gönder
      onClose(); // Modal'ı kapat
      
      // Form'u temizle
      setFormData({
        name: "",
        description: "",
        parentProcessId: ""
      });

    } catch (error) {
      console.error("Süreç kaydetme hatası:", error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError("Girilen bilgiler geçerli değil. Lütfen kontrol ediniz.");
      } else if (error.response?.status === 401) {
        setError("Yetkiniz bulunmamaktadır.");
      } else {
        setError("Süreç kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group spacing="sm" className="flex items-center gap-2">
          <IconPlus size={20} className="text-ivosis-600" />
          <span className="font-semibold text-lg text-[#2d3748]">
            Yeni Süreç Ekle
          </span>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      className="rounded-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Stack spacing="md" className="space-y-4">
          {/* Hata mesajı */}
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              color="red"
              variant="light"
              className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg"
            >
              {error}
            </Alert>
          )}

          {/* Süreç Adı */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#2d3748] mb-1">
              Süreç Adı <span className="text-red-500">*</span>
            </label>
            <TextInput
            ref={nameInputRef}
              placeholder="Süreç adını giriniz..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={loading}
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none transition-colors"
            />
          </div>

          {/* Açıklama */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#2d3748] mb-1">
              Açıklama
            </label>
            <Textarea
              placeholder="Süreç açıklamasını giriniz..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              minRows={3}
              maxRows={5}
              disabled={loading}
              className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 focus:border-[#6c5ce7] focus:ring-1 focus:ring-[#6c5ce7] outline-none transition-colors resize-none"
            />
          </div>

          {/* Üst Süreç Seçimi 
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#2d3748] mb-1">
              Üst Süreç
            </label>
            <Select
              placeholder="Üst süreç seçiniz..."
              value={formData.parentProcessId}
              onChange={(value) => handleInputChange("parentProcessId", value)}
              data={allProcessOptions}
              searchable
              clearable
              disabled={loading}
              className="w-full border border-[#e2e8f0] rounded-md focus-within:border-[#6c5ce7] focus-within:ring-1 focus-within:ring-[#6c5ce7] transition-colors"
              nothingFoundMessage="Süreç bulunamadı"
            />
          </div>
          */}

          {/* Bilgilendirme */}
          <div className="bg-[#f0f4f8] border-l-4 border-ivosis-600 p-3 rounded-md">
            <p className="text-sm text-[#4a5568]">
              💡 <strong>Bilgi:</strong> Üst süreç seçmezseniz bu süreç ana süreç olarak kaydedilecektir.
            </p>
          </div>

          {/* Butonlar */}
          <Group position="right" spacing="sm" className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            >
              İptal
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-ivosis-600 hover:bg-ivosis-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ProcessAddModal;