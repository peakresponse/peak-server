import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-guide-section.component.html',
})
export class EditGuideSectionComponent implements OnInit {
  id: string = '';
  guideId: string = '';
  isEditing = false;
  params?: HttpParams;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.guideId = this.route.snapshot.parent?.params['id'];
    this.params = new HttpParams({ fromObject: { sectionId: this.id } });
  }

  onDelete() {
    this.navigation.backTo(`/guides/${this.guideId}`);
  }
}
