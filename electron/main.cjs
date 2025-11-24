const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getInstance } = require('./database/Database.cjs');
const UserRepository = require('./database/UserRepository.cjs');
const MembershipRepository = require('./database/MembershipRepository.cjs');

let mainWindow;
let dbManager;
let userRepo;
let membershipRepo;

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
    
    const db = dbManager.getDatabase();
    console.log('Database connection obtained');
    
    userRepo = new UserRepository(db);
    console.log('UserRepository created');
    
    membershipRepo = new MembershipRepository(db);
    console.log('MembershipRepository created');
    
    console.log('Database and repositories initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Stack trace:', error.stack);
  }
}

// IPC Handlers para Usuarios
ipcMain.handle('users:getAll', async () => {
  try {
    return userRepo.findAll();
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
});

ipcMain.handle('users:getById', async (event, id) => {
  try {
    return userRepo.findById(id);
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
});

ipcMain.handle('users:create', async (event, userData) => {
  try {
    return userRepo.create(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
});

ipcMain.handle('users:update', async (event, id, userData) => {
  try {
    return userRepo.update(id, userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
});

ipcMain.handle('users:toggleActive', async (event, id) => {
  try {
    userRepo.toggleActive(id);
    return userRepo.findById(id);
  } catch (error) {
    console.error('Error toggling user active:', error);
    throw error;
  }
});

ipcMain.handle('users:search', async (event, term) => {
  try {
    return userRepo.search(term);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
});

// IPC Handlers para asignación de membresías
ipcMain.handle('users:assignMembership', async (event, userId, membershipId, startDate) => {
  try {
    return userRepo.assignMembership(userId, membershipId, startDate);
  } catch (error) {
    console.error('Error assigning membership:', error);
    throw error;
  }
});

ipcMain.handle('users:removeMembership', async (event, userId) => {
  try {
    return userRepo.removeMembership(userId);
  } catch (error) {
    console.error('Error removing membership:', error);
    throw error;
  }
});

ipcMain.handle('users:renewMembership', async (event, userId) => {
  try {
    return userRepo.renewMembership(userId);
  } catch (error) {
    console.error('Error renewing membership:', error);
    throw error;
  }
});

// IPC Handlers para Membresías
ipcMain.handle('memberships:getAll', async () => {
  try {
    return membershipRepo.findAll();
  } catch (error) {
    console.error('Error getting memberships:', error);
    throw error;
  }
});

ipcMain.handle('memberships:getById', async (event, id) => {
  try {
    return membershipRepo.findById(id);
  } catch (error) {
    console.error('Error getting membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:create', async (event, membershipData) => {
  try {
    return membershipRepo.create(membershipData);
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:update', async (event, id, membershipData) => {
  try {
    return membershipRepo.update(id, membershipData);
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
});

ipcMain.handle('memberships:toggleActive', async (event, id) => {
  try {
    membershipRepo.toggleActive(id);
    return membershipRepo.findById(id);
  } catch (error) {
    console.error('Error toggling membership active:', error);
    throw error;
  }
});

ipcMain.handle('memberships:search', async (event, term) => {
  try {
    return membershipRepo.search(term);
  } catch (error) {
    console.error('Error searching memberships:', error);
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