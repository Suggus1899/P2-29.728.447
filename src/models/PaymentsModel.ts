import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';

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
    private static dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> = open({
        filename: './data/payments.sqlite',
        driver: sqlite3.Database
    }).then(async db => {
        await db.run(`
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
    });

    static async getDB(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
        return this.dbPromise;
    }

    // Encripta el número de tarjeta con mayor seguridad
    private static encryptCardNumber(cardNumber: string): string {
        return crypto.createHash('sha512').update(cardNumber).digest('hex'); // 🔒 Usar SHA-512
    }

    static async addPayment(p: Payment): Promise<{ success: boolean; error?: string }> {
        try {
            const db = await this.getDB();
            const encryptedCardNumber = this.encryptCardNumber(p.cardNumber);

            await db.run(
                `INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, amount, currency, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                p.service, p.email, p.cardName, encryptedCardNumber,
                p.expMonth, p.expYear, p.amount, p.currency, p.created_at ?? new Date().toISOString()
            );

            return { success: true };
        } catch (err) {
            console.error("❌ Error al guardar el pago:", err);
            const errorMessage = err instanceof Error ? err.message : "Error desconocido";
            return { success: false, error: errorMessage };
        }
    }

    static async getAllPayments(): Promise<Payment[]> {
        const db = await this.getDB();
        return db.all<Payment[]>(`
            SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at 
            FROM payments 
            ORDER BY created_at DESC
        `);
    }
}