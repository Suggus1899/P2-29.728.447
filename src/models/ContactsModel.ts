import { connectDB } from '../config/db';

export default class ContactsModel {
    private static dbPromise = connectDB();

    // Guarda un nuevo contacto en la base de datos con validación
    static async saveContact(email: string, nombre: string, comment: string, ip: string, date: string) {
        if (!email || !nombre || !comment) {
            console.error("Error: Datos inválidos");
            return { success: false, error: "Datos inválidos" };
        }

        try {
            const db = await this.dbPromise;
            await db.run(
                `INSERT INTO contacts (email, nombre, comment, ip, date) VALUES (?, ?, ?, ?, ?)`, 
                [email, nombre, comment, ip, date]
            );
            return { success: true };
        } catch (error) {
            console.error("Error al guardar contacto:", error);
            return { success: false, error };
        }
    }

    // Obtiene todos los contactos ordenados por fecha
    static async getContacts() {
        try {
            const db = await this.dbPromise;
            return await db.all(`SELECT id, email, nombre, comment, ip, date FROM contacts ORDER BY date DESC`);
        } catch (error) {
            console.error("Error al obtener contactos:", error);
            return [];
        }
    }

    // Elimina un contacto por ID
    static async deleteContact(id: number) {
        try {
            const db = await this.dbPromise;
            await db.run(`DELETE FROM contacts WHERE id = ?`, [id]);
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar contacto:", error);
            return { success: false, error };
        }
    }
}