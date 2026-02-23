// core/auth/auth.service.ts
import { inject, Injectable, computed } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // Convierte el observable de Firebase en una Signal reactiva automáticamente [cite: 235, 245]
  currentUser = toSignal(authState(this.auth));

  // Signal computada para saber si el usuario entró [cite: 246]
  isAuthenticated = computed(() => !!this.currentUser());

  // Método para el MVP (Google Login) [cite: 234, 247]
  async loginWithGoogle() {
    try {
      return await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Error en Auth:", error);
      throw error;
    }
  }

  logout() {
    return signOut(this.auth);
  }
}
