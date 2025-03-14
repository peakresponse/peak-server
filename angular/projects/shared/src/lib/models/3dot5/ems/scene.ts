import { Base } from './base';

export class Scene extends Base {
  get address(): string {
    let city = this.proxy.city?.featureName ?? '';
    if (city.startsWith('City of ')) {
      city = city.substring(8);
    }
    return `${this.proxy.address1 ?? ''}\n${this.proxy.address2 ?? ''}\n${city}, ${this.proxy.state?.abbr ?? ''} ${this.proxy.zip ?? ''}`
      .replace('\n\n', '\n')
      .trim();
  }
}
