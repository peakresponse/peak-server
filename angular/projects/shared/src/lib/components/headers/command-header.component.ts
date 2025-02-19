import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'shared-command-header',
  templateUrl: './command-header.component.html',
  standalone: false,
})
export class CommandHeaderComponent {
  @Input() user?: any;
  @Input() vehicle?: any;
  @Input() showSearch = false;
  @Output() searchValueChange = new EventEmitter<string>();
  @ContentChild(TemplateRef) template: TemplateRef<any> | null = null;

  showDropdown = false;
}
