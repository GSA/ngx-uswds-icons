import { Component } from '@angular/core';
import { allIcons as sdsIcons } from 'projects/icons/src/public-api';
import { uswdsAllIcons } from 'projects/icons/src/public-api';
import { allIcons } from 'ngx-bootstrap-icons';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  appendPrefix = (iconsObject, prefix): Object => {
    const a = {};
    Object.keys(iconsObject).forEach(key => {
      a[`${prefix}${_.upperFirst(key)}`]=iconsObject[key];
    })
    return a;
  }

  specialIcons = [
    { class: 'sds bi-chevron-left bi-bold size-lg', name: 'chevron-left' },
    { class: 'sds bi-chevron-right bi-bold size-lg', name: 'chevron-right' }
  ];  

  title = 'ngx-uswds-icons';
  keys = Object.keys(allIcons).map(iconName => _.kebabCase(iconName));;
  sdsKeys = Object.keys(sdsIcons).map(iconName => _.kebabCase(iconName));;
  uswdsKeys = Object.keys(uswdsAllIcons).map(iconName => _.kebabCase(iconName));;
  sdsUniqueNames = Object.keys(this.appendPrefix(sdsIcons, 'sds'));
  constructor(){
  }


}
