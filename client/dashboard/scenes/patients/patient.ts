import { cloneDeep } from 'lodash';

export class PatientAgeUnits {
  static YEARS = '2516009';
  static MONTHS = '2516007';
  static DAYS = '2516001';
  static HOURS = '2516003';
  static MINUTES = '2516005';
}

export class PatientGender {
  static FEMALE = '9906001';
  static MALE = '9906003';
  static TRANS_MALE = '9906007';
  static TRANS_FEMALE = '9906009';
  static OTHER = '9906011';
  static UNKNOWN = '9906005';
}

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
