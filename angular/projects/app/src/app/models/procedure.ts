import { Base, NemsisValue } from './base';

export class Procedure extends Base {
  get procedurePerformedAt(): NemsisValue {
    return this.getFirstNemsisValue(['eProcedures.01']);
  }

  get performedPrior(): NemsisValue {
    return this.getFirstNemsisValue(['eProcedures.02']);
  }

  get procedure(): NemsisValue {
    return this.getFirstNemsisValue(['eProcedures.03']);
  }

  get responseToProcedure(): NemsisValue {
    return this.getFirstNemsisValue(['eProcedures.08']);
  }
}
