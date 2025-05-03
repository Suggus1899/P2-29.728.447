import { connectDB } from '../config/db';

export default class ContactsModel {
    // Guarda un nuevo contacto en la base de datos
    static async saveContact(email: string, name: string, lastname: string, comment: string, ip: string, date: string) {
        try {
            const db = await connectDB();
            await db.run(
                `INSERT INTO contacts (email, name, lastname, comment, ip, date) VALUES (?, ?, ?, ?, ?, ?)`,
                [email, name, lastname, comment, ip, date]
            );
            return { success: true };
        } catch (error) {
            console.error("Error al guardar contacto:", error);
            return { success: false, error };
        }
    }

    // Obtiene todos los contactos registrados
    static async getContacts() {
        try {
            const db = await connectDB();
            return await db.all(`SELECT * FROM contacts`);
        } catch (error) {
            console.error("Error al obtener contactos:", error);
            return [];
        }
    }
}