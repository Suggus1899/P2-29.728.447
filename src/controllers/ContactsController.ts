import { Request, Response } from 'express';
import ContactsModel from '../models/ContactsModel';

export class ContactsController {
    // Renderiza la vista del formulario de contacto
    static async contactPage(req: Request, res: Response) {
        res.render("contact", { message: null });
    }

    // Guarda los datos del formulario en la base de datos
    static async add(req: Request, res: Response) {
        const { email, name, lastname, comment } = req.body;
        const ip = req.ip ?? "0.0.0.0"; // Manejo seguro para evitar `undefined`
        const date = new Date().toISOString();

        try {
            const result = await ContactsModel.saveContact(email, name, lastname, comment, ip, date);
            if (result.success) {
                res.render("contact", { message: "¡Tu mensaje ha sido enviado con éxito!" });
            } else {
                res.status(500).render("contact", { message: "Error al guardar el mensaje." });
            }
        } catch (error) {
            console.error("Error en ContactsController.add:", error);
            res.status(500).render("contact", { message: "Error interno del servidor." });
        }
    }

    // Obtiene y muestra la lista de contactos en `/admin/contacts`
    static async index(req: Request, res: Response) {
        try {
            const contacts = await ContactsModel.getContacts();
            res.render("admin/contacts", { contacts });
        } catch (error) {
            console.error("Error en ContactsController.index:", error);
            res.status(500).render("admin/contacts", { contacts: [], message: "Error al cargar los contactos." });
        }
    }
}