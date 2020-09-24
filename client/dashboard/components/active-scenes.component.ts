import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ApiService, NavigationService } from '../../shared/services';
import { AgencyService } from '../agencies/agency.service';
import { Scene } from '../scenes/scene';

@Component({
  selector: 'app-dashboard-active-scenes',
  templateUrl: './active-scenes.component.html',
  styleUrls: ['./active-scenes.component.scss'],
})
export class ActiveScenesComponent implements OnDestroy {
  scenes: Scene[] = [];
  maximizedScene: Scene;
  scenesSubscription: Subscription;

  constructor(
    private agency: AgencyService,
    private api: ApiService,
    private navigation: NavigationService
  ) {
    this.scenesSubscription = this.agency.activeScenes$.subscribe((scenes) => {
      this.scenes = scenes;
      if (scenes.length == 1) {
        this.maximizedScene = scenes[0];
      } else {
        this.maximizedScene = null;
        for (let scene of scenes) {
          if (scene.isMaximized) {
            this.maximizedScene = scene;
            break;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.scenesSubscription?.unsubscribe();
  }

  onToggle(scene: Scene) {
    if (scene.isMaximized) {
      scene.isMaximized = false;
      if (this.scenes.length > 1) {
        this.maximizedScene = null;
      }
    } else {
      for (let scene of this.scenes) {
        scene.isMaximized = false;
      }
      this.maximizedScene = scene;
      this.maximizedScene.isMaximized = true;
    }
  }

  onJoin(scene: Scene) {
    this.api.scenes.join(scene['id']).subscribe(() => {
      this.navigation.goTo(`/scenes/${scene['id']}`);
    });
  }
}
