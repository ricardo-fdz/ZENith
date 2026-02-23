import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { firebaseProviders } from './core/firebase/firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Optimización de detección de cambios (estándar en Angular moderno)
    //provideZoneChangeDetection({ eventCoalescing: true }),

    // Configuración de Rutas
    provideRouter(
      routes,
      withViewTransitions(), // Activa transiciones suaves entre páginas
      withPreloading(PreloadAllModules) // Carga los módulos lazy en segundo plano para mayor rapidez
    ),

    // Inyectamos todos los proveedores de Firebase (Auth, Firestore, App)
    ...firebaseProviders
  ]
};
