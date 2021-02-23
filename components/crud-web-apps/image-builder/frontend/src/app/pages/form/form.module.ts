import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ErrorStateMatcher } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormDefaultModule } from './form-default/form-default.module';
import { FormComponent } from './form.component';

import {
  FormModule as KfFormModule,
  ImmediateErrorStateMatcher,
} from 'kubeflow';

@NgModule({
  declarations: [FormComponent],
  imports: [CommonModule, FormDefaultModule],
  providers: [
    { provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher },
  ],
})
export class FormModule {}
