import { inject, Injectable, signal } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc, docData } from '@angular/fire/firestore';
import { UserProfile, UserSettings } from '../models/user.model';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  public currentUserProfile = signal<UserProfile | null>(null);

  constructor() {


    authState(this.auth).subscribe(async (user) => {

      if (user) {
        if (!this.currentUserProfile()) {
          await this.getOrCreateProfile(user.uid);
        }
      } else {
        this.currentUserProfile.set(null);
      }
    });
  }

  async getOrCreateProfile(uid: string, data?: Partial<UserProfile>): Promise<UserProfile> {
    const docRef = doc(this.firestore, `users/${uid}`);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      const hasChanged =
        (data?.displayName !== undefined && data.displayName !== profile.displayName) ||
        (data?.photoURL !== undefined && data.photoURL !== profile.photoURL);
      // Si nos pasan datos nuevos (ej: después de updateProfile), actualizamos
      if (data && hasChanged) {
        const updated = {
          ...profile,
          displayName: data.displayName || profile.displayName,
          photoURL: data.photoURL || profile.photoURL,
        };
        await updateDoc(docRef, {
          displayName: updated.displayName,
          photoURL: updated.photoURL
        });
        this.currentUserProfile.set(updated);
        return updated;
      }

      this.currentUserProfile.set(profile);

      return profile;
    } else {
      // Configuraciones por defecto para el usuario nuevo
      const defaultSettings: UserSettings = {
        pomodoroTime: 25,
        shortBreak: 5,
        longBreak: 15,
        theme: 'zen',
        isSidebarCollapsed: false
      };

      const newProfile: UserProfile = {
        uid: uid,
        email: data?.email || '',
        displayName: data?.displayName || 'Zen User',
        photoURL: data?.photoURL || '',
        createdAt: new Date(),
        globalSettings: defaultSettings
      };

      await setDoc(docRef, newProfile);
      this.currentUserProfile.set(newProfile);
      return newProfile;
    }

  }


  async updateSettings(newSettings: Partial<UserSettings>) {
    const user = this.currentUserProfile();
    if (!user) return;

    const docRef = doc(this.firestore, `users/${user.uid}`);
    const updatedSettings = { ...user.globalSettings, ...newSettings };

    await updateDoc(docRef, { globalSettings: updatedSettings });

    this.currentUserProfile.update(prev =>
      prev ? { ...prev, globalSettings: updatedSettings } : null
    );
  }
}
