import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoaderComponent } from './components/loader.component';
import { Logo } from './components/branding/logo.component';
import { LogoFullDark } from './components/branding/logo.full.dark.component';
import { LogoFullLight } from './components/branding/logo.full.light.component';
import { LogoFullWhite } from './components/branding/logo.full.white.component';
import { LogoSquareDark } from './components/branding/logo.square.dark.component';
import { LogoSquareLight } from './components/branding/logo.square.light.component';
import { TextField } from './components/fields/text-field.component';
import { WizardComponent } from './components/wizard.component';

@NgModule({
  declarations: [
    LoaderComponent,
    Logo,
    LogoFullDark,
    LogoFullLight,
    LogoFullWhite,
    LogoSquareDark,
    LogoSquareLight,
    TextField,
    WizardComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [LoaderComponent, Logo, LogoFullDark, LogoFullLight, LogoFullWhite, LogoSquareDark, LogoSquareLight, TextField, WizardComponent],
})
export class SharedModule {}
