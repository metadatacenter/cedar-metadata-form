import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
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
  @Output() autocomplete = new EventEmitter<any>();
  @ViewChild('help', {static: true}) help: ElementRef;


  title: string;
  description: string;
  dataSource: MatTreeNestedDataSource<TreeNode>;
  treeControl: NestedTreeControl<TreeNode>;
  database: TemplateParserService;
  response: any = {payload: null, jsonLD: null, rdf: null, formValid: false};
  pageEvent: PageEvent;
  copy = 'Copy';
  remove = 'Remove';
  private formChanges: Subscription;
  changeLog: string[] = [];

  constructor(database: TemplateParserService, private elementRef: ElementRef) {
    this.pageEvent = {'previousPageIndex': 0, 'pageIndex': 0, 'pageSize': 1, 'length': 0};
    this.database = database;
    this.dataSource = new MatTreeNestedDataSource();
    this.treeControl = new NestedTreeControl<TreeNode>(this._getChildren);

    // living without zone.js
    // this.ref.detach();
    // setInterval(() => {
    //   this.ref.detectChanges();
    // }, 1000);
  }

  // update() {
  //   setTimeout(() => {
  //     this.ref.detectChanges();
  //   });
  // }

  mouseover() {
    // setTimeout(() => {
    //   // reposition tooltips
    //   const btn = this.elementRef.nativeElement.querySelector('button.mat-icon-button.help .mat-icon');
    //   const tips = document.querySelectorAll('.cdk-overlay-pane.mat-tooltip-panel');
    //   if (tips) {
    //     const rect = btn.getBoundingClientRect();
    //     const value = 'max-width:25em;width:100%;position:absolute;top:' + (rect.top - 25) + 'px;left:' + (rect.right + 5) + 'px';
    //     tips.forEach((tip) => {
    //       tip.setAttribute('style', value);
    //     });
    //   }
    //   this.ref.detectChanges();
    // });
  }

  mouseout() {
    // const value = 'position:absolute;top:-1000px;left:-1000px';
    // document.querySelectorAll('.cdk-overlay-pane.mat-tooltip-panel').forEach((tip) => {
    //   tip.setAttribute('style', value);
    // });
    // this.ref.detectChanges();
  }

  onPageChange(event) {
    this.pageEvent = event;
    this.initialize();
  }

  onAutocomplete(event) {
    this.autocomplete.emit(event);
  }


  // keep up-to-date on changes in the form
  onChanges(): void {
    if (this.form && this.form.valueChanges) {
      this.form.valueChanges.subscribe(val => {
        // this.ref.detectChanges();
      });
    }

    if (this.autocompleteResults && this.autocompleteResults.valueChanges) {
      this.autocompleteResults.valueChanges.subscribe(value => {
        // this.ref.detectChanges();
      });
    }

    if (this.instance && this.instance.valueChanges) {
      this.instance.valueChanges.subscribe(value => {
        // this.ref.detectChanges();
      });
    }
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['autocompleteResults'] && changes['autocompleteResults']['currentValue'].length > 0) {
      this.autocompleteResults = changes['autocompleteResults']['currentValue'];
    } else {
      this.initialize();
    }
  }

  private hasNestedChild = (_: number, nodeData: TreeNode) => !nodeData.type;

  private _getChildren = (node: TreeNode) => node.children;

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
      this.onChanges();
    }
  }

  getPageCount(nodes: TreeNode[]) {
    let count = 0;
    if (nodes) {
      nodes.forEach(function (node) {
        if (InputTypeService.isPageBreak(node.subtype)) {
          count++;
        }
      });
    }
    return count + 1;
  }

  isDisabled() {
    return this.disabled;
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

    // this.ref.detectChanges();
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

    // this.ref.detectChanges();
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

