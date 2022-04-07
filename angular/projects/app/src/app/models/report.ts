import models from '.';

export class Report {
  private data: any;
  private dependencies: any;
  private cache: any = {};

  constructor(data: any, dependencies: any) {
    this.data = data;
    this.dependencies = dependencies;
    return new Proxy(this, {
      get(target, prop) {
        const propName = String(prop);
        if (prop in target.data) {
          return target.data[prop];
        } else if (`${propName}Id` in target.data) {
          const id = target.data[`${propName}Id`];
          const type = propName[0].toUpperCase() + propName.substring(1);
          if (models[type]) {
            if (!target.cache[type]?.[id]) {
              target.cache[type] ||= {};
              target.cache[type][id] = new models[type](target.dependencies[type][id]);
            }
            return target.cache[type][id];
          }
          return target.dependencies[type][id];
        } else if (propName.endsWith('s') && `${propName.substring(0, propName.length - 1)}Ids` in target.data) {
          const ids = target.data[`${propName.substring(0, propName.length - 1)}Ids`];
          const type = propName[0].toUpperCase() + propName.substring(1, propName.length - 1);
          if (models[type]) {
            return ids.map((id: any) => {
              if (!target.cache[type]?.[id]) {
                target.cache[type] ||= {};
                target.cache[type][id] = new models[type](target.dependencies[type][id]);
              }
              return target.cache[type][id];
            });
          }
          return ids.map((id: any) => target.dependencies[type][id]);
        }
        return (target as any)[prop];
      },
      set(obj, prop, value) {
        if (prop in obj) {
          (obj as any)[prop] = value;
        } else {
          obj.data[prop] = value;
        }
        return true;
      },
    });
  }

  predictionsFor(fileId: string): any {
    const sources = (this as any).predictions?._sources;
    for (const predictionId in sources) {
      const prediction = sources[predictionId];
      if (fileId === (prediction as any).fileId?.toLowerCase() && (prediction as any).isFinal) {
        return prediction;
      }
    }
    return null;
  }
}
