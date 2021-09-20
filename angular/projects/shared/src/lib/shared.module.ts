import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Logo } from './components/branding/logo.component';
import { LogoFullDark } from './components/branding/logo.full.dark.component';
import { LogoFullLight } from './components/branding/logo.full.light.component';
import { LogoFullWhite } from './components/branding/logo.full.white.component';
import { LogoSquareDark } from './components/branding/logo.square.dark.component';
import { LogoSquareLight } from './components/branding/logo.square.light.component';
import { TextField } from './components/fields/text-field.component';

@NgModule({
  declarations: [Logo, LogoFullDark, LogoFullLight, LogoFullWhite, LogoSquareDark, LogoSquareLight, TextField],
  imports: [CommonModule, FormsModule],
  exports: [Logo, LogoFullDark, LogoFullLight, LogoFullWhite, LogoSquareDark, LogoSquareLight, TextField],
})
export class SharedModule {}
