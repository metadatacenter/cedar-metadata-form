import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';



@Component({
  selector: 'cedar-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.less']
})
export class TextareaComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() control: FormControl;
  @Input() node: TreeNode;
  @Input() index: number;
  @Output() changed = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
    // initialize the value
    this.formGroup.get('values').setValue(this.getValue(this.node.model[this.node.key], this.node.valueLocation));

    // watch for changes
    this.formGroup.get( 'values').valueChanges.subscribe(value => {
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

  // get the value out of the model and into something the form can edit
  getValue(model, valueLocation) {
    const result = [];
    if (model) {
      if (Array.isArray(model)) {
        model.forEach((value, i) => {
          result.push(value[valueLocation] || null);
        });
      } else {
        result.push(model[valueLocation] || null);
      }
    } else {
      result.push(null);
    }
    return result;
  }


  // get the form value into the model
  setValue(value, model, valueLocation) {
    let result;
    if (value.length > 1) {
      result = [];
      value.forEach((val, i) => {
        const obj = {};
        obj[valueLocation] = val;
        result.push(obj);
      });
    } else if (value.length == 1) {
      result = {};
      result[valueLocation] = value[0];
    }
    return result;
  }
}
