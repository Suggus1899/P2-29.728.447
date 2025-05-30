import { connectDB } from "../config/db";

export default class ContactsModel {
    private static db = connectDB(); 

    // 🔹 Guarda un nuevo contacto incluyendo "pais"
    static saveContact(email: string, nombre: string, comment: string, ip: string, pais: string, date: string) {
        if (!email || !nombre || !comment) {
            console.error("Error: Datos inválidos");
            return { success: false, error: "Datos inválidos" };
        }

        try {
            const stmt = this.db.prepare(
                `INSERT INTO contacts (email, nombre, comment, ip, pais, date) VALUES (?, ?, ?, ?, ?, ?)`
            ); 
            stmt.run(email, nombre, comment, ip, pais, date); 

            return { success: true };
        } catch (error) {
            console.error("Error al guardar contacto:", error);
            return { success: false, error };
        }
    }

    // 🔹 Obtiene contactos con "pais"
    static getContacts() {
        try {
            const stmt = this.db.prepare(
                `SELECT id, email, nombre, comment, ip, pais, date FROM contacts ORDER BY date DESC`
            ); // 
            return stmt.all(); 
        } catch (error) {
            console.error("Error al obtener contactos:", error);
            return [];
        }
    }

    // 🔹 Elimina contacto por ID
    static deleteContact(id: number) {
        try {
            const stmt = this.db.prepare(`DELETE FROM contacts WHERE id = ?`); 
            stmt.run(id); 
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar contacto:", error);
            return { success: false, error };
        }
    }
}