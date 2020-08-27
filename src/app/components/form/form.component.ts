import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChange, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {MatTreeNestedDataSource, PageEvent} from '@angular/material';
import {NestedTreeControl} from '@angular/cdk/tree';

import * as cloneDeep from 'lodash/cloneDeep';
import {TemplateParserService} from '../../services/template-parser.service';
import {TemplateService} from '../../services/template.service';
import {TreeNode} from '../../models/tree-node.model';
import {InstanceService} from '../../services/instance.service';

@Component({
  selector: 'app-metadata-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [TemplateParserService],
  encapsulation: ViewEncapsulation.None
})

export class FormComponent implements OnChanges {

  @Input() instance: any;
  @Input() template: any;
  @Input() mode: string;
  @Input() autocompleteResults: any;
  @Output() autocomplete = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<any>();
  @ViewChild('help', {static: true}) help: ElementRef;

  form: FormGroup;
  title: string;
  description: string;
  dataSource: MatTreeNestedDataSource<TreeNode>;
  treeControl: NestedTreeControl<TreeNode>;
  database: TemplateParserService;
  pageEvent: PageEvent;
  pageTitle: string;
  pageDescription: string;

  constructor(database: TemplateParserService, private elementRef: ElementRef) {
    this.pageEvent = {'previousPageIndex': 0, 'pageIndex': 0, 'pageSize': 1, 'length': 0};
    this.database = database;
    this.dataSource = new MatTreeNestedDataSource();
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
    this.form = new FormGroup({});
  }

  onPageChange(event) {
    this.pageEvent = event;
    this.initialize();
    this.pageTitle = TemplateService.getTitleofPage(this.template, event.pageIndex);
    this.pageDescription = TemplateService.getDescriptionofPage(this.template, event.pageIndex);
  }

  onAutocomplete(event) {
    this.autocomplete.emit(event);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['autocompleteResults'] && changes['autocompleteResults']['currentValue'].length > 0) {
      this.autocompleteResults = changes['autocompleteResults']['currentValue'];
    } else {
      this.initialize();
    }
  }

  private hasNestedChild = (_: number, nodeData: TreeNode) => !nodeData.type;

  private notHidden = (node: TreeNode) => !node.hidden;

  private _getChildren = (node: TreeNode) => node.children;

  // initialize tree database
  initialize() {
    if (this.instance && this.template) {
      this.pageEvent.length = TemplateService.getPageCount(this.template);

      this.title = InstanceService.getTitle(this.instance) || TemplateService.getTitle(this.template);
      this.description = InstanceService.getDescription(this.instance) || TemplateService.getDescription(this.template);
      this.database.initialize(this.form, this.instance, this.template, this.pageEvent.pageIndex);


      this.database.dataChange.subscribe(data => {
        if (data && data.length > 0) {
          this.dataSource = new MatTreeNestedDataSource();
          this.dataSource.data = data;
          this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
        }
      });

      this.emitChanges(this.form.value);
      this.onChanges();
    }
  }

  // is this view or edit mode
  isDisabled() {
    return this.mode === 'view';
  }

  // is this node hidden
  isHidden(node: TreeNode) {
    return node.hidden;
  }

  // add new element to form
  copyItem(node: TreeNode) {

    const clonedModel = cloneDeep(node.model[node.key][node.itemCount]);
    node.model[node.key].splice(node.itemCount + 1, 0, clonedModel);

    const clonedNode = cloneDeep(node);
    clonedNode.model = node.model;
    clonedNode.itemCount++;
    const siblings = node.parent ? node.parent.children : this.database.data;
    const index = siblings.indexOf(node);
    siblings.splice(index + 1, 0, clonedNode);

    // adjust remaining siblings itemCounts
    for (let i = index + 2; i < siblings.length; i++) {
      if (siblings[i].key === node.key) {
        siblings[i].itemCount++;
      }
    }
    this.updateModel(clonedNode, node.model);
    const parentGroup = node.parentGroup || this.form;
    parentGroup.addControl((clonedNode.key + clonedNode.itemCount), clonedNode.formGroup);
    this.database.dataChange.next(this.database.data);
  }

  // delete last element in node array
  removeItem(node: TreeNode) {
    const siblings = node.parent ? node.parent.children : this.database.data;
    const index = siblings.indexOf(node);
    siblings.splice(index, 1);

    // adjust remaining siblings itemCounts
    for (let i = index; i < siblings.length; i++) {
      if (siblings[i].key === node.key) {
        siblings[i].itemCount--;
      }
    }

    const parent = node.parentGroup || this.form;
    parent.removeControl((node.key + node.itemCount));
    this.database.dataChange.next(this.database.data);
  }

  // reset the model down the tree at itemCount
  updateModel(node: TreeNode, model) {

    node.model = model;

    if (node.children) {

      const that = this;
      const key = node.key;
      const itemCount = node.itemCount;

      if (Array.isArray(model[key])) {
        node.children.forEach(function (child) {
          that.updateModel(child, model[key][itemCount]);
        });
      } else {
        node.children.forEach(function (child) {
          that.updateModel(child, model[key]);
        });
      }

    }
  }

  // validate the entire form by touching each field
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormArray) {
        control.controls.forEach(cntl => {
          cntl.markAsTouched({onlySelf: true});
        });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  emitChanges(val) {
    this.validateAllFormFields(this.form);
    this.formChange.emit({
      'title': this.title,
      'description': this.description,
      'valid': this.form.valid,
      'value': val
    });
  }

  // notify caller of changes in the form
  onChanges(): void {
    if (this.form && this.form.valueChanges) {
      this.form.valueChanges.subscribe(val => {
        this.emitChanges(val);
      });
    }
  }

  // correct the minutes and timezone
  parseDate(val) {
    let result;
    if (val) {
      // 'add' a timezone offset so we end up on the original date again
      const dt = new Date(val);
      dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
      result =  dt;
    }
    return result;
  }

  // get the metadata for the template
  getTemplateInfo() {
    let result;
    if (this.template && this.template.hasOwnProperty('pav:lastUpdatedOn')) {
      result = this.parseDate(this.template['pav:lastUpdatedOn'].substring(0, 10)).toDateString();
    }
    return result;
  }
}

