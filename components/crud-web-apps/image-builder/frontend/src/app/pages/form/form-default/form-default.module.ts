import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

import { FormDefaultComponent } from './form-default.component';
import { FormNameComponent } from './form-name/form-name.component';
import { FormImageComponent } from './form-image/form-image.component';

import {
  FormModule as KfFormModule,
  ImmediateErrorStateMatcher,
} from 'kubeflow';
import { FormCondaComponent } from './form-conda/form-conda.component';
import { FormPipComponent } from './form-pip/form-pip.component';
import { FormDestinationComponent } from './form-destination/form-destination.component';
import { FormSecretComponent } from './form-secret/form-secret.component';

@NgModule({
  declarations: [
    FormDefaultComponent,
    FormNameComponent,
    FormImageComponent,
    FormPipComponent,
    FormCondaComponent,
    FormDestinationComponent,
    FormSecretComponent,
  ],
  imports: [
    CommonModule,
    KfFormModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  exports: [
    FormDefaultComponent,
    FormNameComponent,
    FormImageComponent,
    FormPipComponent,
    FormCondaComponent,
    FormDestinationComponent,
    FormSecretComponent,
  ],
})
export class FormDefaultModule {}
