const tables = [
  'dispatches',
  'dispositions',
  'files',
  'histories',
  'medications',
  'narratives',
  'patients',
  'procedures',
  'reports',
  'responses',
  'scenes',
  'signatures',
  'situations',
  'times',
  'vitals',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    async function addColumn(table, options) {
      await queryInterface.addColumn(
        table,
        'version_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'versions',
            },
            key: 'id',
          },
        },
        options
      );
    }
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all(tables.map((t) => addColumn(t, { transaction })));
    });
  },

  async down(queryInterface, Sequelize) {
    async function removeColumn(table, options) {
      await queryInterface.removeColumn(table, 'version_id', options);
    }
    await queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all(tables.map((t) => removeColumn(t, { transaction })));
    });
  },
};
