import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.css',
})
export class ComingSoon implements OnInit, OnDestroy {
  private readonly TARGET_DATE = new Date('2026-06-28T08:00:00');
  private intervalId: ReturnType<typeof setInterval> | null = null;
  baseUrl = environment.api_url;
  timeLeft = signal<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  isExpired = signal(false);

  ngOnInit() {
    this.updateCountdown();
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private updateCountdown() {
    const now = new Date().getTime();
    const target = this.TARGET_DATE.getTime();
    const diff = target - now;

    if (diff <= 0) {
      this.isExpired.set(true);
      this.timeLeft.set({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (this.intervalId) clearInterval(this.intervalId);
      return;
    }

    this.timeLeft.set({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    });
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
