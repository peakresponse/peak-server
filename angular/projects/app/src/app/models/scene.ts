import { Base } from './base';

export class Scene extends Base {
  get address(): string {
    let city = this.data.city?.featureName ?? '';
    if (city.startsWith('City of ')) {
      city = city.substring(8);
    }
    return `${this.data.address1 ?? ''}\n${this.data.address2 ?? ''}\n${city}, ${this.data.state?.abbr ?? ''} ${this.data.zip ?? ''}`
      .replace('\n\n', '\n')
      .trim();
  }
}
