export class DiagnoseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiagnoseInputError';
  }
}
