import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  isDark = signal<boolean>(true);

  constructor() {
    // Apply class to <html> whenever the signal changes
    effect(() => {
      const html = document.documentElement;
      if (this.isDark()) {
        html.classList.add('dark');
        html.classList.remove('light');
      } else {
        html.classList.add('light');
        html.classList.remove('dark');
      }
    });
  }

  toggle() {
    this.isDark.update(v => !v);
  }
}
