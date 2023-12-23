module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('users', 'email', Sequelize.CITEXT, {
        transaction,
      });
      await queryInterface.removeIndex('users', 'users_email_idx', {
        transaction,
      });
      await queryInterface.addConstraint('users', {
        type: 'UNIQUE',
        fields: ['email'],
        transaction,
      });
      await queryInterface.changeColumn({ schema: 'demographics', tableName: 'employments' }, 'email', Sequelize.CITEXT, { transaction });
      await queryInterface.addConstraint(
        { schema: 'demographics', tableName: 'employments' },
        {
          type: 'UNIQUE',
          fields: ['agency_id', 'email'],
          name: 'demographics.employments_agency_id_email_uk',
          transaction,
        },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(
        `ALTER TABLE "demographics"."employments" DROP CONSTRAINT "demographics.employments_agency_id_email_uk"`,
        { transaction },
      );
      await queryInterface.changeColumn({ schema: 'demographics', tableName: 'employments' }, 'email', Sequelize.STRING, { transaction });
      await queryInterface.removeConstraint('users', 'users_email_uk', {
        transaction,
      });
      await queryInterface.changeColumn('users', 'email', Sequelize.STRING, {
        transaction,
      });
      await queryInterface.addIndex('users', {
        fields: [Sequelize.fn('lower', Sequelize.col('email'))],
        unique: true,
        name: 'users_email_idx',
        transaction,
      });
    });
  },
};
