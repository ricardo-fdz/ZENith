import { AuthService } from '../../core/auth/auth.service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'zen-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  authService = inject(AuthService);
  loginForm: FormGroup;
  loading = signal(false);
  submitted = signal(false);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    // Add authentication logic here
    console.log(this.loginForm.value);
  }
  async onLoginWithGoogle() {
    this.loading.set(true);
    try {
      await this.authService.loginWithGoogle()
      // 3. Verificamos si tenemos usuario tras el login

    } catch {
      console.error("Error en la autenticación");
    }
    finally {
      if (this.authService.currentUser()) {
        console.log("Usuario autenticado, redirigiendo...");

        // REDIRECCIÓN AQUÍ: Es el flujo de éxito.
        await this.router.navigate(['/workspace/sessions']);
      }
      this.loading.set(false);
    }
  }
}
