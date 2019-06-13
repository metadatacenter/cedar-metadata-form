import {Injectable} from '@angular/core';
import {TreeNode} from '../models/tree-node.model';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {InputType} from '../models/input-type';


@Injectable()
export class ValidatorService {


  static getValidators(node: TreeNode) {
    const validators = [];
    if (node.required) {
      validators.push(Validators.required);
    }
    if (node.subtype === InputType.email) {
      validators.push(Validators.email);
    }
    if (node.min !== null) {
      validators.push(Validators.min(node.min));
    }
    if (node.max !== null) {
      validators.push(Validators.max(node.max));
    }
    if (node.subtype == InputType.numeric) {
      validators.push(this.numericValidator());
    }
    if (node.decimals) {
      validators.push(this.decimalValidator(node.decimals));
    }
    if (node.minLength !== null) {
      validators.push(Validators.minLength(node.minLength));
    }
    if (node.maxLength !== null) {
      validators.push(Validators.maxLength(node.maxLength));
    }
    if (node.pattern !== null) {
      validators.push(Validators.pattern(node.pattern));
    }
    if (node.subtype === InputType.url) {
      validators.push(this.urlValidator);
    }
    return validators;
  }

  // validator for min and max
  static quantityRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== undefined && (isNaN(control.value) || control.value < min || control.value > max)) {
        return {'quantityRange': true};
      }
      return null;
    };
  }

  // validator for URLs
  static numericValidator(): any {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      let result = null;
      if (control.value) {
        if (isNaN(Number(control.value))) {
          result = {'numeric': true};
        }
      }
      return result;
    };
  }

  // validator for precision of a number
  static decimalValidator(precision: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: { actual: number, required: number } } | null => {
      let result = null;
      if (control.value && (!isNaN(Number(control.value)))) {
        const actual = control.value.split('.')[1].length;
        if (precision !== actual) {
          result = {
            decimal: {
              actual: actual,
              required: precision
            }
          };
        }
      }
      return result;
    };
  }

  // validator for URLs
  static urlValidator(url: FormControl): any {
    if (url.pristine) {
      return null;
    }
    const URL_REGEXP = /^(http?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    url.markAsTouched();
    if (URL_REGEXP.test(url.value)) {
      return null;
    }
    return {
      url: true
    };
  }


  static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


}
