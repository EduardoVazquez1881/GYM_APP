const BaseRepository = require('./BaseRepository.cjs');

class MachineRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = 'machines';
    this.initializeTable();
  }

  initializeTable() {
    // Tabla de máquinas
    this.db.exec(`
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
      )
    `);

    // Tabla de categorías personalizables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS machine_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT 'gray',
        activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de ubicaciones personalizables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS machine_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar categorías por defecto si no existen
    const defaultCategories = [
      { nombre: 'Cardio', color: 'pink' },
      { nombre: 'Fuerza', color: 'purple' },
      { nombre: 'Peso Libre', color: 'orange' },
      { nombre: 'Funcional', color: 'teal' },
      { nombre: 'Estiramiento', color: 'cyan' },
      { nombre: 'Máquinas de Cable', color: 'indigo' },
      { nombre: 'Otro', color: 'gray' }
    ];

    const insertCat = this.db.prepare(`
      INSERT OR IGNORE INTO machine_categories (nombre, color) VALUES (?, ?)
    `);

    for (const cat of defaultCategories) {
      insertCat.run(cat.nombre, cat.color);
    }

    // Insertar ubicaciones por defecto si no existen
    const defaultLocations = [
      { nombre: 'Zona Cardio', descripcion: 'Área de máquinas cardiovasculares' },
      { nombre: 'Zona de Pesas', descripcion: 'Área de peso libre y mancuernas' },
      { nombre: 'Zona de Máquinas', descripcion: 'Área de máquinas de fuerza' },
      { nombre: 'Zona Funcional', descripcion: 'Área de entrenamiento funcional' },
      { nombre: 'Zona de Estiramiento', descripcion: 'Área para estiramientos y yoga' }
    ];

    const insertLoc = this.db.prepare(`
      INSERT OR IGNORE INTO machine_locations (nombre, descripcion) VALUES (?, ?)
    `);

    for (const loc of defaultLocations) {
      insertLoc.run(loc.nombre, loc.descripcion);
    }
  }

  // ========== CATEGORÍAS ==========
  getAllCategories() {
    return this.db.prepare(`
      SELECT * FROM machine_categories WHERE activo = 1 ORDER BY nombre
    `).all();
  }

  createCategory(data) {
    const stmt = this.db.prepare(`
      INSERT INTO machine_categories (nombre, color) VALUES (?, ?)
    `);
    const result = stmt.run(data.nombre, data.color || 'gray');
    return { id: result.lastInsertRowid, ...data };
  }

  updateCategory(id, data) {
    this.db.prepare(`
      UPDATE machine_categories SET nombre = ?, color = ? WHERE id = ?
    `).run(data.nombre, data.color || 'gray', id);
    return this.db.prepare('SELECT * FROM machine_categories WHERE id = ?').get(id);
  }

  deleteCategory(id) {
    this.db.prepare(`
      UPDATE machine_categories SET activo = 0 WHERE id = ?
    `).run(id);
    return { success: true };
  }

  // ========== UBICACIONES ==========
  getAllLocations() {
    return this.db.prepare(`
      SELECT * FROM machine_locations WHERE activo = 1 ORDER BY nombre
    `).all();
  }

  createLocation(data) {
    const stmt = this.db.prepare(`
      INSERT INTO machine_locations (nombre, descripcion) VALUES (?, ?)
    `);
    const result = stmt.run(data.nombre, data.descripcion || null);
    return { id: result.lastInsertRowid, ...data };
  }

  updateLocation(id, data) {
    this.db.prepare(`
      UPDATE machine_locations SET nombre = ?, descripcion = ? WHERE id = ?
    `).run(data.nombre, data.descripcion || null, id);
    return this.db.prepare('SELECT * FROM machine_locations WHERE id = ?').get(id);
  }

  deleteLocation(id) {
    this.db.prepare(`
      UPDATE machine_locations SET activo = 0 WHERE id = ?
    `).run(id);
    return { success: true };
  }

  // ========== MÁQUINAS ==========
  getAll() {
    return this.db.prepare(`
      SELECT * FROM machines WHERE activo = 1 ORDER BY categoria, nombre
    `).all();
  }

  getById(id) {
    return this.db.prepare(`
      SELECT * FROM machines WHERE id = ? AND activo = 1
    `).get(id);
  }

  create(data) {
    const stmt = this.db.prepare(`
      INSERT INTO machines (
        nombre, categoria, marca, modelo, numero_serie, 
        ubicacion, estado, fecha_compra, ultimo_mantenimiento, 
        proximo_mantenimiento, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.nombre,
      data.categoria,
      data.marca || null,
      data.modelo || null,
      data.numero_serie || null,
      data.ubicacion || null,
      data.estado || 'disponible',
      data.fecha_compra || null,
      data.ultimo_mantenimiento || null,
      data.proximo_mantenimiento || null,
      data.notas || null
    );

    return { id: result.lastInsertRowid, ...data };
  }

  update(id, data) {
    const stmt = this.db.prepare(`
      UPDATE machines SET
        nombre = ?,
        categoria = ?,
        marca = ?,
        modelo = ?,
        numero_serie = ?,
        ubicacion = ?,
        estado = ?,
        fecha_compra = ?,
        ultimo_mantenimiento = ?,
        proximo_mantenimiento = ?,
        notas = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.nombre,
      data.categoria,
      data.marca || null,
      data.modelo || null,
      data.numero_serie || null,
      data.ubicacion || null,
      data.estado || 'disponible',
      data.fecha_compra || null,
      data.ultimo_mantenimiento || null,
      data.proximo_mantenimiento || null,
      data.notas || null,
      id
    );

    return this.getById(id);
  }

  updateStatus(id, estado) {
    this.db.prepare(`
      UPDATE machines SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(estado, id);
    return this.getById(id);
  }

  delete(id) {
    this.db.prepare(`
      UPDATE machines SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id);
    return { success: true };
  }

  getStats() {
    const total = this.db.prepare(`
      SELECT COUNT(*) as count FROM machines WHERE activo = 1
    `).get();

    const byStatus = this.db.prepare(`
      SELECT estado, COUNT(*) as count FROM machines WHERE activo = 1 GROUP BY estado
    `).all();

    const byCategory = this.db.prepare(`
      SELECT categoria, COUNT(*) as count FROM machines WHERE activo = 1 GROUP BY categoria
    `).all();

    const needMaintenance = this.db.prepare(`
      SELECT COUNT(*) as count FROM machines 
      WHERE activo = 1 AND proximo_mantenimiento IS NOT NULL AND proximo_mantenimiento <= date('now')
    `).get();

    return {
      total: total.count,
      byStatus: byStatus.reduce((acc, item) => { acc[item.estado] = item.count; return acc; }, {}),
      byCategory: byCategory.reduce((acc, item) => { acc[item.categoria] = item.count; return acc; }, {}),
      needMaintenance: needMaintenance.count
    };
  }
}

module.exports = MachineRepository;
