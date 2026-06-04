import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-election',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-election.html',
  styleUrl: './manage-election.css',
})
export class ManageElection {
  activeTab = 1;

  jsonPreview = '';

  form!: FormGroup;

  // TAB 1
  autoRefreshEnabled = false;
  refreshSeconds = 5;
  private intervalId: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.form = this.fb.group({
      candidates: this.fb.array([]),
    });

    for (let i = 0; i < 5; i++) {
      this.candidates.push(
        this.fb.group({
          name: [''],
          imageUrl: [''],
          partyName: [''],
          partyLogoUrl: [''],
          votes: [0],
        }),
      );
    }
  }

  logout(): void {
    localStorage.removeItem('token');

    this.router.navigate(['/admin-login']);
  }

  get candidates(): FormArray {
    return this.form.get('candidates') as FormArray;
  }

  // TAB 1
  toggleAutoRefresh(): void {
    clearInterval(this.intervalId);

    if (this.autoRefreshEnabled) {
      this.refresh();

      this.intervalId = setInterval(() => {
        this.refresh();
      }, this.refreshSeconds * 1000);
    }
  }

  submit(): void {
    this.jsonPreview = JSON.stringify(this.form.value, null, 2);
  }

  refresh(): void {
    this.authService.getElectionJson().subscribe({
      next: (res: any) => {
        console.log(res);
        if (typeof res === 'string') {
          this.jsonPreview = JSON.stringify(JSON.parse(res), null, 2);
        } else {
          this.jsonPreview = JSON.stringify(res, null, 2);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
