/* eslint-disable no-await-in-loop */
const CONSTRAINTS = [
  [
    'demographics.configurations',
    'demographics.configurations_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.contacts',
    'demographics.contacts_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.devices',
    'demographics.devices_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.employments',
    'demographics.employments_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.facilities',
    'demographics.facilities_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.locations',
    'demographics.locations_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'demographics.vehicles',
    'demographics.vehicles_agency_id_demographics.agencies_fk',
    'agency_id',
  ],
  [
    'observations',
    'observations_created_by_agency_id_[object Object]_fk',
    'created_by_agency_id',
  ],
  [
    'observations',
    'observations_updated_by_agency_id_[object Object]_fk',
    'updated_by_agency_id',
  ],
  [
    'patients',
    'patients_created_by_agency_id_[object Object]_fk',
    'created_by_agency_id',
  ],
  [
    'patients',
    'patients_updated_by_agency_id_[object Object]_fk',
    'updated_by_agency_id',
  ],
  ['responders', 'responders_agency_id_[object Object]_fk', 'agency_id'],
  [
    'responders',
    'responders_created_by_agency_id_[object Object]_fk',
    'created_by_agency_id',
  ],
  [
    'responders',
    'responders_updated_by_agency_id_[object Object]_fk',
    'updated_by_agency_id',
  ],
  [
    'scene_observations',
    'scene_observations_created_by_agency_id_[object Object]_fk',
    'created_by_agency_id',
  ],
  [
    'scene_observations',
    'scene_observations_incident_commander_agency_id_[object Object]',
    'incident_commander_agency_id',
  ],
  [
    'scene_observations',
    'scene_observations_updated_by_agency_id_[object Object]_fk',
    'updated_by_agency_id',
  ],
  [
    'scenes',
    'scenes_created_by_agency_id_[object Object]_fk',
    'created_by_agency_id',
  ],
  [
    'scenes',
    'scenes_incident_commander_agency_id_[object Object]_fk',
    'incident_commander_agency_id',
  ],
  [
    'scenes',
    'scenes_updated_by_agency_id_[object Object]_fk',
    'updated_by_agency_id',
  ],
];

const addAgencyReference = async (
  queryInterface,
  tableName,
  column,
  transaction
) => {
  await queryInterface.addConstraint(tableName, {
    type: 'FOREIGN KEY',
    fields: [column],
    references: {
      table: 'agencies',
      field: 'id',
    },
    transaction,
  });
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'agencies',
        'is_valid',
        { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
        { transaction }
      );

      await queryInterface.addColumn(
        'agencies',
        'subdomain',
        Sequelize.CITEXT,
        { transaction }
      );

      await queryInterface.addColumn(
        'agencies',
        'canonical_agency_id',
        Sequelize.UUID,
        { transaction }
      );
      await addAgencyReference(
        queryInterface,
        'agencies',
        'canonical_agency_id',
        transaction
      );

      await queryInterface.addColumn(
        'agencies',
        'created_by_agency_id',
        Sequelize.UUID,
        { transaction }
      );
      await addAgencyReference(
        queryInterface,
        'agencies',
        'created_by_agency_id',
        transaction
      );

      /// remove existing agency compound unique id
      await queryInterface.removeConstraint(
        'agencies',
        'agencies_state_unique_id_number_state_id_uk',
        { transaction }
      );
      /// include the created by agency column in the compound unique id
      await queryInterface.addConstraint('agencies', {
        type: 'UNIQUE',
        fields: [
          'created_by_agency_id',
          'state_unique_id',
          'number',
          'state_id',
        ],
        transaction,
      });
      /// ensure there is a compound unique id for a canonical agency record
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX agencies_canonical_state_unique_id_number_state_id ON agencies (state_unique_id, number, state_id) WHERE canonical_agency_id IS NULL',
        { transaction }
      );
      /// ensure subdomains are unique
      await queryInterface.addConstraint('agencies', {
        type: 'UNIQUE',
        fields: ['subdomain'],
        transaction,
      });
      /// ensure only one subdomain per unique agency
      await queryInterface.sequelize.query(
        'CREATE UNIQUE INDEX agencies_subdomain_state_unique_id_number_state_id ON agencies (state_unique_id, number, state_id) WHERE subdomain IS NOT NULL',
        { transaction }
      );
      /// ensure subdomains only set on agency owned records
      await queryInterface.addConstraint('agencies', {
        type: 'CHECK',
        fields: ['subdomain'],
        where: {
          [Sequelize.Op.or]: [
            {
              subdomain: { [Sequelize.Op.is]: null },
              [Sequelize.Op.not]: {
                created_by_agency_id: { [Sequelize.Op.col]: 'id' },
              },
            },
            {
              subdomain: { [Sequelize.Op.not]: null },
              created_by_agency_id: { [Sequelize.Op.col]: 'id' },
            },
          ],
        },
        transaction,
      });
      /// ensure agencies are either canonical or owned
      await queryInterface.addConstraint('agencies', {
        type: 'CHECK',
        fields: ['canonical_agency_id'],
        where: {
          [Sequelize.Op.or]: [
            {
              canonical_agency_id: { [Sequelize.Op.is]: null },
              created_by_agency_id: { [Sequelize.Op.is]: null },
            },
            {
              canonical_agency_id: { [Sequelize.Op.not]: null },
              created_by_agency_id: { [Sequelize.Op.not]: null },
            },
          ],
        },
        transaction,
      });

      /// migrage demographics.agencies data
      await queryInterface.sequelize.query(
        `
        INSERT INTO agencies (id, canonical_agency_id, subdomain, state_unique_id, number, name, state_id, data, is_valid, created_by_id, created_by_agency_id, created_at, updated_by_id, updated_at)
        (SELECT id, agency_id, subdomain, state_unique_id, number, name, state_id, data, is_valid, created_by_id, id, created_at, updated_by_id, updated_at FROM demographics.agencies);
      `,
        { transaction }
      );

      /// re-map foreign key references
      for (const [tableName, constraintId, column] of CONSTRAINTS) {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} DROP CONSTRAINT "${constraintId}"`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableName
            .split('.')
            .pop()}_${column}_agencies_fk FOREIGN KEY (${column}) REFERENCES agencies(id)`,
          { transaction }
        );
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      /// re-map foreign key references
      for (const [tableName, constraintId, column] of CONSTRAINTS) {
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} DROP CONSTRAINT ${tableName
            .split('.')
            .pop()}_${column}_agencies_fk`,
          { transaction }
        );
        await queryInterface.sequelize.query(
          `ALTER TABLE ${tableName} ADD CONSTRAINT "${constraintId}" FOREIGN KEY (${column}) REFERENCES demographics.agencies(id)`,
          { transaction }
        );
      }
      await queryInterface.sequelize.query(
        'DELETE FROM agencies WHERE created_by_agency_id IS NOT NULL',
        { transaction }
      );
      await queryInterface.removeColumn('agencies', 'is_valid', {
        transaction,
      });
      await queryInterface.removeColumn('agencies', 'subdomain', {
        transaction,
      });
      await queryInterface.removeColumn('agencies', 'canonical_agency_id', {
        transaction,
      });
      await queryInterface.removeColumn('agencies', 'created_by_agency_id', {
        transaction,
      });
      await queryInterface.addConstraint('agencies', {
        type: 'UNIQUE',
        fields: ['state_unique_id', 'number', 'state_id'],
        transaction,
      });
    });
  },
};
