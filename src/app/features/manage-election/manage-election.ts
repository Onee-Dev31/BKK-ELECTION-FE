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

  // TAB 1
  form!: FormGroup;
  autoRefreshEnabled = false;
  refreshSeconds = 2;
  private intervalId: any;
  countedPercentage = 0;

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
    // หยุด auto refresh
    clearInterval(this.intervalId);

    this.autoRefreshEnabled = false;

    localStorage.removeItem('token');

    this.router.navigate(['/admin-login']);
  }

  get candidates(): FormArray {
    return this.form.get('candidates') as FormArray;
  }

  // TAB 1
  onRefreshSecondsChange(): void {
    if (this.autoRefreshEnabled) {
      this.toggleAutoRefresh();
    }
  }

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
    const payload = {
      candidates: this.candidates.controls.map((candidate: any) => ({
        name: candidate.value.name,
        imageUrl: candidate.value.imageUrl,
        partyName: candidate.value.partyName,
        partyLogoUrl: candidate.value.partyLogoUrl,
        votes: Number(candidate.value.votes),
        counted: `${this.countedPercentage}%`,
      })),
    };

    console.log(payload);

    const result: any = {};

    this.candidates.controls.forEach((candidate: any, index: number) => {
      const value = candidate.value;

      result[`rank${index + 1}`] = {
        candidate_name: value.name,
        candidate_img: value.imageUrl,
        party_name: value.partyName,
        party_logo: value.partyLogoUrl,
        score: Number(value.votes),
        counted: `${this.countedPercentage}%`,
      };
    });

    this.authService.generateManual(payload).subscribe({
      next: (res) => {
        console.log('Success', res);
      },
      error: (err) => {
        console.error(err);
      },
    });

    this.jsonPreview = JSON.stringify(result, null, 2);
  }

  refresh(): void {
    this.authService.getElectionJson(this.autoRefreshEnabled, this.refreshSeconds).subscribe({
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
