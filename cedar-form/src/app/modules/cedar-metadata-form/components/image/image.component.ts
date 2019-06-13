import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';


@Component({
  selector: 'cedar-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.less']
})
export class ImageComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;


  constructor() {}

  ngOnInit() {
  }



  getImageWidth(node: TreeNode) {
    let result = 367;
    if (node.size && node.size.width && Number.isInteger(node.size.width)) {
      result = node.size.width;
    }
    return result;
  }

  getImageHeight(node: TreeNode) {
    if (node.size && node.size.height && Number.isInteger(node.size.height)) {
      return node.size.height;
    }
  }


}
