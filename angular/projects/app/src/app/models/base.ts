import { capitalize, singularize } from 'inflection';
import { get } from 'lodash';

export class NemsisValue {
  private data: any;

  constructor(data: any) {
    this.data = data;
  }

  toString(): string {
    return this.data?._text ?? '';
  }
}

export class NemsisValueList {
  private values: NemsisValue[];

  get length(): number {
    return this.values.length;
  }

  constructor(values: NemsisValue[]) {
    this.values = values;
  }

  toString(): string {
    return this.values.join('\n').trim();
  }
}

export class Base {
  protected data: any;
  protected dependencies: any;
  protected cache: any;
  protected models: any;
  protected proxy: any;

  constructor(data: any, dependencies: any = undefined, models: any = {}) {
    this.data = data;
    this.dependencies = dependencies;
    this.cache = {};
    this.models = models;
    this.proxy = new Proxy(this, {
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
              target.cache[type][id] = new models[type](target.dependencies[type][id], target.dependencies, target.models);
            }
            return target.cache[type][id];
          }
          return target.dependencies[type][id];
        } else if (propName.endsWith('s') && `${singularize(propName)}Ids` in target.data) {
          const ids = target.data[`${singularize(propName)}Ids`];
          const type = capitalize(singularize(propName));
          if (models[type]) {
            return ids.map((id: any) => {
              if (!target.cache[type]?.[id]) {
                target.cache[type] ||= {};
                target.cache[type][id] = new models[type](target.dependencies[type][id], target.dependencies, target.models);
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
    return this.proxy;
  }

  getFirstNemsisValue(keyPath: string[]): NemsisValue {
    const keyPathJoined = keyPath.join('/');
    if (!(keyPathJoined in this.cache)) {
      const element = get(this.data.data, keyPath);
      this.cache[keyPathJoined] = Array.isArray(element) ? new NemsisValue(element[0]) : new NemsisValue(element);
    }
    return this.cache[keyPathJoined];
  }

  getNemsisValues(keyPath: string[]): NemsisValueList {
    const keyPathJoined = keyPath.join('/');
    if (!(keyPathJoined in this.cache)) {
      const element = get(this.data.data, keyPath);
      if (element) {
        this.cache[keyPathJoined] = new NemsisValueList(
          Array.isArray(element) ? element.map((e) => new NemsisValue(e)) : [new NemsisValue(element)]
        );
      } else {
        this.cache[keyPathJoined] = new NemsisValueList([]);
      }
    }
    return this.cache[keyPathJoined];
  }
}
