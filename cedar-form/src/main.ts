import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';

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


// living without zone.js
platformBrowserDynamic()
  .bootstrapModule(
    AppModule, { ngZone: 'noop' })
  .catch(err => console.log(err));
