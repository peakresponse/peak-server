/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('venues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.TEXT,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      address1: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      address2: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      city_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'cities',
          },
          key: 'id',
        },
      },
      county_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'counties',
          },
          key: 'id',
        },
      },
      state_id: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'states',
          },
          key: 'id',
        },
      },
      zip_code: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      archived_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
    });

    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      venue_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'venues',
          },
          key: 'id',
        },
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      archived_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
      created_by_agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
    });

    await queryInterface.createTable('events_agencies', {
      event_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'events',
          },
          key: 'id',
        },
        allowNull: false,
      },
      agency_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'agencies',
          },
          key: 'id',
        },
        allowNull: false,
      },
    });
    await queryInterface.addIndex('events_agencies', ['event_id', 'agency_id'], { unique: true });

    await queryInterface.addColumn('agencies', 'is_events_only', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    await queryInterface.addColumn('incidents', 'event_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'events',
        },
        key: 'id',
      },
    });

    await queryInterface.addColumn('facilities', 'venue_id', {
      type: Sequelize.UUID,
      references: {
        model: {
          tableName: 'venues',
        },
        key: 'id',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('facilities', 'venue_id');
    await queryInterface.removeColumn('incidents', 'event_id');
    await queryInterface.dropTable('events_agencies');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('venues');
  },
};
