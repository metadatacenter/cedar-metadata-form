import {InputType} from './input-type';
import {TemplateSchemaProperties} from './template-schema-properties.model';

export interface TemplateSchema {
  '@id': string;
  '@type': string;
  '@context': object;
  'type': string;
  'title': string;
  'description': string;
  '_ui': {
    'pages': [];
    'order': string[];
    'propertyLabels': string[];
    'propertyDescriptions': string[];
    'inputType': InputType
  };
  'properties': TemplateSchemaProperties;
  'pav:version': string;
  'bibo:status': string;
  '$schema': string;
  '_valueConstraints'?: any;
}
