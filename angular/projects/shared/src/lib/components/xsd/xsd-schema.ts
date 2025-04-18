import { find } from 'lodash-es';

import { XsdElement } from './xsd-element';

export class XsdSchema {
  public readonly dataSet: string;
  private data: any;
  private commonTypes: any;
  private rootElementNameInternal?: string;
  private customElements?: { [key: string]: any };
  private customElementsForGroup?: { [key: string]: any[] };

  private _rootChildElements?: XsdElement[];
  private _childElements?: XsdElement[];

  constructor(dataSet: string, data: any, commonTypes: any, customConfiguration?: any[], rootElementName?: string) {
    this.dataSet = dataSet;
    this.data = data;
    this.commonTypes = commonTypes;
    if (customConfiguration) {
      this.customElements = {};
      for (const element of customConfiguration) {
        const { CustomElementID } = element._attributes ?? {};
        if (CustomElementID) {
          this.customElements[CustomElementID] = element;
          const { nemsisElement } = (element['dCustomConfiguration.01'] ?? element['eCustomConfiguration.01'])?._attributes ?? {};
          if (nemsisElement && nemsisElement !== CustomElementID) {
            this.customElementsForGroup ||= {};
            this.customElementsForGroup[nemsisElement] ||= [];
            this.customElementsForGroup[nemsisElement].push(element);
          }
        }
      }
    }
    this.rootElementNameInternal = rootElementName;
  }

  get rootElementName(): string {
    if (!this.rootElementNameInternal) {
      this.rootElementNameInternal = this.data?.['xs:schema']?.['xs:complexType']?._attributes?.name;
    }
    return this.rootElementNameInternal ?? '';
  }

  get rootChildElements(): XsdElement[] | undefined {
    if (!this._rootChildElements) {
      let complexType = this.data?.['xs:schema']?.['xs:complexType'];
      if (Array.isArray(complexType)) {
        complexType = find(complexType, {
          _attributes: { name: this.rootElementName } as any,
        });
      }
      this._rootChildElements = complexType?.['xs:sequence']?.['xs:element']?.map((e: any) => new XsdElement(e));
    }
    return this._rootChildElements;
  }

  get basePath(): string | undefined {
    if (this.isGrouped) {
      return `$['${this.groupElementName}']`;
    }
    return '$';
  }

  get isGrouped(): boolean {
    return this.rootChildElements?.length == 1;
  }

  get groupElementName(): string {
    return this.rootChildElements?.[0]?.name ?? '';
  }

  get childElements(): XsdElement[] | undefined {
    if (!this._childElements) {
      this._childElements = this.rootChildElements;
      if (this._childElements?.length == 1) {
        this._childElements = this._childElements[0].groupElements;
      }
    }
    return this._childElements;
  }

  getType(name: string): any {
    return this.commonTypes?.[name];
  }

  getCustomConfiguration(element: XsdElement | undefined): any {
    const elementName = element?.name;
    if (elementName) {
      return this.customElements?.[elementName];
    }
    return undefined;
  }
}
