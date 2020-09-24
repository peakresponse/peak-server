import { cloneDeep } from 'lodash';

export class Patient {
  static PRIORITY_IMMEDIATE = 'immediate';
  static PRIORITY_DELAYED = 'delayed';
  static PRIORITY_MINIMAL = 'minimal';
  static PRIORITY_EXPECTANT = 'expectant';
  static PRIORITY_DEAD = 'dead';
  static PRIORITY_TRANSPORTED = 'transported';

  static PRIORITIES = [
    Patient.PRIORITY_IMMEDIATE,
    Patient.PRIORITY_DELAYED,
    Patient.PRIORITY_MINIMAL,
    Patient.PRIORITY_EXPECTANT,
    Patient.PRIORITY_DEAD,
    Patient.PRIORITY_TRANSPORTED,
  ];

  private data: any;

  constructor(data: any) {
    this.data = data;
    return new Proxy(this, {
      get: (target, prop) => {
        return target[prop] ?? target.data?.[prop];
      },
      set(obj, prop, value) {
        if (prop in obj) {
          obj[prop] = value;
        } else {
          obj.data[prop] = value;
        }
        return true;
      },
    });
  }

  get gps(): string {
    if (this.data.lat && this.data.lng) {
      return `${this.data.lat}, ${this.data.lng}`;
    }
    return '';
  }

  set gps(value: string) {
    if (value == null) {
      this.data.lat = null;
      this.data.lng = null;
    }
  }

  cloneDeep() {
    return new Patient(cloneDeep(this.data));
  }
}
