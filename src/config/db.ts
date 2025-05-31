import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Conexión a SQLite con manejo de errores mejorado
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

// Conexión a MySQL usando Sequelize con validaciones
const { DB_NAME, DB_USER, DB_PASS, DB_HOST } = process.env;

if (!DB_NAME || !DB_USER || !DB_HOST) {
  throw new Error("Error: Variables de entorno de la base de datos MySQL no están configuradas correctamente.");
}

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS || "", {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

// Inicialización de ambas bases de datos con manejo de errores
export async function initializeDB() {
  try {
    await connectSQLite();

    await sequelize.authenticate();
    console.log("Conexión a MySQL establecida correctamente.");
  } catch (error) {
    console.error("Error al conectar con MySQL:", error);
  }
}