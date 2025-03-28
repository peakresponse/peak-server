import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { InterfacesRoutingModule } from './interfaces-routing.module';
import { ListInterfacesComponent } from './list-interfaces.component';
import { InterfaceFormComponent } from './interface-form.component';
import { NewInterfaceComponent } from './new-interface.component';
import { EditInterfaceComponent } from './edit-interface.component';
// import { GuideSectionFormComponent } from './guide-section-form.component';
// import { NewGuideSectionComponent } from './new-guide-section.component';
// import { EditGuideSectionComponent } from './edit-guide-section.component';
// import { GuideItemFormComponent } from './guide-item-form.component';
// import { NewGuideItemComponent } from './new-guide-item.component';
// import { EditGuideItemComponent } from './edit-guide-item.component';

@NgModule({
  declarations: [
    ListInterfacesComponent,
    InterfaceFormComponent,
    NewInterfaceComponent,
    EditInterfaceComponent,
    // GuideSectionFormComponent,
    // NewGuideSectionComponent,
    // EditGuideSectionComponent,
    // GuideItemFormComponent,
    // NewGuideItemComponent,
    // EditGuideItemComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, InterfacesRoutingModule],
  providers: [],
})
export class InterfacesModule {}
