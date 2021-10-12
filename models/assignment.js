const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Assignment.belongsTo(models.User, { as: 'user' });
      Assignment.belongsTo(models.Vehicle, { as: 'vehicle' });
      Assignment.belongsTo(models.User, { as: 'createdBy' });
      Assignment.belongsTo(models.User, { as: 'updatedBy' });
    }

    static async assign(user, agency, assignee, vehicle, options) {
      // ensure that assignee, and vehicle all belong to agency
      if (!(await assignee.isEmployedBy(agency, { transaction: options?.transaction }))) {
        throw new Error();
      }
      if (vehicle && vehicle.createdByAgencyId !== agency.id) {
        throw new Error();
      }
      // check if there's a current assignment
      const currentAssignment = await assignee.getCurrentAssignment({ transaction: options?.transaction });
      if (currentAssignment) {
        if (currentAssignment.vehicleId === (vehicle?.id ?? null)) {
          // already assigned to this vehicle, return existing assignment record
          return currentAssignment;
        }
        // end current assignment
        await currentAssignment.update({ endedAt: new Date(), updatedById: user.id }, { transaction: options?.transaction });
      }
      // create new assignment
      return Assignment.create(
        {
          userId: assignee.id,
          vehicleId: vehicle?.id,
          createdById: user.id,
          updatedById: user.id,
        },
        { transaction: options?.transaction }
      );
    }
  }
  Assignment.init(
    {
      endedAt: {
        type: DataTypes.DATE,
        field: 'ended_at',
      },
    },
    {
      sequelize,
      modelName: 'Assignment',
      tableName: 'assignments',
      underscored: true,
    }
  );
  Assignment.addScope('current', {
    where: {
      endedAt: null,
    },
  });
  return Assignment;
};
