import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-count-up',
  standalone: true,
  imports: [DecimalPipe],
  template: `{{ display | number:format }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountUp implements OnDestroy {
  @Input() set value(target: number) { this.animateTo(target); }
  @Input() format = '1.0-0';

  display = 0;
  private raf = 0;
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  animateTo(target: number) {
    cancelAnimationFrame(this.raf);
    const start = this.display;
    const duration = 700;
    const t0 = performance.now();

    this.ngZone.runOutsideAngular(() => {
      const step = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        this.display = parseFloat((start + (target - start) * eased).toFixed(
          this.format.includes('.') ? parseInt(this.format.split('-')[1] ?? '0') : 0
        ));
        this.cdr.detectChanges();
        if (p < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    });
  }

  ngOnDestroy() { cancelAnimationFrame(this.raf); }
}
