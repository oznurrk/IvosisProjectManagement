
import { useEffect, useState } from "react";
import Header from "../Header/Header";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header title="Görev Yönetimi" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Üst Kısım -Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Görev Ekle</h2>
            <p className="text-blue-100 text-sm mt-1">Görev bilgilerini doldurun ve kaydedin</p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default TaskAdd;
