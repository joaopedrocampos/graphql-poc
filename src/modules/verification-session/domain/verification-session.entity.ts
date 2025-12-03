import { VerificationSessionStatus } from './verification-session.types';

export class VerificationSession {
    id: string;
    userId: string;
    orbId: string;
    startedAt: Date;
    completedAt: Date | null;
    status: VerificationSessionStatus;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<VerificationSession>) {
        this.id = data.id || '';
        this.userId = data.userId || '';
        this.orbId = data.orbId || '';
        this.startedAt = data.startedAt || new Date();
        this.completedAt = data.completedAt || null;
        this.status = data.status || 'PENDING';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
}

