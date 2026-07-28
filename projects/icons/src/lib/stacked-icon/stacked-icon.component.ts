import { Component, Input } from '@angular/core';

@Component({
  selector: 'usa-stacked-icon',
  templateUrl: './stacked-icon.component.html',
  styleUrls: ['./stacked-icon.component.scss'],
  standalone: false,
})
export class StackedIconComponent {
  @Input()
  size: string;

  constructor() {}
}
