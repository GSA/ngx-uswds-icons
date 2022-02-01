import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconBasicComponent } from './icon-basic.component';
import { IconModule } from 'projects/icons/src/public-api';



@NgModule({
  declarations: [IconBasicComponent],
  exports: [IconBasicComponent],
  imports: [
    CommonModule,
    IconModule
  ]
})
export class IconBasicModule { }
