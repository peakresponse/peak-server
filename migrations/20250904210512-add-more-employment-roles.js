/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TYPE "enum_employments_roles" ADD VALUE IF NOT EXISTS 'INTEGRATION' AFTER 'CONFIGURATION'`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_employments_roles" ADD VALUE IF NOT EXISTS 'USER' AFTER 'REPORTING'`);
    await queryInterface.sequelize.query(`ALTER TABLE employments ALTER COLUMN roles SET DEFAULT '{USER}'`);
    await queryInterface.sequelize.query(`UPDATE employments SET roles = ARRAY_APPEND(roles, 'USER') WHERE NOT ('USER' = ANY(roles));`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE employments SET roles = ARRAY_REMOVE(roles, 'USER') WHERE 'USER' = ANY(roles);`);
    await queryInterface.sequelize.query(
      `UPDATE employments SET roles = ARRAY_REMOVE(roles, 'INTEGRATION') WHERE 'INTEGRATION' = ANY(roles);`,
    );
    await queryInterface.sequelize.query(
      `CREATE TYPE enum_employments_roles_old AS ENUM ('BILLING', 'CONFIGURATION', 'PERSONNEL', 'REPORTING')`,
    );
    await queryInterface.sequelize.query(`ALTER TABLE employments ALTER COLUMN roles DROP DEFAULT`);
    await queryInterface.sequelize.query(
      `ALTER TABLE employments ALTER COLUMN roles TYPE enum_employments_roles_old[] USING (roles::TEXT[]::enum_employments_roles_old[])`,
    );
    await queryInterface.sequelize.query(`DROP TYPE enum_employments_roles`);
    await queryInterface.sequelize.query(`ALTER TYPE "enum_employments_roles_old" RENAME TO "enum_employments_roles"`);
    await queryInterface.sequelize.query(`ALTER TABLE employments ALTER COLUMN roles SET DEFAULT '{}'`);
  },
};
