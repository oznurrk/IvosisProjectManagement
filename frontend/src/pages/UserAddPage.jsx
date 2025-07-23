// src/pages/UserAddPage.jsx
import React, { useState } from "react";
import axios from "axios";

const UserAddPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const response = await axios.post("/api/users", form);
      setSuccess("Kullanıcı başarıyla eklendi.");
      setForm({ name: "", email: "", password: "", role: "User" });
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Kullanıcı Ekle</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad Soyad</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Şifre</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="User">Kullanıcı</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
};

export default UserAddPage;
