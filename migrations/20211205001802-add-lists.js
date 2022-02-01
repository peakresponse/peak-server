module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'lists',
        {
          id: {
            allowNull: false,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            type: Sequelize.UUID,
          },
          agency_id: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'agencies',
              },
              key: 'id',
            },
          },
          fields: {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: [],
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
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
        { transaction }
      );
      await queryInterface.addConstraint('lists', {
        type: 'UNIQUE',
        fields: ['agency_id', 'fields'],
        transaction,
      });
      await queryInterface.createTable(
        'list_sections',
        {
          id: {
            allowNull: false,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            type: Sequelize.UUID,
          },
          list_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: {
                tableName: 'lists',
              },
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          name: {
            type: Sequelize.CITEXT,
            allowNull: false,
          },
          position: {
            type: Sequelize.INTEGER,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
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
        { transaction }
      );
      await queryInterface.addConstraint('list_sections', {
        type: 'UNIQUE',
        fields: ['list_id', 'name'],
        transaction,
      });
      await queryInterface.createTable(
        'list_items',
        {
          id: {
            allowNull: false,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
            primaryKey: true,
            type: Sequelize.UUID,
          },
          list_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: {
                tableName: 'lists',
              },
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          list_section_id: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'list_sections',
              },
              key: 'id',
            },
            onDelete: 'SET NULL',
          },
          system: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          code: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
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
        { transaction }
      );
      await queryInterface.addConstraint('list_items', {
        type: 'UNIQUE',
        fields: ['list_id', 'system', 'code'],
        transaction,
      });
    });
    await queryInterface.changeColumn('list_items', 'system', {
      type: Sequelize.ENUM('9924001', '9924005', '9924003'),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('list_items', { transaction });
      await queryInterface.dropTable('list_sections', { transaction });
      await queryInterface.dropTable('lists', { transaction });
    });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_list_items_system');
  },
};
