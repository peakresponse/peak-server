import { Base, NemsisValue } from './base';

export enum UnitDisposition {
  patientContactMade = '4227001',
  noPatientFound = '4227009',
  noPatientContact = '4227007',
  cancelledOnScene = '4227003',
  cancelledPrior = '4227005',
  nonPatientIncident = '4227011',
}

export class Disposition extends Base {
  get unitDisposition(): NemsisValue {
    return this.getFirstNemsisValue(['eDisposition.IncidentDispositionGroup', 'eDisposition.27']);
  }
}
