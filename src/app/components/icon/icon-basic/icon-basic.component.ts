import { Component } from '@angular/core';

@Component({
  selector: 'app-icon-basic',
  templateUrl: './icon-basic.component.html'
})
export class IconBasicComponent {
  icons:any

  /**
   * The number of degrees that the icon should be rotated. The following
   * values are supported:
   * 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330
   */
  rotate: number;

  /**
   * Used to scale the icon up or down.
   * 'xs', 'sm', 'lg', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x'
   */
  size: string;

  /**
   * Used to skew icons, array of one or two numbers ranging inclusivly from
   * -45 to 45 expected. If only one number provided, that skew value will be
   * applied both horizontally and vertically.
   */
  skew: Array<number>;

}
