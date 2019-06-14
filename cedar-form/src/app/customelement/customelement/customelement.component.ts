import { Component, Input,  OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';

class Stats {
  constructor(
    readonly a: number,
    readonly b: number,
    readonly c: number,
    readonly value: any,
  ) { }
}

@Component({
  selector: 'app-custom-element',
  templateUrl: './customelement.component.html',
  styleUrls: ['./customelement.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomelementComponent implements OnInit {

  @Input() a: number;
  @Input() b: number;
  @Input() c: number;

  name: FormControl;
  form: FormGroup;

  private statsSubject = new BehaviorSubject<Stats>(null);
  public stats$ = this.statsSubject.asObservable();


  ngOnInit(): void {
    this.name = new FormControl('start');
    this.form = new FormGroup({});
    this.form.addControl('name', this.name);

    this.statsSubject.next(new Stats(this.a, this.b, this.c, this.form.value));
    console.log('a', this.a, 'b', this.b, 'c',  this.c, this.form.value);
  }

  more(): void {
    this.a = Math.round(Math.random() * 100);
    this.b = Math.round(Math.random() * 100);
    this.c = Math.round(Math.random() * 100);

    // this.cd.markForCheck();
    this.statsSubject.next(new Stats(this.a, this.b, this.c, this.form.value));
  }

}
