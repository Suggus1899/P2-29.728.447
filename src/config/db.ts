import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import dotenv from "dotenv";

dotenv.config();

// ✅ Conexión a SQLite con manejo de errores mejorado
export async function connectSQLite(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  try {
    const db = await open({
      filename: "./data/database.sqlite",
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        comment TEXT NOT NULL,
        lastname TEXT NULL,
        ip TEXT,
        pais TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Conexión a SQLite establecida correctamente.");
    return db;
  } catch (error) {
    console.error("Error al conectar con SQLite:", error);
    throw error;
  }
}

// ✅ Inicialización de la base de datos con SQLite
export async function initializeDB() {
  try {
    await connectSQLite();
    console.log("Base de datos SQLite lista.");
  } catch (error) {
    console.error("❌ Error al inicializar SQLite:", error);
  }
}
