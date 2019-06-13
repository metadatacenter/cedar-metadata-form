import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {TreeNode} from '../../models/tree-node.model';


@Component({
  selector: 'app-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.less'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementComponent  implements OnInit {


  @Input() node: TreeNode;
  @Input() parentGroup: FormGroup;
  @Input() formGroup: FormGroup;
  @Input() index: number;

  constructor() {
  }

  ngOnInit() {
    if (this.parentGroup) {
      this.parentGroup.addControl(this.node.key, this.formGroup);
    }

  }

}
