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
    const client = await pool.connect();
    try {
        const selectQuery = 'SELECT url FROM url WHERE short_code = $1';
        const result = await client.query(selectQuery, [shortCode]);
        if (result.rows.length > 0) {
            console.log(result);
            return result.rows[0].url.split(",")[1];
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
}