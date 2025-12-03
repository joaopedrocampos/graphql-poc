import pool from '~/config/database';
import { Orb } from '~/modules/orb/domain/orb.entity';
import { OrbNotFoundError } from '~/modules/orb/domain/orb.errors';
import { Location, OrbStatus } from '~/modules/orb/domain/orb.types';
import { IOrbRepository } from '~/modules/orb/infra/orb.repository.interface';

export class OrbRepositoryPostgres implements IOrbRepository {
  async findById(id: string): Promise<Orb | null> {
    const result = await pool.query('SELECT * FROM orbs WHERE id = $1', [id]);

    if (result.rowCount === 0 || !result.rows[0]) {
      return null;
    }

    const row = result.rows[0] as {
      id: string;
      serial_number: string;
      location: string | Location;
      status: OrbStatus;
      created_at: Date;
      updated_at: Date;
    };

    // Parse JSONB location se necessário
    const location: Location =
      typeof row.location === 'string' ? (JSON.parse(row.location) as Location) : row.location;

    return new Orb({
      id: row.id,
      serialNumber: row.serial_number,
      location,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async create(orb: Omit<Orb, 'id' | 'createdAt' | 'updatedAt'>): Promise<Orb> {
    const result = await pool.query(
      `INSERT INTO orbs (serial_number, location, status, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *`,
      [orb.serialNumber, JSON.stringify(orb.location), orb.status],
    );

    if (!result.rows[0]) {
      throw new Error('Failed to create orb');
    }

    const row = result.rows[0] as {
      id: string;
      serial_number: string;
      location: string | Location;
      status: OrbStatus;
      created_at: Date;
      updated_at: Date;
    };

    // Parse JSONB location se necessário
    const location: Location =
      typeof row.location === 'string' ? (JSON.parse(row.location) as Location) : row.location;

    return new Orb({
      id: row.id,
      serialNumber: row.serial_number,
      location,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async updateStatus(id: string, orbStatus: OrbStatus): Promise<Orb> {
    const result = await pool.query(
      `UPDATE orbs
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *`,
      [orbStatus, id],
    );

    if (result.rowCount === 0 || !result.rows[0]) {
      throw new OrbNotFoundError(id);
    }

    const row = result.rows[0] as {
      id: string;
      serial_number: string;
      location: string | Location;
      status: OrbStatus;
      created_at: Date;
      updated_at: Date;
    };

    // Parse JSONB location se necessário
    const location: Location =
      typeof row.location === 'string' ? (JSON.parse(row.location) as Location) : row.location;

    return new Orb({
      id: row.id,
      serialNumber: row.serial_number,
      location,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByIds(ids: string[]): Promise<(Orb | null)[]> {
    if (ids.length === 0) {
      return [];
    }

    const result = await pool.query(`SELECT * FROM orbs WHERE id = ANY($1::uuid[])`, [ids]);

    const orbsMap = new Map<string, Orb>();
    result.rows.forEach((row) => {
      const rowTyped = row as {
        id: string;
        serial_number: string;
        location: string | Location;
        status: OrbStatus;
        created_at: Date;
        updated_at: Date;
      };

      // Parse JSONB location se necessário
      const location: Location =
        typeof rowTyped.location === 'string'
          ? (JSON.parse(rowTyped.location) as Location)
          : rowTyped.location;

      const orb = new Orb({
        id: rowTyped.id,
        serialNumber: rowTyped.serial_number,
        location,
        status: rowTyped.status,
        createdAt: rowTyped.created_at,
        updatedAt: rowTyped.updated_at,
      });
      orbsMap.set(rowTyped.id, orb);
    });

    return ids.map((id) => orbsMap.get(id) || null);
  }
}
