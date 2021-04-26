import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { ModalComponent } from '../../shared/components';
import { NavigationService } from '../../shared/services';
import { SceneService } from './scene.service';

@Component({
  selector: 'app-dashboard-scene-closer',
  templateUrl: './scene-closer.component.html',
})
export class SceneCloserComponent implements OnDestroy {
  private sceneSubscription: Subscription;
  @ViewChild('dialog') dialog: ModalComponent;

  constructor(private navigation: NavigationService, private scene: SceneService) {
    this.sceneSubscription = scene.attributes$.subscribe((scene) => {
      if (!scene.isActive) {
        this.dialog?.open({ centered: true, size: 'lg' });
      }
    });
  }

  ngOnDestroy() {
    this.sceneSubscription?.unsubscribe();
  }

  onConfirm() {
    this.navigation.replaceWith(`/scenes/${this.scene.id}/summary`);
  }
}
