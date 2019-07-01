import {InputType} from '../models/input-type';
import {constants} from '../models/constants';

export class InputTypeService {

  static isStatic(t: InputType) {
    return constants.inputTypes[t].staticField;
  }

  static allowsMultiple(t: string) {
    return constants.inputTypes[t].allowsMultiple;
  }

  static isNotTextInput(t: string) {
    return t === InputType.attributeValue || t === InputType.controlled || t === InputType.list || t === InputType.radio || t === InputType.checkbox || t === InputType.date || t === InputType.textarea;
  }

  static isRadioCheckList(t: string) {
    return InputTypeService.isRadio(t) || InputTypeService.isCheckbox(t) || InputTypeService.isList(t);
  }

  static isCheckbox(t: string) {
    return t === InputType.checkbox;
  }

  static isPageBreak(t: string) {
    return t === InputType.pageBreak;
  }

  static isTextfield(t: string) {
    return t === InputType.textfield;
  }

  static isRadio(t: string) {
    return t === InputType.radio;
  }

  static isList(t: string) {
    return t === InputType.list;
  }

  static isDate(t: string) {
    return t === InputType.date;
  }

  static isControlled(t: string) {
    return t === InputType.controlled;
  }

  static isAttributeValue(t: string) {
    return t === InputType.attributeValue;
  }

  static isTel(t: string) {
    return t === InputType.tel;
  }

  static isUrl(t: string) {
    return t === InputType.url;
  }

  static isNumber(t: string) {
    return t === InputType.number;
  }


}
