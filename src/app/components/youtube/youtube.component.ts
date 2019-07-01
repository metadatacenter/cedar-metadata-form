import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';
import {NgxYoutubePlayerModule} from 'ngx-youtube-player';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss']
})


export class YoutubeComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;


  constructor(private yt: NgxYoutubePlayerModule) {
  }

  ngOnInit() {
  }

  savePlayer(player) {
    this.yt = player;
  }

  onChange(event) {
  }

  getImageWidth(node: TreeNode) {
    if (node.size && node.size.width && Number.isInteger(node.size.width)) {
      return node.size.width;
    }
  }

  getImageHeight(node: TreeNode) {
    if (node.size && node.size.height && Number.isInteger(node.size.height)) {
      return node.size.height;
    }
  }



}
