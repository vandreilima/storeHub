import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class FormUtils {
  /**
   * Validador para telefone brasileiro
   * @returns ValidatorFn
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');

      // Verifica se tem 10 ou 11 dígitos (com DDD)
      if (numbers.length < 10 || numbers.length > 11) {
        return { phoneNumber: true };
      }

      return null;
    };
  }

  /**
   * Validador para CPF brasileiro
   * @returns ValidatorFn
   */
  static cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Remove caracteres não numéricos
      const cpf = value.replace(/\D/g, '');

      // Verifica se tem 11 dígitos
      if (cpf.length !== 11) {
        return { cpf: true };
      }

      // Verifica se todos os dígitos são iguais (CPF inválido)
      if (/^(\d)\1{10}$/.test(cpf)) {
        return { cpf: true };
      }

      // Validação do primeiro dígito verificador
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      const firstDigit = remainder >= 10 ? 0 : remainder;

      if (firstDigit !== parseInt(cpf.charAt(9))) {
        return { cpf: true };
      }

      // Validação do segundo dígito verificador
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      const secondDigit = remainder >= 10 ? 0 : remainder;

      if (secondDigit !== parseInt(cpf.charAt(10))) {
        return { cpf: true };
      }

      return null;
    };
  }

  /**
   * Validador para CNPJ brasileiro
   * @returns ValidatorFn
   */
  static cnpjValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      // Remove caracteres não numéricos
      const cnpj = value.replace(/\D/g, '');

      // Verifica se tem 14 dígitos
      if (cnpj.length !== 14) {
        return { taxId: true };
      }

      // Verifica se todos os dígitos são iguais (CNPJ inválido)
      if (/^(\d)\1{13}$/.test(cnpj)) {
        return { cnpj: true };
      }

      // Validação do primeiro dígito verificador
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights1[i];
      }
      let remainder = sum % 11;
      const firstDigit = remainder < 2 ? 0 : 11 - remainder;

      if (firstDigit !== parseInt(cnpj.charAt(12))) {
        return { cnpj: true };
      }

      // Validação do segundo dígito verificador
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights2[i];
      }
      remainder = sum % 11;
      const secondDigit = remainder < 2 ? 0 : 11 - remainder;

      if (secondDigit !== parseInt(cnpj.charAt(13))) {
        return { cnpj: true };
      }

      return null;
    };
  }
}
/**
 * Marca todos os campos do formulário como touched e dirty
 * @param formGroup FormGroup a ser marcado
 */
export function FORCE_FORM_FEEDBACK(formGroup: any): void {
  Object.keys(formGroup.controls).forEach((key) => {
    const control = formGroup.get(key);
    control?.markAsTouched();
    control?.markAsDirty();
  });
}
