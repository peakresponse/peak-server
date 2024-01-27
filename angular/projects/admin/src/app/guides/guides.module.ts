import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { GuidesRoutingModule } from './guides-routing.module';
import { ListGuidesComponent } from './list-guides.component';
import { GuideFormComponent } from './guide-form.component';
import { NewGuideComponent } from './new-guide.component';
import { EditGuideComponent } from './edit-guide.component';

@NgModule({
  declarations: [ListGuidesComponent, GuideFormComponent, NewGuideComponent, EditGuideComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, GuidesRoutingModule],
  providers: [],
})
export class GuidesModule {}
