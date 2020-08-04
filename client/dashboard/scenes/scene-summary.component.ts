import { Component } from '@angular/core';

import { SceneService } from './scene.service';

@Component({
  templateUrl: './scene-summary.component.html'
})
export class SceneSummaryComponent {
  constructor(private scene: SceneService) {}
}
