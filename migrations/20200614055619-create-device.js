module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'devices',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          serial_number: {
            type: Sequelize.STRING,
          },
          name: {
            type: Sequelize.STRING,
          },
          primary_type: {
            type: Sequelize.STRING,
          },
          data: {
            type: Sequelize.JSONB,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { schema: 'demographics', transaction },
      );
      await queryInterface.addConstraint('demographics.devices', {
        type: 'UNIQUE',
        fields: ['agency_id', 'serial_number'],
        transaction,
      });
      await queryInterface.addConstraint('demographics.devices', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.devices_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.devices', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.devices', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable({ schema: 'demographics', tableName: 'devices' }, { transaction });
    });
  },
};
