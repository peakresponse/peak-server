module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('incidents', 'sort', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.sequelize.query(`
      UPDATE incidents
      SET sort=NULLIF(
        regexp_replace(
          substring(incidents.number for
            case when position('-' in incidents.number)=0
            then length(incidents.number)
            else position('-' in incidents.number)-1
            end),
          '\\D', '', 'g'
        ),
        '')::int
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('incidents', 'sort');
  },
};
