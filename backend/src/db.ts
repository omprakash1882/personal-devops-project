/**
 * Simple MySQL access — no ORM.
 * - Opens a connection pool from DATABASE_URL
 * - Creates tables if missing (plain SQL)
 * - Seeds sample rows once if the projects table is empty
 */
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";

function parseMysqlUrl(url: string) {
  const u = new URL(url);
  const database = u.pathname.replace(/^\//, "").split("?")[0];
  if (!database) throw new Error("DATABASE_URL must include a database name, e.g. .../personal_project");
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database
  };
}

/** Run once on startup — easy to read in one place. */
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags VARCHAR(512) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!pool) {
    pool = mysql.createPool({
      ...parseMysqlUrl(url),
      waitForConnections: true,
      connectionLimit: 10
    });
  }
  return pool;
}

/** Create tables (idempotent). */
export async function initSchema(): Promise<void> {
  const p = getPool();
  const statements = CREATE_TABLES_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const sql of statements) {
    await p.execute(sql);
  }
}

/** Insert demo projects if none exist. */
export async function seedIfEmpty(): Promise<void> {
  const p = getPool();
  const [rows] = await p.execute<mysql.RowDataPacket[]>("SELECT COUNT(*) AS c FROM projects");
  const count = Number(rows[0]?.c ?? 0);
  if (count > 0) return;

  await p.execute(
    `INSERT INTO projects (name, description, tags) VALUES
     (?, ?, ?),
     (?, ?, ?)`,
    [
      "Personal Website",
      "A full-stack site for DevOps practice (Docker, CI, deployments).",
      "react,express,mysql,devops",
      "Observability Demo",
      "Add logs/metrics/traces and practice dashboards + alerts.",
      "otel,metrics,logs,tracing"
    ]
  );
}

function rowToProjectApi(r: RowDataPacket) {
  return {
    id: String(r.id),
    name: String(r.name),
    description: String(r.description),
    tags: String(r.tags),
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    updatedAt:
      r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at)
  };
}

export async function listProjects() {
  const p = getPool();
  const [rows] = await p.execute<RowDataPacket[]>(
    "SELECT id, name, description, tags, created_at, updated_at FROM projects ORDER BY created_at DESC"
  );
  return rows.map(rowToProjectApi);
}

export async function insertContactMessage(name: string, email: string, message: string) {
  const p = getPool();
  const [result] = await p.execute(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [name, email, message]
  );
  return String((result as ResultSetHeader).insertId);
}
