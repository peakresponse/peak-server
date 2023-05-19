import { find } from 'lodash';

export class XsdSchema {
  private data: any;
  private rootElementNameInternal?: string;

  constructor(data: any, rootElementName?: string) {
    this.data = data;
    this.rootElementNameInternal = rootElementName;
  }

  get rootElementName(): string {
    if (!this.rootElementNameInternal) {
      this.rootElementNameInternal = this.data?.['xs:schema']?.['xs:complexType']?._attributes?.name;
    }
    return this.rootElementNameInternal ?? '';
  }

  get rootChildElements(): any[] {
    let complexType = this.data?.['xs:schema']?.['xs:complexType'];
    if (Array.isArray(complexType)) {
      complexType = find(complexType, {
        _attributes: { name: this.rootElementName } as any,
      });
    }
    return complexType?.['xs:sequence']?.['xs:element'];
  }

  get basePath(): string | undefined {
    if (this.isGrouped) {
      return `$['${this.groupElementName}']`;
    }
    return undefined;
  }

  get isGrouped(): boolean {
    return this.rootChildElements?.length == 1;
  }

  get groupElementName(): string {
    return this.rootChildElements?.[0]?._attributes?.name;
  }

  get childElements(): any[] {
    let childElements = this.rootChildElements;
    if (childElements?.length == 1) {
      return childElements[0]?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
    }
    return childElements;
  }
}
