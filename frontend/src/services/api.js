import axios from 'axios';

// Stock Items ana listeleme fonksiyonu
export const fetchStockItems = async () => {
  const res = await axios.get(`${API_BASE}/StockItems`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

// Stock Locations
export const fetchStockLocations = async () => {
  const res = await axios.get(`${API_BASE}/StockLocations`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Suppliers
export const fetchSuppliers = async () => {
  const res = await axios.get(`${API_BASE}/Suppliers`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

export const addSupplier = async (data) => {
  const res = await axios.post(`${API_BASE}/Suppliers`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Lot
export const addStockLot = async (data) => {
  const res = await axios.post(`${API_BASE}/StockLot`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Movements
export const stockIn = async (data) => {
  const res = await axios.post(`${API_BASE}/StockMovements/stock-in`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Lot Details
export const fetchLotDetails = async (lotId) => {
  const res = await axios.get(`${API_BASE}/StockLot/${lotId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Lot CRUD (tamamlayıcı fonksiyonlar)
export const fetchStockLot = async (id) => {
  const res = await axios.get(`${API_BASE}/StockLot/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const fetchStockLots = async () => {
  const res = await axios.get(`${API_BASE}/StockLot`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Movements CRUD
export const fetchStockMovements = async () => {
  const res = await axios.get(`${API_BASE}/StockMovements`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const updateStockMovement = async (id, data) => {
  const res = await axios.put(`${API_BASE}/StockMovements/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const deleteStockMovement = async (id) => {
  const res = await axios.delete(`${API_BASE}/StockMovements/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Items (ek fonksiyonlar) -- TEKRAR EDEN TANIM KALDIRILDI
export const fetchLowStockItems = async () => {
  const res = await axios.get(`${API_BASE}/StockItems/low-stock`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const fetchCriticalStockItems = async () => {
  const res = await axios.get(`${API_BASE}/StockItems/critical-stock`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Cards (StockItems CRUD tekrar)
export const addStockCard = async (data) => {
  const res = await axios.post(`${API_BASE}/StockItems`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const updateStockCard = async (id, data) => {
  const res = await axios.put(`${API_BASE}/StockItems/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const deleteStockCard = async (id) => {
  const res = await axios.delete(`${API_BASE}/StockItems/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
// Stock Categories
export const fetchStockCategories = async () => {
  const res = await axios.get(`${API_BASE}/StockCategories`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const addStockCategory = async (data) => {
  const res = await axios.post(`${API_BASE}/StockCategories`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const updateStockCategory = async (id, data) => {
  const res = await axios.put(`${API_BASE}/StockCategories/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const deleteStockCategory = async (id) => {
  const res = await axios.delete(`${API_BASE}/StockCategories/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Units
export const fetchUnits = async () => {
  const res = await axios.get(`${API_BASE}/Unit`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Material Names/Types/Qualities
export const fetchMaterialNames = async () => {
  const res = await axios.get(`${API_BASE}/MaterialNames`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const addMaterialName = async (data) => {
  const res = await axios.post(`${API_BASE}/MaterialNames`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const fetchMaterialTypes = async () => {
  const res = await axios.get(`${API_BASE}/MaterialTypes`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const addMaterialType = async (data) => {
  const res = await axios.post(`${API_BASE}/MaterialTypes`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const fetchMaterialQualities = async () => {
  const res = await axios.get(`${API_BASE}/MaterialQualities`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const addMaterialQuality = async (data) => {
  const res = await axios.post(`${API_BASE}/MaterialQualities`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Items CRUD
export const addStockItem = async (data) => {
  const res = await axios.post(`${API_BASE}/StockItems`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const updateStockItem = async (id, data) => {
  const res = await axios.put(`${API_BASE}/StockItems/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const deleteStockItem = async (id) => {
  const res = await axios.delete(`${API_BASE}/StockItems/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Lot CRUD
export const updateStockLot = async (id, data) => {
  const res = await axios.put(`${API_BASE}/StockLot/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const deleteStockLot = async (id) => {
  const res = await axios.delete(`${API_BASE}/StockLot/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};

// Stock Movements
export const stockOut = async (data) => {
  const res = await axios.post(`${API_BASE}/StockMovements/stock-out`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
export const stockTransfer = async (data) => {
  const res = await axios.post(`${API_BASE}/StockMovements/transfer`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.data;
};
