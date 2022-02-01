import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackedIconBasicComponent } from './stacked-icon-basic.component';
import { IconModule, StackedIconModule } from 'projects/icons/src/public-api';



@NgModule({
  declarations: [
    StackedIconBasicComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    StackedIconModule
  ]
})
export class StackedIconBasicModule { }
