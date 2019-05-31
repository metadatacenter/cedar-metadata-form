import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

declare global {
  interface Window {
    WebComponents: {
      ready: boolean;
    };
  }
}

// needed for jsonld js library
(window as any).global = window;



if (environment.production) {
  enableProdMode();
}



platformBrowserDynamic()
  .bootstrapModule(
    AppModule, { ngZone: 'noop' })
  .catch(err => console.log(err));
