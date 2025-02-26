import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-guide-item.component.html',
  standalone: false,
})
export class EditGuideItemComponent implements OnInit {
  id: string = '';
  sectionId: string = '';
  guideId: string = '';
  isEditing = false;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.sectionId = this.route.snapshot.parent?.params['id'];
    this.guideId = this.route.snapshot.parent?.parent?.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/guides/${this.guideId}/sections/${this.sectionId}`);
  }
}
