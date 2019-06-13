import {Injectable} from '@angular/core';
import {InputTypeService} from './input-type.service';
import {TemplateSchema} from '../models/template-schema.model';


@Injectable()
export class InstanceService {

  it: InputTypeService;

  constructor() {
    this.it = new InputTypeService();
  }

  /* parsing Template object */
  static isUndefined(value) {
    return value === null || value === undefined;
  }


  static isBasedOn(instance: any) {
    return instance['schema:isBasedOn'];
  }

  static setBasedOn(instance: any, id: string) {
    instance['schema:isBasedOn'] = id;
    return instance;
  }

  static setHelp(instance: any, help: string) {
    instance['schema:description'] = help;
    return instance;
  }

  static setName(instance: any, name: string) {
    instance['schema:name'] = name;
    return instance;
  }

  static getTitle(instance: any) {
    return instance['schema:name'];
  }

  static getDescription(instance: any) {
    return instance['schema:description'];
  }

  // Function that generates the @type for a field in an instance, based on the schema @type definition
  static generateInstanceType(value) {
    const enumeration = this.isUndefined(value.oneOf) ? value.enum : value.oneOf[0].enum;

    // If the type is defined at the schema level
    if (!this.isUndefined(enumeration)) {
      // If only one type has been defined, it is returned
      const instanceType = (enumeration.length === 1) ? enumeration[0] : enumeration;
      if (instanceType) {
        return instanceType;
      }
    }
  }

  static generateInstanceTypeForDateField() {
    return 'xsd:date';
  }

  static generateInstanceTypeForNumericField(schema: TemplateSchema) {
    if (schema._valueConstraints.hasOwnProperty('numberType')) {
      return schema._valueConstraints.numberType;
    }
  }

  static setTextValue(model, key, index, valueLocation, val) {
    if (Array.isArray(model[key])) {
      model[key][index][valueLocation] = val;
    } else {
      model[key][valueLocation] = val;
    }
  }

  static setListValue(model, key, index, valueLocation, val) {
    if (Array.isArray(model[key])) {
      const arr = [];
      for (let i = 0; i < val.length; i++) {
        arr.push({'@value': val[i]});
      }
      model[key] = arr;
    } else {
      model[key][valueLocation] = val;
    }
  }

  static setRadioValue(model, key, index, valueLocation, val) {
    if (Array.isArray(model[key])) {
      model[key][index][valueLocation] = val;
    } else {
      model[key][valueLocation] = val;
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

  // build the form value for the attribute value field
  static buildAttributeValue(model, key): any[] {
    const val = [];
    if (model[key] && Array.isArray(model[key])) {
        for (let i = 0; i < model[key].length; i++) {
          const itemKey = model[key][i];
          const itemValue = model[itemKey]['@value'];
          val.push({'@value': itemValue, 'rdfs:label': itemKey});
        }
      }
    if (val.length == 0) {
      val.push({'@value': null, 'rdfs:label': null});
    }
    return val;
  }

  // set the form values for the attribute value field into the model
  static setAttributeValue(model, key, index, location, val) {
    const itemKey = model[key][index];
    if (itemKey) {

      if (location === 'value') {
        // change the value
        model[itemKey]['@value'] = val;

      } else {
        // change the label
        const itemValue = model[itemKey]['@value'];
        const index = model[key].indexOf(itemKey);
        delete model[itemKey];
        model['@context'][val] = model['@context'][itemKey];
        delete model['@context'][itemKey];
        model[key][index] = val;
        model[val] = {'@value': itemValue};
      }
    } else {
      // initialize attribute value field with this itemKey
      let newKey = val;
      while (model.hasOwnProperty(newKey)) {
        newKey = newKey + '1';
      }
      model['@context'][newKey] = 'https://schema.metadatacenter.org/properties/' + this.generateGUID();
      model[key] = [newKey];
      model[newKey] = {'@value': val};
    }
  }


  // copy the attribute value field pair at index to a new index
  static copyAttributeValue(model, key, index) {
    const oldKey = model[key][index];
    const oldValue = model[oldKey]['@value'];
    let newKey = oldKey;
    while (model.hasOwnProperty(newKey)) {
      newKey = newKey + '1';
    }
    model['@context'][newKey] = 'https://schema.metadatacenter.org/properties/' + this.generateGUID();
    model[key].splice(index + 1, 0, newKey);
    model[newKey] = {'@value': oldValue};
  }

  // remove the attribute value field pair at index
  static removeAttributeValue(model, key, index) {
    const oldKey = model[key][index];
    delete model['@context'][oldKey];
    model[key].splice(index, 1);
    delete model[oldKey];
  }

  static getRadioValue(model, key, index, valueLocation) {
    if (Array.isArray(model[key])) {
      return model[key][index][valueLocation];
    } else {
      return model[key][valueLocation];
    }
  }

  static addControlledValue(model: any, key: string, value: string, label: string) {
    const val = {'@id': value, 'rdfs:label': label};
    model[key] = Array.isArray(model[key]) ? model[key] : [model[key]];
    model[key].push(val);
  }

  static removeControlledValue(model: any, key: string, index: number) {
    model[key].splice(index, 1);
  }


  static setCheckValue(model: any, key: string, index: number, location: string, val: string[]) {
    const arr = [];
    for (let i = 0; i < val[index].length; i++) {
      const obj = {};
      obj[location] = val[index][i];
      arr.push(obj);
    }
    model[key] = arr;
  }

  static initInstance() {
    return {
      '@context': {
        'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
        'xsd': 'http://www.w3.org/2001/XMLSchema#',
        'pav': 'http://purl.org/pav/',
        'schema': 'http://schema.org/',
        'oslc': 'http://open-services.net/ns/core#',
        'skos': 'http://www.w3.org/2004/02/skos/core#',
        'rdfs:label': {
          '@type': 'xsd:string'
        },
        'schema:isBasedOn': {
          '@type': '@id'
        },
        'schema:name': {
          '@type': 'xsd:string'
        },
        'schema:description': {
          '@type': 'xsd:string'
        },
        'pav:createdOn': {
          '@type': 'xsd:dateTime'
        },
        'pav:createdBy': {
          '@type': '@id'
        },
        'pav:lastUpdatedOn': {
          '@type': 'xsd:dateTime'
        },
        'oslc:modifiedBy': {
          '@type': '@id'
        },
        'skos:notation': {
          '@type': 'xsd:string'
        }
      },
      'schema:isBasedOn': '',
      'schema:name': '',
      'schema:description': '',
      'pav:createdOn': '',
      'pav:createdBy': '',
      'pav:lastUpdatedOn': '',
      'oslc:modifiedBy': '',
      '@id': ''
    };
  }

}
