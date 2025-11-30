const BaseRepository = require('./BaseRepository.cjs');

class MachineRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = 'machines';
    this.initializeTable();
  }

  initializeTable() {
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
  }

  // Obtener todas las máquinas
  getAll() {
    return this.db.prepare(`
      SELECT * FROM machines 
      WHERE activo = 1 
      ORDER BY categoria, nombre
    `).all();
  }

  // Obtener máquina por ID
  getById(id) {
    return this.db.prepare(`
      SELECT * FROM machines WHERE id = ? AND activo = 1
    `).get(id);
  }

  // Crear nueva máquina
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
      data.numeroSerie || null,
      data.ubicacion || null,
      data.estado || 'disponible',
      data.fechaCompra || null,
      data.ultimoMantenimiento || null,
      data.proximoMantenimiento || null,
      data.notas || null
    );

    return { id: result.lastInsertRowid, ...data };
  }

  // Actualizar máquina
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
      data.numeroSerie || null,
      data.ubicacion || null,
      data.estado || 'disponible',
      data.fechaCompra || null,
      data.ultimoMantenimiento || null,
      data.proximoMantenimiento || null,
      data.notas || null,
      id
    );

    return this.getById(id);
  }

  // Cambiar estado de la máquina
  updateStatus(id, estado) {
    this.db.prepare(`
      UPDATE machines SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(estado, id);
    return this.getById(id);
  }

  // Registrar mantenimiento
  registerMaintenance(id, proximoMantenimiento = null) {
    const today = new Date().toISOString().split('T')[0];
    this.db.prepare(`
      UPDATE machines SET 
        ultimo_mantenimiento = ?,
        proximo_mantenimiento = ?,
        estado = 'disponible',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(today, proximoMantenimiento, id);
    return this.getById(id);
  }

  // Eliminar máquina (soft delete)
  delete(id) {
    this.db.prepare(`
      UPDATE machines SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(id);
    return { success: true };
  }

  // Obtener máquinas por categoría
  getByCategory(categoria) {
    return this.db.prepare(`
      SELECT * FROM machines WHERE categoria = ? AND activo = 1 ORDER BY nombre
    `).all(categoria);
  }

  // Obtener máquinas por estado
  getByStatus(estado) {
    return this.db.prepare(`
      SELECT * FROM machines WHERE estado = ? AND activo = 1 ORDER BY nombre
    `).all(estado);
  }

  // Obtener estadísticas
  getStats() {
    const total = this.db.prepare(`
      SELECT COUNT(*) as count FROM machines WHERE activo = 1
    `).get();

    const byStatus = this.db.prepare(`
      SELECT estado, COUNT(*) as count 
      FROM machines 
      WHERE activo = 1 
      GROUP BY estado
    `).all();

    const byCategory = this.db.prepare(`
      SELECT categoria, COUNT(*) as count 
      FROM machines 
      WHERE activo = 1 
      GROUP BY categoria
    `).all();

    const needMaintenance = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM machines 
      WHERE activo = 1 
      AND proximo_mantenimiento <= date('now')
    `).get();

    return {
      total: total.count,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.estado] = item.count;
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.categoria] = item.count;
        return acc;
      }, {}),
      needMaintenance: needMaintenance.count
    };
  }

  // Obtener categorías únicas
  getCategories() {
    return this.db.prepare(`
      SELECT DISTINCT categoria FROM machines WHERE activo = 1 ORDER BY categoria
    `).all().map(row => row.categoria);
  }
}

module.exports = MachineRepository;
