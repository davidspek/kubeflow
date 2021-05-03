import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { ErrorStateMatcher } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  ResourceTableModule,
  NamespaceSelectModule,
  ConfirmDialogModule,
  FormModule,
  ImmediateErrorStateMatcher,
  KubeflowModule,
} from 'kubeflow';

import { IndexComponent } from './pages/index/index.component';
import { FormDefaultComponent } from './pages/form/form-default/form-default.component';
import { FormRokComponent } from './pages/form/form-rok/form-rok.component';
import { IndexDefaultComponent } from './pages/index/index-default/index-default.component';
import { IndexRokComponent } from './pages/index/index-rok/index-rok.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    FormDefaultComponent,
    FormRokComponent,
    IndexDefaultComponent,
    IndexRokComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ResourceTableModule,
    NamespaceSelectModule,
    ConfirmDialogModule,
    FormModule,
    KubeflowModule,
    MatCardModule,
    MatListModule,
  ],
  providers: [
    { provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher },
  ],
  bootstrap: [AppComponent],
  entryComponents: [FormDefaultComponent, FormRokComponent],
})
export class AppModule {}
