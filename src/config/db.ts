import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Conexión a la base de datos SQLite
export async function connectDB() {
    return open({
        filename: "database.sqlite",
        driver: sqlite3.Database
    });
}

// Inicializar la base de datos y crear tablas si no existen
export async function initializeDB() {
    const db = await connectDB();

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
            pais TEXT,  -- Se agrega la columna "pais"
            date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await db.close();
}