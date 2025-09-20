import {Pool} from "pg";

const pool = new Pool({
    user: 'postgres',
    database: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
});

export default pool;