import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ContactsModel from '../models/ContactsModel';

export class ContactsController {
    // Renderiza la vista del formulario de contacto con datos vacíos
    static async contactPage(req: Request, res: Response) {
        res.render("contact", { 
            title: "Contacto",
            data: { nombre: "", email: "", comment: "" },
            message: null,
            success: false,
            errors: [] 
        });
    }

    // Guarda los datos del formulario en la base de datos
    static async add(req: Request, res: Response) {
        const errors = validationResult(req);

        // Filtrar errores duplicados
        const errorMessages = Array.from(
            new Set(errors.array().map(err => err.msg))
        );

        // Si hay errores, los enviamos a la vista
        if (!errors.isEmpty()) {
            return res.render("contact", { 
                title: "Contacto",
                data: req.body,
                message: "Corrige los errores del formulario.",
                success: false,
                errors: errorMessages
            });
        }

        try {
            const { email, nombre, comment } = req.body; 
            const ip = req.ip ?? "0.0.0.0";
            const date = new Date().toISOString();

            const result = await ContactsModel.saveContact(email, nombre, comment, ip, date);

            if (result.success) {
                res.render("contact", { 
                    title: "Contacto",
                    data: { nombre: "", email: "", comment: "" },
                    message: "¡Mensaje enviado con éxito!",
                    success: true,
                    errors: []
                });
            } else {
                res.status(500).render("contact", { 
                    title: "Contacto",
                    data: req.body,
                    message: "Error al guardar el mensaje.",
                    success: false,
                    errors: []
                });
            }
        } catch (error) {
            console.error("Error en ContactsController.add:", error);
            res.status(500).render("contact", { 
                title: "Contacto",
                data: req.body,
                message: "Error interno del servidor.",
                success: false,
                errors: []
            });
        }
    }

    // Obtiene y muestra la lista de contactos en `/admin/contacts`
    static async index(req: Request, res: Response) {
        try {
            const contacts = await ContactsModel.getContacts();
            res.render("admin/contacts", { contacts, message: null, errors: [] });
        } catch (error) {
            console.error("Error en ContactsController.index:", error);
            res.status(500).render("admin/contacts", { 
                contacts: [],
                message: "Error al cargar los contactos.",
                errors: ["Error interno al obtener los contactos"]
            });
        }
    }
}