import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';

@Component({
  selector: 'app-cloud-gate',
  imports: [],
  templateUrl: './cloud-gate.html',
  styleUrl: './cloud-gate.css',
})
export class CloudGate implements OnInit {
  isLoading = signal(true);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const timer = setTimeout(() => this.isLoading.set(false), 1000);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }
}