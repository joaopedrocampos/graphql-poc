/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('verification_sessions', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users(id)',
            onDelete: 'CASCADE',
        },
        orb_id: {
            type: 'uuid',
            notNull: true,
            references: 'orbs(id)',
            onDelete: 'CASCADE',
        },
        started_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        completed_at: {
            type: 'timestamp',
            notNull: false,
        },
        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'PENDING',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    pgm.addConstraint('verification_sessions', 'verification_sessions_status_check', {
        check: "status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED')",
    });

    pgm.createIndex('verification_sessions', 'user_id');
    pgm.createIndex('verification_sessions', 'orb_id');
    pgm.createIndex('verification_sessions', 'status');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('verification_sessions');
};
