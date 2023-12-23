module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'vehicles',
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
          number: {
            type: Sequelize.STRING,
          },
          vin: {
            type: Sequelize.STRING,
          },
          call_sign: {
            type: Sequelize.STRING,
          },
          type: {
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
      await queryInterface.addConstraint('demographics.vehicles', {
        type: 'UNIQUE',
        fields: ['agency_id', 'number'],
        transaction,
      });
      await queryInterface.addConstraint('demographics.vehicles', {
        type: 'UNIQUE',
        fields: ['agency_id', 'vin'],
        transaction,
      });
      await queryInterface.addConstraint('demographics.vehicles', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.vehicles_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.vehicles', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.vehicles', {
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
      await queryInterface.dropTable({ schema: 'demographics', tableName: 'vehicles' }, { transaction });
    });
  },
};
