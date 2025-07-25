import React, { useEffect, useState } from "react";
import axios from "axios";
import UserEditModal from "../components/User/UserEditModal";
import Header from "../components/Header/Header";
import { IconLayoutGrid } from "@tabler/icons-react";
import FilterAndSearch from "../Layout/FilterAndSearch";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users",{
            headers: {Authorization: `Bearer ${token}`},
          });
      setUsers(res.data);
    } catch (err) {
      console.error("Kullanıcılar alınamadı", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, updatedData,{
            headers: {Authorization: `Bearer ${token}`},
          });
      fetchUsers(); // listeyi güncelle
    } catch (err) {
      console.error("Güncelleme hatası", err);
    }
  };

  
  const [searchFilters, setSearchFilters] = useState({
      name: "",
      email: ""
    });

    const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // filtre değişince sayfa 1'e dönsün
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      email: ""
    });
  };
  
  const visibleUsers = users.filter((user) => {
  const nameMatch = user.name.toLowerCase().includes(searchFilters.name.toLowerCase());
  //const emailMatch = user.email.toLowerCase().includes(searchFilters.email.toLowerCase());
  return nameMatch; //&& emailMatch;
  });


  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
            title="Kullanıcılar"
            subtitle="Kullanıcı Listesi"
            icon={IconLayoutGrid
            }
          />
 {/* Filtreleme alanı */}
      <div className="px-4">
        <FilterAndSearch
          searchFilters={searchFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          filtersConfig={[
            { key: "name", type: "text", placeholder: "Adına göre ara..." },
            //{ key: "email", type: "text", placeholder: "E-posta ile ara..." }
          ]}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Ad</th>
              <th className="p-2 border">E-posta</th>
              <th className="p-2 border">Ünvan</th>
              <th className="p-2 border">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{user.id}</td>
                <td className="p-2 border">{user.name}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border text-center">{user.role}</td>
                <td className="p-2 border text-center space-x-2">
                  <button
                    className="bg-ivosis-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(user)}
                  >
                    Güncelle
                  </button>
                  {/* Silme butonu sonra eklenecek */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={selectedUser}
        onSave={handleUpdate}
      />
    </div>
  );
};

export default UserListPage;
