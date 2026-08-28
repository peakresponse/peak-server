import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-interface-element.component.html',
  standalone: false,
})
export class EditInterfaceElementComponent implements OnInit {
  id: string = '';
  sectionId: string = '';
  screenId: string = '';
  interfaceId: string = '';

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.sectionId = this.route.snapshot.parent?.params['id'];
    this.screenId = this.route.snapshot.parent?.parent?.params['id'];
    this.interfaceId = this.route.snapshot.parent?.parent?.parent?.params['id'];
  }

  onUpdate() {
    this.onCancel();
  }

  onCancel() {
    this.navigation.backTo(`/interfaces/${this.interfaceId}/screens/${this.screenId}/sections/${this.sectionId}`);
  }

  onDelete() {
    this.onCancel();
  }

  preTransformRecord(record: any) {
    let newRecord = { ...record };
    newRecord.visibleIf = record.visibleIf ? JSON.stringify(record.visibleIf) : null;
    newRecord.onChange = record.onChange ? JSON.stringify(record.onChange) : null;
    return newRecord;
  }

  transformRecord(record: any) {
    let newRecord = { ...record };
    newRecord.visibleIf = record.visibleIf ? JSON.parse(record.visibleIf) : null;
    newRecord.onChange = record.onChange ? JSON.parse(record.onChange) : null;
    return newRecord;
  }
}
