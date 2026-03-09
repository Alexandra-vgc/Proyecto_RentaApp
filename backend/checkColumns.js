import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rentaapp',
});

(async () => {
  try {
    const res = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'solicitudes_arriendo' ORDER BY ordinal_position"
    );
    console.log('columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('error:', err);
  } finally {
    await pool.end();
  }
})();
