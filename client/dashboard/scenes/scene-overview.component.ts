import { Component } from '@angular/core';

import { SceneService } from './scene.service';

@Component({
  templateUrl: './scene-overview.component.html'
})
export class SceneOverviewComponent {
  constructor(public scene: SceneService) {}
}
