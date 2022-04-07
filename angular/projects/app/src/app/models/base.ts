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
  protected cache: any = {};

  constructor(data: any) {
    this.data = data;
    return new Proxy(this, {
      get(target, prop) {
        const propName = String(prop);
        if (prop in target.data) {
          return target.data[prop];
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
