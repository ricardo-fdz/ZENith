import { UserService } from './../user/user.service';
// core/auth/auth.service.ts
import { inject, Injectable, computed, signal } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut, User, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { UserProfile, UserSettings } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userService = inject(UserService);
  // Signal para exponer el perfil completo del usuario en toda la app
  public userProfile = signal<UserProfile | null>(null);

  // Convierte el observable de Firebase en una Signal reactiva automáticamente [cite: 235, 245]
  currentUser = toSignal(authState(this.auth));

  // Signal computada para saber si el usuario entró [cite: 246]
  isAuthenticated = computed(() => !!this.currentUser());

  // Método para el MVP (Google Login) [cite: 234, 247]
  async loginWithGoogle() {
    try {
      // 1. Autenticación con Firebase Auth
      const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());

      // 2. Sincronización con Firestore vía UserService
      // Pasamos los datos que Google nos da por si es un usuario nuevo
      await this.userService.getOrCreateProfile(credential.user.uid, {
        email: credential.user.email || '',
        displayName: credential.user.displayName || 'Zen User',
        photoURL: credential.user.photoURL || ''
      });

      return credential;
    } catch (error) {
      console.error("Error en Auth con Google:", error);
      throw error;
    }
  }

  logout() {
    return signOut(this.auth);
  }


  async registerWithEmail(email: string, pass: string, name: string) {
    try{

      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      await updateProfile(credential.user, { displayName: name });
      await this.userService.getOrCreateProfile(credential.user.uid, {
        email: credential.user.email ?? '',
        displayName: name, // 👈 pasamos el nombre directamente, no desde credential.user
        photoURL: credential.user.photoURL ?? ''
      });
      return credential;
    }catch(error){
      throw error
    }
  }

  async loginWithEmail(email: string, pass: string) {
    const credential = await signInWithEmailAndPassword(this.auth, email, pass);

    await this.handleAuthSuccess(credential.user);
    return credential;
  }

  async handleAuthSuccess(user: any) {
    // Aquí delegamos la creación/carga del perfil al UserService
    await this.userService.getOrCreateProfile(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  }

}
