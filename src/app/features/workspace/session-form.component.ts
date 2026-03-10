import { Component, inject, input, output, Signal, signal } from '@angular/core';
import { WorkspaceService } from '../../core/sessions/workspace.service';
import { UserService } from '../../core/user/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'zen-session-form',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule],
  template: `
   <div class="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 mb-3">
          @if(typeView() == 'start'){
          <h2 class="text-3xl font-bold text-dark-teal-900 mb-2">Bienvenido</h2>
          <p class="text-dark-teal-700 mb-3 leading-relaxed">
            Empieza creando una nueva sesión de trabajo o gestiona tus tareas pendientes.
          </p>
          }
          <form [formGroup]="sessionForm" (submit)="createNewSession()"
            class="flex flex-col bg-dry-sage-100 p-6 gap-6 rounded-[2rem] shadow-xl border border-white">

            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold uppercase tracking-widest text-dark-teal-400 ml-2">Nombre del
                espacio</label>
              <input [formControl]="sessionForm.controls.name" type="text"
                placeholder="Ej: Redacción de Tesis o Enfoque Profundo"
                class="w-full bg-white border border-dark-teal-100 rounded-2xl p-2 ps-4 text-dark-teal-900 placeholder:text-dark-teal-200 focus:ring-2 focus:ring-accent-gold/20 focus:border-accent-gold outline-none transition-all">
            </div>

            <div class="flex flex-col gap-3">
              <label class="text-xs font-bold uppercase tracking-widest text-dark-teal-400 ml-2 hidden md:block">Identificador
                Visual</label>
              <div class="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white">
                <div class="relative w-8 h-8 rounded-full border-4 border-white shadow-inner overflow-hidden"
                  [style.background-color]="sessionForm.controls.color.value">
                  <input [formControl]="sessionForm.controls.color" type="color"
                    class="absolute inset-0 scale-150 cursor-pointer opacity-0">
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-dark-teal-800">Color de la sesión</span>
                  <span class="text-xs text-dark-teal-400">Haz clic en el círculo para cambiar</span>
                </div>
              </div>
            </div>

            <button type="submit" [disabled]="sessionForm.invalid" class="mt-2 w-full py-2 bg-dark-teal-900 text-white rounded-2xl shadow-lg font-bold
              hover:bg-dark-teal-800 hover:-translate-y-1 active:scale-95
              disabled:opacity-30 disabled:pointer-events-none disabled:grayscale
              transition-all duration-300 flex items-center justify-center gap-2">
              <span>{{typeView() == 'start'? "Comenzar ahora":'Crear nueva session'}}</span>
              <i class="lucide-sparkles text-accent-gold"></i> </button>
          </form>
        </div>
  `,
})
export class SessionFormComponent {
  submitted = output<void>();
  typeView = input<string>();
  isNewSelected = input();
  workspaceService = inject(WorkspaceService);
  userService = inject(UserService)
  currentSession = this.workspaceService.currentSession();
  private fb = inject(FormBuilder);

  sessionForm = this.fb.group({
    name: ['Nueva sesión', [Validators.required]],
    color: ['#154651', [Validators.required]],
  })

  async createNewSession() {
    const { name, color } = this.sessionForm.value;
    if (!name || !color) return;
    try {
      const sessionId = await this.workspaceService.createSession(name, color);
      this.submitted.emit();
    } catch {

    }
  }

}
