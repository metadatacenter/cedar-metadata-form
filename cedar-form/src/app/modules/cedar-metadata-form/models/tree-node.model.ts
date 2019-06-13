import {FormGroup} from '@angular/forms';

import {Metadata} from './metadata.model';
import {InputType} from '../models/input-type';

export interface TreeNode {
  key: string;
  name: string;

  minItems?: number;
  maxItems?: number;
  itemCount?: number;

  type?: InputType;
  subtype?: InputType;

  formGroup?: FormGroup;
  parent?: TreeNode;
  parentGroup?: FormGroup;
  children?: TreeNode[];

  help?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  min?: number;
  max?: number;
  decimals?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  multipleChoice?: boolean;
  multiSelect?: boolean;

  options?: any;
  size?: any;
  staticValue?: any[];

  model?: Metadata;
  valueLocation?: string;
  valueConstraints?: any;
}
