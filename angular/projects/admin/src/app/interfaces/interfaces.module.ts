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
import { InterfaceScreenFormComponent } from './screens/interface-screen-form.component';
import { NewInterfaceScreenComponent } from './screens/new-interface-screen.component';
import { EditInterfaceScreenComponent } from './screens/edit-interface-screen.component';
import { InterfaceSectionFormComponent } from './sections/interface-section-form.component';
import { NewInterfaceSectionComponent } from './sections/new-interface-section.component';

@NgModule({
  declarations: [
    ListInterfacesComponent,
    InterfaceFormComponent,
    NewInterfaceComponent,
    EditInterfaceComponent,
    InterfaceScreenFormComponent,
    NewInterfaceScreenComponent,
    EditInterfaceScreenComponent,
    InterfaceSectionFormComponent,
    NewInterfaceSectionComponent,
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
