import {Inject, Injectable, Optional} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

import {TemplateSchema} from '../models/template-schema.model';
import {Metadata} from '../models/metadata.model';
import {MetadataSnip} from '../models/metadata-snip.model';

import {InputTypeService} from './input-type.service';
import {InputType} from '../models/input-type';
import {TemplateService} from './template.service';
import {TreeNode} from '../models/tree-node.model';
import {InstanceService} from './instance.service';


@Injectable()
export class TemplateParserService {

  constructor(@Inject('instance') @Optional() public instance?: any, @Inject('template') @Optional() public template?: any) {
    this.templateSchema = template as TemplateSchema;
    this.instanceModel = instance as Metadata;
  }

  get data(): TreeNode[] {
    return this.dataChange.value;
  }

  formGroup: FormGroup;
  pageIndex: number;
  dataChange = new BehaviorSubject<TreeNode[]>([]);
  instanceModel: Metadata;
  templateSchema: TemplateSchema;

  static getOptions(schema: TemplateSchema, inputType: InputType) {
    const options: any[] = [];
    if (InputTypeService.isRadioCheckList(inputType)) {
      const literals = TemplateService.getLiterals(schema);
      for (let i = 0; i < literals.length; i++) {
        const val: any = literals[i];
        const obj = {};
        obj['label'] = val.label;
        obj['value'] = i;
        options.push(obj);
      }
    }
    return options;
  }

  static getNodeType(schema: TemplateSchema, inputType: InputType): InputType {
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

  static staticNode(schema: TemplateSchema, model: Metadata, inputType: InputType,
                    minItems, maxItems, key: string, modelValue: MetadataSnip, formGroup: FormGroup, parent: TreeNode): TreeNode {
    const nodeType = TemplateService.getNodeType(inputType);
    const nodeSubtype = TemplateService.getNodeSubtype(inputType);
    return {
      'key': key,
      'model': model,
      'minItems': 0,
      'maxItems': 0,
      'itemCount': 0,
      'name': TemplateService.getTitle(schema, null),
      'type': nodeType,
      'subtype': nodeSubtype,

      'formGroup': formGroup,
      'parentGroup': parent ? parent.formGroup : null,
      'parent': parent,

      'staticValue': TemplateService.getContent(schema),
      'size': TemplateService.getSize(schema)
    };
  }

  static attributeValueNode(schema: TemplateSchema, model: any, key: string, modelValue: any,
                            formGroup: FormGroup, parent: TreeNode): TreeNode {
    const nodeType = TemplateParserService.getNodeType(schema, InputType.attributeValue);
    const nodeSubtype = TemplateParserService.getNodeSubtype(InputType.attributeValue);
    return {
      'key': key,
      'name': TemplateService.getTitle(schema),
      'type': nodeType,
      'subtype': nodeSubtype,
      'model': model,
      'min': TemplateService.getMin(schema),
      'max': TemplateService.getMax(schema),
      'itemCount': 0,

      'formGroup': formGroup,
      'parentGroup': parent ? parent.formGroup : null,
      'parent': parent,

      'required': TemplateService.isRequired(schema),
      'valueLocation': TemplateService.getValueLocation(schema, nodeType, nodeSubtype),
      'help': TemplateService.getHelp(schema),
      'placeholder': TemplateService.getPlaceholder(schema),
      'hint': TemplateService.getHint(schema)
    };
  }

  getTitle() {
    return this.instance ? TemplateService.getTitle(this.template, null) : '';
  }

  initialize(formGroup: FormGroup, instance: any, template: any, page: number): any {
    this.templateSchema = template as TemplateSchema;
    this.instanceModel = (instance || {}) as Metadata;
    this.formGroup = formGroup;
    this.pageIndex = 0;
    this.dataChange.next(this.buildTree(this.templateSchema, this.instanceModel, 0, this.formGroup, null, page));
  }

  fieldNode(schema: TemplateSchema, model: Metadata, propertyLabel: string, inputType: InputType,
            minItems, maxItems, key: string, modelValue: MetadataSnip, formGroup: FormGroup, parent: TreeNode): TreeNode {
    const nodeType = TemplateService.getNodeType(inputType);
    const nodeSubtype = TemplateService.getNodeSubtype(inputType);
    return {
      'key': key,
      'name': TemplateService.getTitle(schema, propertyLabel),
      'type': nodeType,
      'subtype': nodeSubtype,
      'model': model,
      'minItems': minItems,
      'maxItems': maxItems,
      'itemCount': 0,

      'formGroup': formGroup,
      'parentGroup': parent ? parent.formGroup : null,
      'parent': parent,

      'valueLocation': TemplateService.getValueLocation(schema, nodeType, nodeSubtype),
      'multiSelect': (minItems !== undefined && nodeType !== InputType.controlled),
      'multipleChoice': TemplateService.isMultiValue(schema),
      'min': TemplateService.getMin(schema),
      'max': TemplateService.getMax(schema),
      'decimals': TemplateService.getDecimals(schema),
      'minLength': TemplateService.getMinStringLength(schema),
      'maxLength': TemplateService.getMaxStringLength(schema),
      'valueConstraints': TemplateService.getValueConstraints(schema),
      'options': TemplateParserService.getOptions(schema, inputType),
      'required': TemplateService.isRequired(schema),
      'help': TemplateService.getHelp(schema),
      'placeholder': TemplateService.getPlaceholder(schema),
      'hint': TemplateService.getHint(schema),

    };
  }

  getFirst(value, index) {
    if (Array.isArray(value)) {
      return value[index];
    } else {
      return value;
    }
  }

  elementNode(schema: TemplateSchema, model: Metadata, label: string, minItems, maxItems, i,
              key, level, modelValue, formGroup: FormGroup, parent: TreeNode, page: number): TreeNode {
    const nodeType = TemplateService.getNodeType(InputType.element);
    const nodeSubtype = TemplateService.getNodeSubtype(InputType.element);
    const node = {
      'key': key,
      'name': TemplateService.getTitle(schema),
      'model': model,
      'minItems': minItems,
      'maxItems': maxItems,
      'itemCount': i,

      'parent': parent,
      'parentGroup': parent ? parent.formGroup : null,
      'formGroup': new FormGroup({}),

      'multiSelect': (minItems !== undefined),
    };
    formGroup.addControl(key + i, node.formGroup);
    if (schema.properties) {
      node['children'] = this.buildTree(schema, this.getFirst(modelValue, i), level + 1,
        node.formGroup, node, page);
    }

    return node;
  }

  // build the tree of FileNodes
  buildTree(parentSchema: TemplateSchema, model: Metadata, level: number, formGroup: FormGroup,
            parentNode: TreeNode, page: number): TreeNode[] {
    const order = TemplateService.getOrderofPage(parentSchema, page);
    const properties = TemplateService.getProperties(parentSchema);
    const labels = TemplateService.getLabels(parentSchema);

    return order.reduce<TreeNode[]>((accumulator, key) => {
      if (!TemplateService.isSpecialKey(key)) {

        const value = properties[key];
        const maxItems = value['maxItems'];
        const minItems = value['minItems'];
        const schema = TemplateService.schemaOf(value);
        const type = TemplateService.getInputType(schema);
        const label = labels[key];

        if (!model.hasOwnProperty(key)) {

          model['@context'][key] = schema['@id'];

          if (TemplateService.isElement(schema)) {
            model[key] = TemplateService.initValue(schema, key, InputType.element, minItems, maxItems);

          } else if (TemplateService.isField(schema)) {
            model[key] = TemplateService.initValue(schema, key, type, minItems, maxItems);

          }
        }
        const modelValue = model[key];

        if (TemplateService.isElement(schema)) {
          const itemCount = modelValue.length ? modelValue.length : 1;

          for (let i = 0; i < itemCount; i++) {
            const node = this.elementNode(schema, model, label, minItems, maxItems, i, key, level, modelValue, formGroup, parentNode, 0);
            accumulator = accumulator.concat(node);
          }

        } else if (TemplateService.isStaticField(schema)) {
          const node = TemplateParserService.staticNode(schema, model, type, minItems, maxItems, key, modelValue, formGroup, parentNode);
          accumulator = accumulator.concat(node);

        } else if (TemplateService.isField(schema)) {
          if (InputTypeService.isAttributeValue(type)) {
            const items = InstanceService.buildAttributeValue(model, key);
            const node = TemplateParserService.attributeValueNode(schema, model, key, items, formGroup, parentNode);
            accumulator = accumulator.concat(node);

          } else {
            const node = this.fieldNode(schema, model, label, type, minItems, maxItems, key, modelValue, formGroup, parentNode);
            accumulator = accumulator.concat(node);
          }
        }

      }
      return accumulator;

    }, []);
  }


}
