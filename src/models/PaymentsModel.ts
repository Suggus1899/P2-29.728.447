import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import crypto from "crypto";

export interface Payment {
  id?: number;
  service: string;
  email: string;
  cardName: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv?: string;
  amount: number;
  currency: string;
  created_at: string;
}

export class PaymentModel {
  private static dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>>;

  constructor() {
    if (!PaymentModel.dbPromise) {
      PaymentModel.dbPromise = open({
        filename: "./data/payments.sqlite",
        driver: sqlite3.Database,
      }).then(async (db) => {
        await db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service TEXT NOT NULL,
            email TEXT NOT NULL,
            cardName TEXT NOT NULL,
            cardNumber TEXT NOT NULL,
            expMonth TEXT NOT NULL,
            expYear TEXT NOT NULL,
            cvv TEXT,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            created_at TEXT DEFAULT (DATETIME('now'))
          )
        `);
        return db;
      });
    }
  }

  // Encripta el número de tarjeta con seguridad mejorada
  private static encryptCardNumber(cardNumber: string): string {
    return crypto.createHash("sha512").update(cardNumber.replace(/\s+/g, "")).digest("hex");
  }

  // Agregar un nuevo pago
  static async addPayment(p: Payment): Promise<void> {
    const db = await PaymentModel.dbPromise;
    const encryptedCardNumber = PaymentModel.encryptCardNumber(p.cardNumber);

    await db.run(
      `INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, cvv, amount, currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      p.service,
      p.email,
      p.cardName,
      encryptedCardNumber,
      p.expMonth,
      p.expYear,
      p.cvv ?? null,
      p.amount,
      p.currency,
      p.created_at ?? new Date().toISOString()
    );
  }

  // ✅ Obtener todos los pagos
  static async getAllPayments(): Promise<Payment[]> {
    const db = await PaymentModel.dbPromise;
    return db.all<Payment[]>(`SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at FROM payments ORDER BY created_at DESC`);
  }
}