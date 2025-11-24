const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }

    // Determinar la ruta de la base de datos
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'gym_app.db');
    
    console.log('Database path:', dbPath);
    
    // Crear conexión a la base de datos
    this.db = new Database(dbPath, { verbose: console.log });
    
    // Habilitar foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Inicializar esquema
    this.initializeSchema();
    
    DatabaseManager.instance = this;
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

    console.log('Database schema initialized');
  }

  getDatabase() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
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
  }
};
