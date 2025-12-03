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
    pgm.createTable('orbs', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        serial_number: {
            type: 'varchar(256)',
            notNull: true,
            unique: true,
        },
        location: {
            type: 'jsonb',
            notNull: true,
        },
        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'INACTIVE',
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

    pgm.addConstraint('orbs', 'orbs_status_check', {
        check: "status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('orbs');
};
