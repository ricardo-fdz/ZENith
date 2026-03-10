import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FieldErrorComponent } from "../../shared/components/field-error/field-error.component";
import { AUTH_ERRORS } from '../../core/utils/auth-errors';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  loading = signal(false);
  submitted = signal(false);
  private fb = inject(FormBuilder);

  errorMessage = signal('');

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', [Validators.required, Validators.minLength(6)]]
  });



  async onRegister() {
    if (this.registerForm.invalid) return;

    this.loading.set(true);
    const { email, password, name } = this.registerForm.value;
    if (!name || !email || !password) return;
    try {
      await this.authService.registerWithEmail(email, password, name);
      this.router.navigate(['/workspace']);
    } catch (error:any) {
      console.error("Error en el registro:", error);
      this.errorMessage.set(AUTH_ERRORS[error.code] || AUTH_ERRORS["default"]);

    } finally {
      this.loading.set(false);
    }
  }

  async onLoginWithGoogle() {
    this.loading.set(true);
    try {
      await this.authService.loginWithGoogle()
      // 3. Verificamos si tenemos usuario tras el login

    } catch(error:any) {
      console.error("Error en la autenticación");
      this.errorMessage.set(AUTH_ERRORS[error.code] || AUTH_ERRORS["default"]);
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
