import { IUserRepository } from '~/modules/user/domain/user.repository.interface';
import { User } from '~/modules/user/domain/user.entity';
import pool from '~/config/database';

export class UserRepositoryPostgres implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0 || !result.rows[0]) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      name: string;
      email: string;
      created_at: Date;
      updated_at: Date;
    };

    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0 || !result.rows[0]) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      name: string;
      email: string;
      created_at: Date;
      updated_at: Date;
    };

    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (name, email, created_at, updated_at)
            VALUES ($1, $2, NOW(), NOW())
            RETURNING *`,
      [user.name, user.email],
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create user');
    }

    const row = result.rows[0] as {
      id: string;
      name: string;
      email: string;
      created_at: Date;
      updated_at: Date;
    };

    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
