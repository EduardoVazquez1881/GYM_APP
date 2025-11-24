const BaseRepository = require('./BaseRepository.cjs');

class UserRepository extends BaseRepository {
  constructor(db) {
    super(db, 'users');
  }

  create(userData) {
    // Si viene membresía, calculamos la fecha de fin
    let membershipEndDate = null;
    if (userData.membershipId && userData.membershipStartDate) {
      const membership = this.db.prepare('SELECT duracion_dias FROM memberships WHERE id = ?').get(userData.membershipId);
      if (membership) {
        const start = new Date(userData.membershipStartDate);
        const end = new Date(start);
        end.setDate(start.getDate() + membership.duracion_dias);
        membershipEndDate = end.toISOString();
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO users (
        nombre, apellido_paterno, apellido_materno, telefono, correo, 
        telefono_emergencia, activo, membership_id, membership_start_date, membership_end_date, nip
      )
      VALUES (
        @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, @correo, 
        @telefonoEmergencia, @activo, @membershipId, @membershipStartDate, @membershipEndDate, @nip
      )
    `);
    
    const result = stmt.run({
      nombre: userData.nombre,
      apellidoPaterno: userData.apellidoPaterno,
      apellidoMaterno: userData.apellidoMaterno || null,
      telefono: userData.telefono,
      correo: userData.correo,
      telefonoEmergencia: userData.telefonoEmergencia || null,
      activo: userData.activo !== undefined ? userData.activo : 1,
      membershipId: userData.membershipId || null,
      membershipStartDate: userData.membershipStartDate || null,
      membershipEndDate: membershipEndDate,
      nip: userData.nip || null
    });

    return this.findById(result.lastInsertRowid);
  }

  update(id, userData) {
    // Lógica similar para actualizar membresía si se proporciona
    let membershipUpdate = "";
    let extraParams = {};
    
    if (userData.membershipId !== undefined) { // Si se envía explícitamente (aunque sea null)
      if (userData.membershipId && userData.membershipStartDate) {
        const membership = this.db.prepare('SELECT duracion_dias FROM memberships WHERE id = ?').get(userData.membershipId);
        if (membership) {
          const start = new Date(userData.membershipStartDate);
          const end = new Date(start);
          end.setDate(start.getDate() + membership.duracion_dias);
          
          membershipUpdate = `, 
            membership_id = @membershipId,
            membership_start_date = @membershipStartDate,
            membership_end_date = @membershipEndDate`;
            
          extraParams = {
            membershipId: userData.membershipId,
            membershipStartDate: userData.membershipStartDate,
            membershipEndDate: end.toISOString()
          };
        }
      } else if (userData.membershipId === null) {
        membershipUpdate = `, 
          membership_id = NULL,
          membership_start_date = NULL,
          membership_end_date = NULL`;
      }
    }

    const stmt = this.db.prepare(`
      UPDATE users 
      SET nombre = @nombre,
          apellido_paterno = @apellidoPaterno,
          apellido_materno = @apellidoMaterno,
          telefono = @telefono,
          correo = @correo,
          telefono_emergencia = @telefonoEmergencia,
          nip = @nip,
          updated_at = CURRENT_TIMESTAMP
          ${membershipUpdate}
      WHERE id = @id
    `);

    const result = stmt.run({
      id,
      nombre: userData.nombre,
      apellidoPaterno: userData.apellidoPaterno,
      apellidoMaterno: userData.apellidoMaterno || null,
      telefono: userData.telefono,
      correo: userData.correo,
      telefonoEmergencia: userData.telefonoEmergencia || null,
      nip: userData.nip || null,
      ...extraParams
    });

    return this.findById(id);
  }

  assignMembership(userId, membershipId, startDate) {
    const membership = this.db.prepare('SELECT duracion_dias FROM memberships WHERE id = ?').get(membershipId);
    if (!membership) throw new Error('Membresía no encontrada');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + membership.duracion_dias);

    const stmt = this.db.prepare(`
      UPDATE users 
      SET membership_id = ?, 
          membership_start_date = ?, 
          membership_end_date = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(membershipId, startDate, end.toISOString(), userId);
    return this.findById(userId);
  }

  removeMembership(userId) {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET membership_id = NULL, 
          membership_start_date = NULL, 
          membership_end_date = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(userId);
    return this.findById(userId);
  }

  renewMembership(userId) {
    const user = this.findById(userId);
    if (!user || !user.membership) {
      throw new Error('Usuario no tiene membresía asignada');
    }

    const membership = this.db.prepare('SELECT duracion_dias FROM memberships WHERE id = ?').get(user.membership.id);
    if (!membership) {
      throw new Error('Membresía original no encontrada');
    }

    // Determinar nueva fecha de inicio
    // Si está vencida (daysRemaining <= 0), inicia hoy
    // Si está activa, inicia cuando termina la actual
    const now = new Date();
    const currentEndDate = new Date(user.membership.endDate);
    
    let newStartDate;
    if (user.membership.daysRemaining <= 0) {
      newStartDate = now;
    } else {
      newStartDate = currentEndDate;
    }

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + membership.duracion_dias);

    const stmt = this.db.prepare(`
      UPDATE users 
      SET membership_end_date = ?,
          membership_start_date = CASE WHEN ? = 1 THEN ? ELSE membership_start_date END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    // Solo actualizamos start_date si estaba vencida (daysRemaining <= 0)
    const isExpired = user.membership.daysRemaining <= 0 ? 1 : 0;

    stmt.run(newEndDate.toISOString(), isExpired, newStartDate.toISOString(), userId);
    return this.findById(userId);
  }

  _mapToFrontend(user) {
    if (!user) return null;
    
    // Calcular días restantes si tiene membresía
    let membership = null;
    let status = 'pending'; // pending, active, expired

    if (user.membership_id) {
      const now = new Date();
      const endDate = new Date(user.membership_end_date);
      const diffTime = endDate - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      status = daysRemaining > 0 ? 'active' : 'expired';

      // Calcular progreso (0 a 100)
      let progress = 0;
      if (user.membership_start_date) {
        const startDate = new Date(user.membership_start_date);
        const totalDuration = endDate - startDate;
        const elapsed = now - startDate;
        progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      }

      membership = {
        id: user.membership_id,
        nombre: user.membership_nombre,
        startDate: user.membership_start_date,
        endDate: user.membership_end_date,
        daysRemaining: daysRemaining,
        progress: progress
      };
    } else {
      status = 'pending';
    }

    return {
      id: user.id,
      nombre: user.nombre,
      apellidoPaterno: user.apellido_paterno,
      apellidoMaterno: user.apellido_materno,
      telefono: user.telefono,
      correo: user.correo,
      telefonoEmergencia: user.telefono_emergencia,
      nip: user.nip,
      activo: user.activo === 1,
      membership: membership,
      status: status,
      createdAt: user.created_at
    };
  }

  // Override getAll to include membership info
  getAll() {
    const users = this.db.prepare(`
      SELECT u.*, m.nombre as membership_nombre
      FROM users u
      LEFT JOIN memberships m ON u.membership_id = m.id
      ORDER BY u.created_at DESC
    `).all();
    return users.map(user => this._mapToFrontend(user));
  }

  // Override findById to include membership info
  findById(id) {
    const user = this.db.prepare(`
      SELECT u.*, m.nombre as membership_nombre
      FROM users u
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE u.id = ?
    `).get(id);
    return this._mapToFrontend(user);
  }
}

module.exports = UserRepository;
