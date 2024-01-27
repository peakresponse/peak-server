/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guides', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      nav_name: {
        type: Sequelize.TEXT,
      },
      slug: {
        allowNull: false,
        type: Sequelize.CITEXT,
        unique: true,
      },
      body: {
        type: Sequelize.TEXT,
      },
      position: {
        type: Sequelize.INTEGER,
      },
      is_visible: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.createTable('guide_sections', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      guide_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'guides',
          },
          key: 'id',
        },
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      body: {
        type: Sequelize.TEXT,
      },
      position: {
        type: Sequelize.INTEGER,
      },
      is_visible: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.createTable('guide_items', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      guide_section_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'guides',
          },
          key: 'id',
        },
      },
      file: {
        type: Sequelize.TEXT,
      },
      body: {
        type: Sequelize.TEXT,
      },
      position: {
        type: Sequelize.INTEGER,
      },
      is_visible: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('guide_items');
    await queryInterface.dropTable('guide_sections');
    await queryInterface.dropTable('guides');
  },
};
