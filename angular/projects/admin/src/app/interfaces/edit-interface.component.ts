import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-interface.component.html',
  standalone: false,
})
export class EditInterfaceComponent implements OnInit {
  id: string = '';
  isEditing = false;

  params?: HttpParams;

  constructor(
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.params = new HttpParams({ fromObject: { interfaceId: this.id } });
  }

  onDelete() {
    this.navigation.backTo(`/interfaces`);
  }
}
