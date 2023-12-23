module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'scene_observations',
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
          parent_scene_observation_id: {
            type: Sequelize.UUID,
          },
          name: {
            type: Sequelize.STRING,
          },
          desc: {
            type: Sequelize.TEXT,
          },
          urgency: {
            type: Sequelize.TEXT,
          },
          note: {
            type: Sequelize.TEXT,
          },
          approx_patients: {
            type: Sequelize.INTEGER,
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          is_mci: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          lat: {
            type: Sequelize.STRING,
          },
          lng: {
            type: Sequelize.STRING,
          },
          geog: {
            type: Sequelize.GEOMETRY,
          },
          address1: {
            type: Sequelize.STRING,
          },
          address2: {
            type: Sequelize.STRING,
          },
          city_id: {
            type: Sequelize.STRING,
          },
          county_id: {
            type: Sequelize.STRING,
          },
          state_id: {
            type: Sequelize.STRING,
          },
          zip: {
            type: Sequelize.STRING,
          },
          updated_attributes: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: [],
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
      await queryInterface.sequelize.query('CREATE INDEX scene_observations_geog_idx ON scene_observations USING gist(geog)', {
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['scene_id'],
        references: {
          table: 'scenes',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['parent_scene_observation_id'],
        references: {
          table: 'scene_observations',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['city_id'],
        references: {
          table: 'cities',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['county_id'],
        references: {
          table: 'counties',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('scene_observations', {
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
      await queryInterface.addConstraint('scene_observations', {
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('scene_observations'),
};
