module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'responders',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          scene_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          user_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          arrived_at: {
            type: Sequelize.DATE,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          created_by_agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_agency_id: {
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
        { transaction },
      );
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['scene_id'],
        references: {
          table: 'scenes',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['user_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['created_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('responders', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_agency_id'],
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('responders');
  },
};
