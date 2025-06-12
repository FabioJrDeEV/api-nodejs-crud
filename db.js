import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

//Conexão do db PostgreSQL

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
