import { Component, Input, OnInit } from '@angular/core';

@Component({
	standalone: false,
  selector: 'usa-stacked-icon',
  templateUrl: './stacked-icon.component.html',
  styleUrls: ['./stacked-icon.component.scss']
})
export class StackedIconComponent {

  @Input()
  size: string;

  constructor() { }

}
