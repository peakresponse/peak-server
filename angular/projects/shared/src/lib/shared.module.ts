import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SortablejsModule } from 'ngx-sortablejs';

import { DropzoneComponent } from './components/dropzone.component';
import { ErrorComponent } from './components/error.component';
import { FormComponent } from './components/form.component';
import { ListComponent } from './components/list.component';
import { LoaderComponent } from './components/loader.component';
import { ModalComponent } from './components/modal.component';
import { PictureComponent } from './components/picture.component';
import { UploaderComponent } from './components/uploader.component';
import { WizardComponent } from './components/wizard.component';

import { Logo } from './components/branding/logo.component';
import { LogoFullDark } from './components/branding/logo.full.dark.component';
import { LogoFullLight } from './components/branding/logo.full.light.component';
import { LogoFullWhite } from './components/branding/logo.full.white.component';
import { LogoSquareDark } from './components/branding/logo.square.dark.component';
import { LogoSquareLight } from './components/branding/logo.square.light.component';

import { ArrayFieldComponent } from './components/fields/array-field.component';
import { CheckboxComponent } from './components/fields/checkbox.component';
import { FileFieldComponent } from './components/fields/file-field.component';
import { ObjectFieldComponent } from './components/fields/object-field.component';
import { RecordingFieldComponent } from './components/fields/recording-field.component';
import { SearchFieldComponent } from './components/fields/search-field.component';
import { SelectFieldComponent } from './components/fields/select-field.component';
import { TextFieldComponent } from './components/fields/text-field.component';

import { XsdBaseComponent } from './components/fields/xsd/xsd-base.component';
import { XsdElementWrapperComponent } from './components/fields/xsd/xsd-element-wrapper.component';
import { XsdElementComponent } from './components/fields/xsd/xsd-element.component';
import { XsdFormGroupComponent } from './components/fields/xsd/xsd-form-group.component';
import { XsdInputComponent } from './components/fields/xsd/xsd-input.component';
import { XsdSelectStateComponent } from './components/fields/xsd/xsd-select-state.component';
import { XsdSelectComponent } from './components/fields/xsd/xsd-select.component';

import { CommandFooterComponent } from './components/headers/command-footer.component';
import { CommandHeaderComponent } from './components/headers/command-header.component';
import { WelcomeHeaderComponent } from './components/headers/welcome-header.component';

import { AutoloadDirective } from './directives/autoload.directive';
import { DebouncedDirective } from './directives/debounced.directive';
import { RouterLinkClassDirective } from './directives/router-link-class.directive';

import { DurationPipe } from './pipes/duration.pipe';
import { ErrorPipe } from './pipes/error.pipe';
import { GetPipe } from './pipes/get.pipe';
import { InflectionPipe } from './pipes/inflection.pipe';
import { VersionPipe } from './pipes/version.pipe';

@NgModule({
  declarations: [
    // components
    DropzoneComponent,
    ErrorComponent,
    FormComponent,
    ListComponent,
    LoaderComponent,
    ModalComponent,
    PictureComponent,
    UploaderComponent,
    WizardComponent,
    // components/branding
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    // components/fields
    ArrayFieldComponent,
    CheckboxComponent,
    FileFieldComponent,
    ObjectFieldComponent,
    RecordingFieldComponent,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    // components/fields/xsd
    XsdBaseComponent,
    XsdElementWrapperComponent,
    XsdElementComponent,
    XsdFormGroupComponent,
    XsdInputComponent,
    XsdSelectStateComponent,
    XsdSelectComponent,
    // components/headers
    CommandFooterComponent,
    CommandHeaderComponent,
    WelcomeHeaderComponent,
    // directives
    AutoloadDirective,
    DebouncedDirective,
    RouterLinkClassDirective,
    // pipes
    DurationPipe,
    ErrorPipe,
    GetPipe,
    InflectionPipe,
    VersionPipe,
  ],
  imports: [CommonModule, FormsModule, NgbModule, NgxDropzoneModule, SortablejsModule.forRoot({ animation: 150 })],
  exports: [
    // components
    DropzoneComponent,
    ErrorComponent,
    FormComponent,
    ListComponent,
    LoaderComponent,
    ModalComponent,
    PictureComponent,
    UploaderComponent,
    WizardComponent,
    // components/branding
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    // components/fields
    ArrayFieldComponent,
    CheckboxComponent,
    FileFieldComponent,
    ObjectFieldComponent,
    RecordingFieldComponent,
    SearchFieldComponent,
    SelectFieldComponent,
    TextFieldComponent,
    // components/fields/xsd
    XsdBaseComponent,
    XsdElementWrapperComponent,
    XsdElementComponent,
    XsdFormGroupComponent,
    XsdInputComponent,
    XsdSelectStateComponent,
    XsdSelectComponent,
    // components/headers
    CommandFooterComponent,
    CommandHeaderComponent,
    WelcomeHeaderComponent,
    // directives
    AutoloadDirective,
    DebouncedDirective,
    RouterLinkClassDirective,
    // pipes
    DurationPipe,
    ErrorPipe,
    GetPipe,
    InflectionPipe,
    VersionPipe,
  ],
})
export class SharedModule {}
