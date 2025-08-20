import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconPlus, IconCheck, IconCalendar, IconRefresh, IconUpload } from "@tabler/icons-react";

const DemandAddModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    demandNumber: "",
    projectId: "",
    companyId: "",
    title: "",
    description: "",
    statusId: "",
    priorityId: "",
    requestedDate: "",
    requiredDate: "",
    approvedDate: "",
    isApproved: false,
    approvedBy: "",
    approvalNotes: "",
    estimatedBudget: "",
    currency: "TRY",
    notes: "",
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Dropdown verileri
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal state'leri
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true
  });
  const [companyForm, setCompanyForm] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true
  });

  const [attachmentFiles, setAttachmentFiles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchModalData();
      // Bugünün tarihi
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({
        ...prev,
        requestedDate: today,
        demandNumber: generateDemandNumber()
      }));
    }
  }, [isOpen]);

  const fetchModalData = async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Projeleri çek
      try {
        const projectsRes = await axios.get("http://localhost:5000/api/Projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projectsData = extractArray(projectsRes.data);
        setProjects(projectsData);
      } catch (err) {
        setProjects([
          { id: 1, name: "Proje A", code: "PA", isActive: true },
          { id: 2, name: "Proje B", code: "PB", isActive: true }
        ]);
      }

      // Şirketleri çek
      try {
        const companiesRes = await axios.get("http://localhost:5000/api/Companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companiesData = extractArray(companiesRes.data);
        setCompanies(companiesData);
      } catch (err) {
        setCompanies([
          { id: 1, name: "ABC Şirketi", code: "ABC", isActive: true },
          { id: 2, name: "XYZ Ltd.", code: "XYZ", isActive: true }
        ]);
      }

      // Durumları çek
      try {
        const statusesRes = await axios.get("http://localhost:5000/api/Demand/Statuses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statusesData = extractArray(statusesRes.data);
        setStatuses(statusesData);
      } catch (err) {
        setStatuses([
          { id: 1, name: "Beklemede", code: "PENDING", color: "#FFA500" },
          { id: 2, name: "Onaylandı", code: "APPROVED", color: "#4CAF50" },
          { id: 3, name: "Reddedildi", code: "REJECTED", color: "#F44336" },
          { id: 4, name: "İptal Edildi", code: "CANCELLED", color: "#9E9E9E" }
        ]);
      }

      // Öncelik seviyelerini çek
      try {
        const prioritiesRes = await axios.get("http://localhost:5000/api/Demand/Priorities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prioritiesData = extractArray(prioritiesRes.data);
        setPriorities(prioritiesData);
      } catch (err) {
        setPriorities([
          { id: 1, name: "Düşük", code: "LOW", color: "#4CAF50" },
          { id: 2, name: "Normal", code: "NORMAL", color: "#FFA500" },
          { id: 3, name: "Yüksek", code: "HIGH", color: "#FF5722" },
          { id: 4, name: "Acil", code: "URGENT", color: "#F44336" }
        ]);
      }

      // Kullanıcıları çek (onay için)
      try {
        const usersRes = await axios.get("http://localhost:5000/api/Users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = extractArray(usersRes.data);
        setUsers(usersData);
      } catch (err) {
        setUsers([]);
      }

    } catch (error) {
      console.error("Modal verileri yükleme hatası:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.success === false) return [];
    if (res.items && Array.isArray(res.items)) return res.items;
    if (res.data && Array.isArray(res.data)) return res.data;
    if (res.result && Array.isArray(res.result)) return res.result;
    return [];
  };

  const generateDemandNumber = () => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TAL-${year}${month}-${randomNum}`;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleQuickFill = () => {
    const sampleData = {
      demandNumber: generateDemandNumber(),
      title: "Örnek Talep Başlığı",
      description: "Bu bir örnek talep açıklamasıdır. Detaylı bilgiler burada yer alır.",
      projectId: projects[0]?.id?.toString() || "1",
      companyId: companies[0]?.id?.toString() || "1",
      statusId: statuses.find(s => s.code === "PENDING")?.id?.toString() || "1",
      priorityId: priorities.find(p => p.code === "NORMAL")?.id?.toString() || "2",
      estimatedBudget: "25000",
      currency: "TRY",
      notes: "Örnek notlar burada yer alır.",
      requestedDate: new Date().toISOString().split('T')[0],
      requiredDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 gün sonra
    };
    setForm(prev => ({ ...prev, ...sampleData }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProjectSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/Projects", projectForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowProjectModal(false);
      setProjectForm({ name: "", code: "", description: "", isActive: true });
      fetchModalData();
    } catch (err) {
      alert("Proje kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
    }
  };

  const handleCompanySave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/Companies", companyForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowCompanyModal(false);
      setCompanyForm({ name: "", code: "", description: "", isActive: true });
      fetchModalData();
    } catch (err) {
      alert("Şirket kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Talep başlığı zorunludur";
    if (!form.description.trim()) newErrors.description = "Talep açıklaması zorunludur";
    if (!form.projectId) newErrors.projectId = "Proje seçimi zorunludur";
    if (!form.companyId) newErrors.companyId = "Şirket seçimi zorunludur";
    if (!form.statusId) newErrors.statusId = "Durum seçimi zorunludur";
    if (!form.priorityId) newErrors.priorityId = "Öncelik seçimi zorunludur";
    if (!form.requestedDate) newErrors.requestedDate = "Talep tarihi zorunludur";
    if (!form.requiredDate) newErrors.requiredDate = "Gereksinim tarihi zorunludur";

    if (form.estimatedBudget && parseFloat(form.estimatedBudget) <= 0) {
      newErrors.estimatedBudget = "Geçerli bir bütçe giriniz";
    }

    if (form.requestedDate && form.requiredDate) {
      if (new Date(form.requiredDate) < new Date(form.requestedDate)) {
        newErrors.requiredDate = "Gereksinim tarihi, talep tarihinden önce olamaz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const demandData = {
        demandNumber: form.demandNumber || generateDemandNumber(),
        title: form.title.trim(),
        description: form.description.trim(),
        projectId: parseInt(form.projectId),
        companyId: parseInt(form.companyId),
        statusId: parseInt(form.statusId),
        priorityId: parseInt(form.priorityId),
        requestedDate: form.requestedDate,
        requiredDate: form.requiredDate,
        approvedDate: form.approvedDate || null,
        isApproved: form.isApproved,
        approvedBy: form.approvedBy || null,
        approvalNotes: form.approvalNotes?.trim() || "",
        estimatedBudget: form.estimatedBudget ? parseFloat(form.estimatedBudget) : null,
        currency: form.currency || "TRY",
        notes: form.notes?.trim() || "",
        attachments: attachmentFiles.map(file => ({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }))
      };

      await onSave(demandData);

      // Form'u sıfırla
      setForm({
        demandNumber: "",
        projectId: "",
        companyId: "",
        title: "",
        description: "",
        statusId: "",
        priorityId: "",
        requestedDate: "",
        requiredDate: "",
        approvedDate: "",
        isApproved: false,
        approvedBy: "",
        approvalNotes: "",
        estimatedBudget: "",
        currency: "TRY",
        notes: "",
        attachments: []
      });
      setAttachmentFiles([]);
      setErrors({});

    } catch (error) {
      console.error("Talep ekleme hatası:", error);
      alert('Kaydetme hatası: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Yeni Talep Oluştur</h2>
              <p className="text-blue-100 text-sm">Detaylı talep bilgileri</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <IconRefresh size={14} className="mr-1 inline" />
                Örnek Veri
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
          {dataLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Veriler yükleniyor...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Temel Bilgiler */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talep Numarası
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={form.demandNumber}
                        onChange={(e) => handleChange("demandNumber", e.target.value)}
                        placeholder="Otomatik oluşturulacak"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange("demandNumber", generateDemandNumber())}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talep Başlığı *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Talep başlığını giriniz"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proje *</label>
                    <div className="flex space-x-2 items-center">
                      <select
                        value={form.projectId}
                        onChange={(e) => handleChange("projectId", e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.projectId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Proje Seçiniz</option>
                        {projects.filter(p => p.isActive !== false).map((project) => (
                          <option key={project.id} value={project.id.toString()}>
                            {project.code ? `${project.code} - ` : ""}{project.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowProjectModal(true)}
                        className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Proje Ekle"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    {errors.projectId && (
                      <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şirket *</label>
                    <div className="flex space-x-2 items-center">
                      <select
                        value={form.companyId}
                        onChange={(e) => handleChange("companyId", e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.companyId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Şirket Seçiniz</option>
                        {companies.filter(c => c.isActive !== false).map((company) => (
                          <option key={company.id} value={company.id.toString()}>
                            {company.code ? `${company.code} - ` : ""}{company.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCompanyModal(true)}
                        className="px-3 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Şirket Ekle"
                      >
                        <IconPlus size={16} />
                      </button>
                    </div>
                    {errors.companyId && (
                      <p className="text-red-500 text-xs mt-1">{errors.companyId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Durum ve Öncelik */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Durum ve Öncelik</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durum *</label>
                    <select
                      value={form.statusId}
                      onChange={(e) => handleChange("statusId", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.statusId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Durum Seçiniz</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id.toString()}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    {errors.statusId && (
                      <p className="text-red-500 text-xs mt-1">{errors.statusId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik *</label>
                    <select
                      value={form.priorityId}
                      onChange={(e) => handleChange("priorityId", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.priorityId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Öncelik Seçiniz</option>
                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id.toString()}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                    {errors.priorityId && (
                      <p className="text-red-500 text-xs mt-1">{errors.priorityId}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tarih Bilgileri */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Tarih Bilgileri
                  <IconCalendar size={20} className="inline ml-2 text-green-600" />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talep Tarihi *
                    </label>
                    <input
                      type="date"
                      value={form.requestedDate}
                      onChange={(e) => handleChange("requestedDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.requestedDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.requestedDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.requestedDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gereksinim Tarihi *
                    </label>
                    <input
                      type="date"
                      value={form.requiredDate}
                      onChange={(e) => handleChange("requiredDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.requiredDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.requiredDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.requiredDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onay Tarihi
                    </label>
                    <input
                      type="date"
                      value={form.approvedDate}
                      onChange={(e) => handleChange("approvedDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Onay Bilgileri */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Onay Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={form.isApproved}
                        onChange={(e) => handleChange("isApproved", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Onaylandı</label>
                    </div>

                    {form.isApproved && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Onaylayan Kişi
                        </label>
                        <select
                          value={form.approvedBy}
                          onChange={(e) => handleChange("approvedBy", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Onaylayan Seçiniz</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id.toString()}>
                              {user.firstName} {user.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {form.isApproved && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onay Notları
                      </label>
                      <textarea
                        value={form.approvalNotes}
                        onChange={(e) => handleChange("approvalNotes", e.target.value)}
                        placeholder="Onay ile ilgili notlar..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bütçe Bilgileri */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bütçe Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahmini Bütçe
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.estimatedBudget}
                      onChange={(e) => handleChange("estimatedBudget", e.target.value)}
                      placeholder="0.00"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.estimatedBudget ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.estimatedBudget && (
                      <p className="text-red-500 text-xs mt-1">{errors.estimatedBudget}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Para Birimi
                    </label>
                    <select
                      value={form.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="TRY">TRY - Türk Lirası</option>
                      <option value="USD">USD - Amerikan Doları</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Açıklamalar */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Açıklamalar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Talep Açıklaması *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Talep ile ilgili detaylı açıklama..."
                      rows="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ek Notlar
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Ek notlar ve açıklamalar..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dosya Ekleri */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Dosya Ekleri
                  <IconUpload size={20} className="inline ml-2 text-indigo-600" />
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosya Seç
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,.txt"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, Excel, Resim dosyaları kabul edilir (Max: 10MB)
                    </p>
                  </div>

                  {/* Seçilen dosyalar listesi */}
                  {attachmentFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Seçilen Dosyalar:</h4>
                      {attachmentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <IconUpload size={16} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <IconX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} />
                      <span>Talep Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Proje Ekleme Modalı */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Yeni Proje Ekle</h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Proje Adı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={projectForm.code}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Proje Kodu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Proje Açıklaması"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectForm.isActive}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">Aktif</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded"
                  onClick={() => setShowProjectModal(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleProjectSave}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Şirket Ekleme Modalı */}
        {showCompanyModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Yeni Şirket Ekle</h3>
                <button
                  onClick={() => setShowCompanyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Şirket Adı"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={companyForm.code}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Şirket Kodu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Şirket Açıklaması"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={companyForm.isActive}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">Aktif</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded"
                  onClick={() => setShowCompanyModal(false)}
                >
                  İptal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleCompanySave}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandAddModal;