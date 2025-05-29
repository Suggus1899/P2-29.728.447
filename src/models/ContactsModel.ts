import { connectDB } from '../config/db';

export default class ContactsModel {
    private static dbPromise = connectDB();

    // Guarda un nuevo contacto incluyendo "pais"
    static async saveContact(email: string, nombre: string, comment: string, ip: string, pais: string, date: string) {
        if (!email || !nombre || !comment) {
            console.error("Error: Datos inválidos");
            return { success: false, error: "Datos inválidos" };
        }

        try {
            const db = await this.dbPromise;
            await db.run(
                `INSERT INTO contacts (email, nombre, comment, ip, pais, date) VALUES (?, ?, ?, ?, ?, ?)`, 
                [email, nombre, comment, ip, pais, date]
            );
            return { success: true };
        } catch (error) {
            console.error("❌ Error al guardar contacto:", error);
            return { success: false, error };
        }
    }

    // Obtiene contactos con "pais"
    static async getContacts() {
        try {
            const db = await this.dbPromise;
            return await db.all(`SELECT id, email, nombre, comment, ip, pais, date FROM contacts ORDER BY date DESC`);
        } catch (error) {
            console.error("Error al obtener contactos:", error);
            return [];
        }
    }

    // Elimina contacto por ID
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