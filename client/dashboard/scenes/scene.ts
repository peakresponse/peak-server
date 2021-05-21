export class Scene {
  private data: any;
  isMaximized: boolean = false;

  constructor(data: any) {
    this.data = data;
    return new Proxy(this, {
      get(target, prop) {
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

  update(data: any) {
    this.data = data;
  }

  mapUrl(width: number, height: number): string {
    if (this.gps) {
      return `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}&scale=2&center=${this.data.lat},${this.data.lng}&zoom=14&key=${window['env'].GOOGLE_MAPS_API_KEY}`;
    }
    return null;
  }
}
