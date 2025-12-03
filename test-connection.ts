import pool from './src/config/database';

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(result.rows[0]);
        console.log('Connection to database successful');
    } catch (error) {
        console.error('Error connecting to database:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testConnection();