import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header/Header";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import FilterAndSearch from "../Layout/FilterAndSearch";
import PersonnelEditModal from "../components/Personel/PersonnelEditModal";


const PersonnelListPage = () => {
  const { isMobile, setIsMobileMenuOpen } = useOutletContext();
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

  const handlePersonnelAdded = (person) => {
    setPersonnel((prev) => [...prev, person]); 
    setShowModal(false); 
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
          headers: { Authorization: `Bearer ${token}` },
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
        <Header 
          title="İnsan Kaynakları" 
          subtitle="Personel Listesi" 
          icon={IconUsers}
          showMenuButton={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
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
        showMenuButton={isMobile}
        onMenuClick={() => setIsMobileMenuOpen(true)}
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
      {/*
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
          </div>
          <button
            onClick={() => navigate("/personel-add")}
            className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-700 transition-all duration-200 flex items-center gap-2 font-semibold h-8"
          >
            <IconPlus size={20} />
            Ekle
          </button>
        </div>
      </div>
      */}
      <div className="fixed bottom-4 right-4 flex flex-row items-end space-x-2 z-50 md:bottom-6 md:right-6 md:space-x-4">
                <div className="relative group">
                  {/*}
                  <button
                    onClick={() => navigate("/personel-add")}
                    className="bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300">
                      <IconPlus className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <span className="absolute bottom-14 right-1/2 translate-x-1/2 px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Ekle
                    </span>
                    */}
                  <button
                    onClick={() => {
                      setSelectedPersonnel(null); // boş veriyoruz, çünkü yeni ekleme olacak
                      setShowModal(true); // modalı açıyoruz
                    }}
                    className="bg-green-500 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300">
                      <IconPlus className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>
              </div>


      {/* Tablo */}
      <div className="px-4">
        <div className="bg-blue rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-blue">
                <tr>
                  <th className="w-24 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Sicil No
                  </th>
                  <th className="w-48 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Ünvan
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Departman
                  </th>
                  <th className="w-40 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Firma
                  </th>
                  <th className="w-36 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Giriş Tarihi
                  </th>
                  <th className="w-56 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    E-posta
                  </th>
                  <th className="w-28 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="w-36 px-4 py-3 text-left text-xs font-medium text-ivosis-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPersonnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {person.sicilNo}
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {person.title || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {person.department || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {person.section || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(person.startDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {person.email || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${person.workStatus === 'Aktif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {person.workStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(person)}
                        className="text-ivosis-500 hover:text-ivosis-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handleEdit(person)}
                        className="text-ivosis-700 hover:text-ivosis-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs"
                      >
                        Düzenle
                      </button>
                      {/* 
                      <button
                     onClick={() => handleDelete(person.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                      >
                      Sil
                     </button>
                      */}
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber
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
        mode={selectedPersonnel ? "edit" : "add"}
        personnel={selectedPersonnel}
        onSave={selectedPersonnel ? handleUpdate : handlePersonnelAdded}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedPersonnel && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-ivosis-600 to-ivosis-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-32">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  {/* Profil Fotoğrafı */}
                  <div className="relative group">
                    {selectedPersonnel.photo ? (
                      <div className="relative">
                        <img
                          src={selectedPersonnel.photo}
                          alt={`${selectedPersonnel.name} ${selectedPersonnel.surname}`}
                          className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fotoğraf büyütme ikonu */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-white shadow-lg flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white leading-tight">
                      {selectedPersonnel.name} {selectedPersonnel.surname}
                    </h2>
                    <p className="text-blue-100 text-xs sm:text-sm mt-1">
                      {selectedPersonnel.title || "Personel Detayları"}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedPersonnel.workStatus === 'Aktif'
                        ? 'bg-green-200 bg-opacity-20 text-white border border-green-300'
                        : 'bg-red-200 bg-opacity-20 text-red-100 border border-red-300'
                        }`}>
                        <span className={`w-1 h-1 rounded-full mr-1.5 ${selectedPersonnel.workStatus === 'Aktif' ? 'bg-green-300' : 'bg-red-300'
                          }`}></span>
                        {selectedPersonnel.workStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg self-end sm:self-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-160px)]">
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

                {/* Temel Bilgiler */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Temel Bilgiler</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ad Soyad</label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedPersonnel.name} {selectedPersonnel.surname}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sicil No</label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedPersonnel.sicilNo}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">TC Kimlik No</label>
                      <p className="text-gray-900 font-mono text-sm sm:text-base">{selectedPersonnel.tcKimlikNo || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Organizasyon Bilgileri */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Organizasyon Bilgileri</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ünvan</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.title || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yaka</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.badge || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bölüm</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.department || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Departman</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.section || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Giriş Tarihi</label>
                      <p className="text-gray-900 text-sm sm:text-base">{formatDate(selectedPersonnel.startDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Kişisel Bilgiler */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Kişisel Bilgiler</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Doğum Yeri</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.birthPlace || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Doğum Tarihi</label>
                      <p className="text-gray-900 text-sm sm:text-base">{formatDate(selectedPersonnel.birthDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cinsiyet</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.gender || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uyruk</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.nationality || "-"}</p>
                    </div>
                    <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Öğrenim Durumu</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.educationLevel || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">İletişim Bilgileri</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cep Telefonu</label>
                      <p className="text-gray-900 font-mono text-sm sm:text-base">{selectedPersonnel.mobilePhone || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-posta</label>
                      <p className="text-gray-900 text-sm sm:text-base break-all">{selectedPersonnel.email || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">İl</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.city || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">İlçe</label>
                      <p className="text-gray-900 text-sm sm:text-base">{selectedPersonnel.district || "-"}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adres</label>
                      <p className="text-gray-900 text-sm sm:text-base leading-relaxed">{selectedPersonnel.address || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Mali Bilgiler */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Mali Bilgiler</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Maaş</label>
                      <p className="text-emerald-700 font-semibold text-base sm:text-lg">{formatCurrency(selectedPersonnel.salary)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">IBAN</label>
                      <p className="text-gray-900 font-mono text-xs sm:text-sm break-all">{selectedPersonnel.iban || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Sistem Bilgileri */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Sistem Bilgileri</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Oluşturulma Tarihi</label>
                      <p className="text-gray-900 text-sm sm:text-base">{formatDate(selectedPersonnel.createdDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Son Güncelleme</label>
                      <p className="text-gray-900 text-sm sm:text-base">{formatDate(selectedPersonnel.updatedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fotoğraf Büyütme Modalı */}
          {selectedPersonnel.photo && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-60 p-4 cursor-pointer"
              style={{ display: 'none' }}
              id="photoModal"
              onClick={() => document.getElementById('photoModal').style.display = 'none'}
            >
              <div className="relative max-w-2xl max-h-[80vh] w-full h-full flex items-center justify-center">
                <img
                  src={selectedPersonnel.photo}
                  alt={`${selectedPersonnel.name} ${selectedPersonnel.surname}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('photoModal').style.display = 'none';
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default PersonnelListPage;