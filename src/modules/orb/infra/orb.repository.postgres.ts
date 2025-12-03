import pool from "../../../config/database";
import { Orb } from "../domain/orb.entity";
import { OrbStatus } from "../domain/orb.types";
import { IOrbRepository } from "./orb.repository.interface";

export class OrbRepositoryPostgres implements IOrbRepository {
    async findById(id: string): Promise<Orb | null> {
        const result = await pool.query(
            'SELECT * FROM orbs WHERE id = $1',
            [id],
        );

        if (result.rowCount === 0) {
            return null;
        }

        return new Orb({
            id: result.rows[0].id,
            serialNumber: result.rows[0].serial_number,
            location: result.rows[0].location,
            status: result.rows[0].status,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }

    async create(orb: Omit<Orb, "id" | "createdAt" | "updatedAt">): Promise<Orb> {
        const result = await pool.query(
            `INSERT INTO orbs (serial_number, location, status, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *`,
            [orb.serialNumber, orb.location, orb.status],
        );

        return new Orb({
            id: result.rows[0].id,
            serialNumber: result.rows[0].serial_number,
            location: result.rows[0].location,
            status: result.rows[0].status,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }

    async updateStatus(id: string, orbStatus: OrbStatus): Promise<Orb> {
        const result = await pool.query(
            `UPDATE orbs
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
            `,
            [orbStatus, id]
        );

        if (result.rowCount === 0) {
            throw new Error ('Orb not found');
        }

        return new Orb({
            id: result.rows[0].id,
            serialNumber: result.rows[0].serial_number,
            location: result.rows[0].location,
            status: result.rows[0].status,
            createdAt: result.rows[0].created_at,
            updatedAt: result.rows[0].updated_at,
        });
    }
}