import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:5000/api',
});

export const login = (data) => API.post('/auth/login', data);
export const getTasks = (processId) => API.get('/tasks?processId=${processId}');
export const updateTask = (id, data) => API.put('/tasks/${id}', data);
export const getProcesses = () => API.get('/processes');
export const getUsers = () => API.get('/users');