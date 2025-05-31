import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Definición de la interfaz Contact
export interface Contact {
  id?: number;
  nombre: string;
  email: string;
  mensaje: string;
  ip: string;
  pais: string;
  created_at: Date;
}

export class ContactsModel {
  private static dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>>;

  constructor() {
    if (!ContactsModel.dbPromise) {
      ContactsModel.dbPromise = open({
        filename: "./data/contacts.sqlite",
        driver: sqlite3.Database,
      }).then(async (db) => {
        // Crear la tabla si no existe
        await db.run(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            ip TEXT NOT NULL,
            pais TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        `);
        return db;
      });
    }
  }

  // Método para agregar un contacto (antes `saveContact`)
  public async addContact(contact: Contact): Promise<{ success: boolean; error?: string }> {
    if (!contact.email || !contact.nombre || !contact.mensaje) {
      console.error("Error: Datos inválidos");
      return { success: false, error: "Datos inválidos" };
    }

    try {
      const db = await ContactsModel.dbPromise;
      await db.run(
        `INSERT INTO contacts (nombre, email, mensaje, ip, pais, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        contact.nombre,
        contact.email,
        contact.mensaje,
        contact.ip,
        contact.pais ?? "Desconocido",
        contact.created_at.toISOString()
      );

      return { success: true };
    } catch (error) {
      console.error("Error al guardar contacto:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  }

  // Método para obtener todos los contactos (antes `getContacts`)
  public async getAllContacts(): Promise<Contact[]> {
    try {
      const db = await ContactsModel.dbPromise;
      const contactos = await db.all<Contact[]>(
        `SELECT id, nombre, email, mensaje, ip, pais, created_at FROM contacts ORDER BY created_at DESC`
      );

      return contactos.map((contacto) => ({
        ...contacto,
        created_at: new Date(contacto.created_at),
      }));
    } catch (error) {
      console.error("Error al obtener contactos:", error);
      return [];
    }
  }

  // Método para eliminar un contacto por ID
  public async deleteContact(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await ContactsModel.dbPromise;
      await db.run(`DELETE FROM contacts WHERE id = ?`, id);
      return { success: true };
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  }
}