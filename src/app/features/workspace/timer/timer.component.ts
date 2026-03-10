import { ChevronLast, LucideAngularModule, Pause, Play, Square } from 'lucide-angular';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceService } from '../../../core/sessions/workspace.service';
import { UserService } from '../../../core/user/user.service';
import { PomodoroLog } from '../../../core/models/workspace.model';

@Component({
  selector: 'zen-timer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './timer.component.html',
  host: {
    'class': 'flex flex-col justify-center items-center my-3 sm:my-4 md:my-3 lg:my-5 flex-1 min-h-0 gap-3 sm:gap-4 md:gap-5 lg:gap-8'
  }
})
export class TimerComponent {
  workspaceService = inject(WorkspaceService);
  userService = inject(UserService)
  currentSession = this.workspaceService.currentSession();
  readonly stopIcon = Square;
  readonly playIcon = Play;
  readonly pauseIcon = Pause;
  readonly skipIcon = ChevronLast
  currentTimeLeft = signal(0);
  currentTime = signal(Date.now())
  periodType = signal('work');
  timerPauseOffset = signal(0);
  hiddenTimer = signal(false);

  isRunning = signal(false);
  private totalDurationMs = signal(0);
  private endTime: number = 0;
  private animationFrameId: number = 0;
  private workSessionCount = signal(0);
  private pomodoroLogItem = signal<PomodoroLog | null>(null)

  displayTime = computed(() => {
    const ms = this.currentTimeLeft();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    effect(() => {
      this.currentSession = (this.workspaceService.currentSession());
      if (this.currentSession) {
        if (this.currentSession.pomodoroConfig.workDuration)
          this.currentTimeLeft.set(this.currentSession.pomodoroConfig.workDuration * 60 * 1000);
      }
    });
  }
  startTimer() {
    this.playSound('start');
    this.isRunning.set(true)
    const session = this.workspaceService.currentSession();
    const minutes = session?.pomodoroConfig.workDuration || 25;
    this.pomodoroLogItem.set({
      userId: this.userService.currentUserProfile()?.uid || '',
      sessionId: session?.id || '',
      type: this.periodType() as 'work' | 'short_break' | 'long_break' || 'work',
      plannedDuration: minutes,
      startedAt: new Date(),
    })
    this.totalDurationMs.set(minutes * 60 * 1000);

    this.endTime = Date.now() + (this.timerPauseOffset() ? this.timerPauseOffset() : this.totalDurationMs());
    this.timerPauseOffset.set(0);
    const update = () => {
      const now = Date.now();
      const remaining = this.endTime - now;
      if (remaining <= 0) {
        this.currentTimeLeft.set(0);
        this.handleTimerFinished();
        return;
      }

      this.currentTimeLeft.set(remaining);
      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  handleTimerFinished() {
    const current = this.periodType();
    const session = this.workspaceService.currentSession()?.pomodoroConfig;
    this.pomodoroLogItem.set({
      ...this.pomodoroLogItem(),
      actualDuration: (current == 'work'
        ? session?.workDuration
        : current == 'short_break'
          ? session?.shortBreak
          : session?.longBreak) ?? undefined,
      endedAt: new Date()
    } as PomodoroLog);
    console.log(this.pomodoroLogItem());

    if (current === 'work') {
      if (this.workSessionCount() == 3) {
        this.periodType.set('lonBreak');
        this.currentTimeLeft.set((session?.longBreak || 5) * 60 * 1000);
      } else {
        this.periodType.set('shortBreak');
        this.currentTimeLeft.set((session?.shortBreak || 5) * 60 * 1000);
      }
    } else {
      this.periodType.set('work');
      this.currentTimeLeft.set((session?.workDuration || 25) * 60 * 1000);
    }

    this.playSound('end');

    this.endTime = Date.now() + this.currentTimeLeft();

    this.requestNextFrame();
  }

  private requestNextFrame() {
    this.animationFrameId = requestAnimationFrame(() => this.updateLoop());
  }

  private updateLoop() {
    const now = Date.now();
    const remaining = this.endTime - now;

    if (remaining <= 0) {
      this.currentTimeLeft.set(0);
      this.handleTimerFinished();
      return;
    }

    this.currentTimeLeft.set(remaining);
    this.requestNextFrame();
  }
  pauseTimer() {
    const now = Date.now();
    this.timerPauseOffset.set(this.endTime - now)
    cancelAnimationFrame(this.animationFrameId);
    this.isRunning.set(false);
  }

  private playSound(type: string) {
    const audio = new Audio('../../../../assets/' + type + '.wav')
    console.log(audio);

    audio.play();
  }
}
