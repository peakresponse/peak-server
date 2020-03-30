export class Patient {
  static PRIORITY_IMMEDIATE = 'immediate';
  static PRIORITY_DELAYED = 'delayed';
  static PRIORITY_MINIMAL = 'minimal';
  static PRIORITY_EXPECTANT = 'expectant';
  static PRIORITY_DEAD = 'dead';
  // static PRIORITY_UNKNOWN = 'unknown';

  static PRIORITY_ARRAY = [
    Patient.PRIORITY_IMMEDIATE,
    Patient.PRIORITY_DELAYED,
    Patient.PRIORITY_MINIMAL,
    Patient.PRIORITY_EXPECTANT,
    Patient.PRIORITY_DEAD,
    // Patient.PRIORITY_UNKNOWN,
  ];
  static PRIORITY_MAP = {
    immediate: 0,
    delayed: 1,
    minimal: 2,
    expectant: 3,
    dead: 4,
    unknown: 5,
  };
};
