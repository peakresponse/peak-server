import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoaderComponent } from './components/loader.component';
import { Logo } from './components/branding/logo.component';
import { LogoFullDark } from './components/branding/logo.full.dark.component';
import { LogoFullLight } from './components/branding/logo.full.light.component';
import { LogoFullWhite } from './components/branding/logo.full.white.component';
import { LogoSquareDark } from './components/branding/logo.square.dark.component';
import { LogoSquareLight } from './components/branding/logo.square.light.component';
import { SearchFieldComponent } from './components/fields/search-field.component';
import { SelectFieldComponent } from './components/fields/select-field.component';
import { TextFieldComponent } from './components/fields/text-field.component';
import { WizardComponent } from './components/wizard.component';

import { ErrorPipe } from './pipes/error.pipe';

@NgModule({
  declarations: [
    LoaderComponent,
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    WizardComponent,
    ErrorPipe,
  ],
  imports: [CommonModule, FormsModule, NgbModule],
  exports: [
    LoaderComponent,
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    WizardComponent,
    ErrorPipe,
  ],
})
export class SharedModule {}
