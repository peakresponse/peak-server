/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interfaces', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      min_app_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      nemsis_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data_set: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
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
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
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
    });

    await queryInterface.createTable('screens', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      interface_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'interfaces',
          },
          key: 'id',
        },
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
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
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
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
    });
    await queryInterface.addIndex('screens', ['interface_id']);

    await queryInterface.createTable('interface_screens', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      interface_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'interfaces',
          },
          key: 'id',
        },
      },
      screen_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'screens',
          },
          key: 'id',
        },
      },
      position: {
        type: Sequelize.UUID,
      },
    });
    await queryInterface.addIndex('interface_screens', ['interface_id', 'screen_id'], { unique: true });

    await queryInterface.createTable('sections', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      screen_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'screens',
          },
          key: 'id',
        },
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      position: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
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
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
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
    });
    await queryInterface.addIndex('sections', ['screen_id']);

    await queryInterface.createTable('section_elements', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      section_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'sections',
          },
          key: 'id',
        },
      },
      position: {
        type: Sequelize.INTEGER,
      },
      column: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      custom_id: {
        type: Sequelize.STRING,
      },
      nemsis_element_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'nemsis_elements',
          },
          key: 'id',
        },
      },
      screen_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'screens',
          },
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
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
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
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
    });
    await queryInterface.addIndex('section_elements', ['section_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('section_elements');
    await queryInterface.dropTable('sections');
    await queryInterface.dropTable('interface_screens');
    await queryInterface.dropTable('screens');
    await queryInterface.dropTable('interfaces');
  },
};
