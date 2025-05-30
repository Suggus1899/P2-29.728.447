import fetch from "node-fetch";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import ContactsModel from "../models/ContactsModel";
import { getUserLocation } from "../utils/geolocation";
import { sendEmail } from "../utils/emailServices";

// Definir la interfaz para la respuesta de reCAPTCHA
interface RecaptchaResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    "error-codes"?: string[];
}

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
            const recaptchaToken = req.body["g-recaptcha-response"];
            const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

            // 🔹 Validar reCAPTCHA antes de procesar el formulario
            const recaptchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, {
                method: "POST"
            });

            const recaptchaData = (await recaptchaVerify.json()) as RecaptchaResponse; 

            if (!recaptchaData.success) {
                return res.render("contact", {
                    title: "Contacto",
                    data: req.body,
                    message: "❌ Error de verificación reCAPTCHA, inténtalo nuevamente.",
                    success: false,
                    errors: ["reCAPTCHA inválido"]
                });
            }

            const email = req.body.email?.trim() || "";
            const nombre = req.body.nombre?.trim() || "";
            const comment = req.body.comment?.trim() || "";
            const ip = req.headers["x-forwarded-for"] as string || req.ip || "0.0.0.0";
            const pais = await getUserLocation(ip);
            const date = new Date().toISOString();

            const result = await ContactsModel.saveContact(email, nombre, comment, ip, pais, date);

            if (result.success) {
                // Enviar notificación por correo electrónico
                await sendEmail({ nombre, email, comment, ip, pais, date });

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

    // Método para obtener y mostrar la lista de contactos
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