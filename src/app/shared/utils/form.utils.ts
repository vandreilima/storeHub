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
