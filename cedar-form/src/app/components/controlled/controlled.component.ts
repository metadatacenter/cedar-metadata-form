import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';
import {debounceTime} from 'rxjs/operators';

import {Post} from '../../models/post.model';

@Component({
  selector: 'app-controlled',
  templateUrl: './controlled.component.html',
  styleUrls: ['./controlled.component.less']
})
export class ControlledComponent implements OnInit, OnChanges {

  allPosts: Post[];
  selectable = true;
  removable = true;
  isLoading = false;
  search;

  @Input() group: FormGroup;
  @Input() autocompleteResults;
  @Input() valueConstraints: any;
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef;
  @ViewChild('chipList') chipList: ElementRef;
  @Output() onSelectedOption = new EventEmitter();
  @Output() onRemovedOption = new EventEmitter();
  @Output() autocomplete = new EventEmitter<any>();


  constructor(private fb: FormBuilder) {
  }

  filterItems(arr, query) {
    return arr.filter(function (el) {
      return el.prefLabel.toLowerCase().indexOf(query.toLowerCase().toLowerCase()) !== -1;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['autocompleteResults']) {
      if (this.group && this.search) {

        // save the posts
        let posts = changes['autocompleteResults']['currentValue'];

        // filter
        posts = this.filterItems(posts, this.search);

        // and sort
        posts = posts.sort((leftSide, rightSide): number => {
          if (leftSide.prefLabel.toLowerCase() < rightSide.prefLabel.toLowerCase()) { return -1; }
          if (leftSide.prefLabel.toLowerCase() > rightSide.prefLabel.toLowerCase()) { return 1; }
          return 0;
        });

        // hide the spinner and show the data
        this.isLoading = false;
        this.allPosts = posts;
      }
    }
  }

  ngOnInit() {
    this.group.controls['values']['controls'][0].get('search').valueChanges.pipe(debounceTime(500)).subscribe(val => {
      this.search = val;
      this.autocomplete.emit({'search': val, 'constraints': this.valueConstraints});

      // show the loading spinner
      this.isLoading = true;
    });
  }


  // after you clicked an autosuggest option, this function will show the field you want to show in input
  displayFn(post: Post) {
    if (post) {
      return post.prefLabel;
    }
  }

  // add chips
  add(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    // Add our requirement
    if ((value || '').trim()) {
      const chips = this.group.controls['values']['controls'][0].get('chips') as FormArray;
      chips.push(this.fb.control(value.trim()));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  // chip selection changed
  changed(event: MatAutocompleteSelectedEvent) {
  }

  // chip was removed
  remove(index: number): void {
    const chips = this.group.controls['values']['controls'][0].get('chips') as FormArray;
    const ids = this.group.controls['values']['controls'][0].get('ids') as FormArray;

    if (index >= 0) {
      chips.removeAt(index);
      ids.removeAt(index);
    }
    this.onRemovedOption.emit(index);
  }

  // chip was selected
  selected(event: MatAutocompleteSelectedEvent, value, label): void {
    this.autocompleteInput.nativeElement.value = '';
    this.autocompleteInput.nativeElement.focus();

    const chips = this.group.controls['values']['controls'][0].get('chips') as FormArray;
    chips.push(this.fb.control(label.trim()));
    const ids = this.group.controls['values']['controls'][0].get('ids') as FormArray;
    ids.push(this.fb.control(value.toString().trim()));

    // notify the parent component of the selection
    this.onSelectedOption.emit(event.option.value);
    this.group.controls['values']['controls'][0].get('search').setValue('');
  }

  // filter the data by the search string
  filterCategoryList(val) {
    const categoryList = [];
    if (typeof val !== 'string') {
      return [];
    }
    if (val === '' || val === null) {
      return [];
    }
    return val ? this.allPosts.filter(s => s.title.toLowerCase().indexOf(val.toLowerCase()) !== -1)
      : this.allPosts;
  }


  // focus the input field and remove any unwanted text.
  focusOnPlaceInput() {
    this.autocompleteInput.nativeElement.focus();
    this.autocompleteInput.nativeElement.value = '';
  }
}
