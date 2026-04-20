import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

const ELECTION_DATE = new Date('2026-06-28T08:00:00');

export const electionGuard: CanActivateFn = () => {
  if (new Date() >= ELECTION_DATE) return true;
  inject(Router).navigate(['/coming-soon']);
  return false;
};
