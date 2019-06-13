import {Component, EventEmitter, Input, OnChanges, Output, SimpleChange, ViewEncapsulation} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatTreeNestedDataSource, PageEvent} from '@angular/material';
import {NestedTreeControl} from '@angular/cdk/tree';
import {Subscription} from 'rxjs';

import * as cloneDeep from 'lodash/cloneDeep';
import {TemplateParserService} from '../../services/template-parser.service';
import {TemplateService} from '../../services/template.service';
import {TreeNode} from '../../models/tree-node.model';
import {InputTypeService} from '../../services/input-type.service';
import {InstanceService} from '../../services/instance.service';
import {faBars, faBox, faBoxes, faList, faPoll, faProjectDiagram, faSquare, faTag} from '@fortawesome/free-solid-svg-icons';
import {UiService} from '../../services/ui.service';

@Component({
  selector: 'app-metadata-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.less'],
  providers: [TemplateParserService],
  encapsulation: ViewEncapsulation.None

})

export class FormComponent implements OnChanges {

  @Input() form: FormGroup;
  @Input() instance: any;
  @Input() template: any;
  @Input() disabled: boolean;
  @Input() autocompleteResults: any;
  @Output() changed = new EventEmitter<any>();
  @Output() autocomplete = new EventEmitter<any>();


  title: string;
  description: string;
  dataSource: MatTreeNestedDataSource<TreeNode>;
  treeControl: NestedTreeControl<TreeNode>;
  response: any = {payload: null, jsonLD: null, rdf: null, formValid: false};
  pageEvent: PageEvent;
  copy = 'Copy';
  remove = 'Remove';
  private formChanges: Subscription;

  faTag = faTag;
  faSquare = faSquare;
  faBars = faBars;
  faList = faList;
  faPoll = faPoll;
  faBox = faBox;
  faBoxes = faBoxes;
  faProjectDiagram = faProjectDiagram;

  constructor(private database: TemplateParserService, private uiService: UiService) {
    this.pageEvent = {'previousPageIndex': 0, 'pageIndex': 0, 'pageSize': 1, 'length': 0};
    this.dataSource = new MatTreeNestedDataSource();
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
  }

  changeLog: string[] = [];


  onPageChange(event) {
    this.pageEvent = event;
    this.initialize();
  }

  getIconType() {
    let result = faPoll;
    // switch (this.type) {
    //   case 'template':
    //     result = faPoll;
    //     break;
    //   case 'element':
    //     result = faProjectDiagram;
    //     break;
    //   case 'field':
    //     result = faBox;
    //     break;
    //   case 'instance':
    //     result = faTag;
    //     break;
    // }
    return result;
  }

  onAutocomplete(event) {
    this.autocomplete.emit(event);
  }

  // keep up-to-date on changes in the form
  onChanges(): void {
    if (this.form) {
      console.log('valueChanges', this.form.valueChanges);
      this.formChanges = this.form.valueChanges.subscribe(val => {
        setTimeout(() => {
          this.response.payload = val;
          this.response.jsonLD = this.database.instanceModel;
          this.response.formValid = this.form.valid;
        }, 0);
      });
    }
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    if (changes['autocompleteResults'] && changes['autocompleteResults']['currentValue'] &&
      changes['autocompleteResults']['currentValue'].length > 0) {
      this.autocompleteResults = changes['autocompleteResults']['currentValue'];
    } else {
      const log: string[] = [];
      // for (const propName in changes) {
      //   const changedProp = changes[propName];
      //   const to = JSON.stringify(changedProp.currentValue);
      //   if (changedProp.isFirstChange()) {
      //     log.push(`Initial value of ${propName} set to ${to}`);
      //   } else {
      //     const from = JSON.stringify(changedProp.previousValue);
      //     log.push(`${propName} changed from ${from} to ${to}`);
      //   }
      // }
      this.changeLog.push(log.join(', '));
      this.initialize();
    }
  }

  private hasNestedChild = (_: number, nodeData: TreeNode) => !nodeData.type;

  private _getChildren = (node: TreeNode) => node.children;

  initialize() {

    if (this.instance && this.template) {
      this.pageEvent.length = TemplateService.getPageCount(this.template);

      // this.form = new FormGroup({});
      this.title = InstanceService.getTitle(this.instance) || TemplateService.getTitle(this.template);
      this.description = InstanceService.getDescription(this.instance) || TemplateService.getDescription(this.template);
      this.uiService.setTitleAndDescription(this.title, this.description);

      this.database.initialize(this.form, this.instance, this.template, this.pageEvent.pageIndex);

      console.log(' this.database.dataChange', this.database.dataChange)
      this.database.dataChange.subscribe(data => {
        if (data && data.length > 0) {
          this.dataSource = new MatTreeNestedDataSource();
          this.dataSource.data = data;
          this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);
        }
      });
      this.onChanges();
    }
  }

  getPageCount(nodes: TreeNode[]) {
    let count = 0;
    nodes.forEach(function (node) {
      if (InputTypeService.isPageBreak(node.subtype)) {
        count++;
      }
    });
    return count + 1;
  }

  isDisabled() {
    return this.disabled;
  }


  // add new element to form
  copyItem(node: TreeNode) {
    console.log('copyItem', Array.isArray(node.model[node.key]));

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


}

