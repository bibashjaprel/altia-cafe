import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  signup: (username: string, password: string, full_name: string, role?: string) =>
    api.post('/auth/signup', { username, password, full_name, role }),
  getMe: () => api.get('/auth/me'),
};

export const tables = {
  getAll: () => api.get('/tables'),
  getOne: (id: number) => api.get(`/tables/${id}`),
  create: (data: any) => api.post('/tables', data),
  update: (id: number, data: any) => api.put(`/tables/${id}`, data),
  delete: (id: number) => api.delete(`/tables/${id}`),
  assignCustomer: (id: number, customer_id: number | null, status: string, guest_name?: string, guest_phone?: string) =>
    api.post(`/tables/${id}/assign`, { customer_id, status, guest_name, guest_phone }),
  getOrders: (id: number) => api.get(`/tables/${id}/orders`),
  payout: (id: number, amount: number, method: string, notes?: string) =>
    api.post(`/tables/${id}/payout`, { amount, method, notes }),
};

export const customers = {
  getAll: () => api.get('/customers'),
  getOne: (id: number) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  getBalance: (id: number) => api.get(`/customers/${id}/balance`),
};

export const orders = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getOne: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
  addItem: (id: number, item: any) => api.post(`/orders/${id}/items`, item),
};

export const payments = {
  getAll: (params?: any) => api.get('/payments', { params }),
  getOne: (id: number) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

export const menu = {
  getAll: (params?: any) => api.get('/menu', { params }),
  getCategories: () => api.get('/menu/categories'),
  getOne: (id: number) => api.get(`/menu/${id}`),
  create: (data: any) => api.post('/menu', data),
  update: (id: number, data: any) => api.put(`/menu/${id}`, data),
  delete: (id: number) => api.delete(`/menu/${id}`),
};

export default api;
