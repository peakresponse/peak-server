import { Component } from '@angular/core';

import { AgencyService } from '../agencies/agency.service';
import { Scene } from './scene';

@Component({
  templateUrl: './list-scenes.component.html',
  styleUrls: ['./list-scenes.component.scss'],
})
export class ListScenesComponent {
  cls = Scene;

  constructor(public agency: AgencyService) {}
}
