import {Injectable} from '@angular/core';
import {InputTypeService} from './input-type.service';
import {TemplateSchema} from '../models/template-schema.model';
import {InputType} from '../models/input-type';

@Injectable()
export class TemplateService {

  it: InputTypeService;

  constructor() {
    this.it = new InputTypeService();
  }

  /* parsing Template object */
  static isUndefined(value) {
    return value === null || value === undefined;
  }


  static isElement(schema: TemplateSchema) {
    return (schema['@type'] === 'https://schema.metadatacenter.org/core/TemplateElement');
  }

  static isTemplate(schema: TemplateSchema) {
    return (schema['@type'] === 'https://schema.metadatacenter.org/core/Template');
  }

  static isField(schema: TemplateSchema) {
    return (schema['@type'] === 'https://schema.metadatacenter.org/core/TemplateField');
  }

  static isStaticField(schema: TemplateSchema) {
    return (schema['@type'] === 'https://schema.metadatacenter.org/core/StaticTemplateField');
  }

  static schemaOf(node): TemplateSchema {
    return (node && node.type === 'array' && node.items) ? node.items : node;
  }

  static propertiesOf(schema: TemplateSchema) {
    return schema.properties;
  }

  static isBasedOn(schema: any) {
    return schema['schema:isBasedOn'];
  }

  static getId(schema: TemplateSchema) {
    return schema['@id'];
  }

  static isSpecialKey(key) {
    const specialKeyPattern = /(^@)|(^_)|(^schema:)|(^pav:)|(^rdfs:)|(^oslc:)/i;
    return specialKeyPattern.test(key);
  }

  // get the value constraint literal values
  static getLiterals(schema: TemplateSchema) {
    if (schema._valueConstraints) {
      return schema._valueConstraints.literals;
    }
  }

  static getValueConstraints(schema: TemplateSchema) {
    if (schema._valueConstraints) {
      return schema._valueConstraints;
    }
  }

  static getHelp(schema: TemplateSchema) {
    return schema['schema:description'];
  }


  static getPlaceholder(schema: TemplateSchema) {
    return 'placeholder text';
  }

  static getHint(schema: TemplateSchema) {
    return ' ';
  }

  static isRequired(schema: TemplateSchema) {
    return schema._valueConstraints && schema._valueConstraints.requiredValue;
  }


  static getMin(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.minValue;
  }

  static getMax(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.maxValue;
  }

  static getDecimals(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.decimalPlace;
  }

  static getNumeric(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.numberType;
  }

  static getMinStringLength(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.minLength;
  }

  static getMaxStringLength(schema: TemplateSchema) {
    return schema && schema._valueConstraints && schema._valueConstraints.maxLength;
  }

  static getMaxDefaultValue(schema: TemplateSchema) {
    return schema._valueConstraints.defaultValue;
  }

  static getName(schema: TemplateSchema) {
    return schema['schema:name'];
  }


  static getPrefLabel(schema: TemplateSchema) {
    return schema['skos:prefLabel'];
  }

  static getTitle(schema: TemplateSchema, label?: string) {
    return TemplateService.getPrefLabel(schema) || label || TemplateService.getName(schema);
  }

  static getDescription(schema: any) {
    return schema['schema:description'];
  }

  static getNodeType(inputType: InputType): InputType {
    let result: InputType;
    switch (inputType) {
      case InputType.numeric:
      case InputType.phoneNumber:
      case InputType.email:
      case InputType.link:
        result = InputType.textfield;
        break;
      case InputType.pageBreak:
      case InputType.sectionBreak:
      case InputType.richText:
      case InputType.image:
      case InputType.youTube:
        result = InputType.static;
        break;
      default:
        result = inputType;
        break;
    }
    return result;
  }

  static getNodeSubtype(inputType) {
    let result: InputType;
    switch (inputType) {
      case InputType.youTube:
        result = InputType.youTube;
        break;
      case InputType.image:
        result = InputType.image;
        break;
      case InputType.richText:
        result = InputType.richText;
        break;
      case InputType.sectionBreak:
        result = InputType.sectionBreak;
        break;
      case InputType.pageBreak:
        result = InputType.pageBreak;
        break;
      case InputType.email:
        result = InputType.email;
        break;
      case InputType.numeric:
        result = InputType.number;
        break;
      case InputType.link:
        result = InputType.url;
        break;
      case InputType.phoneNumber:
        result = InputType.tel;
        break;
      default:
        result = InputType.text;
        break;
    }
    return result;
  }

  static initValue(schema: TemplateSchema, key: string, type: InputType, minItems: number, maxItems: number) {
    let result;
    if (type === InputType.element) {
      if (!this.isUndefined(minItems)) {
        result = [{'@context': {}, '@id': schema['@id']}];
      } else {
        result = {'@context': {}, '@id': schema['@id']};
      }
    } else {
      const location = this.getValueLocation(schema, this.getNodeType(type), this.getNodeSubtype(type));

      if (location === '@value') {
        if (!this.isUndefined(minItems)) {
          result = [];
          for (let i = 0; i < minItems; i++) {
            const item = {'@value': null};
            if (type === InputType.date) {
              item['@type'] = 'xsd:date';
            }
            result.push(item);
          }
        } else {
          result = {'@value': null};
          if (type === InputType.date) {
            result['@type'] = 'xsd:date';
          }
        }
      } else {
        if (type === InputType.controlled) {
          if (!this.isUndefined(minItems)) {
            result = [];
          } else {
            result = {};
          }
        } else if (!this.isUndefined(minItems)) {
          result = [];
          for (let i = 0; i < minItems; i++) {
            const item = {};
            result.push(item);
          }
        } else {
          result = {};
        }
      }
    }
    return result;
  }

  // does this field have a value constraint?
  static hasControlledTermValue(schema: TemplateSchema) {
    let result = false;
    const vcst = schema._valueConstraints;
    if (vcst) {
      const hasOntologies = vcst.ontologies && vcst.ontologies.length > 0;
      const hasValueSets = vcst.valueSets && vcst.valueSets.length > 0;
      const hasClasses = vcst.classes && vcst.classes.length > 0;
      const hasBranches = vcst.branches && vcst.branches.length > 0;
      result = hasOntologies || hasValueSets || hasClasses || hasBranches;
    }
    return result;
  }

  // get the controlled terms list for field types
  static getFieldControlledTerms(schema: TemplateSchema, inputType: InputType) {
    if (!InputTypeService.isStatic(inputType) && inputType !== InputType.attributeValue) {
      const properties = this.propertiesOf(schema);
      if (properties['@type'] && properties['@type'].oneOf && properties['@type'].oneOf[1]) {
        return properties['@type'].oneOf[1].items['enum'];
      }
    }
  }

  // where is the value of this field, @id or @value?
  static getValueLocation(schema: TemplateSchema, nodeType: InputType, nodeSubtype: InputType) {
    const ct = TemplateService.getFieldControlledTerms(schema, nodeType);
    const ctv = TemplateService.hasControlledTermValue(schema);
    const link = nodeSubtype === InputType.url;
    return (ct || ctv || link) ? '@id' : '@value';
  }

  static getOrder(schema: TemplateSchema) {
    if (this.isField(schema)) {
      return [schema['schema:name']];
    } else {
      return schema['_ui']['order'];
    }
  }

  static getProperties(schema: TemplateSchema) {
    if (this.isField(schema)) {
      const prop = {};
      prop[schema['schema:name']] = schema;
      return prop;
      return schema;
    } else {
      return schema['properties'];
    }
  }

  static getLabels(schema: TemplateSchema) {
    if (this.isField(schema)) {
      return [schema['schema:name']];
    } else {
      return schema['_ui']['propertyLabels'];
    }
  }

  static getDescriptions(schema: TemplateSchema) {
    if (this.isField(schema)) {
      return [schema['schema:description']];
    } else {
      return schema['_ui']['propertyDescriptions'];
    }
  }

  static getPageCount(schema: TemplateSchema) {
    const properties = this.getProperties(schema);
    let currentPage = 0;
    if (this.getOrder(schema)) {
      this.getOrder(schema).forEach(function (key) {
        const prop: TemplateSchema = properties[key];
        const type: InputType = TemplateService.getInputType(prop);
        if (InputTypeService.isPageBreak(type)) {
          currentPage++;
        }
      });
    }
    return currentPage + 1;
  }

  // build an order array for a particular page
  static getOrderofPage(schema: TemplateSchema, page: number) {
    const p = page || 0;
    const properties = this.getProperties(schema);
    const order = this.getOrder(schema);
    let currentPage = 0;
    const pageOrder = [];
    const that = this;
    if (order) {
      order.forEach(function (key) {

        const prop: TemplateSchema = properties[key];

        const type: InputType = that.getInputType(prop);
        if (InputTypeService.isPageBreak(type)) {
          currentPage++;
        } else {
          if (currentPage === p) {
            pageOrder.push(key);
          }
        }

      });
    }
    return pageOrder;
  }

  static getInputType(schema: TemplateSchema): InputType {
    let result = InputType.textfield;
    if (schema && schema._ui && schema._ui.inputType) {
      result = schema._ui.inputType as InputType;
      if (InputTypeService.isTextfield(result) && this.hasControlledTermValue(schema)) {
        result = InputType.controlled;
      }
    }
    return result;
  }

  static getContent(schema: TemplateSchema): any {
    return (schema && schema._ui && schema._ui['_content']) ? schema._ui['_content'] : null;
  }

  static getSize(schema: TemplateSchema): any {
    return (schema && schema._ui && schema._ui['_size']) ? schema._ui['_size'] : null;
  }

  // has multiple choice value constraints?
  static isMultiValue(schema: TemplateSchema) {
    return schema._valueConstraints && schema._valueConstraints.multipleChoice;
  }


  static generateInstanceTypeForNumericField(schema: TemplateSchema) {
    if (schema._valueConstraints.hasOwnProperty('numberType')) {
      return schema._valueConstraints.numberType;
    }
  }


  static generateGUID = function () {
    let d = Date.now();
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
  };


}
