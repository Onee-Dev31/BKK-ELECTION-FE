import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  private readonly STORAGE_KEY = 'bkk-theme';

  isDark = signal<boolean>(this.loadSaved());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle() {
    this.isDark.update(v => !v);
  }

  private loadSaved(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== 'light';
  }
}
