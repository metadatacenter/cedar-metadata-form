import {Component, Input} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-tooltip',
  styleUrls: ['./tooltip.component.less'],
  templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
  @Input() text;

  constructor() {}

}
