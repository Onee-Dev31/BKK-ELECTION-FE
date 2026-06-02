import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: (res) => {
        console.log('Login Success', res);

        localStorage.setItem('token', res.accessToken);

        // navigate ไปหน้า dashboard
        this.router.navigate(['/manage']);
      },
      error: (err) => {
        alert('ไม่มีสิทธิ์เข้าถึง');
        // alert(err.error?.message || 'Login Failed');
      },
    });
  }
}
