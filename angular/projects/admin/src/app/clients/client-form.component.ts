import { Component, Input } from '@angular/core';

@Component({
  selector: 'admin-client-form',
  templateUrl: './client-form.component.html',
  standalone: false,
})
export class ClientFormComponent {
  @Input() record: any;
  @Input() error: any;

  inputFormatter = (item: any): string => `${item.firstName ?? ''} ${item.lastName ?? ''} <${item.email ?? ''}>`.trim();
}
