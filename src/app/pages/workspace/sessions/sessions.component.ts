import { Component, signal, inject, Pipe, effect, computed } from '@angular/core';
import { ChevronLast, Cog, LucideAngularModule, Pause, Play, Square } from 'lucide-angular';
import { WorkspaceService } from '../../../core/sessions/workspace.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/user/user.service';
import { SessionModalComponent } from "../../../features/workspace/session-modal/sessions-modal.component";
import { TaskComponent } from "../../../features/workspace/tasks/tasks.component";
import { SessionConfComponent } from '../../../features/workspace/session-conf-modal/session-conf-modal.component';
import { DecimalPipe } from '@angular/common';
import { TimerComponent } from "../../../features/workspace/timer/timer.component";

@Component({
  selector: 'zen-sessions',
  imports: [LucideAngularModule, ReactiveFormsModule, SessionModalComponent, TaskComponent, SessionConfComponent, TimerComponent],
  templateUrl: './sessions.component.html',

  //styleUrl: './sessions.component.scss',
})
export class SessionsComponent {


  readonly confIcon = Cog;
  isSessionModalOpen = false;
  isSessionConfModalOpen = false;
  workspaceService = inject(WorkspaceService);
  userService = inject(UserService)
  currentSession = this.workspaceService.currentSession();

  private fb = inject(FormBuilder);



  constructor() {
    effect(() => {
      this.currentSession = (this.workspaceService.currentSession());
    });
  }

  sessionForm = this.fb.group({
    name: ['Nueva sesión', [Validators.required]],
    color: ['154651', [Validators.required]],
  })

  async createNewSession() {
    const { name, color } = this.sessionForm.value;
    if (!name || !color) return;
    try {
      const sessionId = await this.workspaceService.createSession(name, color);
    } catch {

    }
  }

  showSessionModal() {
    this.isSessionModalOpen = true;
  }
  showSessionConfModal() {
    this.isSessionConfModalOpen = true;
  }

}
