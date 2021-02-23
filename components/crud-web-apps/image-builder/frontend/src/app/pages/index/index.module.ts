import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexDefaultModule } from './index-default/index-default.module';
import { IndexComponent } from './index.component';

@NgModule({
  declarations: [IndexComponent],
  imports: [CommonModule, IndexDefaultModule],
})
export class IndexModule {}
