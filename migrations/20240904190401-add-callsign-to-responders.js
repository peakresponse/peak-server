/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn('responders', 'call_sign', Sequelize.CITEXT, {
        transaction,
      });
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_agency_name_call_sign ON responders (scene_id, agency_name, call_sign) WHERE agency_id IS NULL AND user_id IS NULL AND vehicle_id IS NULL AND departed_at IS NULL',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_agency_id_call_sign ON responders (scene_id, agency_id, call_sign) WHERE agency_id IS NOT NULL AND user_id IS NULL AND vehicle_id IS NULL AND departed_at IS NULL',
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('responders', 'call_sign', { transaction });
    });
  },
};
