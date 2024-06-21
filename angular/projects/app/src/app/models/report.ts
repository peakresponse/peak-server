import { DateTime } from 'luxon';

import { TriagePriority } from 'shared';

import { Base } from './base';

export class Report extends Base {
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

  get description(): string {
    const report = this.proxy;
    return [report.patient?.fullName, report.patient?.ageString, report.patient?.genderString].filter((v) => !!v).join(', ');
  }

  get filterPriorityString(): string {
    return TriagePriority.toString(this.data.filterPriority);
  }

  get updatedAtRelative(): string | null {
    const report = this.proxy;
    return DateTime.fromISO(report.updatedAt).toRelative();
  }
}
