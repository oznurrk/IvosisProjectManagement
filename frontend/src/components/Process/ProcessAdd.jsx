import { Button, Modal, Select, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react"

const ProcessAdd = () => {
  const [showConfirm,setShowConfirm] = useState(false);
  const [showSuccess,setShowSuccess] = useState(false);
  const [showError,setShowError] = useState(false);
  const [processOptions,setProcessOptions] = useState([]);
  const [currentUser,setCurrentUser] = useState(null);
  const [errors,setErrors] = useState({});

  const [formData,setFormData] = useState({
    name: "",
    description: "",
    parentProcessId: null,
  });

  useEffect(() => {
    const fetchProcesses = async () => {
      const token = localStorage.getItem("token");
      try{
        const response = await fetch("http://localhost:5000/api/processes",{
          headers: {Authorization: `Bearer ${token}`},
        });
        const data = await response.json();
        const options = data.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }));
        setProcessOptions(options);
      }catch(err){
        console.error("Süreç verileri alınmadı: ", err);
      }
    };

    const getCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if(token){
        try{
          const userInfo = JSON.parse(localStorage.getItem("userInfo"));
          if(userInfo && userInfo.name){
            setCurrentUser(userInfo);
            return;
          }

          const response = await fetch("http://localhost:5000/api/users",{
            headers: {Authorization: `Bearer ${token}`},
          });

          if(response.ok){
            const userData = await response.json();
            setCurrentUser(userData);
            localStorage.setItem("userInfo",JSON.stringify(userData));
          }else{
            setCurrentUser({name: "Giriş Yapan Kullanıcı",id: 1});
          }
        }catch(err){
          console.error("Kullanıcı Bilgileri Alınmadı: ", err);
          setCurrentUser({name: localStorage.getItem("userInfo"), id: 1});
        }
      }
    };
    fetchProcesses();
    getCurrentUser();
  },[]);


  const validateForm = () => {
    const newErrors = {};
    
    if(!formData.name){
      newErrors.name = "Süreç Adı Boş Bırakılamaz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitTask = async () => {
    if(!validateForm()){
      setShowConfirm(false);
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      name: formData.name,
      description: formData.description,
      parentProcessId: formData.parentProcessId,
      createdByUserId: currentUser?.id || 1
    };

    try{
      const response = await fetch("http://localhost:5000/api/processes",{
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":"application/json"
        },
        body: JSON.stringify(payload)
      });

      if(!response.ok){
        throw new Error("API isteği başarısız");
      }

      setFormData({
        name: "",
        description: "",
        parentProcessId: null
      });

      setShowSuccess(true);
    }catch(err){
      console.error("Süreç Kaydedilirken Bir Hata Oluştu: ", err);
      setShowError(true);
    }finally{
      setShowConfirm(false);
    }
  };

  const handleConfirm = () => {
    if(validateForm()){
      setShowConfirm(true);
    }
  };

  return (
    <div className="py-6 px-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-ivosis-800">Süreç Ekle</h2>
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h6 className="text-lg font-bold text-ivosis-800 mb-6 border-b pb-2">Süreç Bilgileri</h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                <span className="text-red-500">*</span> Süreç Adı
              </label>
              <TextInput
                placeholder="Süreç Adı Girin"
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.currentTarget.value});
                  if(errors.name) setErrors({...errors, title: null});
                }}
                error={errors.name}
              />
            </div>
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                Açıklama
              </label>
              <Textarea
                placeholder="Süreç Açıklaması Yazın"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.currentTarget.value})}
                />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                Üst Süreç
              </label>
              <Select
                placeholder="Süreç Seçin"
                searchable
                clearable
                data={processOptions}
                value={formData.parentProcessId?.toString() || null}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    parentProcessId: value ? parseInt(value) : null
                  });
                  if(errors.parentProcessId) setErrors({...errors, parentProcessId: null});
                }}
                error={errors.parentProcessId}
              />
            </div>
            <div>
              <label className="text-gray-800 font-semibold block mb-2">
                Oluşturan Kullanıcı
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
                  name: "",
                  description: "",
                  parentProcessId: null
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
              Süreci Kaydet
            </Button>
          </div>
        </div>
      </div>
      <Modal 
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Süreç Kaydetme Onayı"
        centered
      >
        <div className="space-y-4">
          <p className="text-gray-700">Aşağıdaki Bilgilerle Süreci Kaydetmek İstiyor Musunuz?</p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Süreç Adı: </strong>{formData.name}</p>
            <p><strong>Açıklama: </strong>{formData.description || "Belirtilmemiş. "}</p>
            <p>
              <strong>
                Üst Süreç:
              </strong>
              {
                processOptions.find(p => p.value === formData.parentProcessId?.toString())?.label
              }
            </p>
            <p><strong>Oluşturan: </strong>{currentUser?.name}</p>
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
      <Modal
        opened={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Kayıt Başarılı"
        centered
      >
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">✓</div>
          <p className="text-gray-700 mb-4">Süreç Başarıyla Kaydedildi</p>
          <Button onClick={() => setShowSuccess(false)} className="bg-green-500">
            Tamam
          </Button>
        </div>
      </Modal>
      <Modal
        opened={showError}
        onClose={() => setShowError(false)}
        title="Hata"
        centered
      >
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">✗</div>
          <p className="text-gray-700 mb-4">Süreç Oluşturulurken Bir Hata Oluştu</p>
          <Button color="red" onClick={() => setShowError(false)}>
            Tamam
          </Button>
        </div>
      </Modal>
    </div>
  )
  
}

export default ProcessAdd;