import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { IconComponent } from './icon.component';



@NgModule({
  declarations: [IconComponent],
  imports: [
    NgxBootstrapIconsModule,
    CommonModule
  ],
  exports: [IconComponent]
})
export class IconModule { }
