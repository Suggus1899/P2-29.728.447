import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ContactsModel from "../models/ContactsModel";
import { getUserLocation } from "../utils/geolocation"; // ✅ Importamos la función

export class ContactsController {
    static async contactPage(req: Request, res: Response) {
        res.render("contact", { 
            title: "Contacto",
            data: { nombre: "", email: "", comment: "" },
            message: null,
            success: false,
            errors: [] 
        });
    }

    static async add(req: Request, res: Response) {
        console.log("📌 Datos recibidos en el formulario:", req.body);

        const errors = validationResult(req);
        console.log("📌 Errores detectados:", errors.array());

        // 🚀 Filtrar errores duplicados
        const errorMessages = Array.from(new Set(errors.array().map(err => err.msg)));

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
            const email = req.body.email?.trim() || "";
            const nombre = req.body.nombre?.trim() || "";
            const comment = req.body.comment?.trim() || "";
            const ip = req.headers["x-forwarded-for"] as string || req.ip || "0.0.0.0"; 

            // 🔹 Obtener el país basado en la IP
            const pais = await getUserLocation(ip);
            console.log(`Ubicación detectada: ${pais} (${ip})`);

            const date = new Date().toISOString();

            const result = await ContactsModel.saveContact(email, nombre, comment, ip, pais, date);

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