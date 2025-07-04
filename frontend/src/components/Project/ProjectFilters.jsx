// components/ProjectFilters.jsx

import React from "react";

const ProjectFilters = ({
  searchTerm,
  onSearchChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="mb-6 flex flex-col lg:flex-row flex-wrap gap-4 items-stretch justify-between">
      {/* Arama alanı */}
      <input
        type="text"
        placeholder="Proje adı, açıklama, tarih, öncelik veya durum ile ara..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] px-6 py-2 border border-ivosis-400 rounded-md shadow-sm"
      />

      {/* Sıralama alanları */}
      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value)}
          className="px-3 py-2 border border-ivosis-400 rounded-md shadow-sm"
        >
          <option value="startDate">Başlama Tarihi</option>
          <option value="endDate">Bitiş Tarihi</option>
          <option value="createdAt">Eklenme Tarihi</option>
          <option value="priority">Öncelik</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="px-3 py-2 border border-ivosis-400 rounded-md shadow-sm"
        >
          <option value="asc">Artan</option>
          <option value="desc">Azalan</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectFilters;
