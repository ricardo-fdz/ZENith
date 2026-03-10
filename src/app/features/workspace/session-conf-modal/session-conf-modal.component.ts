import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { X, LucideAngularModule } from 'lucide-angular';
import { WorkspaceService } from '../../../core/sessions/workspace.service';
import { UserService } from '../../../core/user/user.service';
import { Session } from '../../../core/models/workspace.model';
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';

@Component({
  selector: 'zen-session-conf-modal',
  standalone: true,
  imports: [LucideAngularModule, ɵInternalFormsSharedModule,ReactiveFormsModule],
  templateUrl: './session-conf-modal.component.html',
})
export class SessionConfComponent {

  private workspaceService = inject(WorkspaceService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  sessionForm = this.fb.group({
    name: ['', [Validators.required]],
    color: ['', [Validators.required]],
    workDuration: [0, [Validators.required, Validators.min(3)]],
    shortBreak: [0, [Validators.required, Validators.min(3)]],
    longBreak: [0, [Validators.required, Validators.min(3)]],
    sessionsUntilLongBreak: [0, [Validators.required]],
  })
  isOpen = input<boolean>();
  session = signal<Session | null>(null);
  close = output<void>();
  xIcon = X;


  constructor() {
    effect(async () => {
      if (this.isOpen()) {
        this.session.set(this.workspaceService.currentSession() as Session);
        this.sessionForm.patchValue({
          name: this.session()?.name,
          color: this.session()?.color,
          workDuration: this.session()?.pomodoroConfig?.workDuration,
          shortBreak: this.session()?.pomodoroConfig?.shortBreak,
          longBreak: this.session()?.pomodoroConfig?.longBreak,
          sessionsUntilLongBreak: this.session()?.pomodoroConfig?.sessionsUntilLongBreak,
        })
      } else {
      }
    });
  }
  async updateSession() {
    try {

    } catch (error) {
      console.error(error);
    }
  }

}
