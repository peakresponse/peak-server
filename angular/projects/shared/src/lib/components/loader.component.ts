import { Component, Input } from '@angular/core';

@Component({
  selector: 'shared-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {
  @Input() color = '#000';
}
