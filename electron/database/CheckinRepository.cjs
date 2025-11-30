const BaseRepository = require('./BaseRepository.cjs');

class CheckinRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = 'checkins';
  }

  // Obtener fecha/hora local en formato ISO sin la Z (para SQLite)
  getLocalDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Obtener inicio del día local
  getLocalDayStart() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const offset = start.getTimezoneOffset() * 60000;
    return new Date(start.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Obtener fin del día local
  getLocalDayEnd() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const offset = end.getTimezoneOffset() * 60000;
    return new Date(end.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Verificar usuario por NIP y hacer check-in
  checkInByNip(nip) {
    // Primero buscar el usuario por NIP
    const user = this.db.prepare(`
      SELECT u.*, m.nombre as membership_nombre, m.id as membership_id, m.duracion_dias
      FROM users u
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE u.nip = ? AND u.activo = 1
    `).get(nip);

    if (!user) {
      throw new Error('NIP no válido o usuario inactivo');
    }

    // Verificar si tiene membresía activa
    if (!user.membership_id) {
      throw new Error('El usuario no tiene membresía asignada');
    }

    // Calcular días restantes
    const today = new Date();
    const endDate = new Date(user.membership_end_date);
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      throw new Error('La membresía ha expirado');
    }

    const currentTime = this.getLocalDateTime();
    const todayStart = this.getLocalDayStart();
    const todayEnd = this.getLocalDayEnd();

    // Cerrar automáticamente check-ins de días anteriores que quedaron abiertos
    const oldOpenCheckins = this.db.prepare(`
      SELECT * FROM checkins 
      WHERE user_id = ? 
      AND check_in_time < ?
      AND check_out_time IS NULL
    `).all(user.id, todayStart);

    // Cerrar cada check-in antiguo con la hora 23:59:59 de ese día
    for (const oldCheckin of oldOpenCheckins) {
      const checkinDate = oldCheckin.check_in_time.split(' ')[0]; // Obtener solo la fecha
      const closingTime = `${checkinDate} 23:59:59`;
      
      this.db.prepare(`
        UPDATE checkins 
        SET check_out_time = ? 
        WHERE id = ?
      `).run(closingTime, oldCheckin.id);
    }

    // Verificar si ya hizo check-in HOY y no ha hecho check-out
    const existingCheckinToday = this.db.prepare(`
      SELECT * FROM checkins 
      WHERE user_id = ? 
      AND check_in_time >= ? 
      AND check_in_time <= ?
      AND check_out_time IS NULL
    `).get(user.id, todayStart, todayEnd);

    // Obtener historial de visitas del usuario (últimas 10)
    const userHistory = this.db.prepare(`
      SELECT check_in_time, check_out_time
      FROM checkins
      WHERE user_id = ?
      ORDER BY check_in_time DESC
      LIMIT 10
    `).all(user.id).map(row => ({
      date: row.check_in_time,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      duration: row.check_out_time 
        ? this.calculateDuration(row.check_in_time, row.check_out_time)
        : null
    }));

    // Contar total de visitas en el período de membresía actual
    const visitCount = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM checkins
      WHERE user_id = ? AND check_in_time >= ?
    `).get(user.id, user.membership_start_date);

    // Información común del usuario
    const userInfo = {
      id: user.id,
      nombre: user.nombre,
      apellidoPaterno: user.apellido_paterno,
      apellidoMaterno: user.apellido_materno,
      membership: user.membership_nombre,
      membershipStartDate: user.membership_start_date,
      membershipEndDate: user.membership_end_date,
      daysRemaining: daysRemaining,
      totalDays: user.duracion_dias,
      totalVisits: visitCount.count,
      history: userHistory
    };

    // Si hubo check-ins antiguos cerrados, informar al usuario
    if (oldOpenCheckins.length > 0) {
      userInfo.autoClosedSessions = oldOpenCheckins.length;
    }

    if (existingCheckinToday) {
      // Ya tiene check-in activo HOY, hacer check-out (DESPEDIDA)
      this.db.prepare(`
        UPDATE checkins 
        SET check_out_time = ? 
        WHERE id = ?
      `).run(currentTime, existingCheckinToday.id);
      
      // Calcular duración de esta sesión
      const sessionDuration = this.calculateDuration(existingCheckinToday.check_in_time, currentTime);
      
      return {
        action: 'checkout',
        user: userInfo,
        checkInTime: existingCheckinToday.check_in_time,
        checkOutTime: currentTime,
        sessionDuration: sessionDuration,
        sessionDurationFormatted: this.formatDuration(sessionDuration)
      };
    }

    // Crear nuevo check-in (BIENVENIDA)
    const stmt = this.db.prepare(`
      INSERT INTO checkins (user_id, check_in_time)
      VALUES (?, ?)
    `);
    const result = stmt.run(user.id, currentTime);

    // Incrementar el contador de visitas
    userInfo.totalVisits += 1;

    return {
      action: 'checkin',
      user: userInfo,
      checkInId: result.lastInsertRowid,
      checkInTime: currentTime
    };
  }

  // Formatear duración en minutos a texto legible
  formatDuration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  // Obtener todos los check-ins de hoy
  getTodayCheckins() {
    const todayStart = this.getLocalDayStart();
    const todayEnd = this.getLocalDayEnd();

    return this.db.prepare(`
      SELECT c.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.nip,
        m.nombre as membership_nombre
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE c.check_in_time >= ? AND c.check_in_time <= ?
      ORDER BY c.check_in_time DESC
    `).all(todayStart, todayEnd).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      userNip: row.nip,
      userEmail: row.correo,
      membership: row.membership_nombre,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      isActive: !row.check_out_time
    }));
  }

  // Obtener check-ins por rango de fecha
  getCheckinsByDateRange(startDate, endDate) {
    return this.db.prepare(`
      SELECT c.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.nip,
        m.nombre as membership_nombre
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE c.check_in_time >= ? AND c.check_in_time <= ?
      ORDER BY c.check_in_time DESC
    `).all(startDate, endDate).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      userNip: row.nip,
      userEmail: row.correo,
      membership: row.membership_nombre,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      isActive: !row.check_out_time
    }));
  }

  // Obtener historial de check-ins de un usuario
  getUserCheckins(userId, limit = 50) {
    return this.db.prepare(`
      SELECT c.*, m.nombre as membership_nombre
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE c.user_id = ?
      ORDER BY c.check_in_time DESC
      LIMIT ?
    `).all(userId, limit).map(row => ({
      id: row.id,
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      membership: row.membership_nombre,
      duration: row.check_out_time 
        ? this.calculateDuration(row.check_in_time, row.check_out_time)
        : null
    }));
  }

  // Calcular duración en minutos
  calculateDuration(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime - startTime) / (1000 * 60));
  }

  // Estadísticas de asistencia
  getAttendanceStats(period = 'week') {
    let startDate;
    const today = new Date();
    
    switch(period) {
      case 'today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
    }

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as totalCheckins,
        COUNT(DISTINCT user_id) as uniqueUsers,
        COUNT(CASE WHEN check_out_time IS NOT NULL THEN 1 END) as completedSessions,
        AVG(CASE 
          WHEN check_out_time IS NOT NULL 
          THEN (julianday(check_out_time) - julianday(check_in_time)) * 24 * 60 
          END) as avgDurationMinutes
      FROM checkins
      WHERE check_in_time >= ?
    `).get(startDate.toISOString());

    // Asistencias por día
    const dailyStats = this.db.prepare(`
      SELECT 
        date(check_in_time) as date,
        COUNT(*) as count
      FROM checkins
      WHERE check_in_time >= ?
      GROUP BY date(check_in_time)
      ORDER BY date ASC
    `).all(startDate.toISOString());

    // Hora pico
    const peakHours = this.db.prepare(`
      SELECT 
        strftime('%H', check_in_time) as hour,
        COUNT(*) as count
      FROM checkins
      WHERE check_in_time >= ?
      GROUP BY strftime('%H', check_in_time)
      ORDER BY count DESC
      LIMIT 5
    `).all(startDate.toISOString());

    return {
      totalCheckins: stats.totalCheckins || 0,
      uniqueUsers: stats.uniqueUsers || 0,
      completedSessions: stats.completedSessions || 0,
      avgDurationMinutes: Math.round(stats.avgDurationMinutes || 0),
      dailyStats,
      peakHours: peakHours.map(h => ({
        hour: `${h.hour}:00`,
        count: h.count
      }))
    };
  }

  // Obtener usuarios actualmente en el gym
  getCurrentlyInGym() {
    const todayStart = this.getLocalDayStart();
    const currentTime = this.getLocalDateTime();

    return this.db.prepare(`
      SELECT c.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.nip,
        m.nombre as membership_nombre
      FROM checkins c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN memberships m ON u.membership_id = m.id
      WHERE c.check_in_time >= ? 
      AND c.check_out_time IS NULL
      ORDER BY c.check_in_time DESC
    `).all(todayStart).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      userNip: row.nip,
      userEmail: row.correo,
      membership: row.membership_nombre,
      checkInTime: row.check_in_time,
      minutesInGym: this.calculateDuration(row.check_in_time, currentTime)
    }));
  }
}

module.exports = CheckinRepository;
