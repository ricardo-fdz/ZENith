import { inject, Injectable, signal, computed, effect } from '@angular/core';
import {
  Firestore, collection, addDoc, query, where,
  orderBy, collectionData, doc, updateDoc, deleteDoc,
  serverTimestamp, Timestamp,
  getDocs,
  limit
} from '@angular/fire/firestore';
import { Session, SessionPomodoroConfig, Task } from '../models/workspace.model';
import { UserService } from '../user/user.service';
import { Observable, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private firestore = inject(Firestore);
  private userService = inject(UserService);

  // Signals para el estado global del espacio de trabajo
  activeSessionId = signal<string | null>(null);
  currentSession = signal<Session | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    // Al iniciar, buscamos la última sesión
    effect(async () => {
      const user = this.userService.currentUserProfile();
      if (user === undefined) return;
      if (user) {
        // Solo cuando hay usuario, intentamos cargar la sesión
        await this.loadLastSession(user.uid);
      } else {
        // Si el usuario cierra sesión, limpiamos el espacio de trabajo
        this.currentSession.set(null);
      }
    });
  }

  // Tareas de la sesión actual (se actualiza automáticamente)
  private tasks$ = (sessionId: string) => {
    const tasksRef = collection(this.firestore, 'tasks');
    const q = query(
      tasksRef,
      where('sessionId', '==', sessionId),
      orderBy('order', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Task[]>;
  };

  /**
   * Crear una nueva sesión de trabajo
   */
  async createSession(name: string, color: string = '#0D9488') {
    const user = this.userService.currentUserProfile();
    if (!user) throw new Error('Usuario no autenticado');
    const settings = user.globalSettings;
    const sessionRef = collection(this.firestore, 'sessions');
    const newSession: Partial<Session> = {
      userId: user.uid,
      name,
      color,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      pomodoroConfig: {
        workDuration: settings.pomodoroTime,
        shortBreak: settings.shortBreak,
        longBreak: settings.longBreak,
        sessionsUntilLongBreak: 4,
      } as SessionPomodoroConfig,
      metrics: {
        totalPomodoros: 0,
        totalWorkMinutes: 0,
        tasksCompleted: 0,
        tasksTotal: 0,
        productivityScore: 0
      }
    };

    const docRef = await addDoc(sessionRef, newSession);
    this.activeSessionId.set(docRef.id);
    const fullSession: Session = {
      id: docRef.id,
      ...newSession
    } as Session
    this.currentSession.set(fullSession);
    return docRef.id;
  }

  /**
   * Añadir una tarea a una sesión (o global)
   */
  async addTask(title: string, makeGlobal: boolean = false) {
    const user = this.userService.currentUserProfile();
    const session = this.currentSession();


    const newTask: Partial<Task> = {
      userId: user?.uid,
      title,
      // Si el usuario marca "Global", el sessionId es null.
      // Si no, intentamos usar el de la sesión activa.
      sessionId: makeGlobal ? null : (session?.id || null),
      isGlobal: makeGlobal || !session, // Es global si se marca o si no hay sesión activa
      status: 'pending',
      priority: 'medium',
      estimatedPomodoros: 1,
      completedPomodoros: 0,
      order: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };

    return await addDoc(collection(this.firestore, 'tasks'), newTask);
  }

  /**
   * Cambiar estado de una tarea (Completar/Pendiente)
   */
  async toggleTaskStatus(taskId?: string, currentStatus?: string) {
    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date() : null;

    await updateDoc(taskRef, {
      status: newStatus,
      completedAt,
      updatedAt: new Date()
    });
  }

  private async loadLastSession(uid: string) {

    this.isLoading.set(true);
    try {
      const sessionsRef = collection(this.firestore, 'sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', uid),
        where('status', '==', 'active'),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        this.currentSession.set({
          id: docSnap.id,
          ...docSnap.data()
        } as Session);

      } else {
        this.currentSession.set(null);
      }
    } catch (error) {
      console.error("Error cargando sesión:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getSessions(uid: string): Promise<Session[] | null> {

    this.isLoading.set(true);
    try {
      const sessionsRef = collection(this.firestore, 'sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', uid),
        orderBy('updatedAt', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Session));

      } else {
        return [];
      }
    } catch (error) {
      console.error("Error cargando sesión:", error);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }
  async getTasks(uid: string): Promise<Task[] | null> {

    this.isLoading.set(true);
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', uid),
        orderBy('updatedAt', 'asc'),
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));

      } else {
        return [];
      }
    } catch (error) {
      console.error("Error cargando sesión:", error);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }
}
