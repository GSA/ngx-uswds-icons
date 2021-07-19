import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconModule, StackedIconModule } from 'projects/icons/src/public-api';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';
import { allIcons as sdsIcons } from 'projects/icons/src/public-api';
import { uswdsAllIcons } from 'projects/icons/src/public-api';
import { CommonModule } from '@angular/common';
import * as _ from 'lodash';

export const appendPrefix = (iconsObject, prefix): Object => {
  const a = {};
  Object.keys(iconsObject).forEach(key => {
    a[`${prefix}${_.upperFirst(key)}`]=iconsObject[key];
  })
  return a;
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconModule,
    StackedIconModule,
    NgxBootstrapIconsModule.pick(Object.assign(
      {},
      _.cloneDeep(allIcons),
      appendPrefix(_.cloneDeep(sdsIcons), 'sds'),
      _.cloneDeep(uswdsAllIcons),
    )),
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

