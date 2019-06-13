import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';
import {Overlay} from '@angular/cdk/overlay';
import {MatSelect} from '@angular/material';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSelect, {static: true}) public selectComponent: MatSelect;
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;
  @Output() changed = new EventEmitter<any>();

  constructor(private elementRef: ElementRef, private overlay: Overlay) {
  }

  public ngAfterViewInit () {
    if (this.selectComponent) {
      this.selectComponent.overlayDir.attach.subscribe((event) => {
        this.selectComponent.overlayDir.overlayRef.updatePosition();
      });
    }
  }

  ngOnInit() {
    this.formGroup.get(this.node.key + 'list').setValue(
      this.getListValue(this.node.options,
        this.node.model[this.node.key],
        this.node.valueLocation,
        this.node.multipleChoice));

    // watch for changes
    this.formGroup.get(this.node.key + 'list').valueChanges.subscribe(value => {
      this.node.model[this.node.key] = this.setListValue(value,
        this.node.options, this.node.model[this.node.key],
        this.node.valueLocation, this.node.multipleChoice);

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

  getLiteralMap(literals) {
    const map = literals
      .map(function (element) {
        return element.label;
      });
    return map;
  }

  // get the value out of the model and into something the form can edit
  getListValue(literals, model, valueLocation, multiple) {
    let result = [];
    const map = this.getLiteralMap(literals);
    if (model) {
      if (multiple) {

        for (let i = 0; i < model.length; i++) {
          result.push(map.indexOf(model[i][valueLocation]));
        }
      } else {
        result = map.indexOf(model[valueLocation]);
      }
    }
    return result;
  }

  // get the form value into the model
  setListValue(value, literals, model, valueLocation, multiple) {
    let result;
    const map = this.getLiteralMap(literals);
    if (multiple) {
      result = [];
      for (let i = 0; i < value.length; i++) {
        const obj = {};
        obj[valueLocation] = map[value[i]];
        result.push(obj);
      }
    } else {
      result = {};
      result[valueLocation] = map[value];
    }
    return result;
  }

}
