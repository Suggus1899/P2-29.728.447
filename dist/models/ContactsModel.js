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
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
class ContactsModel {
    // Guarda un nuevo contacto incluyendo "pais"
    static saveContact(email, nombre, comment, ip, pais, date) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !nombre || !comment) {
                console.error("Error: Datos inválidos");
                return { success: false, error: "Datos inválidos" };
            }
            try {
                const db = yield this.dbPromise;
                yield db.run(`INSERT INTO contacts (email, nombre, comment, ip, pais, date) VALUES (?, ?, ?, ?, ?, ?)`, [email, nombre, comment, ip, pais, date]);
                return { success: true };
            }
            catch (error) {
                console.error("❌ Error al guardar contacto:", error);
                return { success: false, error };
            }
        });
    }
    // Obtiene contactos con "pais"
    static getContacts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield this.dbPromise;
                return yield db.all(`SELECT id, email, nombre, comment, ip, pais, date FROM contacts ORDER BY date DESC`);
            }
            catch (error) {
                console.error("Error al obtener contactos:", error);
                return [];
            }
        });
    }
    // Elimina contacto por ID
    static deleteContact(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield this.dbPromise;
                yield db.run(`DELETE FROM contacts WHERE id = ?`, [id]);
                return { success: true };
            }
            catch (error) {
                console.error("Error al eliminar contacto:", error);
                return { success: false, error };
            }
        });
    }
}
ContactsModel.dbPromise = (0, db_1.connectDB)();
exports.default = ContactsModel;
