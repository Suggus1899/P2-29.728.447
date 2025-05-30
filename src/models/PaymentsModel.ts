import Database from "better-sqlite3";
import crypto from "crypto";

export interface Payment {
    id?: number;
    service: string;
    email: string;
    cardName: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
    amount: number;
    currency: string;
    created_at?: string;
}

export class PaymentModel {
    private static db = new Database("./data/payments.sqlite", {});

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
    private static encryptCardNumber(cardNumber: string): string {
        return crypto.createHash("sha512").update(cardNumber).digest("hex");
    }

    // 🔹 Agregar un nuevo pago
    static addPayment(p: Payment): { success: boolean; error?: string } {
        try {
            const encryptedCardNumber = this.encryptCardNumber(p.cardNumber);
            const stmt = this.db.prepare(`
                INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, amount, currency, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                p.service, p.email, p.cardName, encryptedCardNumber,
                p.expMonth, p.expYear, p.amount, p.currency, p.created_at ?? new Date().toISOString()
            );

            return { success: true };
        } catch (err) {
            console.error("Error al guardar el pago:", err);
            return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
        }
    }

    // 🔹 Obtener todos los pagos
    static getAllPayments(): Payment[] {
        const stmt = this.db.prepare(`
            SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at 
            FROM payments 
            ORDER BY created_at DESC
        `);
        return stmt.all() as Payment[]; 
    }
}