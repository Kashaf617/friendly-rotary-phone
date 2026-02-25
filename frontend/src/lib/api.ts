import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle 401 and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: newRefresh } = res.data.data || res.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; first_name: string; last_name: string; tenant_name: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

// Tenants API
export const tenantsApi = {
  getAll: () => api.get('/tenants'),
  getOne: (id: string) => api.get(`/tenants/${id}`),
  getStats: () => api.get('/tenants/stats'),
  create: (data: any) => api.post('/tenants', data),
  update: (id: string, data: any) => api.put(`/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/tenants/${id}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Menu API
export const menuApi = {
  getCategories: () => api.get('/menu/categories'),
  getCategory: (id: string) => api.get(`/menu/categories/${id}`),
  createCategory: (data: any) => api.post('/menu/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/menu/categories/${id}`),
  getItems: (categoryId?: string) =>
    api.get('/menu/items', { params: categoryId ? { category_id: categoryId } : {} }),
  getItem: (id: string) => api.get(`/menu/items/${id}`),
  createItem: (data: any) => api.post('/menu/items', data),
  updateItem: (id: string, data: any) => api.put(`/menu/items/${id}`, data),
  deleteItem: (id: string) => api.delete(`/menu/items/${id}`),
  toggleAvailability: (id: string) => api.patch(`/menu/items/${id}/toggle-availability`),
};

// Orders API
export const ordersApi = {
  getAll: (status?: string) => api.get('/orders', { params: status ? { status } : {} }),
  getLive: () => api.get('/orders/live'),
  getOne: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  updateKitchenStatus: (orderItemId: string, kitchenStatus: string) =>
    api.patch('/orders/kitchen-status', { order_item_id: orderItemId, kitchen_status: kitchenStatus }),
  processPayment: (id: string, data: any) => api.post(`/orders/${id}/payment`, data),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
  getDailySummary: (date?: string) => api.get('/orders/daily-summary', { params: date ? { date } : {} }),
};

// Inventory API
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getOne: (id: string) => api.get(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  getValue: () => api.get('/inventory/value'),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  restock: (id: string, quantity: number) => api.patch(`/inventory/${id}/restock`, { quantity }),
};

// HR API
export const hrApi = {
  getEmployees: () => api.get('/hr/employees'),
  getEmployee: (id: string) => api.get(`/hr/employees/${id}`),
  createEmployee: (data: any) => api.post('/hr/employees', data),
  updateEmployee: (id: string, data: any) => api.put(`/hr/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/hr/employees/${id}`),
  clockIn: (employeeId: string) => api.post(`/hr/attendance/clock-in/${employeeId}`),
  clockOut: (employeeId: string) => api.post(`/hr/attendance/clock-out/${employeeId}`),
  getAttendance: (employeeId?: string, month?: string) =>
    api.get('/hr/attendance', { params: { employee_id: employeeId, month } }),
  generatePayroll: (period: string) => api.post('/hr/payroll/generate', { period }),
  getPayroll: (period?: string) => api.get('/hr/payroll', { params: period ? { period } : {} }),
  approvePayroll: (id: string) => api.patch(`/hr/payroll/${id}/approve`),
  exportWPS: (period: string) => api.get('/hr/payroll/wps-export', { params: { period } }),
};

// Accounting API
export const accountingApi = {
  getInvoices: () => api.get('/accounting/invoices'),
  getInvoice: (id: string) => api.get(`/accounting/invoices/${id}`),
  getTransactions: (type?: string, category?: string) =>
    api.get('/accounting/transactions', { params: { type, category } }),
  createTransaction: (data: any) => api.post('/accounting/transactions', data),
  getProfitLoss: (startDate: string, endDate: string) =>
    api.get('/accounting/reports/profit-loss', { params: { start_date: startDate, end_date: endDate } }),
  getVatReport: (startDate: string, endDate: string) =>
    api.get('/accounting/reports/vat', { params: { start_date: startDate, end_date: endDate } }),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSalesTrend: (days?: number) => api.get('/analytics/sales-trend', { params: { days } }),
  getTopItems: (limit?: number) => api.get('/analytics/top-items', { params: { limit } }),
  getRevenueByType: () => api.get('/analytics/revenue-by-type'),
  getHourlySales: (date?: string) => api.get('/analytics/hourly-sales', { params: { date } }),
};

// Suppliers API
export const suppliersApi = {
  getSuppliers: () => api.get('/suppliers'),
  getSupplier: (id: string) => api.get(`/suppliers/${id}`),
  createSupplier: (data: any) => api.post('/suppliers', data),
  updateSupplier: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id: string) => api.delete(`/suppliers/${id}`),
  getPurchaseOrders: () => api.get('/suppliers/purchase-orders/all'),
  getPurchaseOrder: (id: string) => api.get(`/suppliers/purchase-orders/${id}`),
  createPurchaseOrder: (data: any) => api.post('/suppliers/purchase-orders', data),
  updatePurchaseOrderStatus: (id: string, status: string) =>
    api.patch(`/suppliers/purchase-orders/${id}/status`, { status }),
};

// Subscription API
export const subscriptionApi = {
  createSubscription: (data: any) => api.post('/subscriptions', data),
  getSubscriptions: () => api.get('/subscriptions'),
  updateSubscription: (id: string, data: any) => api.patch(`/subscriptions/${id}`, data),
  deleteSubscription: (id: string) => api.delete(`/subscriptions/${id}`),
  getCurrent: () => api.get('/subscriptions/current'),
  getAll: () => api.get('/subscriptions'),
  upgrade: (plan: string) => api.post('/subscriptions/upgrade', { plan }),
  checkLimits: () => api.get('/subscriptions/check-limits'),
};

// Notifications API
export const notificationsApi = {
  getAll: (unreadOnly?: boolean) =>
    api.get('/notifications', { params: { unread_only: unreadOnly } }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Settings API
export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  upsert: (data: { key: string; value: string }) => api.post('/settings', data),
  update: (key: string, data: { value: string }) => api.put(`/settings/${key}`, data),
  delete: (key: string) => api.delete(`/settings/${key}`),
};
