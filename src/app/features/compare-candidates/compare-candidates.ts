import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectionService } from '../../core/services/election.service';
import { CandidatePolicy } from '../../core/models/election.models';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';

interface Tilt { rotX: number; rotY: number; glareX: number; glareY: number; active: boolean; }

const RESET: Tilt = { rotX: 0, rotY: 0, glareX: 50, glareY: 50, active: false };

@Component({
  selector: 'app-compare-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-candidates.html',
  styleUrl: './compare-candidates.css'
})
export class CompareCandidates {
  electionService = inject(ElectionService);
  candidates = this.electionService.candidates;

  selectedIdA = signal<number>(1);
  selectedIdB = signal<number>(2);

  candidateA = computed(() => this.candidates().find(c => c.id === this.selectedIdA()));
  candidateB = computed(() => this.candidates().find(c => c.id === this.selectedIdB()));

  tiltA = signal<Tilt>({ ...RESET });
  tiltB = signal<Tilt>({ ...RESET });

  getImageUrl(number: number): string {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', number.toString());
  }

  onMove(e: MouseEvent, side: 'A' | 'B') {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const tilt: Tilt = {
      rotX: -((y / r.height) - 0.5) * 22,
      rotY:  ((x / r.width)  - 0.5) * 22,
      glareX: (x / r.width)  * 100,
      glareY: (y / r.height) * 100,
      active: true
    };
    side === 'A' ? this.tiltA.set(tilt) : this.tiltB.set(tilt);
  }

  onLeave(side: 'A' | 'B') {
    side === 'A' ? this.tiltA.set({ ...RESET }) : this.tiltB.set({ ...RESET });
  }

  tiltStyle(t: Tilt) {
    return {
      transform: t.active
        ? `perspective(900px) rotateX(${t.rotX}deg) rotateY(${t.rotY}deg) scale3d(1.04,1.04,1.04)`
        : 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: t.active ? 'transform 0.08s ease' : 'transform 0.5s cubic-bezier(.23,1,.32,1)'
    };
  }

  glareStyle(t: Tilt) {
    return {
      background: `radial-gradient(circle at ${t.glareX}% ${t.glareY}%, rgba(255,255,255,0.35) 0%, transparent 65%)`,
      opacity: t.active ? '1' : '0',
      transition: 'opacity 0.3s ease'
    };
  }

  getPolicies(candidateId: number | undefined): CandidatePolicy[] {
    if (!candidateId) return [];
    return this.electionService.getCandidatePolicies(candidateId);
  }
}
