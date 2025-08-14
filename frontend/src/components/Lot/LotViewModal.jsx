import React from "react";
import { IconX } from "@tabler/icons-react";



const LotViewModal = ({ isOpen, onClose, lot }) => {
  if (!isOpen || !lot) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Lot Detayları</h2>
              <p className="text-blue-100 text-sm">Lot ile ilgili tüm bilgiler</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lot Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><b>Lot No:</b> {lot.lotNumber}</div>
                <div><b>Barkod:</b> {lot.barcode}</div>
                <div><b>Başlangıç Ağırlık:</b> {lot.initialWeight}</div>
                <div><b>Mevcut Ağırlık:</b> {lot.currentWeight}</div>
                <div><b>Genişlik:</b> {lot.width}</div>
                <div><b>Kalınlık:</b> {lot.thickness}</div>
                <div><b>Kalite:</b> {lot.qualityGrade}</div>
                <div><b>Depo Pozisyonu:</b> {lot.storagePosition}</div>
                <div><b>Durum:</b> {lot.status}</div>
                <div><b>Bloklu:</b> {lot.isBlocked ? "Evet" : "Hayır"}</div>
                <div><b>Geliş Tarihi:</b> {lot.receiptDate ? new Date(lot.receiptDate).toLocaleDateString("tr-TR") : "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotViewModal;
