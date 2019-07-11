# CedarForm

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## To build as web component and push to cedar-component-server

ng build --prod --output-hashing=none

cat dist/cedar-form/{runtime,polyfills,main}.js > custom-elements.js

cp custom-elements.js  /Users/dwillrett/Development/git_repos/CEDAR/cedar-component-server/cedar-form/cedar-form-dev.js

## To load in your app as web component 

```       
<script src="https://component.metadatacenter.orgx/cedar-form/cedar-form-dev.js" type="text/javascript"></script>   
```
 
Follow the instructions for using web components for your environment.

## To use the cedar-form web component in your app 

Here is an example of how you would call it from your Angular app:

```       
 <cedar-form [mode]="mode" [instance]="instance" [template]="template" (autocomplete)="onAutocomplete($event)" [autocompleteResults]="allPosts" (formChange)="onFormChange($event)"  ></cedar-form> 
```

using parameters:
1. mode 
  a. "edit" for full editing capability
  b. "view" for view only
2. instance - The CEDAR JSON-LD instance to view or edit.  
3. template - the CEDAR Template, Template-element or Template-field to be used
4. autocomplete = event triggered when user requests autocomplete of a controlled term dropdown
5. autocompleteResults - after the autocomplete event, caller should fill the autocompleteResult array to populate the dropdown
6. formChange - event triggered when the value of the form has changed. 
