const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getInstance } = require('./database/Database.cjs');
const UserRepository = require('./database/UserRepository.cjs');
const MembershipRepository = require('./database/MembershipRepository.cjs');
const AdminRepository = require('./database/AdminRepository.cjs');
const CheckinRepository = require('./database/CheckinRepository.cjs');
const PaymentRepository = require('./database/PaymentRepository.cjs');
const MachineRepository = require('./database/MachineRepository.cjs');

let mainWindow;
let dbManager = null;
let userRepo = null;
let membershipRepo = null;
let adminRepo = null;
let checkinRepo = null;
let paymentRepo = null;
let machineRepo = null;
let dbInitialized = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // En desarrollo carga desde Vite, en producción carga el build
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Inicializar base de datos y repositorios
function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    dbManager = getInstance();
    console.log('Database manager created');
    
    if (!dbManager || !dbManager.isConnected()) {
      throw new Error('Database manager failed to initialize');
    }
    
    const db = dbManager.getDatabase();
    console.log('Database connection obtained');
    
    userRepo = new UserRepository(db);
    console.log('UserRepository created');
    
    membershipRepo = new MembershipRepository(db);
    console.log('MembershipRepository created');
    
    adminRepo = new AdminRepository(db);
    console.log('AdminRepository created');
    
    checkinRepo = new CheckinRepository(db);
    console.log('CheckinRepository created');
    
    paymentRepo = new PaymentRepository(db);
    console.log('PaymentRepository created');
    
    machineRepo = new MachineRepository(db);
    console.log('MachineRepository created');
    
    dbInitialized = true;
    console.log('Database and repositories initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Stack trace:', error.stack);
    dbInitialized = false;
    return false;
  }
}

// Helper para verificar si la DB está lista
function checkDbReady() {
  if (!dbInitialized || !userRepo || !membershipRepo || !adminRepo || !checkinRepo || !paymentRepo || !machineRepo) {
    throw new Error('Database not initialized. Please restart the application.');
  }
}

// IPC Handlers para Usuarios
ipcMain.handle('users:getAll', async () => {
  try {
    checkDbReady();
    return userRepo.findAll();
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
});

ipcMain.handle('users:getById', async (event, id) => {
  try {
    checkDbReady();
    return userRepo.findById(id);
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
});

ipcMain.handle('users:create', async (event, userData) => {
  try {
    checkDbReady();
    return userRepo.create(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
});

ipcMain.handle('users:update', async (event, id, userData) => {
  try {
    checkDbReady();
    return userRepo.update(id, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
});

ipcMain.handle('users:toggleActive', async (event, id) => {
  try {
    checkDbReady();
    userRepo.toggleActive(id);
    return userRepo.findById(id);
  } catch (error) {
    console.error('Error toggling user active:', error);
    throw error;
  }
});

ipcMain.handle('users:search', async (event, term) => {
  try {
    checkDbReady();
    return userRepo.search(term);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
});

// IPC Handlers para asignación de membresías
ipcMain.handle('users:assignMembership', async (event, userId, membershipId, startDate) => {
  try {
    checkDbReady();
    return userRepo.assignMembership(userId, membershipId, startDate);
  } catch (error) {
    console.error('Error assigning membership:', error);
    throw error;
  }
});

ipcMain.handle('users:removeMembership', async (event, userId) => {
  try {
    checkDbReady();
    return userRepo.removeMembership(userId);
  } catch (error) {
    console.error('Error removing membership:', error);
    throw error;
  }
});

ipcMain.handle('users:renewMembership', async (event, userId) => {
  try {
    checkDbReady();
    return userRepo.renewMembership(userId);
  } catch (error) {
    console.error('Error renewing membership:', error);
    throw error;
  }
});

ipcMain.handle('users:generateNip', async () => {
  try {
    checkDbReady();
    return userRepo.generateUniqueNip();
  } catch (error) {
    console.error('Error generating NIP:', error);
    throw error;
  }
});

ipcMain.handle('users:checkNip', async (event, nip, excludeUserId) => {
  try {
    checkDbReady();
    return userRepo.nipExists(nip, excludeUserId);
  } catch (error) {
    console.error('Error checking NIP:', error);
    throw error;
  }
});

// IPC Handlers para Membresías
ipcMain.handle('memberships:getAll', async () => {
  try {
    checkDbReady();
    return membershipRepo.findAll();
  } catch (error) {
    console.error('Error getting memberships:', error);
    throw error;
  }
});

ipcMain.handle('memberships:getById', async (event, id) => {
  try {
    checkDbReady();
    return membershipRepo.findById(id);
  } catch (error) {
    console.error('Error getting membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:create', async (event, membershipData) => {
  try {
    checkDbReady();
    return membershipRepo.create(membershipData);
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:update', async (event, id, membershipData) => {
  try {
    checkDbReady();
    return membershipRepo.update(id, membershipData);
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:toggleActive', async (event, id) => {
  try {
    checkDbReady();
    membershipRepo.toggleActive(id);
    return membershipRepo.findById(id);
  } catch (error) {
    console.error('Error toggling membership active:', error);
    throw error;
  }
});

ipcMain.handle('memberships:search', async (event, term) => {
  try {
    checkDbReady();
    return membershipRepo.search(term);
  } catch (error) {
    console.error('Error searching memberships:', error);
    throw error;
  }
});

// IPC Handlers para Autenticación
ipcMain.handle('auth:login', async (event, username, password) => {
  try {
    checkDbReady();
    const admin = adminRepo.login(username, password);
    if (admin) {
      return { success: true, user: admin };
    }
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Error al iniciar sesión' };
  }
});

ipcMain.handle('auth:logout', async () => {
  return { success: true };
});

ipcMain.handle('auth:changePassword', async (event, adminId, newPassword) => {
  try {
    checkDbReady();
    const result = adminRepo.changePassword(adminId, newPassword);
    return { success: result };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Error al cambiar contraseña' };
  }
});

// IPC Handlers para gestión de Admins
ipcMain.handle('admins:getAll', async () => {
  try {
    checkDbReady();
    return adminRepo.findAll();
  } catch (error) {
    console.error('Error getting admins:', error);
    throw error;
  }
});

ipcMain.handle('admins:getById', async (event, id) => {
  try {
    checkDbReady();
    return adminRepo.findById(id);
  } catch (error) {
    console.error('Error getting admin:', error);
    throw error;
  }
});

ipcMain.handle('admins:create', async (event, adminData) => {
  try {
    checkDbReady();
    // Verificar si el username ya existe
    if (adminRepo.usernameExists(adminData.username)) {
      throw new Error('El nombre de usuario ya existe');
    }
    return adminRepo.create(adminData);
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
});

ipcMain.handle('admins:update', async (event, id, adminData) => {
  try {
    checkDbReady();
    return adminRepo.update(id, adminData);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
});

ipcMain.handle('admins:delete', async (event, id) => {
  try {
    checkDbReady();
    return adminRepo.delete(id);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
});

ipcMain.handle('admins:toggleActive', async (event, id) => {
  try {
    checkDbReady();
    adminRepo.toggleActive(id);
    return adminRepo.findById(id);
  } catch (error) {
    console.error('Error toggling admin active:', error);
    throw error;
  }
});

// IPC Handlers para Check-ins
ipcMain.handle('checkins:checkInByNip', async (event, nip) => {
  try {
    checkDbReady();
    return checkinRepo.checkInByNip(nip);
  } catch (error) {
    console.error('Error during check-in:', error);
    throw error;
  }
});

ipcMain.handle('checkins:getToday', async () => {
  try {
    checkDbReady();
    return checkinRepo.getTodayCheckins();
  } catch (error) {
    console.error('Error getting today checkins:', error);
    throw error;
  }
});

ipcMain.handle('checkins:getByDateRange', async (event, startDate, endDate) => {
  try {
    checkDbReady();
    return checkinRepo.getCheckinsByDateRange(startDate, endDate);
  } catch (error) {
    console.error('Error getting checkins by date range:', error);
    throw error;
  }
});

ipcMain.handle('checkins:getUserHistory', async (event, userId, limit) => {
  try {
    checkDbReady();
    return checkinRepo.getUserCheckins(userId, limit);
  } catch (error) {
    console.error('Error getting user checkins:', error);
    throw error;
  }
});

ipcMain.handle('checkins:getStats', async (event, period) => {
  try {
    checkDbReady();
    return checkinRepo.getAttendanceStats(period);
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    throw error;
  }
});

ipcMain.handle('checkins:getCurrentlyInGym', async () => {
  try {
    checkDbReady();
    return checkinRepo.getCurrentlyInGym();
  } catch (error) {
    console.error('Error getting currently in gym:', error);
    throw error;
  }
});

// IPC Handlers para Pagos
ipcMain.handle('payments:create', async (event, paymentData) => {
  try {
    checkDbReady();
    return paymentRepo.create(paymentData);
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
});

ipcMain.handle('payments:getAll', async (event, limit) => {
  try {
    checkDbReady();
    return paymentRepo.getAll(limit);
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
});

ipcMain.handle('payments:getByUserId', async (event, userId, limit) => {
  try {
    checkDbReady();
    return paymentRepo.getByUserId(userId, limit);
  } catch (error) {
    console.error('Error getting user payments:', error);
    throw error;
  }
});

ipcMain.handle('payments:getByDateRange', async (event, startDate, endDate) => {
  try {
    checkDbReady();
    return paymentRepo.getByDateRange(startDate, endDate);
  } catch (error) {
    console.error('Error getting payments by date range:', error);
    throw error;
  }
});

ipcMain.handle('payments:getStats', async (event, period) => {
  try {
    checkDbReady();
    return paymentRepo.getPaymentStats(period);
  } catch (error) {
    console.error('Error getting payment stats:', error);
    throw error;
  }
});

ipcMain.handle('payments:getTodaySummary', async () => {
  try {
    checkDbReady();
    return paymentRepo.getTodaySummary();
  } catch (error) {
    console.error('Error getting today payment summary:', error);
    throw error;
  }
});

// IPC Handlers para Máquinas
ipcMain.handle('machines:getAll', async () => {
  try {
    checkDbReady();
    return machineRepo.findAll();
  } catch (error) {
    console.error('Error getting machines:', error);
    throw error;
  }
});

ipcMain.handle('machines:getAllActive', async () => {
  try {
    checkDbReady();
    return machineRepo.findAllActive();
  } catch (error) {
    console.error('Error getting active machines:', error);
    throw error;
  }
});

ipcMain.handle('machines:getById', async (event, id) => {
  try {
    checkDbReady();
    return machineRepo.findById(id);
  } catch (error) {
    console.error('Error getting machine:', error);
    throw error;
  }
});

ipcMain.handle('machines:getByCategory', async (event, category) => {
  try {
    checkDbReady();
    return machineRepo.findByCategory(category);
  } catch (error) {
    console.error('Error getting machines by category:', error);
    throw error;
  }
});

ipcMain.handle('machines:getByStatus', async (event, status) => {
  try {
    checkDbReady();
    return machineRepo.findByStatus(status);
  } catch (error) {
    console.error('Error getting machines by status:', error);
    throw error;
  }
});

ipcMain.handle('machines:create', async (event, machineData) => {
  try {
    checkDbReady();
    return machineRepo.create(machineData);
  } catch (error) {
    console.error('Error creating machine:', error);
    throw error;
  }
});

ipcMain.handle('machines:update', async (event, id, machineData) => {
  try {
    checkDbReady();
    return machineRepo.update(id, machineData);
  } catch (error) {
    console.error('Error updating machine:', error);
    throw error;
  }
});

ipcMain.handle('machines:delete', async (event, id) => {
  try {
    checkDbReady();
    return machineRepo.delete(id);
  } catch (error) {
    console.error('Error deleting machine:', error);
    throw error;
  }
});

ipcMain.handle('machines:toggleStatus', async (event, id, newStatus) => {
  try {
    checkDbReady();
    return machineRepo.toggleStatus(id, newStatus);
  } catch (error) {
    console.error('Error toggling machine status:', error);
    throw error;
  }
});

ipcMain.handle('machines:getCategories', async () => {
  try {
    checkDbReady();
    return machineRepo.getAllCategories();
  } catch (error) {
    console.error('Error getting machine categories:', error);
    throw error;
  }
});

ipcMain.handle('machines:createCategory', async (event, data) => {
  try {
    checkDbReady();
    return machineRepo.createCategory(data);
  } catch (error) {
    console.error('Error creating machine category:', error);
    throw error;
  }
});

ipcMain.handle('machines:updateCategory', async (event, id, data) => {
  try {
    checkDbReady();
    return machineRepo.updateCategory(id, data);
  } catch (error) {
    console.error('Error updating machine category:', error);
    throw error;
  }
});

ipcMain.handle('machines:deleteCategory', async (event, id) => {
  try {
    checkDbReady();
    return machineRepo.deleteCategory(id);
  } catch (error) {
    console.error('Error deleting machine category:', error);
    throw error;
  }
});

ipcMain.handle('machines:getLocations', async () => {
  try {
    checkDbReady();
    return machineRepo.getAllLocations();
  } catch (error) {
    console.error('Error getting machine locations:', error);
    throw error;
  }
});

ipcMain.handle('machines:createLocation', async (event, data) => {
  try {
    checkDbReady();
    return machineRepo.createLocation(data);
  } catch (error) {
    console.error('Error creating machine location:', error);
    throw error;
  }
});

ipcMain.handle('machines:updateLocation', async (event, id, data) => {
  try {
    checkDbReady();
    return machineRepo.updateLocation(id, data);
  } catch (error) {
    console.error('Error updating machine location:', error);
    throw error;
  }
});

ipcMain.handle('machines:deleteLocation', async (event, id) => {
  try {
    checkDbReady();
    return machineRepo.deleteLocation(id);
  } catch (error) {
    console.error('Error deleting machine location:', error);
    throw error;
  }
});

ipcMain.handle('machines:getStats', async () => {
  try {
    checkDbReady();
    return machineRepo.getStats();
  } catch (error) {
    console.error('Error getting machine stats:', error);
    throw error;
  }
});

app.whenReady().then(() => {
  initializeDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Cerrar conexión a la base de datos
    if (dbManager) {
      dbManager.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});