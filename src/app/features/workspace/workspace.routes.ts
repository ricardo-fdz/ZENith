import { WorkspaceComponent } from '../../pages/workspace/workspace.component';
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
        loadComponent: () => import('../../pages/workspace/workspace.component').then(m => m.WorkspaceComponent)
      },
      // {
      //   path: 'projects',
      //   loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
      // },
      // { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
}
]
