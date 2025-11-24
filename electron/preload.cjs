const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer process
contextBridge.exposeInMainWorld('electron', {
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
    renewMembership: (userId) => ipcRenderer.invoke('users:renewMembership', userId)
  },

  // API de Membresías
  memberships: {
    getAll: () => ipcRenderer.invoke('memberships:getAll'),
    getById: (id) => ipcRenderer.invoke('memberships:getById', id),
    create: (membershipData) => ipcRenderer.invoke('memberships:create', membershipData),
    update: (id, membershipData) => ipcRenderer.invoke('memberships:update', id, membershipData),
    toggleActive: (id) => ipcRenderer.invoke('memberships:toggleActive', id),
    search: (term) => ipcRenderer.invoke('memberships:search', term)
  }
});
