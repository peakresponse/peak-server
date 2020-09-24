import { Component } from '@angular/core';

import {
  NavigationService,
  ApiService,
  UserService,
} from '../../shared/services';

import { SceneService } from './scene.service';
import { Patient } from './patients';

@Component({
  templateUrl: './scene-overview.component.html',
  styleUrls: ['./scene-overview.component.scss'],
})
export class SceneOverviewComponent {
  private patientPriorities = Patient.PRIORITIES;

  constructor(
    private navigation: NavigationService,
    public scene: SceneService,
    public user: UserService
  ) {}

  onLeave() {
    const sceneId = this.scene.id;
    this.scene.leave().subscribe(() => {
      this.user.leaveScene(sceneId);
      this.navigation.backTo('/scenes');
    });
  }

  onClose() {
    const sceneId = this.scene.id;
    this.scene.close().subscribe(() => {
      this.user.leaveScene(sceneId);
      this.navigation.backTo('/scenes');
    });
  }
}
