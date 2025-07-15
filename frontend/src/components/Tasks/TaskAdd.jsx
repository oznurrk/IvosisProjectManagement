import { Button, Modal, Select, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";

const TaskAdd = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [processOptions, setProcessOptions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    processId: null,
    title: "",
    description: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProcesses = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/processes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const options = data.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }));
        setProcessOptions(options);
      } catch (err) {
        console.error("Süreç verileri alınamadı: ", err);
      }
    };

    const getCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Önce localStorage'dan kontrol et
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          if (userInfo && userInfo.name) {
            setCurrentUser(userInfo);
            return;
          }
          
          // Eğer localStorage'da yoksa API'den çek
          const response = await fetch("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
            // Gelecek kullanımlar için localStorage'a kaydet
            localStorage.setItem("userInfo", JSON.stringify(userData));
          } else {
            setCurrentUser({ name: "Giriş Yapan Kullanıcı", id: 1 });
          }
        } catch (err) {
          console.error("Kullanıcı bilgileri alınamadı: ", err);
          setCurrentUser({ name: localStorage.getItem("userInfo"), id: 1 });
        }
      }
    };

    fetchProcesses();
    getCurrentUser();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.processId) {
      newErrors.processId = "Süreç seçimi zorunludur";
    }
    
    if (!formData.title.trim()) {
      newErrors.title = "Görev başlığı zorunludur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitTask = async () => {
    if (!validateForm()) {
      setShowConfirm(false);
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      processId: formData.processId,
      title: formData.title,
      description: formData.description,
      createdByUserId: currentUser?.id || 1
    };

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("API isteği başarısız");
      }
      
      // Reset form
      setFormData({
        processId: null,
        title: "",
        description: ""
      });
      
      setShowSuccess(true);
    } catch (err) {
      console.error("Görev Kaydedilirken Bir Hata Oluştu: ", err);
      setShowError(true);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleConfirm = () => {
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  return (
    <div className="py-6 px-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-ivosis-800">Görev Ekle</h2>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h6 className="text-lg font-bold text-ivosis-800 mb-6 border-b pb-2">Görev Bilgileri</h6>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                <span className="text-red-500">*</span> Süreç
              </label>
              <Select
                placeholder="Süreç seçin"
                searchable
                clearable
                data={processOptions}
                value={formData.processId?.toString() || null}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    processId: value ? parseInt(value) : null,
                  });
                  if (errors.processId) setErrors({ ...errors, processId: null });
                }}
                error={errors.processId}
              />
            </div>
            
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                <span className="text-red-500">*</span> Görev Başlığı
              </label>
              <TextInput
                placeholder="Görev başlığını girin"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.currentTarget.value });
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                error={errors.title}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                Açıklama
              </label>
              <Textarea
                placeholder="Görev açıklamasını yazın"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.currentTarget.value })
                }
              />
            </div>
            
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                <span className="text-red-500">*</span> Oluşturan Kullanıcı
              </label>
              <TextInput
                value={currentUser?.name || "Yükleniyor..."}
                readOnly
                className="opacity-60"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-6 border-t">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  processId: null,
                  title: "",
                  description: ""
                });
                setErrors({});
              }}
            >
              Temizle
            </Button>
            <Button
              className="bg-green-500 hover:!bg-green-600"
              onClick={handleConfirm}
            >
              Görevi Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Onay Modali */}
      <Modal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Görev Kaydetme Onayı"
        centered
      >
        <div className="space-y-4">
          <p className="text-gray-700">Aşağıdaki bilgilerle görevi kaydetmek istiyor musunuz?</p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Süreç:</strong> {
              processOptions.find(p => p.value === formData.processId?.toString())?.label
            }</p>
            <p><strong>Görev Başlığı:</strong> {formData.title}</p>
            <p><strong>Açıklama:</strong> {formData.description || "Belirtilmemiş"}</p>
            <p><strong>Oluşturan:</strong> {currentUser?.name}</p>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              İptal
            </Button>
            <Button color="green" onClick={submitTask}>
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Başarı Modali */}
      <Modal
        opened={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Kayıt Başarılı"
        centered
      >
        <div className="text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <p className="text-gray-700 mb-4">Görev başarıyla kaydedildi.</p>
          <Button onClick={() => setShowSuccess(false)} className="bg-green-500">
            Tamam
          </Button>
        </div>
      </Modal>

      {/* Hata Modali */}
      <Modal
        opened={showError}
        onClose={() => setShowError(false)}
        title="Hata"
        centered
      >
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">✗</div>
          <p className="text-gray-700 mb-4">Görev kaydı sırasında bir hata oluştu.</p>
          <Button color="red" onClick={() => setShowError(false)}>
            Tamam
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TaskAdd;