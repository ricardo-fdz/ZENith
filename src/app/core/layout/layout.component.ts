import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'zen-layout',
  imports: [RouterOutlet,RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  authService = inject(AuthService)
  router = inject(Router);
  routerLink = RouterLink;
  logout(){

    this.authService.logout();
    this.router.navigateByUrl('/auth/login');

  }
}
