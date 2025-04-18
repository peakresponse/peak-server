const sequelizePaginate = require('sequelize-paginate');

const { getNemsisPublicRepo } = require('../lib/nemsis/public');
const { NemsisEmsXsdParser } = require('../lib/nemsis/emsXsdParser');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class NemsisElement extends Base {
    static associate() {
      NemsisElement.belongsTo(NemsisElement, { as: 'parent' });
    }

    static async import(nemsisVersion) {
      const repo = getNemsisPublicRepo(nemsisVersion);
      if (!repo.exists) {
        await repo.pull();
      }
      const parser = new NemsisEmsXsdParser(repo.emsDataSetXsdPath);
      const result = await parser.parsePatientCareReport();
      // perform a depth-first traversal to generate nested set indices
      let depth = 0;
      let i = 1;
      function traverse(element) {
        element.depth = depth;
        depth += 1;
        element.lft = i;
        i += 1;
        element.children.forEach(traverse);
        element.rgt = i;
        i += 1;
        depth -= 1;
      }
      result.children.forEach(traverse);
      // perform a breadth-first traversal to generate records
      const dataSet = 'EMS';
      return sequelize.transaction(async (transaction) => {
        const queue = [...result.children];
        do {
          const element = queue.shift();
          // eslint-disable-next-line no-await-in-loop
          const [obj] = await NemsisElement.upsert(
            { ...element, dataSet, nemsisVersion },
            {
              conflictFields: ['nemsis_version', 'data_set', 'name'],
              transaction,
            },
          );
          if (element.children.length > 0) {
            element.children.forEach((c) => {
              c.parentId = obj.id;
            });
            queue.push(...element.children);
          }
        } while (queue.length > 0);
      });
    }
  }

  NemsisElement.init(
    {
      lft: DataTypes.INTEGER,
      rgt: DataTypes.INTEGER,
      depth: DataTypes.INTEGER,
      nemsisVersion: DataTypes.STRING,
      dataSet: DataTypes.STRING,
      xsd: DataTypes.STRING,
      name: DataTypes.STRING,
      displayName: DataTypes.STRING,
      definition: DataTypes.TEXT,
      minOccurs: DataTypes.INTEGER,
      maxOccurs: DataTypes.INTEGER,
      isNational: DataTypes.BOOLEAN,
      isState: DataTypes.BOOLEAN,
      isDeprecated: DataTypes.BOOLEAN,
      isNillable: DataTypes.BOOLEAN,
      usage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'NemsisElement',
      tableName: 'nemsis_elements',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(NemsisElement);

  return NemsisElement;
};
