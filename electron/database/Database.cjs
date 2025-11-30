const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }

    try {
      // Determinar la ruta de la base de datos
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'gym_app.db');
      
      console.log('Database path:', dbPath);
      
      // Crear conexión a la base de datos
      this.db = new Database(dbPath);
      
      // Habilitar foreign keys
      this.db.pragma('foreign_keys = ON');
      
      // Inicializar esquema
      this.initializeSchema();
      
      // Crear admin por defecto si no existe
      this.createDefaultAdmin();
      
      DatabaseManager.instance = this;
      console.log('DatabaseManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DatabaseManager:', error);
      this.db = null;
      throw error;
    }
  }

  initializeSchema() {
    // Crear tabla de usuarios
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido_paterno TEXT NOT NULL,
        apellido_materno TEXT,
        telefono TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        telefono_emergencia TEXT,
        activo INTEGER DEFAULT 1,
        membership_id INTEGER,
        membership_start_date DATETIME,
        membership_end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (membership_id) REFERENCES memberships(id)
      )
    `);

    // Migración: Verificar si existen las columnas de membresía y nip, y agregarlas si no
    const columns = this.db.pragma('table_info(users)');
    const hasMembershipId = columns.some(col => col.name === 'membership_id');
    const hasNip = columns.some(col => col.name === 'nip');
    
    if (!hasMembershipId) {
      console.log('Migrating users table: Adding membership columns...');
      try {
        this.db.exec(`
          ALTER TABLE users ADD COLUMN membership_id INTEGER REFERENCES memberships(id);
          ALTER TABLE users ADD COLUMN membership_start_date DATETIME;
          ALTER TABLE users ADD COLUMN membership_end_date DATETIME;
        `);
        console.log('Migration (membership) completed successfully.');
      } catch (error) {
        console.error('Error during membership migration:', error);
      }
    }

    if (!hasNip) {
      console.log('Migrating users table: Adding nip column...');
      try {
        this.db.exec(`ALTER TABLE users ADD COLUMN nip TEXT;`);
        console.log('Migration (nip) completed successfully.');
      } catch (error) {
        console.error('Error during nip migration:', error);
      }
    }

    // Crear tabla de membresías
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        duracion_dias INTEGER NOT NULL,
        precio REAL NOT NULL,
        beneficios TEXT,
        activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de administradores
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        nombre TEXT,
        rol TEXT DEFAULT 'admin',
        activo INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de check-ins (asistencias)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        check_out_time DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Crear tabla de historial de pagos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        membership_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        metodo_pago TEXT DEFAULT 'efectivo',
        fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
        notas TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (membership_id) REFERENCES memberships(id)
      )
    `);

    console.log('Database schema initialized');
  }

  // Crear administrador por defecto
  createDefaultAdmin() {
    const existingAdmin = this.db.prepare(`
      SELECT id FROM admins WHERE username = ?
    `).get('usuario21211916');

    if (!existingAdmin) {
      const hashedPassword = crypto.createHash('sha256').update('21211916').digest('hex');
      this.db.prepare(`
        INSERT INTO admins (username, password, nombre, rol, activo)
        VALUES (?, ?, ?, ?, ?)
      `).run('usuario21211916', hashedPassword, 'Administrador', 'admin', 1);
      console.log('Default admin created: usuario21211916');
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  isConnected() {
    return this.db !== null;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Exportar instancia única
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new DatabaseManager();
    }
    return instance;
  },
  resetInstance: () => {
    if (instance) {
      instance.close();
      instance = null;
      DatabaseManager.instance = null;
    }
  }
};
