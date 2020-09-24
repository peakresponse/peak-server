module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'status',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'status_at',
        { type: Sequelize.DATE },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'primary_job_role',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'data',
        { type: Sequelize.JSONB },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'first_name',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'last_name',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'middle_name',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'email',
        { type: Sequelize.STRING },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'invitation_code',
        { type: Sequelize.UUID },
        { transaction }
      );
      await queryInterface.addColumn(
        { schema: 'demographics', tableName: 'employments' },
        'invitation_at',
        { type: Sequelize.DATE },
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments ALTER COLUMN hired_at DROP NOT NULL`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments ALTER COLUMN started_at DROP NOT NULL`,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments ALTER COLUMN user_id DROP NOT NULL`,
        { transaction }
      );
      await queryInterface.addConstraint('demographics.employments', {
        type: 'UNIQUE',
        fields: ['invitation_code'],
        transaction,
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'invitation_at',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'invitation_code',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'email',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'middle_name',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'last_name',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'first_name',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'data',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'primary_job_role',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'status_at',
        { transaction }
      );
      await queryInterface.removeColumn(
        { schema: 'demographics', tableName: 'employments' },
        'status',
        { transaction }
      );
    });
  },
};
