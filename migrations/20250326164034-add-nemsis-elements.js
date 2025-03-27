/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nemsis_elements', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        type: Sequelize.UUID,
      },
      lft: {
        type: Sequelize.INTEGER,
      },
      rgt: {
        type: Sequelize.INTEGER,
      },
      depth: {
        type: Sequelize.INTEGER,
      },
      parent_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'nemsis_elements',
          },
          key: 'id',
        },
      },
      nemsis_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data_set: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      xsd: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      min_occurs: {
        type: Sequelize.INTEGER,
      },
      max_occurs: {
        type: Sequelize.INTEGER,
      },
      is_national: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_state: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_deprecated: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      usage: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      is_nillable: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      display_name: {
        type: Sequelize.STRING,
      },
      definition: {
        type: Sequelize.TEXT,
      },
    });
    await queryInterface.addIndex('nemsis_elements', ['nemsis_version', 'data_set', 'name'], {
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nemsis_elements');
  },
};
