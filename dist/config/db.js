"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.initializeDB = initializeDB;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// 🔹 Conexión a la base de datos SQLite
function connectDB() {
    return new better_sqlite3_1.default("database.sqlite");
}
// 🔹 Inicializar la base de datos y crear tablas si no existen
function initializeDB() {
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
    db.close();
}
