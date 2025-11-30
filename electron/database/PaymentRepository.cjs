const BaseRepository = require('./BaseRepository.cjs');

class PaymentRepository extends BaseRepository {
  constructor(db) {
    super(db);
    this.tableName = 'payments';
  }

  // Crear un nuevo pago
  create(paymentData) {
    const { userId, membershipId, monto, metodoPago = 'efectivo', notas = '' } = paymentData;
    
    const stmt = this.db.prepare(`
      INSERT INTO payments (user_id, membership_id, monto, metodo_pago, notas)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(userId, membershipId, monto, metodoPago, notas);
    return this.getById(result.lastInsertRowid);
  }

  // Obtener pago por ID
  getById(id) {
    const row = this.db.prepare(`
      SELECT p.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno,
        m.nombre as membership_nombre
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN memberships m ON p.membership_id = m.id
      WHERE p.id = ?
    `).get(id);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      membershipId: row.membership_id,
      membershipName: row.membership_nombre,
      monto: row.monto,
      metodoPago: row.metodo_pago,
      fechaPago: row.fecha_pago,
      notas: row.notas,
      createdAt: row.created_at
    };
  }

  // Obtener todos los pagos
  getAll(limit = 100) {
    return this.db.prepare(`
      SELECT p.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno,
        m.nombre as membership_nombre
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN memberships m ON p.membership_id = m.id
      ORDER BY p.fecha_pago DESC
      LIMIT ?
    `).all(limit).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      membershipId: row.membership_id,
      membershipName: row.membership_nombre,
      monto: row.monto,
      metodoPago: row.metodo_pago,
      fechaPago: row.fecha_pago,
      notas: row.notas,
      createdAt: row.created_at
    }));
  }

  // Obtener pagos de un usuario
  getByUserId(userId, limit = 50) {
    return this.db.prepare(`
      SELECT p.*, m.nombre as membership_nombre
      FROM payments p
      JOIN memberships m ON p.membership_id = m.id
      WHERE p.user_id = ?
      ORDER BY p.fecha_pago DESC
      LIMIT ?
    `).all(userId, limit).map(row => ({
      id: row.id,
      membershipId: row.membership_id,
      membershipName: row.membership_nombre,
      monto: row.monto,
      metodoPago: row.metodo_pago,
      fechaPago: row.fecha_pago,
      notas: row.notas
    }));
  }

  // Obtener pagos por rango de fecha
  getByDateRange(startDate, endDate) {
    return this.db.prepare(`
      SELECT p.*, 
        u.nombre, u.apellido_paterno, u.apellido_materno,
        m.nombre as membership_nombre
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN memberships m ON p.membership_id = m.id
      WHERE p.fecha_pago >= ? AND p.fecha_pago <= ?
      ORDER BY p.fecha_pago DESC
    `).all(startDate, endDate).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.nombre} ${row.apellido_paterno} ${row.apellido_materno || ''}`.trim(),
      membershipId: row.membership_id,
      membershipName: row.membership_nombre,
      monto: row.monto,
      metodoPago: row.metodo_pago,
      fechaPago: row.fecha_pago,
      notas: row.notas
    }));
  }

  // Estadísticas de pagos
  getPaymentStats(period = 'month') {
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
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(monto) as totalRevenue,
        AVG(monto) as avgPayment,
        MAX(monto) as maxPayment,
        MIN(monto) as minPayment
      FROM payments
      WHERE fecha_pago >= ?
    `).get(startDate.toISOString());

    // Pagos por método de pago
    const byMethod = this.db.prepare(`
      SELECT 
        metodo_pago,
        COUNT(*) as count,
        SUM(monto) as total
      FROM payments
      WHERE fecha_pago >= ?
      GROUP BY metodo_pago
    `).all(startDate.toISOString());

    // Pagos por membresía
    const byMembership = this.db.prepare(`
      SELECT 
        m.nombre as membershipName,
        COUNT(*) as count,
        SUM(p.monto) as total
      FROM payments p
      JOIN memberships m ON p.membership_id = m.id
      WHERE p.fecha_pago >= ?
      GROUP BY p.membership_id
      ORDER BY total DESC
    `).all(startDate.toISOString());

    // Ingresos por día (últimos 30 días)
    const dailyRevenue = this.db.prepare(`
      SELECT 
        date(fecha_pago) as date,
        SUM(monto) as total
      FROM payments
      WHERE fecha_pago >= date('now', '-30 days')
      GROUP BY date(fecha_pago)
      ORDER BY date ASC
    `).all();

    return {
      totalPayments: stats.totalPayments || 0,
      totalRevenue: stats.totalRevenue || 0,
      avgPayment: Math.round((stats.avgPayment || 0) * 100) / 100,
      maxPayment: stats.maxPayment || 0,
      minPayment: stats.minPayment || 0,
      byMethod,
      byMembership,
      dailyRevenue
    };
  }

  // Obtener resumen de pagos de hoy
  getTodaySummary() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const summary = this.db.prepare(`
      SELECT 
        COUNT(*) as count,
        COALESCE(SUM(monto), 0) as total
      FROM payments
      WHERE fecha_pago >= ?
    `).get(todayStart);

    return {
      count: summary.count || 0,
      total: summary.total || 0
    };
  }
}

module.exports = PaymentRepository;
