import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';


@Component({
  selector: 'cedar-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.less']
})
export class SectionComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;

  constructor() {
  }

  ngOnInit() {
  }



}
