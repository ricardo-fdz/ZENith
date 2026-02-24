import { ConfigComponent } from '../../pages/workspace/config/config.component';
import { Routes } from '@angular/router';
import { LayoutComponent } from '../../core/layout/layout.component';
import { authGuard } from '../../core/guards/auth-guard';

export const WORKSPACE_ROUTES: Routes = [{
  path: '',
    component: LayoutComponent, // Este es el padre con la Navbar y el router-outlet
    canActivate: [authGuard],    // El guard protege todo el grupo
    children: [
      {
        path: 'sessions',
        loadComponent: () => import('../../pages/workspace/sessions/sessions.component').then(m => m.SessionsComponent)
      },
      {
        path: 'configuration',
        loadComponent: () => import('../../pages/workspace/config/config.component').then(m => m.ConfigComponent)
      },
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
}
]
