import { Component, Input } from '@angular/core';

import * as inflection from 'inflection';
import { filter, find, isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ApiService } from '../../../services/api.service';
import { XsdSchema } from '../xsd-schema';

@Component({
  template: '',
})
export class XsdElementBaseComponent {
  @Input() xsd?: XsdSchema;
  @Input() element: any;
  @Input() data: any;
  @Input() error: any;
  @Input() index?: number;
  @Input() selectedValue: any;
  @Input() displayOnly = false;
  @Input() basePath?: string;
  private _type: any;

  constructor(protected api: ApiService) {}

  get type(): any {
    if (this._type !== undefined) {
      return this._type;
    }
    this._type = null;
    /// check for a type attribute
    let name = this.element?._attributes?.type;
    if (!name) {
      name = this.element?.['xs:complexType']?.['xs:simpleContent']?.['xs:extension']?._attributes?.base;
    }
    if (name) {
      this._type = this.xsd?.getType(name);
    }
    return this._type;
  }

  get primitiveType(): string {
    return this.type?.['xs:restriction']?._attributes?.base;
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

  get groupElements(): any[] {
    return this.element?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
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

  get isInvalid(): boolean {
    if (this.error?.messages) {
      const predicate: any = { path: this.path };
      return find(this.error.messages, predicate) !== undefined;
    }
    return false;
  }

  isInvalidValue(index: number): boolean {
    if (this.error?.messages) {
      const predicate: any = { path: `${this.path}[${index}]` };
      return find(this.error.messages, predicate) !== undefined;
    }
    return false;
  }

  get errorMessages(): string[] {
    if (this.error?.messages) {
      const predicate: any = { path: this.path };
      return filter(this.error.messages, predicate).map((error: any) => error.message);
    }
    return [];
  }

  errorMessagesForValue(index: number): string[] {
    if (this.error?.messages) {
      const predicate: any = { path: `${this.path}[${index}]` };
      return filter(this.error.messages, predicate).map((error: any) => error.message);
    }
    return [];
  }

  get id(): string {
    return this.element?._attributes?.id;
  }

  get name(): string {
    return this.element?._attributes?.name;
  }

  get path(): string {
    let path = this.basePath || '$';
    path = `${path}['${this.name}']`;
    if (this.index) {
      path = `${path}[${this.index}]`;
    }
    return path;
  }

  get isDisplayOnly(): boolean {
    return this.displayOnly;
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

  get formName(): string {
    if (this.index) {
      return `${this.name}[${this.index}]`;
    }
    return this.name;
  }

  get value(): string {
    if (this.selectedValue) {
      return this.selectedValue._text;
    }
    const value = this.data?.[this.name]?._text;
    if (this.isRequired && value === undefined) {
      this.value = value;
    }
    return value;
  }

  get enumeratedValue(): string | null {
    let result: string | null = null;
    for (const item of this.type['xs:restriction']['xs:enumeration']) {
      if (item._attributes.value === this.value) {
        return item['xs:annotation']['xs:documentation']._text;
      }
    }
    return result;
  }

  set value(value: string) {
    if (this.selectedValue) {
      this.selectedValue._text = value;
    } else {
      this.data[this.name] = this.data[this.name] || {};
      this.data[this.name]._text = value;
    }
  }

  delValue() {
    if (this.selectedValue) {
      if (this.selectedValue._text !== undefined) {
        delete this.selectedValue._text;
      }
    } else {
      if (this.data?.[this.name]?._text !== undefined) {
        delete this.data[this.name]._text;
        if (isEmpty(this.data[this.name])) {
          delete this.data[this.name];
        }
      }
    }
  }

  get values(): any[] | null {
    if (Array.isArray(this.data?.[this.name])) {
      return this.data[this.name];
    } else if (this.data?.[this.name]) {
      return [this.data[this.name]];
    }
    if (this.isRequired && this.data) {
      const value: any = {};
      if (this.isGroup && this.isGroupUUIDRequired) {
        value._attributes = {
          UUID: uuid(),
        };
      }
      this.addValue(value);
      return this.values;
    }
    return null;
  }

  addValue(value: any) {
    if (Array.isArray(this.data?.[this.name])) {
      this.data[this.name].push(value);
    } else if (this.data?.[this.name]) {
      this.data[this.name] = [this.data[this.name], value];
    } else if (this.data) {
      this.data[this.name] = value;
    }
  }

  remValue(value: any) {
    if (Array.isArray(this.data?.[this.name])) {
      this.data[this.name] = this.data[this.name].filter((v: any) => v != value);
    } else if (this.data?.[this.name] == value) {
      delete this.data[this.name];
    }
  }

  getAttr(name: string): string {
    if (this.selectedValue) {
      return this.selectedValue?._attributes?.[name];
    }
    return this.data?.[this.name]?._attributes?.[name];
  }

  setAttr(name: string, value: string) {
    if (this.selectedValue) {
      this.selectedValue._attributes = this.selectedValue._attributes || {};
      this.selectedValue._attributes[name] = value;
    } else {
      this.data[this.name] = this.data[this.name] || {};
      this.data[this.name]._attributes = this.data[this.name]._attributes || {};
      this.data[this.name]._attributes[name] = value;
    }
  }

  delAttr(name: string) {
    if (this.selectedValue) {
      const attributes = this.selectedValue._attributes;
      if (attributes?.[name] !== undefined) {
        delete attributes[name];
      }
      if (attributes && isEmpty(attributes)) {
        delete this.selectedValue._attributes;
      }
    } else {
      const attributes = this.data[this.name]._attributes;
      if (attributes?.[name] !== undefined) {
        delete attributes[name];
      }
      if (attributes && isEmpty(attributes)) {
        delete this.data[this.name]._attributes;
      }
    }
  }

  get isNillable(): boolean {
    return this.element?._attributes?.nillable === 'true';
  }

  get isNil(): boolean {
    return this.value === undefined && this.getAttr('xsi:nil') === 'true';
  }

  set isNil(value: boolean) {
    if (value) {
      this.delValue();
      this.setAttr('xsi:nil', 'true');
      this.NV = this.nilValues[0]?.['xs:restriction']?.['xs:enumeration']?._attributes?.value;
    } else {
      this.delAttr('xsi:nil');
      this.delAttr('NV');
      this.value = '';
    }
  }

  get NV(): string {
    return this.getAttr('NV');
  }

  set NV(value: string) {
    this.setAttr('NV', value);
  }

  get nilValues(): any[] {
    if (this.element['xs:complexType']?.['xs:simpleContent']?.['xs:extension']?.['xs:attribute']) {
      let attributes = this.element['xs:complexType']?.['xs:simpleContent']?.['xs:extension']?.['xs:attribute'];
      if (!Array.isArray(attributes)) {
        attributes = [attributes];
      }
      for (let attribute of attributes) {
        if (attribute._attributes?.name == 'NV') {
          if (attribute['xs:simpleType']?.['xs:union']?._attributes?.memberTypes) {
            const types = attribute['xs:simpleType']['xs:union']._attributes.memberTypes.split(' ');
            return types.map((t: any) => this.xsd?.getType(t));
          }
          break;
        }
      }
    }
    return [];
  }

  get displayNV(): string | null {
    const NV = this.NV;
    for (const nv of this.nilValues) {
      if (nv['xs:restriction']['xs:enumeration']._attributes.value === NV) {
        return nv['xs:restriction']['xs:enumeration']['xs:annotation']['xs:documentation']._text;
      }
    }
    return null;
  }
}