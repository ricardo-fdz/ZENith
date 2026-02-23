import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    // Lazy loading del módulo de autenticación
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'workspace',
    // Aquí vivirá el core de la app (Kanban, Timer, etc.)
    loadChildren: () => import('./features/workspace/workspace.routes').then(m => m.WORKSPACE_ROUTES)
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
