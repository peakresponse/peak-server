import { TriagePriority } from 'shared';

import { Base } from './base';

export enum PatientAgeUnits {
  years = '2516009',
  months = '2516007',
  days = '2516001',
  hours = '2516003',
  minutes = '2516005',
}

export enum PatientGender {
  female = '9906001',
  male = '9906003',
  transFemale = '9906009',
  transMale = '9906007',
  other = '9906011',
  unknown = '9906005',
}

export class Patient extends Base {
  get ageString(): string {
    if (this.data.age) {
      return `${this.data.age} ${this.ageUnitsString}`;
    }
    return '';
  }

  get ageUnitsString(): string {
    switch (this.data.ageUnits) {
      case PatientAgeUnits.years:
        return $localize`:@@PatientAgeUnits.years:yr`;
      case PatientAgeUnits.months:
        return $localize`:@@PatientAgeUnits.months:mo`;
      case PatientAgeUnits.days:
        return $localize`:@@PatientAgeUnits.days:d`;
      case PatientAgeUnits.hours:
        return $localize`:@@PatientAgeUnits.hours:hr`;
      case PatientAgeUnits.minutes:
        return $localize`:@@PatientAgeUnits.minutes:min`;
      default:
        return '';
    }
  }

  get fullName(): string {
    return `${this.data.firstName ?? ''} ${this.data.lastName ?? ''}`.trim();
  }

  get genderString(): string {
    switch (this.data.gender) {
      case PatientGender.female:
        return $localize`:@@PatientGender.female:Female`;
      case PatientGender.male:
        return $localize`:@@PatientGender.male:Male`;
      case PatientGender.transFemale:
        return $localize`:@@PatientGender.transFemale:Trans Female`;
      case PatientGender.transMale:
        return $localize`:@@PatientGender.transMale:Trans Male`;
      case PatientGender.other:
        return $localize`:@@PatientGender.other:Other`;
      case PatientGender.unknown:
        return $localize`:@@PatientGender.unknown:Unknown`;
      default:
        return '';
    }
  }

  get filterPriorityString(): string {
    return TriagePriority.toString(this.data.filterPriority);
  }

  get priorityString(): string {
    return TriagePriority.toString(this.data.priority);
  }
}
