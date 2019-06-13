export interface Post {
  title: string;
  body: string;
  '@id': string;
  '@type': string;
  created: string;
  creator: string;
  definitions: string[];
  hasChildren: boolean;
  id: string;
  ontology: string;
  prefLabel: string;
  provisional: boolean;
  relations: any;
  subclassOf: any;
  synonyms: string[];
  type: string;
}
