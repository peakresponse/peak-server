import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { RegionsRoutingModule } from './regions-routing.module';
import { ListRegionsComponent } from './list-regions.component';
import { RegionFormComponent } from './region-form.component';
import { NewRegionComponent } from './new-region.component';
import { EditRegionComponent } from './edit-region.component';

@NgModule({
  declarations: [ListRegionsComponent, RegionFormComponent, NewRegionComponent, EditRegionComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, RegionsRoutingModule],
  providers: [],
})
export class RegionsModule {}
