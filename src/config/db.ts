import Database from "better-sqlite3"; 

// Conexión a la base de datos SQLite
export function connectDB() {
    return new Database("database.sqlite"); 
}

// iicializar la base de datos y crear tablas si no existen
export function initializeDB() {
    const db = connectDB();

    db.exec(`
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
            pais TEXT,
            date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);
}