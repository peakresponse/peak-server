/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex('responders', 'responders_scene_id_role_uk');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX responders_scene_id_role_uk ON responders (scene_id, role) WHERE departed_at IS NULL',
    );
  },
};
