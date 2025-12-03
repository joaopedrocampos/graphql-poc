export class User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(user: Partial<User>) {
        this.id = user.id || '';
        this.name = user.name || '';
        this.email = user.email || '';
        this.createdAt = user.createdAt || new Date();
        this.updatedAt = user.updatedAt || new Date();
    }
}