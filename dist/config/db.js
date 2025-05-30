"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.initializeDB = initializeDB;
const sqlite_1 = require("sqlite");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
// 🔹 Conexión a la base de datos SQLite
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, sqlite_1.open)({
            filename: "database.sqlite",
            driver: better_sqlite3_1.default
        });
    });
}
// 🔹 Inicializar la base de datos y crear tablas si no existen
function initializeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = yield connectDB();
        yield db.exec(`
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
        yield db.close();
    });
}
