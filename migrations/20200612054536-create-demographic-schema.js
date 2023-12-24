module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      /// create a new demographics schema
      await queryInterface.sequelize.createSchema('demographics', {
        transaction,
      });
      /// create a new demographics agency table, that incorporates both the
      /// demographics table and the _type modifiations to the original agency table
      await queryInterface.createTable(
        'agencies',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.literal('gen_random_uuid()'),
          },
          agency_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          subdomain: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          state_unique_id: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          number: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          name: {
            type: Sequelize.STRING,
          },
          state_id: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          data: {
            type: Sequelize.JSONB,
          },
          created_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
          },
          updated_by_id: {
            allowNull: false,
            type: Sequelize.UUID,
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
        { schema: 'demographics', transaction },
      );
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'FOREIGN KEY',
        fields: ['state_id'],
        references: {
          table: 'states',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        references: {
          table: 'agencies',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'FOREIGN KEY',
        fields: ['created_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'FOREIGN KEY',
        fields: ['updated_by_id'],
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'UNIQUE',
        fields: ['agency_id'],
        transaction,
      });
      await queryInterface.addConstraint('demographics.agencies', {
        type: 'UNIQUE',
        fields: ['subdomain'],
        transaction,
      });
      /// migrate existing data over
      await queryInterface.sequelize.query(
        `
        INSERT INTO demographics.agencies
        (agency_id, subdomain, state_unique_id, number, name, state_id, data, created_by_id, updated_by_id, created_at, updated_at)
        (SELECT state_agency_id, subdomain, state_unique_id, number, name, state_id, data, agencies.created_by_id, agencies.updated_by_id, agencies.created_at, agencies.updated_at
        FROM demographics JOIN agencies ON demographics.agency_id=agencies.id)
      `,
        { transaction },
      );

      /// move/adapt the employments table to refer to this new agency table
      await queryInterface.sequelize.query(`ALTER TABLE employments SET SCHEMA demographics`, { transaction });
      await queryInterface.addColumn({ schema: 'demographics', tableName: 'employments' }, 'agency_id', Sequelize.UUID, { transaction });
      await queryInterface.addConstraint('demographics.employments', {
        type: 'FOREIGN KEY',
        fields: ['agency_id'],
        name: 'demographics.employments_agency_id_demographics.agencies_fk',
        references: {
          table: {
            schema: 'demographics',
            tableName: 'agencies',
          },
          field: 'id',
        },
        transaction,
      });
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments RENAME CONSTRAINT employments_created_by_id_fkey TO "demographics.employments_created_by_id_users_fk"`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments RENAME CONSTRAINT employments_updated_by_id_fkey TO "demographics.employments_updated_by_id_users_fk"`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE demographics.employments RENAME CONSTRAINT employments_user_id_fkey TO "demographics.employments_user_id_users_fk"`,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `
        UPDATE demographics.employments
        SET agency_id=
        (SELECT demographics.agencies.id
         FROM demographics.employments
         JOIN demographics ON demographics.employments.demographic_id=demographics.id
         JOIN public.agencies ON demographics.agency_id=public.agencies.id
         JOIN demographics.agencies ON public.agencies.state_agency_id=demographics.agencies.agency_id)
      `,
        { transaction },
      );
      await queryInterface.removeColumn({ schema: 'demographics', tableName: 'employments' }, 'demographic_id', { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE demographics.employments ALTER COLUMN agency_id SET NOT NULL`, { transaction });
      await queryInterface.sequelize.query(`ALTER TYPE enum_employments__roles RENAME TO "enum_demographics.employments_roles"`, {
        transaction,
      });

      /// remove the _type modifications from the original agency table
      await queryInterface.removeConstraint('demographics', 'demographics_agency_id_fkey', { transaction });
      await queryInterface.removeConstraint('agencies', 'agencies_demographic_id_fkey', { transaction });
      await queryInterface.sequelize.query(`DELETE FROM demographics`, {
        transaction,
      });
      await queryInterface.sequelize.query(`DELETE FROM agencies WHERE _type='dAgency'`, { transaction });
      await queryInterface.removeConstraint('agencies', 'agencies_demographic_uk', { transaction });
      await queryInterface.removeConstraint('agencies', 'agencies_state_uk', {
        transaction,
      });
      await queryInterface.addConstraint('agencies', {
        type: 'UNIQUE',
        fields: ['state_unique_id', 'number', 'state_id'],
        transaction,
      });
      await queryInterface.removeColumn('agencies', '_type', { transaction });
      await queryInterface.removeColumn('agencies', 'demographic_id', {
        transaction,
      });
      await queryInterface.removeColumn('agencies', 'state_agency_id', {
        transaction,
      });
      await queryInterface.sequelize.query(`DROP TYPE enum_agencies__type`, {
        transaction,
      });

      /// remove the public demographics table
      await queryInterface.dropTable('demographics', { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
