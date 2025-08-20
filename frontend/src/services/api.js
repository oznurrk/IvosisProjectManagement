
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Token ekleme
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ─── STOCK ITEMS ───────────────────────────────────────────────
export const fetchStockItems = () => api.get("/StockItems").then(r => r.data);
export const fetchLowStockItems = () => api.get("/StockItems/low-stock").then(r => r.data);
export const fetchCriticalStockItems = () => api.get("/StockItems/critical-stock").then(r => r.data);
export const addStockItem = (data) => api.post("/StockItems", data).then(r => r.data);
export const updateStockItem = (id, data) => api.put(`/StockItems/${id}`, data).then(r => r.data);
export const deleteStockItem = (id) => api.delete(`/StockItems/${id}`).then(r => r.data);

// Stock Cards (alias for Stock Items CRUD)
export const addStockCard = addStockItem;
export const updateStockCard = updateStockItem;
export const deleteStockCard = deleteStockItem;

// ─── STOCK LOTS ───────────────────────────────────────────────
export const fetchStockLots = () => api.get("/StockLot").then(r => r.data);
export const fetchStockLot = (id) => api.get(`/StockLot/${id}`).then(r => r.data);
export const fetchLotDetails = (lotId) => api.get(`/StockLot/${lotId}`).then(r => r.data);
export const addStockLot = (data) => api.post("/StockLot", data).then(r => r.data);
export const updateStockLot = (id, data) => api.put(`/StockLot/${id}`, data).then(r => r.data);
export const deleteStockLot = (id) => api.delete(`/StockLot/${id}`).then(r => r.data);

// ─── SUPPLIERS ───────────────────────────────────────────────
export const fetchSuppliers = () => api.get("/Suppliers").then(r => r.data);
export const addSupplier = (data) => api.post("/Suppliers", data).then(r => r.data);

// Stock Locations
export const fetchStockLocations = () => api.get("/StockLocations").then(r => r.data);

// ─── STOCK MOVEMENTS ───────────────────────────────────────────────
export const fetchStockMovements = () => api.get("/StockMovements").then(r => r.data);
export const stockIn = (data) => api.post("/StockMovements/stock-in", data).then(r => r.data);
export const stockOut = (data) => api.post("/StockMovements/stock-out", data).then(r => r.data);
export const stockTransfer = (data) => api.post("/StockMovements/transfer", data).then(r => r.data);
export const updateStockMovement = (id, data) => api.put(`/StockMovements/${id}`, data).then(r => r.data);
export const deleteStockMovement = (id) => api.delete(`/StockMovements/${id}`).then(r => r.data);

// ─── STOCK CATEGORIES ───────────────────────────────────────────────
export const fetchStockCategories = () => api.get("/StockCategories").then(r => r.data);
export const addStockCategory = (data) => api.post("/StockCategories", data).then(r => r.data);
export const updateStockCategory = (id, data) => api.put(`/StockCategories/${id}`, data).then(r => r.data);
export const deleteStockCategory = (id) => api.delete(`/StockCategories/${id}`).then(r => r.data);

// ─── MATERIALS ───────────────────────────────────────────────
export const fetchMaterialNames = () => api.get("/MaterialNames").then(r => r.data);
export const addMaterialName = (data) => api.post("/MaterialNames", data).then(r => r.data);
export const fetchMaterialTypes = () => api.get("/MaterialTypes").then(r => r.data);
export const addMaterialType = (data) => api.post("/MaterialTypes", data).then(r => r.data);
export const fetchMaterialQualities = () => api.get("/MaterialQualities").then(r => r.data);
export const addMaterialQuality = (data) => api.post("/MaterialQualities", data).then(r => r.data);

// ─── UNITS ───────────────────────────────────────────────
export const fetchUnits = () => api.get("/Unit").then(r => r.data);
