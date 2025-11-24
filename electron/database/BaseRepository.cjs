class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  findAll() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    return stmt.all();
  }

  findById(id) {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id);
  }

  delete(id) {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  toggleActive(id) {
    const stmt = this.db.prepare(`
      UPDATE ${this.tableName} 
      SET activo = NOT activo, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  count() {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    return stmt.get().count;
  }
}

module.exports = BaseRepository;
