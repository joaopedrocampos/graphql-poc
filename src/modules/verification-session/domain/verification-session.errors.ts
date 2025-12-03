export class VerificationSessionNotFoundError extends Error {
  constructor(id: string) {
    super(`Verification session with id ${id} not found`);
    this.name = 'VerificationSessionNotFoundError';
  }
}

export class VerificationSessionAlreadyCompletedError extends Error {
  constructor(id: string) {
    super(`Verification session with id ${id} is already completed`);
    this.name = 'VerificationSessionAlreadyCompletedError';
  }
}
