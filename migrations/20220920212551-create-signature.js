module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('signatures', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      canonical_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'signatures',
          },
          key: 'id',
        },
      },
      current_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'signatures',
          },
          key: 'id',
          deferrable: Sequelize.Deferrable.INITIALLY_DEFERRED,
        },
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'signatures',
          },
          key: 'id',
        },
      },
      second_parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'signatures',
          },
          key: 'id',
        },
      },
      form_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'forms',
          },
          key: 'id',
        },
      },
      form_instance_id: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      file: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSONB,
      },
      updated_attributes: {
        type: Sequelize.JSONB,
      },
      updated_data_attributes: {
        type: Sequelize.JSONB,
      },
      is_valid: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      validation_errors: {
        type: Sequelize.JSONB,
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
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      updated_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
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
    await queryInterface.createTable('reports_signatures', {
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'reports',
          },
          key: 'id',
        },
      },
      signature_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: {
            tableName: 'signatures',
          },
          key: 'id',
        },
      },
    });
    await queryInterface.addIndex('reports_signatures', ['report_id', 'signature_id'], { unique: true });
    await queryInterface.addColumn('reports', 'signature_ids', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reports', 'signature_ids');
    await queryInterface.dropTable('reports_signatures');
    await queryInterface.dropTable('signatures');
  },
};
