import { VerificationSession } from './verification-session.entity';

export interface IVerificationSessionRepository {
    findById(id: string): Promise<VerificationSession | null>;
    findByUserId(userId: string): Promise<VerificationSession[]>;
    create(session: Omit<VerificationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<VerificationSession>;
    updateStatus(id: string, status: VerificationSession['status'], completedAt?: Date): Promise<VerificationSession>;
}

