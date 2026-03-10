import { UserService } from './../user/user.service';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule, FileIcon, MenuIcon, ChevronLeft, ClockCheck, Cog, ChevronRight, LayoutDashboard } from 'lucide-angular';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'zen-layout',
  imports: [RouterOutlet, RouterLink, LucideAngularModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  readonly menuIcon = MenuIcon;
  readonly leftIcon = ChevronLeft;
  readonly sessionsIcon = ClockCheck;
  readonly configIcon = Cog;
  readonly rightIcon = ChevronRight;
  readonly dashboardIcon = LayoutDashboard;
  authService = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  routerLink = RouterLink;
  isToggleAside = signal(false);
  currentUser =  this.userService.currentUserProfile;

  protected asideClasses = computed(() => {
    const isExpanded = this.isToggleAside();
    const base = "h-full bg-dark-teal-900 text-white flex flex-col shadow-xl fixed md:relative transition-all duration-300 ease-in-out z-50 overflow-hidden";
    const state = isExpanded
      ? 'w-64 p-6 opacity-100' // Expandido (Móvil y Desktop)
      : 'w-0 p-0 opacity-0 md:w-20 md:p-4 md:opacity-100'; // Oculto en móvil, compacto en desktop
    return `${base} ${state}`;
  });

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  toggleAside() {
    this.isToggleAside.update(v => !v)
  }
}
