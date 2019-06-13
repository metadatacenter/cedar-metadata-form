
export interface Metadata {
  '@context'?: {
    'rdfs'?: string,
    'xsd'?: string,
    'pav'?: string,
    'schema'?: string,
    'oslc'?: string,
    'skos'?: string,
    'rdfs:label'?: {
      '@type': string
    },
    'schema:isBasedOn'?: {
      '@type': string
    },
    'schema:name'?: {
      '@type': string
    },
    'schema:description'?: {
      '@type': string
    },
    'pav:createdOn'?: {
      '@type': string
    },
    'pav:createdBy'?: {
      '@type': string
    },
    'pav:lastUpdatedOn'?: {
      '@type': string
    },
    'oslc:modifiedBy'?: {
      '@type': string
    },
    'skos:notation'?: {
      '@type': string
    }
  };
  'schema:isBasedOn'?: string;
  'schema:name'?: string;
  'schema:description'?: string;
  'pav:createdOn'?: string;
  'pav:createdBy'?: string;
  'pav:lastUpdatedOn'?: string;
  'oslc:modifiedBy'?: string;
  '@id'?: string;
}



