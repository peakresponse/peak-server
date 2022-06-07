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
}
