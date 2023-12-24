module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.sequelize.transaction(async (transaction) => {
      /// create new demographics data set parent object
      await queryInterface.createTable(
        'demographics',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          subdomain: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'agencies',
              },
              key: 'id',
            },
          },
          data_set: {
            type: Sequelize.JSONB,
          },
          data_set_xml: {
            type: Sequelize.TEXT,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );
      await queryInterface.addConstraint('demographics', {
        type: 'UNIQUE',
        fields: ['agency_id'],
        transaction,
      });
      await queryInterface.addConstraint('demographics', {
        type: 'UNIQUE',
        fields: ['subdomain'],
        transaction,
      });

      /// add Employment relationship between User and Demographic
      await queryInterface.createTable(
        'employments',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          demographic_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'demographics',
              },
              key: 'id',
            },
          },
          user_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          hired_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          started_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          ended_at: {
            type: Sequelize.DATE,
          },
          is_owner: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction },
      );
      await queryInterface.sequelize.query(
        `CREATE TYPE enum_employments__roles AS ENUM ('BILLING', 'CONFIGURATION', 'PERSONNEL', 'REPORTING')`,
        { transaction },
      );
      await queryInterface.sequelize.query(`ALTER TABLE employments ADD COLUMN roles enum_employments__roles[] NOT NULL DEFAULT '{}'`, {
        transaction,
      });
      await queryInterface.addConstraint('employments', {
        type: 'UNIQUE',
        fields: ['demographic_id', 'user_id'],
        transaction,
      });
      /// clean up the existing agency/state columns

      /// remove the current compount index (to be replaced after modifications)
      await queryInterface.removeIndex('agencies', 'agencies_state_id_state_number', { transaction });
      /// rename state number column to better match NEMSIS element name
      await queryInterface.renameColumn('agencies', 'state_number', 'state_unique_id', { transaction });
      /// rename data blob, it's not one of the main set objects in the model
      await queryInterface.renameColumn('agencies', 'data_set', 'data', {
        transaction,
      });
      /// add a new state column with GNIS code, to become a new foreign key to simplified state model
      await queryInterface.addColumn('agencies', 'state', Sequelize.STRING, {
        transaction,
      });
      /// bulk update the column with the appropriate value
      await queryInterface.sequelize.query(`UPDATE agencies SET state=states.code FROM states WHERE agencies.state_id=states.id`, {
        transaction,
      });
      /// now drop the old foreign key
      await queryInterface.removeColumn('agencies', 'state_id', {
        transaction,
      });
      /// rename state to new state_id foreign key
      await queryInterface.renameColumn('agencies', 'state', 'state_id', {
        transaction,
      });
      /// add created/updated by cols
      await queryInterface.addColumn('agencies', 'created_by_id', Sequelize.UUID, { transaction });
      await queryInterface.addColumn('agencies', 'updated_by_id', Sequelize.UUID, { transaction });
      await queryInterface.sequelize.query(
        `UPDATE agencies SET created_by_id=users.id, updated_by_id=users.id FROM users WHERE users.is_admin=TRUE`,
        { transaction },
      );
      await queryInterface.sequelize.query(`ALTER TABLE agencies ALTER COLUMN created_by_id SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE agencies ALTER COLUMN updated_by_id SET NOT NULL`, { transaction });

      /// drop the primary key on states
      await queryInterface.removeColumn('states', 'id', { transaction });
      /// rename the code to id
      await queryInterface.renameColumn('states', 'code', 'id', {
        transaction,
      });
      /// make it the new primary key
      await queryInterface.addConstraint('states', {
        type: 'PRIMARY KEY',
        fields: ['id'],
        transaction,
      });
      /// remove the now redundant unique index
      await queryInterface.removeIndex('states', 'states_code', {
        transaction,
      });
      /// add a flag for easy check if the state config has been loaded
      await queryInterface.addColumn(
        'states',
        'is_configured',
        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        { transaction },
      );
      /// initialize existing state data
      await queryInterface.sequelize.query(`UPDATE states SET is_configured=TRUE WHERE data_set IS NOT NULL`, { transaction });

      /// now make state in agencies a foreign key
      await queryInterface.addConstraint('agencies', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: { table: 'states', field: 'id' },
        transaction,
      });
      /// and not null
      await queryInterface.changeColumn('agencies', 'state_id', { type: Sequelize.STRING, allowNull: false }, { transaction });

      /// update the agency model to handle state/agency-level records

      /// create _type column, to handle state/agency dem overrides
      await queryInterface.addColumn('agencies', '_type', Sequelize.ENUM('sAgency', 'dAgency'), { transaction });
      /// set initial value
      await queryInterface.sequelize.query(`UPDATE agencies SET _type='sAgency'`, { transaction });
      /// manually change not null constraint because sequelize dumb
      await queryInterface.sequelize.query(`ALTER TABLE agencies ALTER COLUMN _type SET NOT NULL`, { transaction });

      /// agency-added records reference their demographics data set
      await queryInterface.addColumn(
        'agencies',
        'demographic_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'demographics',
            },
            key: 'id',
          },
        },
        { transaction },
      );
      /// agency-overrides reference the source state record
      await queryInterface.addColumn(
        'agencies',
        'state_agency_id',
        {
          type: Sequelize.UUID,
          references: {
            model: {
              tableName: 'agencies',
            },
            key: 'id',
          },
        },
        { transaction },
      );

      /// finally, create agency compound unique constraint as defined by NEMSIS
      await queryInterface.sequelize.query(
        `ALTER TABLE agencies ADD CONSTRAINT agencies_state_uk EXCLUDE (state_unique_id WITH =, number WITH =, state_id WITH =) WHERE (demographic_id IS NULL) DEFERRABLE INITIALLY DEFERRED`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE agencies ADD CONSTRAINT agencies_demographic_uk EXCLUDE (demographic_id WITH =, state_unique_id WITH =, number WITH =, state_id WITH =) WHERE (demographic_id IS NOT NULL)`,
        { transaction },
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  },
};
