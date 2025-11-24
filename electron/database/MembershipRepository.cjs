const BaseRepository = require('./BaseRepository.cjs');

class MembershipRepository extends BaseRepository {
  constructor(db) {
    super(db, 'memberships');
  }

  create(membershipData) {
    const stmt = this.db.prepare(`
      INSERT INTO memberships (nombre, descripcion, duracion_dias, precio, beneficios, activo)
      VALUES (@nombre, @descripcion, @duracionDias, @precio, @beneficios, @activo)
    `);
    
    const result = stmt.run({
      nombre: membershipData.nombre,
      descripcion: membershipData.descripcion || null,
      duracionDias: membershipData.duracionDias,
      precio: membershipData.precio,
      beneficios: JSON.stringify(membershipData.beneficios || []),
      activo: membershipData.activo !== undefined ? membershipData.activo : 1
    });

    return this.findById(result.lastInsertRowid);
  }

  update(id, membershipData) {
    const stmt = this.db.prepare(`
      UPDATE memberships 
      SET nombre = @nombre,
          descripcion = @descripcion,
          duracion_dias = @duracionDias,
          precio = @precio,
          beneficios = @beneficios,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    const result = stmt.run({
      id,
      nombre: membershipData.nombre,
      descripcion: membershipData.descripcion || null,
      duracionDias: membershipData.duracionDias,
      precio: membershipData.precio,
      beneficios: JSON.stringify(membershipData.beneficios || [])
    });

    return result.changes > 0 ? this.findById(id) : null;
  }

  search(searchTerm) {
    const stmt = this.db.prepare(`
      SELECT * FROM memberships 
      WHERE nombre LIKE @term 
         OR descripcion LIKE @term
      ORDER BY created_at DESC
    `);

    return stmt.all({ term: `%${searchTerm}%` });
  }

  // Convertir snake_case de DB a camelCase para frontend
  _mapToFrontend(membership) {
    if (!membership) return null;
    return {
      id: membership.id,
      nombre: membership.nombre,
      descripcion: membership.descripcion,
      duracionDias: membership.duracion_dias,
      precio: membership.precio,
      beneficios: membership.beneficios ? JSON.parse(membership.beneficios) : [],
      activo: Boolean(membership.activo),
      createdAt: membership.created_at,
      updatedAt: membership.updated_at
    };
  }

  // Override métodos para mapear datos
  findAll() {
    const memberships = super.findAll();
    return memberships.map(m => this._mapToFrontend(m));
  }

  findById(id) {
    const membership = super.findById(id);
    return this._mapToFrontend(membership);
  }

  search(searchTerm) {
    const stmt = this.db.prepare(`
      SELECT * FROM memberships 
      WHERE nombre LIKE @term 
         OR descripcion LIKE @term
      ORDER BY created_at DESC
    `);

    const memberships = stmt.all({ term: `%${searchTerm}%` });
    return memberships.map(m => this._mapToFrontend(m));
  }
}

module.exports = MembershipRepository;
