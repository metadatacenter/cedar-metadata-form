import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'cedar-form',
  templateUrl: './customelement.component.html',
  styleUrls: ['./customelement.component.less'],
  encapsulation: ViewEncapsulation.None // <- this allows CSS to bleed to this component from parent app
})
export class CustomelementComponent  {

  @Input() name: string;
  @Output() helloEvt: EventEmitter<string> = new EventEmitter();

  constructor() { }


}
