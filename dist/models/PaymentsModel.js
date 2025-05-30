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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModel = void 0;
const sqlite_1 = require("sqlite");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = __importDefault(require("crypto"));
class PaymentModel {
    static getDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbPromise;
        });
    }
    // 🔒 Encripta el número de tarjeta con seguridad mejorada
    static encryptCardNumber(cardNumber) {
        return crypto_1.default.createHash("sha512").update(cardNumber).digest("hex");
    }
    static addPayment(p) {
        return __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const db = yield this.getDB();
                const encryptedCardNumber = this.encryptCardNumber(p.cardNumber);
                yield db.run(`INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, amount, currency, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, p.service, p.email, p.cardName, encryptedCardNumber, p.expMonth, p.expYear, p.amount, p.currency, (_b = p.created_at) !== null && _b !== void 0 ? _b : new Date().toISOString());
                return { success: true };
            }
            catch (err) {
                console.error("❌ Error al guardar el pago:", err);
                return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
            }
        });
    }
    static getAllPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDB();
            return db.all(`
            SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at 
            FROM payments 
            ORDER BY created_at DESC
        `);
        });
    }
}
exports.PaymentModel = PaymentModel;
_a = PaymentModel;
PaymentModel.dbPromise = (0, sqlite_1.open)({
    filename: "./data/payments.sqlite",
    driver: better_sqlite3_1.default
}).then((db) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.run(`
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
    return db;
}));
