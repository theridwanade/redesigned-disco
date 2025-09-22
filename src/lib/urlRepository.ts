import pool from "../db/pool";

export const saveUrl = async ({shortCode, url}: { shortCode: string, url: string }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertQuery = 'INSERT INTO url (original_url, short_code) VALUES ($1, $2)';
        await client.query(insertQuery, [url, shortCode]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
export const getUrl = async (shortCode: string): Promise<string | null> => {
    try {
        const query = 'SELECT original_url FROM url WHERE short_code = $1';
        const { rows } = await pool.query(query, [shortCode]);
        return rows[0]?.original_url ?? null;
    } catch (err) {
        console.error('getUrl error', err);
        throw err;
    }
};
