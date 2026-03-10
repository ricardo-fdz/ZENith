import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../../../core/sessions/workspace.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../core/models/workspace.model';
import { UserService } from '../../../core/user/user.service';
import { Funnel, ListFilter, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'zen-tasks',
  host: {
    'class': 'flex flex-col flex-1 lg:flex-none p-4 sm:p-6 lg:p-8 gap-4 w-full h-1/2 lg:h-auto lg:w-1/2 bg-dark-teal-700 text-white overflow-hidden shadow-2xl scrollbar-hide'
  },
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,LucideAngularModule],
  templateUrl: './tasks.component.html',
})
export class TaskComponent {
  filterIcon = Funnel;
  workspaceService = inject(WorkspaceService);
  userService = inject(UserService);
  fb = inject(FormBuilder)
  tasks = signal<Task[] | null>([]);
  showGlobalTasks = signal<boolean>(false);
  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    isGlobal: [false]
  })

  constructor() {
    effect(async () => {
      const user = this.userService.currentUserProfile();
      if (user?.uid) {
        const data = await this.workspaceService.getTasks(user.uid);
        this.tasks.set(data);
      };
    })
  }

  filteredTasks = computed(() => {
    const allTasks = this.tasks() || [];
    const currentSessionId = this.workspaceService.currentSession()?.id;

    const includeGlobal = this.showGlobalTasks();

    return allTasks.filter(task => {
      const isFromCurrentSession = task.sessionId === currentSessionId;
      const isVisibleGlobal = task.isGlobal && includeGlobal;

      return isFromCurrentSession || isVisibleGlobal;
    });
  });

  async createTask() {
    const { title, isGlobal } = this.taskForm.value;
    if (!title || isGlobal == null) return;
    try {
      await this.workspaceService.addTask(title, isGlobal as boolean);
      this.tasks.update((currentTasks) => {
        const newTask: Task = {
          userId: this.userService.currentUserProfile()?.uid || '',
          id: 'temp-' + Date.now(), // ID temporal hasta que Firebase responda
          title: title,
          isGlobal: isGlobal,
          status: 'pending',
          createdAt: new Date(),
          sessionId: this.workspaceService.currentSession()?.id
        };
        if (!currentTasks) return [newTask];
        return [...currentTasks, newTask]
      }
      )
      this.taskForm.reset({
        title: '',
        isGlobal: false
      });
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
    }
  }
  async loadTasks() {

  }
}
