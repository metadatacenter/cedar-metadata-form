import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TreeNode} from '../../models/tree-node.model';
import {NgxYoutubePlayerModule} from 'ngx-youtube-player';

@Component({
  selector: 'cedar-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.less']
})


export class YoutubeComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() node: TreeNode;


  constructor(private yt: NgxYoutubePlayerModule) {
  }

  ngOnInit() {
  }

  savePlayer(player) {
    console.log('savePlayer', player);
    this.yt = player;
  }

  onChange(event) {
    console.log('onChange', event);
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

  // getYouTubeEmbedFrame(node: FileNode) {
  //   if (node.value[0]) {
  //     let src = ' src="https://www.youtube.com/embed/' + node.value[0].replace(/<(?:.|\n)*?>/gm, '') + '" ';
  //     let width = '';
  //     let height = '';
  //     if (node.size) {
  //       if (node.size.height && Number.isInteger(node.size.height)) {
  //         height = ' height=' + node.size.height;
  //       }
  //       if (node.size.width && Number.isInteger(node.size.width)) {
  //         width = ' width=' + node.size.width;
  //       }
  //     }
  //     console.log('iframe' ,'<iframe class="aspect-ratio"' + width + height + src + ' frameborder="0" allowfullscreen></iframe>')
  //     return '<iframe class="aspect-ratio"' + width + height + src + ' frameborder="0" allowfullscreen></iframe>';
  //   }
  // };

}
