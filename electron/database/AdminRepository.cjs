const BaseRepository = require('./BaseRepository.cjs');
const crypto = require('crypto');

class AdminRepository extends BaseRepository {
  constructor(db) {
    super(db, 'admins');
  }

  // Hash de contraseña usando SHA-256
  hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Verificar credenciales de login
  login(username, password) {
    const hashedPassword = this.hashPassword(password);
    const admin = this.db.prepare(`
      SELECT * FROM admins 
      WHERE username = ? AND password = ? AND activo = 1
    `).get(username, hashedPassword);
    
    if (admin) {
      // Actualizar último acceso
      this.db.prepare(`
        UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?
      `).run(admin.id);
      
      return this._mapToFrontend(admin);
    }
    return null;
  }

  // Crear nuevo admin
  create(adminData) {
    const hashedPassword = this.hashPassword(adminData.password);
    
    const stmt = this.db.prepare(`
      INSERT INTO admins (username, password, nombre, rol, activo)
      VALUES (@username, @password, @nombre, @rol, @activo)
    `);
    
    const result = stmt.run({
      username: adminData.username,
      password: hashedPassword,
      nombre: adminData.nombre || adminData.username,
      rol: adminData.rol || 'admin',
      activo: adminData.activo !== undefined ? adminData.activo : 1
    });

    return this.findById(result.lastInsertRowid);
  }

  // Cambiar contraseña
  changePassword(id, newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    const stmt = this.db.prepare(`
      UPDATE admins 
      SET password = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    return stmt.run(hashedPassword, id).changes > 0;
  }

  // Verificar si existe un usuario
  usernameExists(username) {
    const admin = this.db.prepare(`
      SELECT id FROM admins WHERE username = ?
    `).get(username);
    return !!admin;
  }

  // Actualizar admin
  update(id, adminData) {
    let query = `
      UPDATE admins 
      SET nombre = @nombre,
          rol = @rol,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `;
    
    const params = {
      id,
      nombre: adminData.nombre,
      rol: adminData.rol || 'admin'
    };

    // Si se envía nueva contraseña, actualizarla
    if (adminData.password) {
      query = `
        UPDATE admins 
        SET nombre = @nombre,
            rol = @rol,
            password = @password,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `;
      params.password = this.hashPassword(adminData.password);
    }

    const stmt = this.db.prepare(query);
    stmt.run(params);
    return this.findById(id);
  }

  // Eliminar admin (no permitir eliminar el último admin)
  delete(id) {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM admins WHERE activo = 1').get().count;
    if (count <= 1) {
      throw new Error('No se puede eliminar el último administrador');
    }
    
    const stmt = this.db.prepare('DELETE FROM admins WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  _mapToFrontend(admin) {
    if (!admin) return null;
    return {
      id: admin.id,
      username: admin.username,
      nombre: admin.nombre,
      rol: admin.rol,
      activo: admin.activo === 1,
      lastLogin: admin.last_login,
      createdAt: admin.created_at
    };
  }

  findAll() {
    const admins = this.db.prepare(`
      SELECT * FROM admins ORDER BY created_at DESC
    `).all();
    return admins.map(a => this._mapToFrontend(a));
  }

  findById(id) {
    const admin = this.db.prepare(`
      SELECT * FROM admins WHERE id = ?
    `).get(id);
    return this._mapToFrontend(admin);
  }
}

module.exports = AdminRepository;
