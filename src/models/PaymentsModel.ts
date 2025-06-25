import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";

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
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            created_at TEXT DEFAULT (DATETIME('now'))
          )
        `);
        return db;
      });
    }
  }

  // Agregar un nuevo pago
  static async addPayment(p: Payment): Promise<void> {
    try {
      const db = await PaymentModel.dbPromise;

      await db.run(
        `INSERT INTO payments (service, email, cardName, cardNumber, expMonth, expYear, amount, currency, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p.service,
        p.email,
        p.cardName,
        p.cardNumber, // Ya viene encriptado desde el controlador
        p.expMonth,
        p.expYear,
        p.amount,
        p.currency,
        p.created_at ?? new Date().toISOString()
      );
    } catch (error) {
      console.error("❌ Error al insertar el pago en SQLite:", error);
      throw error;
    }
  }

  // Obtener todos los pagos
  static async getAllPayments(): Promise<Payment[]> {
    const db = await PaymentModel.dbPromise;
    return db.all<Payment[]>(`
      SELECT id, service, email, cardName, expMonth, expYear, amount, currency, created_at
      FROM payments
      ORDER BY created_at DESC
    `);
  }
}