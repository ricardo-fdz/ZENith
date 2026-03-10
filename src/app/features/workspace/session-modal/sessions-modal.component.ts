import { Component, computed, effect, EventEmitter, inject, input, output, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrowLeft, LucideAngularModule, PencilRuler, Sparkles, WorkflowIcon, X } from "lucide-angular";
import { WorkspaceService } from '../../../core/sessions/workspace.service';
import { UserService } from '../../../core/user/user.service';
import { Session } from '../../../core/models/workspace.model';
import { FormsModule } from "@angular/forms";
import { SessionFormComponent } from '../session-form.component';

@Component({
  selector: 'zen-session-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, SessionFormComponent],
  templateUrl: './session-modal-component.html',
  styles: `

  `
})
export class SessionModalComponent {
  private workspaceService = inject(WorkspaceService);
  private userService = inject(UserService);
  isOpen = input<boolean>();
  session = input<any>();
  close = output<void>();
  xIcon = X;
  backIcon = ArrowLeft;
workIcon = PencilRuler
  searchTerm = signal('');
  sessions = signal<Session[] | null>([]);
  isNewSelected = signal(false);

  constructor() {
    effect(async () => {
      if (this.isOpen()) {
        const user = this.userService.currentUserProfile();
        console.log(user);

        if (user?.uid) {
          const data = await this.workspaceService.getSessions(user.uid);
          this.sessions.set(data);
        }
      } else {
        this.isNewSelected.set(false);
      }
    });
  }
  selectSession(session: Session) {
    this.workspaceService.currentSession.set(session);
    this.close.emit(); // Función para cerrar el modal
  }
  filteredSessions = computed(() => {
    const text = this.searchTerm().toLowerCase();
    return this.sessions()?.filter(s => s.name.toLowerCase().includes(text));
  });
}
