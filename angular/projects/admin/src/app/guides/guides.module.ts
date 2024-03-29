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
import { GuideSectionFormComponent } from './guide-section-form.component';
import { NewGuideSectionComponent } from './new-guide-section.component';
import { EditGuideSectionComponent } from './edit-guide-section.component';
import { GuideItemFormComponent } from './guide-item-form.component';
import { NewGuideItemComponent } from './new-guide-item.component';
import { EditGuideItemComponent } from './edit-guide-item.component';

@NgModule({
  declarations: [
    ListGuidesComponent,
    GuideFormComponent,
    NewGuideComponent,
    EditGuideComponent,
    GuideSectionFormComponent,
    NewGuideSectionComponent,
    EditGuideSectionComponent,
    GuideItemFormComponent,
    NewGuideItemComponent,
    EditGuideItemComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, GuidesRoutingModule],
  providers: [],
})
export class GuidesModule {}
