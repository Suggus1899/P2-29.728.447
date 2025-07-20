import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function getDB() {
  return open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
}

export async function createUserTable() {
  const db = await getDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}