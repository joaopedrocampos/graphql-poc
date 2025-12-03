import pool from '../../../config/database';
import { VerificationSession } from '../domain/verification-session.entity';
import { IVerificationSessionRepository } from '../domain/verification-session.repository.interface';

export class VerificationSessionRepositoryPostgres implements IVerificationSessionRepository {
    async findById(id: string): Promise<VerificationSession | null> {
        const result = await pool.query(
            `SELECT id, user_id, orb_id, started_at, completed_at, status, created_at, updated_at
             FROM verification_sessions
             WHERE id = $1`,
            [id],
        );

        if (result.rowCount === 0) {
            return null;
        }

        const row = result.rows[0];
        return new VerificationSession({
            id: row.id,
            userId: row.user_id,
            orbId: row.orb_id,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async findByUserId(userId: string): Promise<VerificationSession[]> {
        const result = await pool.query(
            `SELECT id, user_id, orb_id, started_at, completed_at, status, created_at, updated_at
             FROM verification_sessions
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId],
        );

        return result.rows.map((row) => new VerificationSession({
            id: row.id,
            userId: row.user_id,
            orbId: row.orb_id,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
    }

    async create(session: Omit<VerificationSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<VerificationSession> {
        const result = await pool.query(
            `INSERT INTO verification_sessions (user_id, orb_id, started_at, completed_at, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id, user_id, orb_id, started_at, completed_at, status, created_at, updated_at`,
            [session.userId, session.orbId, session.startedAt, session.completedAt, session.status],
        );

        const row = result.rows[0];
        return new VerificationSession({
            id: row.id,
            userId: row.user_id,
            orbId: row.orb_id,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }

    async updateStatus(id: string, status: VerificationSession['status'], completedAt?: Date): Promise<VerificationSession> {
        const result = await pool.query(
            `UPDATE verification_sessions
             SET status = $1, completed_at = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING id, user_id, orb_id, started_at, completed_at, status, created_at, updated_at`,
            [status, completedAt || null, id],
        );

        if (result.rowCount === 0) {
            throw new Error('Verification session not found');
        }

        const row = result.rows[0];
        return new VerificationSession({
            id: row.id,
            userId: row.user_id,
            orbId: row.orb_id,
            startedAt: row.started_at,
            completedAt: row.completed_at,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}

