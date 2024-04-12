const _ = require('lodash');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const crypto = require('../lib/crypto');

module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    static associate(models) {
      Region.belongsTo(models.User, { as: 'createdBy' });
      Region.belongsTo(models.User, { as: 'updatedBy' });
      Region.hasMany(models.RegionAgency, { as: 'regionAgencies' });
      Region.hasMany(models.RegionFacility, { as: 'regionFacilities' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, [
        'id',
        'name',
        'routedUrl',
        'routedClientId',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
      ]);
      if (this.regionAgencies) {
        data.regionAgencies = this.regionAgencies.map((ra) => ra.toJSON());
      }
      if (this.regionFacilities) {
        data.regionFacilities = this.regionFacilities.map((rf) => rf.toJSON());
      }
      return data;
    }

    async createPayload(options) {
      const { transaction } = options ?? {};
      const regionAgencies = await sequelize.models.RegionAgency.findAll({
        where: { regionId: this.id },
        include: { model: sequelize.models.Agency, as: 'agency' },
        order: [['position', 'ASC']],
        transaction,
      });
      const regionFacilities = await sequelize.models.RegionFacility.findAll({
        where: { regionId: this.id },
        include: { model: sequelize.models.Facility, as: 'facility' },
        order: [['position', 'ASC']],
        transaction,
      });
      const payload = {};
      payload.Region = this.toJSON();
      delete payload.Region.regionAgencies;
      delete payload.Region.regionFacilities;
      payload.Agency = [];
      payload.Facility = [];
      payload.RegionAgency = [];
      payload.RegionFacility = [];
      await Promise.all(
        regionAgencies.map(async (ra) => {
          const regionAgency = ra.toJSON();
          delete regionAgency.agency;
          const agency = _.pick(ra.agency, ['id', 'stateUniqueId', 'number', 'name']);
          const claimedAgency = await sequelize.models.Agency.scope('claimed').findOne({
            where: { canonicalAgencyId: agency.id },
            transaction,
          });
          if (claimedAgency) {
            agency.id = claimedAgency.id;
            agency.name = claimedAgency.name;
            regionAgency.agencyId = agency.id;
          }
          payload.Agency.push(agency);
          payload.RegionAgency.push(regionAgency);
        }),
      );
      regionFacilities.forEach((rf) => {
        const regionFacility = rf.toJSON();
        const { facility } = regionFacility;
        delete regionFacility.facility;
        payload.Facility.push(facility);
        payload.RegionFacility.push(regionFacility);
      });
      return payload;
    }
  }

  Region.init(
    {
      name: DataTypes.STRING,
      routedUrl: DataTypes.TEXT,
      routedClientId: DataTypes.TEXT,
      routedClientSecret: {
        type: DataTypes.VIRTUAL(DataTypes.TEXT, ['routedEncryptedClientSecret']),
        get() {
          try {
            return crypto.decrypt(process.env.MODEL_REGION_AES_KEY, this.getDataValue('routedEncryptedClientSecret'));
          } catch {
            return null;
          }
        },
        set(newValue) {
          let encrypted = null;
          if (newValue) {
            encrypted = crypto.encrypt(process.env.MODEL_REGION_AES_KEY, newValue);
          }
          this.setDataValue('routedEncryptedClientSecret', encrypted);
        },
      },
      routedEncryptedClientSecret: DataTypes.TEXT,
      routedCredentials: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: 'Region',
      tableName: 'regions',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(Region);

  return Region;
};
