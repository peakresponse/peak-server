import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ErrorComponent } from './components/error.component';
import { FormComponent } from './components/form.component';
import { ListComponent } from './components/list.component';
import { LoaderComponent } from './components/loader.component';
import { ModalComponent } from './components/modal.component';
import { UploaderComponent } from './components/uploader.component';
import { WizardComponent } from './components/wizard.component';

import { Logo } from './components/branding/logo.component';
import { LogoFullDark } from './components/branding/logo.full.dark.component';
import { LogoFullLight } from './components/branding/logo.full.light.component';
import { LogoFullWhite } from './components/branding/logo.full.white.component';
import { LogoSquareDark } from './components/branding/logo.square.dark.component';
import { LogoSquareLight } from './components/branding/logo.square.light.component';

import { SearchFieldComponent } from './components/fields/search-field.component';
import { SelectFieldComponent } from './components/fields/select-field.component';
import { TextFieldComponent } from './components/fields/text-field.component';

import { AutoloadDirective } from './directives/autoload.directive';
import { DebouncedDirective } from './directives/debounced.directive';

import { ErrorPipe } from './pipes/error.pipe';

@NgModule({
  declarations: [
    ErrorComponent,
    FormComponent,
    ListComponent,
    LoaderComponent,
    ModalComponent,
    UploaderComponent,
    WizardComponent,
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    AutoloadDirective,
    DebouncedDirective,
    ErrorPipe,
  ],
  imports: [CommonModule, FormsModule, NgbModule],
  exports: [
    ErrorComponent,
    FormComponent,
    ListComponent,
    LoaderComponent,
    ModalComponent,
    UploaderComponent,
    WizardComponent,
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    AutoloadDirective,
    DebouncedDirective,
    ErrorPipe,
  ],
})
export class SharedModule {}
