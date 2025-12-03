export class OrbNotFoundError extends Error {
  constructor(id: string) {
    super(`Orb with id ${id} not found`);
    this.name = 'OrbNotFoundError';
  }
}
