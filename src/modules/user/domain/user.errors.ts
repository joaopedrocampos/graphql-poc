export class UserNotFoundError extends Error {
    constructor(id: string) {
        super(`User with id ${id} not found`);
        this.name = 'UserNotFoundError';
    }
}

export class UserEmailAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
        this.name = 'UserEmailAlreadyExistsError';
    }
}