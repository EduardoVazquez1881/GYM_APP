-- BASE DE DATOS PARA GYM APP
-- Estructura completa del proyecto

-- ============================================
-- TABLA: USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    telefono TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    telefono_emergencia TEXT,
    nip TEXT,
    activo INTEGER DEFAULT 1,
    membership_id INTEGER,
    membership_start_date DATETIME,
    membership_end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (membership_id) REFERENCES memberships(id)
);

-- ============================================
-- TABLA: MEMBRESÍAS
-- ============================================
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
);

-- ============================================
-- TABLA: ADMINISTRADORES
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nombre TEXT,
    rol TEXT DEFAULT 'admin',
    activo INTEGER DEFAULT 1,
    last_login DATETIME,
    creataced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: CHECK-INS (ASISTENCIAS)
-- ============================================
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLA: HISTORIAL DE PAGOS
-- ============================================
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
);

-- ============================================
-- TABLA: MÁQUINAS
-- ============================================
CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    ubicacion TEXT,
    estado TEXT DEFAULT 'disponible',
    fecha_compra DATE,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    notas TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: CATEGORÍAS DE MÁQUINAS
-- ============================================
CREATE TABLE IF NOT EXISTS machine_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT 'gray',
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: UBICACIONES DE MÁQUINAS
-- ============================================
CREATE TABLE IF NOT EXISTS machine_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DATOS POR DEFECTO
-- ============================================

-- Administrador por defecto
-- Usuario: usuario21211916
-- Contraseña: 21211916 (hash SHA256)
INSERT OR IGNORE INTO admins (username, password, nombre, rol, activo) 
VALUES ('usuario21211916', 'c0eb20d2b6d65e62c96f0c40cc74d36e7768c0b6db4f4e1ea88cc45a7e45c7e1', 'Administrador', 'admin', 1);

-- Categorías de máquinas por defecto
INSERT OR IGNORE INTO machine_categories (nombre, color) VALUES 
('Cardio', 'pink'),
('Fuerza', 'purple'),
('Peso Libre', 'orange'),
('Funcional', 'teal'),
('Estiramiento', 'cyan'),
('Máquinas de Cable', 'indigo'),
('Otro', 'gray');

-- Ubicaciones de máquinas por defecto
INSERT OR IGNORE INTO machine_locations (nombre, descripcion) VALUES 
('Zona Cardio', 'Área de máquinas cardiovasculares'),
('Zona de Pesas', 'Área de peso libre y mancuernas'),
('Zona de Máquinas', 'Área de máquinas de fuerza'),
('Zona Funcional', 'Área de entrenamiento funcional'),
('Zona de Estiramiento', 'Área para estiramientos y yoga');

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_membership_id ON users(membership_id);
CREATE INDEX IF NOT EXISTS idx_users_correo ON users(correo);
CREATE INDEX IF NOT EXISTS idx_users_activo ON users(activo);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_machines_categoria ON machines(categoria);
CREATE INDEX IF NOT EXISTS idx_machines_ubicacion ON machines(ubicacion);
