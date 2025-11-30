const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer process
contextBridge.exposeInMainWorld('electron', {
  // API de Autenticación
  auth: {
    login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    changePassword: (adminId, newPassword) => ipcRenderer.invoke('auth:changePassword', adminId, newPassword)
  },

  // API de Administradores
  admins: {
    getAll: () => ipcRenderer.invoke('admins:getAll'),
    getById: (id) => ipcRenderer.invoke('admins:getById', id),
    create: (adminData) => ipcRenderer.invoke('admins:create', adminData),
    update: (id, adminData) => ipcRenderer.invoke('admins:update', id, adminData),
    delete: (id) => ipcRenderer.invoke('admins:delete', id),
    toggleActive: (id) => ipcRenderer.invoke('admins:toggleActive', id)
  },

  // API de Usuarios
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    getById: (id) => ipcRenderer.invoke('users:getById', id),
    create: (userData) => ipcRenderer.invoke('users:create', userData),
    update: (id, userData) => ipcRenderer.invoke('users:update', id, userData),
    toggleActive: (id) => ipcRenderer.invoke('users:toggleActive', id),
    search: (term) => ipcRenderer.invoke('users:search', term),
    assignMembership: (userId, membershipId, startDate) => ipcRenderer.invoke('users:assignMembership', userId, membershipId, startDate),
    removeMembership: (userId) => ipcRenderer.invoke('users:removeMembership', userId),
    renewMembership: (userId) => ipcRenderer.invoke('users:renewMembership', userId),
    generateNip: () => ipcRenderer.invoke('users:generateNip'),
    checkNip: (nip, excludeUserId) => ipcRenderer.invoke('users:checkNip', nip, excludeUserId)
  },

  // API de Membresías
  memberships: {
    getAll: () => ipcRenderer.invoke('memberships:getAll'),
    getById: (id) => ipcRenderer.invoke('memberships:getById', id),
    create: (membershipData) => ipcRenderer.invoke('memberships:create', membershipData),
    update: (id, membershipData) => ipcRenderer.invoke('memberships:update', id, membershipData),
    toggleActive: (id) => ipcRenderer.invoke('memberships:toggleActive', id),
    search: (term) => ipcRenderer.invoke('memberships:search', term)
  },

  // API de Check-ins
  checkins: {
    checkInByNip: (nip) => ipcRenderer.invoke('checkins:checkInByNip', nip),
    getToday: () => ipcRenderer.invoke('checkins:getToday'),
    getByDateRange: (startDate, endDate) => ipcRenderer.invoke('checkins:getByDateRange', startDate, endDate),
    getUserHistory: (userId, limit) => ipcRenderer.invoke('checkins:getUserHistory', userId, limit),
    getStats: (period) => ipcRenderer.invoke('checkins:getStats', period),
    getCurrentlyInGym: () => ipcRenderer.invoke('checkins:getCurrentlyInGym')
  },

  // API de Pagos
  payments: {
    create: (paymentData) => ipcRenderer.invoke('payments:create', paymentData),
    getAll: (limit) => ipcRenderer.invoke('payments:getAll', limit),
    getByUserId: (userId, limit) => ipcRenderer.invoke('payments:getByUserId', userId, limit),
    getByDateRange: (startDate, endDate) => ipcRenderer.invoke('payments:getByDateRange', startDate, endDate),
    getStats: (period) => ipcRenderer.invoke('payments:getStats', period),
    getTodaySummary: () => ipcRenderer.invoke('payments:getTodaySummary')
  },

  // API de Máquinas
  machines: {
    getAll: () => ipcRenderer.invoke('machines:getAll'),
    getAllActive: () => ipcRenderer.invoke('machines:getAllActive'),
    getById: (id) => ipcRenderer.invoke('machines:getById', id),
    getByCategory: (category) => ipcRenderer.invoke('machines:getByCategory', category),
    getByStatus: (status) => ipcRenderer.invoke('machines:getByStatus', status),
    create: (machineData) => ipcRenderer.invoke('machines:create', machineData),
    update: (id, machineData) => ipcRenderer.invoke('machines:update', id, machineData),
    delete: (id) => ipcRenderer.invoke('machines:delete', id),
    toggleStatus: (id, newStatus) => ipcRenderer.invoke('machines:toggleStatus', id, newStatus),
    getCategories: () => ipcRenderer.invoke('machines:getCategories'),
    createCategory: (data) => ipcRenderer.invoke('machines:createCategory', data),
    updateCategory: (id, data) => ipcRenderer.invoke('machines:updateCategory', id, data),
    deleteCategory: (id) => ipcRenderer.invoke('machines:deleteCategory', id),
    getLocations: () => ipcRenderer.invoke('machines:getLocations'),
    createLocation: (data) => ipcRenderer.invoke('machines:createLocation', data),
    updateLocation: (id, data) => ipcRenderer.invoke('machines:updateLocation', id, data),
    deleteLocation: (id) => ipcRenderer.invoke('machines:deleteLocation', id),
    getStats: () => ipcRenderer.invoke('machines:getStats')
  }
});
