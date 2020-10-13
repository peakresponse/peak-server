module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'scene_pins',
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
          lat: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          lng: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          geog: {
            allowNull: false,
            type: Sequelize.GEOGRAPHY,
          },
          name: {
            type: Sequelize.STRING,
          },
          desc: {
            type: Sequelize.TEXT,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          deleted_by_id: {
            allowNull: true,
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
          deleted_by_agency_id: {
            allowNull: true,
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
          deleted_at: {
            allowNull: true,
            type: Sequelize.DATE,
          },
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'scene_pins',
        'type',
        {
          type: Sequelize.ENUM('MGS', 'OTHER', 'STAGING', 'TRANSPORT', 'TRIAGE', 'TREATMENT'),
          allowNull: false,
        },
        { transaction }
      );
      await queryInterface.sequelize.query(
        `CREATE UNIQUE INDEX scene_pins_scene_id_type_uk ON scene_pins (scene_id, type) WHERE type <> 'OTHER' AND deleted_at IS NULL`,
        { transaction }
      );
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['scene_id'],
        references: {
          table: 'scenes',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['deleted_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['created_by_agency_id'],
        references: {
          table: 'agencies',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_agency_id'],
        references: {
          table: 'agencies',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_pins', {
        type: 'FOREIGN KEY',
        fields: ['deleted_by_agency_id'],
        references: {
          table: 'agencies',
          field: 'id',
        },
        transaction,
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('scene_pins', 'type', { transaction });
      await queryInterface.sequelize.query('DROP TYPE enum_scene_pins_type', {
        transaction,
      });
      await queryInterface.dropTable('scene_pins', { transaction });
    });
  },
};
