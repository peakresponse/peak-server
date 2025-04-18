import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-interface-section.component.html',
  standalone: false,
})
export class EditInterfaceSectionComponent implements OnInit {
  id: string = '';
  screenId: string = '';
  interfaceId: string = '';
  isEditing = false;
  params?: HttpParams;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.screenId = this.route.snapshot.parent?.params['id'];
    this.interfaceId = this.route.snapshot.parent?.parent?.params['id'];
    this.params = new HttpParams({ fromObject: { sectionId: this.id } });
  }

  onDelete() {
    this.navigation.backTo(`/interfaces/${this.interfaceId}/screens/${this.screenId}`);
  }

  name(record: any): string {
    if (record.nemsisElement) {
      return `${record.nemsisElement.displayName} (${record.nemsisElement.name})`;
    } else if (record.screen) {
      return record.screen.name;
    }
    return record.customId;
  }
}
