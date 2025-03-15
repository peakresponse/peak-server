import * as inflection from 'inflection';

export class XsdElement {
  private element: any;
  private _groupElements?: XsdElement[];

  constructor(data: any) {
    this.element = data;

    return new Proxy(this, {
      get(target, prop) {
        const propName = String(prop);
        if (prop in target.element) {
          return target.element[prop];
        }
        return (target as any)[prop];
      },
      set(obj, prop, value) {
        if (prop in obj) {
          (obj as any)[prop] = value;
        } else {
          obj.element[prop] = value;
        }
        return true;
      },
    });
  }

  get isGroup(): boolean {
    return this.element?.['xs:complexType']?.['xs:sequence'] !== undefined;
  }

  get isGroupUUIDRequired(): boolean {
    let attributes = this.element?.['xs:complexType']?.['xs:attribute'];
    if (attributes) {
      if (!Array.isArray(attributes)) {
        attributes = [attributes];
      }
      for (const attr of attributes) {
        if (attr._attributes?.name === 'UUID' && attr._attributes?.type === 'UUID') {
          return attr._attributes?.use === 'required';
        }
      }
    }
    return false;
  }

  get groupElements(): XsdElement[] | undefined {
    if (!this._groupElements) {
      this._groupElements = this.element?.['xs:complexType']?.['xs:sequence']?.['xs:element']?.map((e: any) => new XsdElement(e));
    }
    return this._groupElements;
  }

  get groupText(): string {
    return this.element?.['xs:annotation']?.['xs:documentation']._text;
  }

  get isRequired(): boolean {
    return this.element?._attributes?.minOccurs !== '0';
  }

  get isMulti(): boolean {
    return this.element?._attributes?.maxOccurs === 'unbounded';
  }

  get isNillable(): boolean {
    return this.element?._attributes?.nillable === 'true';
  }

  get id(): string {
    return this.element?._attributes?.id;
  }

  get name(): string {
    return this.element?._attributes?.name;
  }

  get displayName(): string {
    let displayName = this.element?.['xs:annotation']?.['xs:documentation']?.nemsisTacDoc?.name?._text;
    if (!displayName && this.isGroup) {
      displayName = inflection.titleize(inflection.underscore(this.name?.split('.').pop() ?? ''));
      /// fix all caps abbreviations from being split (i.e. EMS -> E M S)
      displayName = displayName.replaceAll(/(?:[A-Z] ){2,}/g, (m: any) => `${m.replaceAll(' ', '')} `);
      if (this.isMulti) {
        displayName = inflection.pluralize(displayName);
      }
    }
    return displayName;
  }

  get displayText(): string {
    return this.element?.['xs:annotation']?.['xs:documentation']?.nemsisTacDoc?.definition?._text;
  }

  get typeName(): string {
    let name = this.element?._attributes?.type;
    if (!name) {
      name = this.element?.['xs:complexType']?.['xs:simpleContent']?.['xs:extension']?._attributes?.base;
    }
    console.log('?!', name, this.element);
    return name;
  }

  get attributes(): any[] {
    if (this.element?.['xs:complexType']?.['xs:simpleContent']?.['xs:extension']?.['xs:attribute']) {
      let attributes = this.element['xs:complexType']['xs:simpleContent']['xs:extension']['xs:attribute'];
      if (!Array.isArray(attributes)) {
        attributes = [attributes];
      }
      return attributes;
    }
    return [];
  }
}
