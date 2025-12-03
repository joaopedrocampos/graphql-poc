import { IUserRepository } from '../domain/user.repository.interface';
import { User } from '../domain/user.entity';
import pool from '../../../config/database';

export class UserRepositoryPostgres implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return new User({
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rowCount === 0) {
            return null;
        }

        return new User({
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }

    async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (name, email, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING *`,
            [user.name, user.email]
        );

        return new User({
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }
}