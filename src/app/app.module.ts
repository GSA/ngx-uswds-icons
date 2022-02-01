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
import { IconBasicModule } from './components/icon/icon-basic/icon-basic.module';
import { StackedIconBasicModule } from './components/stacked-icon/stacked-icon-basic/stacked-icon-basic.module';

export const appendPrefix = (iconsObject, prefix): object => {
  const a = {};
  Object.keys(iconsObject).forEach(key => {
    a[`${prefix}${_.upperFirst(key)}`] = iconsObject[key];
  });
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
    CommonModule,
    IconBasicModule,
    StackedIconBasicModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

