import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header/Header";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import FilterAndSearch from "../Layout/FilterAndSearch";
import PersonnelEditModal from "../components/Personel/PersonnelEditModal";
import { useNavigate } from "react-router-dom";


const PersonnelListPage = () => {
  const [personnel, setPersonnel] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();
 
  const token = localStorage.getItem("token");


  const [searchFilters, setSearchFilters] = useState({
    name: "",
    surname: "",
    sicilNo: "",
    department: "",
    workStatus: ""
  });


  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/personnel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonnel(res.data);
    } catch (err) {
      console.error("Personel listesi alınamadı", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPersonnel();
  }, []);


  const handleEdit = (person) => {
    setSelectedPersonnel(person);
    setShowModal(true);
  };


  const handleViewDetails = (person) => {
    setSelectedPersonnel(person);
    setShowDetailModal(true);
  };


  const handleUpdate = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/personnel/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPersonnel();
      setShowModal(false);
    } catch (err) {
      console.error("Güncelleme hatası", err);
      throw err;
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(`http://localhost:5000/api/personnel/${id}`, {
          headers: { Authorization: `Bearer ${token}`},
        });
        fetchPersonnel();
      } catch (err) {
        console.error("Silme hatası", err);
        alert("Personel silinirken bir hata oluştu.");
      }
    }
  };


  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };


  const clearFilters = () => {
    setSearchFilters({
      name: "",
      surname: "",
      sicilNo: "",
      department: "",
      workStatus: ""
    });
    setCurrentPage(1);
  };


  const visiblePersonnel = personnel.filter((person) => {
    const nameMatch = person.name.toLowerCase().includes(searchFilters.name.toLowerCase());
    const surnameMatch = person.surname.toLowerCase().includes(searchFilters.surname.toLowerCase());
    const sicilMatch = person.sicilNo.toLowerCase().includes(searchFilters.sicilNo.toLowerCase());
    const departmentMatch = person.department?.toLowerCase().includes(searchFilters.department.toLowerCase()) || !searchFilters.department;
    const statusMatch = !searchFilters.workStatus || person.workStatus === searchFilters.workStatus;
   
    return nameMatch && surnameMatch && sicilMatch && departmentMatch && statusMatch;
  });


  // Pagination
  const totalPages = Math.ceil(visiblePersonnel.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPersonnel = visiblePersonnel.slice(startIndex, endIndex);


  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };


  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY"
    }).format(amount);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header title="İnsan Kaynakları" subtitle="Personel Listesi" icon={IconUsers} />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header
        title="İnsan Kaynakları"
        subtitle="Personel Listesi"
        icon={IconUsers}
        totalCount={` ${visiblePersonnel.length} personel (${personnel.filter(p => p.workStatus === 'Aktif').length} aktif)`}
      />


      {/* Filtreleme alanı */}
      <div className="px-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            { key: "sicilNo", type: "text", placeholder: "Sicil No..." },
            { key: "name", type: "text", placeholder: "Ad..." },
            { key: "surname", type: "text", placeholder: "Soyad..." },
            { key: "department", type: "text", placeholder: "Bölüm..." },
            {
              key: "workStatus",
              type: "select",
              placeholder: "Çalışma Durumu",
              options: [
                { value: "", label: "Tümü" },
                { value: "Aktif", label: "Aktif" },
                { value: "Pasif", label: "Pasif" }
              ]
            }
          ]}
        />
      </div>


      {/* Actions */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
          </div>
          <button
            onClick={() => navigate("/personel-add")}
            className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold"
          >
            <IconPlus size={20} />
            Ekle
          </button>
        </div>
      </div>


      {/* Tablo */}
      <div className="px-4">
        <div className="bg-blue rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Sicil No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Ünvan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Departman
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Giriş Tarihi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPersonnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {person.sicilNo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {person.photo && (
                          <img
                            className="h-8 w-8 rounded-full mr-3"
                            src={person.photo}
                            alt={`${person.name} ${person.surname}`}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {person.name} {person.surname}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.title || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.department || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.section || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(person.startDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.email || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        person.workStatus === 'Aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {person.workStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(person)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handleEdit(person)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, visiblePersonnel.length)}</span> arası,{" "}
                    toplam <span className="font-medium">{visiblePersonnel.length}</span> kayıt
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Önceki
                    </button>
                   
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                   
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Edit Modal */}
      <PersonnelEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        personnel={selectedPersonnel}
        onSave={handleUpdate}
      />


      {/* Detail Modal */}
      {showDetailModal && selectedPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Personel Detayları - {selectedPersonnel.name} {selectedPersonnel.surname}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
           
            <div className="p-6 space-y-6">
              {/* Fotoğraf ve Temel Bilgiler */}
              <div className="flex items-start space-x-6">
                {selectedPersonnel.photo && (
                  <img
                    src={selectedPersonnel.photo}
                    alt={`${selectedPersonnel.name} ${selectedPersonnel.surname}`}
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPersonnel.name} {selectedPersonnel.surname}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Sicil No:</span>
                      <span className="ml-2">{selectedPersonnel.sicilNo}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Durum:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedPersonnel.workStatus === 'Aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPersonnel.workStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Organizasyon Bilgileri */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Organizasyon Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Ünvan:</span>
                    <span className="ml-2">{selectedPersonnel.title || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Yaka:</span>
                    <span className="ml-2">{selectedPersonnel.badge || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Bölüm:</span>
                    <span className="ml-2">{selectedPersonnel.department || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Departman:</span>
                    <span className="ml-2">{selectedPersonnel.section || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Giriş Tarihi:</span>
                    <span className="ml-2">{formatDate(selectedPersonnel.startDate)}</span>
                  </div>
                </div>
              </div>


              {/* Kişisel Bilgiler */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Kişisel Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Doğum Yeri:</span>
                    <span className="ml-2">{selectedPersonnel.birthPlace || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Doğum Tarihi:</span>
                    <span className="ml-2">{formatDate(selectedPersonnel.birthDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">TC Kimlik No:</span>
                    <span className="ml-2">{selectedPersonnel.tcKimlikNo || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Cinsiyet:</span>
                    <span className="ml-2">{selectedPersonnel.gender || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Uyruk:</span>
                    <span className="ml-2">{selectedPersonnel.nationality || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Öğrenim:</span>
                    <span className="ml-2">{selectedPersonnel.educationLevel || "-"}</span>
                  </div>
                </div>
              </div>


              {/* İletişim Bilgileri */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">İletişim Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Cep Telefonu:</span>
                    <span className="ml-2">{selectedPersonnel.mobilePhone || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">E-posta:</span>
                    <span className="ml-2">{selectedPersonnel.email || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">İl:</span>
                    <span className="ml-2">{selectedPersonnel.city || "-"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">İlçe:</span>
                    <span className="ml-2">{selectedPersonnel.district || "-"}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Adres:</span>
                    <span className="ml-2">{selectedPersonnel.address || "-"}</span>
                  </div>
                </div>
              </div>


              {/* Mali Bilgiler */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Mali Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Maaş:</span>
                    <span className="ml-2">{formatCurrency(selectedPersonnel.salary)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">IBAN:</span>
                    <span className="ml-2">{selectedPersonnel.iban || "-"}</span>
                  </div>
                </div>
              </div>


              {/* Sistem Bilgileri */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Sistem Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Oluşturulma:</span>
                    <span className="ml-2">{formatDate(selectedPersonnel.createdDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Son Güncelleme:</span>
                    <span className="ml-2">{formatDate(selectedPersonnel.updatedDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PersonnelListPage;