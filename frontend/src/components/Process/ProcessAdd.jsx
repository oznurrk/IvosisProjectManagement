import { Button, Modal, Select, Textarea, TextInput } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

const ProcessAdd = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [processOptions, setProcessOptions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentProcessId: null,
  });

  useEffect(() => {
    const fetchProcesses = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/processes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const options = res.data.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }));
        setProcessOptions(options);
      } catch (err) {
        console.error("Süreç verileri alınamadı: ", err);
      }
    };

    fetchProcesses();
  }, []);

  const submitProcess = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      name: formData.name,
      description: formData.description,
      parentProcessId: formData.parentProcessId,
    };

    try {
      await axios.post("http://localhost:5000/api/processes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowSuccess(true);
    } catch (err) {
      console.error("Süreç Kaydedilirken Bir Hata Oluştu: ", err);
      setShowError(true);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold mb-6 text-ivosis-700">Süreç Ekle</h2>
      <div className="border rounded-lg p-6 bg-white space-y-8">
        <h6 className="text-lg font-bold text-ivosis-700 mb-4">Süreç Bilgileri</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                <span className="text-red-500">*</span> Süreç Adı
              </label>
              <TextInput
                className="full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.currentTarget.value })
                }
              />
            </div>
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Açıklama
              </label>
              <Textarea
                placeholder="Açıklama Yazın"
                rows={2}
                className="w-full h-full"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.currentTarget.value })
                }
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Üst Süreç
              </label>
              <Select
                placeholder="Üst Süreç Seçin"
                searchable
                clearable
                data={processOptions}
                value={formData.parentProcessId?.toString() || null}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    parentProcessId: value ? parseInt(value) : null,
                  })
                }
              />
            </div>
            <div className="w-full flex justify-end">
              <Button
                className="bg-green-500 hover:!bg-green-600"
                onClick={() => setShowConfirm(true)}
              >
                Süreci Kaydet
              </Button>
            </div>
          </div>

          {/* Onay Modali */}
          <Modal
            opened={showConfirm}
            onClose={() => setShowConfirm(false)}
            title="Süreç Kaydetme Onayı"
            centered
          >
            <p>Süreci Kaydetmek istiyor musunuz?</p>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="default" onClick={() => setShowConfirm(false)}>
                Hayır
              </Button>
              <Button color="green" onClick={submitProcess}>
                Evet
              </Button>
            </div>
          </Modal>

          {/* Başarı Modali */}
          <Modal
            opened={showSuccess}
            onClose={() => setShowSuccess(false)}
            title="Kayıt Başarılı"
            centered
          >
            <p>Süreç başarıyla kaydedildi.</p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowSuccess(false)}>Tamam</Button>
            </div>
          </Modal>

          {/* Hata Modali */}
          <Modal
            opened={showError}
            onClose={() => setShowError(false)}
            title="Hata"
            centered
          >
            <p>Süreç kaydı sırasında bir hata oluştu.</p>
            <div className="flex justify-end mt-4">
              <Button color="red" onClick={() => setShowError(false)}>
                Tamam
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ProcessAdd;
