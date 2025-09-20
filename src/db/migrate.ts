import pool from "./pool";
import * as fs from "node:fs";
import * as path from "node:path";

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        //     Create migration tables if it does not exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations
            (
                id
                SERIAL
                PRIMARY
                KEY,
                name
                VARCHAR
            (
                255
            ) NOT NULL,
                run_on TIMESTAMP NOT NULL DEFAULT NOW
            (
            )
                );
        `);

        const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
        const files = fs.readdirSync(migrationsDir).filter(r => r.endsWith('.sql')).sort();

        // Get already applied migrations
        const applied = await client.query('SELECT name FROM migrations');
        const appliedNames = applied.rows.map(r => r.name);

        // Run new migrations
        for (const file of files) {
            if (!appliedNames.includes(file)) {
                const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                const [upSql] = content.split('-- Down');
                await client.query(upSql);
                await client.query('INSERT INTO migrations(name) VALUES($1)', [file]);
                console.log(`Applied: ${file}`);
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed', e);
    } finally {
        client.release();
    }
};

runMigrations();