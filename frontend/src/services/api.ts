import axios from 'axios';
import type { AuthResponse, ProduceListing, BuyerRequirement, Offer, Order, MarketPrice, Forecast, RouteResult, Notification, Payment, AdminStats } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('agridirect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
  register: (data: Record<string, any>) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
};

// Produce
export const produceService = {
  create: (data: Record<string, any>) =>
    api.post<ProduceListing>('/produce/', data).then(r => r.data),
  list: (params?: Record<string, any>) =>
    api.get<ProduceListing[]>('/produce/', { params }).then(r => r.data),
  get: (id: number) =>
    api.get<ProduceListing>(`/produce/${id}`).then(r => r.data),
  update: (id: number, data: Record<string, any>) =>
    api.put<ProduceListing>(`/produce/${id}`, data).then(r => r.data),
  delete: (id: number) =>
    api.delete(`/produce/${id}`).then(r => r.data),
};

// Buyer Requirements
export const requirementService = {
  create: (data: Record<string, any>) =>
    api.post<BuyerRequirement>('/requirements/', data).then(r => r.data),
  list: (params?: Record<string, any>) =>
    api.get<BuyerRequirement[]>('/requirements/', { params }).then(r => r.data),
  get: (id: number) =>
    api.get<BuyerRequirement>(`/requirements/${id}`).then(r => r.data),
};

// Matching
export const matchingService = {
  getMatches: (requirementId: number) =>
    api.get(`/matches/${requirementId}`).then(r => r.data),
};

// Offers
export const offerService = {
  create: (data: Record<string, any>) =>
    api.post<Offer>('/offers', data).then(r => r.data),
  list: (params?: Record<string, any>) =>
    api.get<Offer[]>('/offers', { params }).then(r => r.data),
  accept: (id: number) =>
    api.post(`/offers/${id}/accept`).then(r => r.data),
  reject: (id: number) =>
    api.post(`/offers/${id}/reject`).then(r => r.data),
};

// Orders
export const orderService = {
  create: (data: Record<string, any>) =>
    api.post<Order>('/orders', data).then(r => r.data),
  list: (params?: Record<string, any>) =>
    api.get<Order[]>('/orders', { params }).then(r => r.data),
  get: (id: number) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),
  updateStatus: (id: number, status: string) =>
    api.put(`/orders/${id}/status`, { status }).then(r => r.data),
};

// Market Prices
export const marketService = {
  getPrices: (params?: Record<string, any>) =>
    api.get<MarketPrice[]>('/market-prices/', { params }).then(r => r.data),
  getHistory: (crop: string, location?: string, days?: number) =>
    api.get('/market-prices/history', { params: { crop, location, days } }).then(r => r.data),
};

// Forecast
export const forecastService = {
  getForecast: (crop: string, location?: string, days?: number) =>
    api.get<Forecast>('/forecast', { params: { crop, location, days } }).then(r => r.data),
};

// AI Chat
export const aiService = {
  chat: (message: string) =>
    api.post('/ai/chat', { message }).then(r => r.data),
};

// Logistics
export const logisticsService = {
  optimizeRoute: (data: Record<string, any>) =>
    api.post<RouteResult>('/logistics/optimize-route', data).then(r => r.data),
};

// Notifications
export const notificationService = {
  list: () => api.get<Notification[]>('/notifications').then(r => r.data),
  markRead: (id: number) => api.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.put('/notifications/read-all').then(r => r.data),
};

// Payments
export const paymentService = {
  list: () => api.get<Payment[]>('/payments').then(r => r.data),
  update: (id: number, status: string) =>
    api.put(`/payments/${id}`, { status }).then(r => r.data),
};

// Admin
export const adminService = {
  getStats: () => api.get<AdminStats>('/admin/stats').then(r => r.data),
  getUsers: () => api.get('/admin/users').then(r => r.data),
  getSupplyDemand: () => api.get('/admin/supply-demand').then(r => r.data),
  verifyUser: (userId: number) => api.put(`/admin/users/${userId}/verify`).then(r => r.data),
};

export default api;
