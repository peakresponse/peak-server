module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      canonical_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'forms',
          },
          key: 'id',
        },
      },
      current_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'forms',
          },
          key: 'id',
          deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
        },
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'forms',
          },
          key: 'id',
        },
      },
      second_parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'forms',
          },
          key: 'id',
        },
      },
      updated_attributes: {
        type: Sequelize.JSONB,
      },
      title: {
        type: Sequelize.STRING,
      },
      body: {
        type: Sequelize.TEXT,
      },
      reasons: {
        type: Sequelize.JSONB,
      },
      signatures: {
        type: Sequelize.JSONB,
      },
      archived_at: {
        type: Sequelize.DATE,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('forms');
  },
};
