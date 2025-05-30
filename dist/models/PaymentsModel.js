"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = __importDefault(require("crypto"));
class PaymentModel {
    // 🔹 Crear tabla si no existe
    static initializeDB() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service TEXT NOT NULL,
                email TEXT NOT NULL,
                cardName TEXT NOT NULL,
                cardNumber TEXT NOT NULL,
                expMonth TEXT NOT NULL,
                expYear TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                created_at TEXT DEFAULT (DATETIME('now'))
            )
        `);
    }
    // 🔒 Encripta el número de tarjeta con seguridad mejorada
    static encryptCardNumber(cardNumber) {
        return crypto_1.default.createHash("sha512").update(cardNumber).digest("hex");
    }
    // 🔹 Agregar un nuevo pago
    static addPayment(p) {
        var _a;
        try {
            const encryptedCardNumber = this.encryptCardNumber(p.cardNumber);
            const stmt = this.db.prepare(`
                INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, amount, currency, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(p.service, p.email, p.cardName, encryptedCardNumber, p.expMonth, p.expYear, p.amount, p.currency, (_a = p.created_at) !== null && _a !== void 0 ? _a : new Date().toISOString());
            return { success: true };
        }
        catch (err) {
            console.error("Error al guardar el pago:", err);
            return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
        }
    }
    // 🔹 Obtener todos los pagos
    static getAllPayments() {
        const stmt = this.db.prepare(`
            SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at 
            FROM payments 
            ORDER BY created_at DESC
        `);
        return stmt.all();
    }
}
exports.PaymentModel = PaymentModel;
PaymentModel.db = new better_sqlite3_1.default("./data/payments.sqlite", {});
