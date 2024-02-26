/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'responders',
        'user_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        {
          transaction,
        },
      );
      await queryInterface.changeColumn(
        'responders',
        'agency_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        {
          transaction,
        },
      );
      await queryInterface.changeColumn(
        'responders',
        'arrived_at',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        {
          transaction,
        },
      );
      await queryInterface.addColumn('responders', 'agency_name', Sequelize.CITEXT, {
        transaction,
      });
      await queryInterface.addColumn('responders', 'unit_number', Sequelize.CITEXT, {
        transaction,
      });
      await queryInterface.addColumn('responders', 'capability', Sequelize.STRING, {
        transaction,
      });
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_agency_name_unit_number ON responders (scene_id, agency_name, unit_number) WHERE agency_id IS NULL AND user_id IS NULL AND vehicle_id IS NULL AND departed_at IS NULL',
        { transaction },
      );
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX responders_scene_id_agency_id_unit_number ON responders (scene_id, agency_id, unit_number) WHERE agency_id IS NOT NULL AND user_id IS NULL AND vehicle_id IS NULL AND departed_at IS NULL',
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('responders', 'capability', { transaction });
      await queryInterface.removeColumn('responders', 'unit_number', { transaction });
      await queryInterface.removeColumn('responders', 'agency_name', { transaction });
      await queryInterface.changeColumn(
        'responders',
        'arrived_at',
        {
          type: Sequelize.DATE,
          allowNull: false,
        },
        {
          transaction,
        },
      );
      await queryInterface.changeColumn(
        'responders',
        'agency_id',
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        {
          transaction,
        },
      );
      await queryInterface.changeColumn(
        'responders',
        'user_id',
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        {
          transaction,
        },
      );
    });
  },
};
