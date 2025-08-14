import React from "react";
import { IconX, IconTrash } from "@tabler/icons-react";



const LotDeleteModal = ({ isOpen, onClose, lot, onDelete }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Lot Sil</h2>
              <p className="text-red-100 text-sm">Bu işlem geri alınamaz!</p>
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
          <div className="p-8 flex flex-col items-center">
            <div className="bg-red-100 rounded-full p-4 mb-4">
              <IconTrash size={36} className="text-red-600" />
            </div>
            <p className="text-lg text-gray-800 mb-4 text-center">Bu lotu silmek istediğinize emin misiniz?</p>
            <div className="flex justify-center gap-4 w-full mt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-1/2"
              >
                Vazgeç
              </button>
              <button
                onClick={() => onDelete(lot)}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center w-1/2"
              >
                <IconTrash size={16} className="mr-2" /> Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDeleteModal;
