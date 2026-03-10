import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Component({
  selector: 'field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (control?.invalid && control?.touched) {
      <span class="text-red-500 text-xs mt-1 block">
        @if (control?.hasError('required')) { Este campo es obligatorio }
        @if (control?.hasError('email')) { El email no es válido }
        @if (control?.hasError('minlength')) {
          Mínimo {{ control?.getError('minlength').requiredLength }} caracteres
        }
      </span>
    }
  `
})
export class FieldErrorComponent {
  @Input() control?: AbstractControl | null;
}
