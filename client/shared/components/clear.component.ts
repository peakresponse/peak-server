import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shared-clear',
  templateUrl: './clear.component.html',
  styleUrls: ['./clear.component.scss'],
})
export class ClearComponent {
  @Input() object: any;
  @Input() propertyName: string;
  @Output() clear = new EventEmitter<null>();

  onClear() {
    delete this.object[this.propertyName];
    this.clear.emit();
  }
}
