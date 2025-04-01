import { Component, Input, OnInit } from '@angular/core';
import { JSONPath } from 'jsonpath-plus';

import { SchemaService, XsdElement, XsdSchema } from 'shared';

@Component({
  selector: 'nemsis-element',
  templateUrl: './nemsis-element.component.html',
  standalone: false,
})
export class NemsisElementComponent implements OnInit {
  @Input() nemsisVersion: string = '';
  @Input() dataSet: string = '';
  @Input() xsdName: string = '';
  @Input() name?: string = '';
  @Input() customConfiguration?: any[];

  @Input() record: any;

  xsd?: XsdSchema;
  element?: XsdElement;
  basePath?: string;
  stack?: any[];
  data: any;

  constructor(private schema: SchemaService) {}

  ngOnInit() {
    this.schema.getXsd(this.nemsisVersion, this.xsdName).subscribe((schema: any) => {
      this.xsd = new XsdSchema(this.dataSet, schema, this.schema.getCommonTypes(this.nemsisVersion), this.customConfiguration);

      const baseParts = ['$'];
      const stack: any[] = [];
      if (this.xsd?.isGrouped) {
        baseParts.push(this.xsd?.groupElementName);
        stack.push({ element: this.xsd?.rootChildElements?.[0], path: '$' });
      }
      // find matching child element
      const find = (elements: XsdElement[]): XsdElement | undefined => {
        for (const element of elements) {
          if (element.name === this.name) {
            return element;
          } else if (element.isGroup) {
            baseParts.push(element.name);
            stack.push({ element, path: element.name });
            const result = find(element.groupElements ?? []);
            if (result) {
              return result;
            }
            baseParts.pop();
            stack.pop();
          }
        }
        return undefined;
      };
      this.element = find(this.xsd?.childElements ?? []);
      this.basePath = JSONPath.toPathString(baseParts);
      this.stack = stack;
      this.data = {};
    });
  }
}
