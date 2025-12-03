export class OrbNotFound extends Error {
    constructor(id: string) {
        super(`Orb with id ${id} not found`);
        this.name = 'OrbNotFound';
    }
}
