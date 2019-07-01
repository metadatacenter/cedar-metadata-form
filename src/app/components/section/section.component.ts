import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';


@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent  {
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;

  constructor() {
  }
}
