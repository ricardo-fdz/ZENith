import { AuthService } from '../../core/auth/auth.service';
import { Component, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_ERRORS } from '../../core/utils/auth-errors';
import { FieldErrorComponent } from '../../shared/components/field-error/field-error.component';

@Component({
  selector: 'zen-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [RouterLink, ReactiveFormsModule, FieldErrorComponent]
})
export class LoginComponent {
  authService = inject(AuthService);
  loading = signal(false);
  submitted = signal(false);
  router = inject(Router)
  fb = inject(FormBuilder)
  routerLink = RouterLink;
  errorMessage = signal('');
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get f() {
    return this.loginForm.controls;
  }

  async onLoginWithGoogle() {


    this.loading.set(true);
    try {
      const result = await this.authService.loginWithGoogle(); // Tu método existente
      if (result.user) {
        this.router.navigate(['/workspace']);
      }

    } catch (error: any) {
      this.errorMessage.set(AUTH_ERRORS[error.code] || AUTH_ERRORS["default"]);
      console.log("Error en la autenticación: ", error.code);
    }
    finally {
      if (this.authService.currentUser()) {
        console.log("Usuario autenticado, redirigiendo...");
        await this.router.navigate(['/workspace/sessions']);
      }
      this.loading.set(false);
    }
  }
  async onLogin() {
    if (!this.loginForm.valid) {
      console.log(this.loginForm.valid);

      this.errorMessage.set("Revise las credenciales")
    }
    const { email, password } = this.loginForm.value; // Suponiendo que usas ReactiveForms
    if (!email || !password) return;

    try {
      await this.authService.loginWithEmail(email, password);
      this.router.navigate(['/workspace/sessions']); // Redirigir al dashboard zen
    } catch (error: any) {
      this.errorMessage.set(AUTH_ERRORS[error.code] || AUTH_ERRORS["default"]);
      console.log("Error de acceso:", error.code);
    }
  }
}
