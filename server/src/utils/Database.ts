import dotenv from "dotenv";
import mysql from "mysql2/promise";
import type { Pool, PoolConnection, RowDataPacket, FieldPacket } from "mysql2/promise";
import type { QueryResult } from "mysql2";

dotenv.config();

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  async queryRows<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await this.pool.execute<T>(sql, params);
    return rows;
  }

  async execute<T extends QueryResult = QueryResult>(
    sql: string,
    params?: any[]
  ): Promise<[T, FieldPacket[]]> {
    return this.pool.execute<T>(sql, params);
  }

  async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
