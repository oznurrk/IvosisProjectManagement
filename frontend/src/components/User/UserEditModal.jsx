import React, { useState, useEffect } from "react";

const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "User",
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, role: user.role });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(user.id, form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Kullanıcıyı Güncelle</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Ad Soyad</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm">E-posta</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm">Rol</label>
            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="User">Kullanıcı</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
