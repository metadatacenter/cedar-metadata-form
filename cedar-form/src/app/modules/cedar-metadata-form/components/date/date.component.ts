import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';

@Component({
  selector: 'cedar-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.less']
})
export class DateComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() control: FormControl;
  @Input() node: TreeNode;
  @Input() index: number;
  @Output() changed = new EventEmitter<any>();


  constructor() {
  }

  ngOnInit() {
    // initialize the value
    this.formGroup.get('values').setValue(this.getValue(this.node.model[this.node.key], this.node.valueLocation));

    // watch for changes
    this.formGroup.get('values').valueChanges.subscribe(value => {

      // update our metadata model
      this.node.model[this.node.key] = this.setValue(value, this.node.model[this.node.key], this.node.valueLocation);

      // fire off change message to parent
      this.changed.emit({
        'type': this.node.type,
        'subtype': this.node.subtype,
        'model': this.node.model,
        'key': this.node.key,
        'index': 0,
        'location': this.node.valueLocation,
        'value': value
      });
    });
  }

  // correct the minutes and timezone
  parseDate(val) {
    if (val) {
      // 'add' a timezone offset so we end up on the original date again
      const dt = new Date(val);
      dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
      return dt;
    }
    return null;
  }

  // get the form value from the metadata model
  getValue(model, valueLocation): Date[] {
    const result = [];
    if (model) {
      if (Array.isArray(model)) {
        for (let i = 0; i < model.length; i++) {
          result.push(this.parseDate(model[i][valueLocation]) || null);
        }
      } else {
        result.push(this.parseDate(model[valueLocation]) || null);
      }
    } else {
      result.push(null);
    }
    return result;
  }

  // create the metadata model date object
  setDate(value, valueLocation) {
    const obj = {'@type': 'xsd:date'};
    obj[valueLocation] = value ? this.parseDate(value).toISOString().substring(0, 10) : null;
    return obj;
  }

  // set the metadata model from the form value
  setValue(value, model, valueLocation): Date[] {
    const result = [];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        result.push(this.setDate(value[i], valueLocation));
      }
    } else {
      result.push(this.setDate(value, valueLocation));
    }
    return result;
  }
}
