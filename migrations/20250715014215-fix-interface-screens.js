/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('interface_screens');
    await queryInterface.addColumn('screens', 'position', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.sequelize.query('ALTER TABLE "screens" ALTER COLUMN "interface_id" SET NOT NULL;');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "screens" ALTER COLUMN "interface_id" DROP NOT NULL;');
    await queryInterface.removeColumn('screens', 'position');
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
  },
};
