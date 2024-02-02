/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE INDEX dispatches_vehicle_id ON dispatches (vehicle_id) WHERE canonical_id IS NULL');
    await queryInterface.addIndex('incidents', [
      {
        attribute: 'sort',
        order: 'DESC',
      },
      {
        attribute: 'number',
        order: 'DESC',
      },
    ]);
    await queryInterface.createTable('incidents_agencies', {
      incident_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'incidents',
          },
          key: 'id',
        },
      },
      agency_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('incidents_agencies', ['agency_id']);
    await queryInterface.sequelize.query(`
      INSERT INTO incidents_agencies
      SELECT DISTINCT incidents.id AS incident_id, vehicles.created_by_agency_id AS agency_id
      FROM incidents
      JOIN dispatches ON incidents.id=dispatches.incident_id
      JOIN vehicles ON dispatches.vehicle_id=vehicles.id;
    `);
    await queryInterface.sequelize.query(`
      INSERT INTO incidents_agencies
      SELECT DISTINCT incidents.id AS incident_id, incidents.created_by_agency_id AS agency_id
      FROM incidents
      LEFT JOIN incidents_agencies ON incidents.id=incidents_agencies.incident_id 
      WHERE incidents.created_by_agency_id IS NOT NULL
      AND incidents_agencies.agency_id IS NULL;    
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('incidents_agencies');
    await queryInterface.removeIndex('incidents', ['sort', 'number']);
    await queryInterface.removeIndex('dispatches', 'dispatches_vehicle_id');
  },
};
