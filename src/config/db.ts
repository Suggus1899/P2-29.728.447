import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

//Conexion a la base de datos SQLite
export async function connectDB() {
    return open({
        filename: 'database.sqlite',
        driver: sqlite3.Database
    });
}

//Crea la tabla de usuarios si no existe
export async function inicialiceDB() {
    const db = await connectDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await db.close();
}