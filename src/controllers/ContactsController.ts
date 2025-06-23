import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/emailServices";
import { getUserLocation } from "../utils/geolocation";
import axios from "axios";
import { ContactsModel } from "../models/ContactsModel";

export class ContactsController {
  private static model = new ContactsModel();
  private static readonly RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || "";

  static async contactPage(req: Request, res: Response) {
    res.render("contact", {
      title: "Contacto",
      data: { nombre: "", email: "", comentario: "" },
      message: null,
      success: false,
      errors: [],
    });
  }

  private static async validateRecaptcha(token: string, action: string): Promise<number | null> {
    if (!token) {
      console.error("❌ Error: reCAPTCHA token no recibido.");
      return null;
    }

    try {
      const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
        params: {
          secret: ContactsController.RECAPTCHA_SECRET,
          response: token,
        },
      });

      const data = response.data;

      if (!data.success || data.action !== action) {
        console.error(`❌ Falló la verificación reCAPTCHA. Acción esperada: ${action}, recibida: ${data.action}`);
        return null;
      }

      console.log(`✅ reCAPTCHA válido. Score: ${data.score}`);
      return data.score;
    } catch (error) {
      console.error("❌ Error al validar reCAPTCHA:", error);
      return null;
    }
  }

  static async add(req: Request, res: Response, next: NextFunction) {
    console.log("📌 Datos recibidos:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("contact", {
        title: "Contacto",
        data: req.body,
        message: "Corrige los errores del formulario.",
        success: false,
        errors: errors.array().map(err => err.msg),
      });
    }

    const { nombre, email, comentario } = req.body;
    const recaptchaToken = req.body["g-recaptcha-response"];
    const score = await ContactsController.validateRecaptcha(recaptchaToken, "CONTACT");

    if (score === null || score < 0.3) {
      return res.status(400).render("contact", {
        title: "Contacto",
        data: req.body,
        message: "❌ El sistema ha detectado actividad sospechosa. Intenta nuevamente.",
        success: false,
        errors: ["reCAPTCHA sospechoso o inválido"],
      });
    }

    try {
      const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "0.0.0.0";
      const pais = await getUserLocation(ip);
      const fechaHora = new Date().toISOString();

      const result = await ContactsController.model.addContact({
        nombre,
        email,
        mensaje: comentario,
        ip,
        pais,
        created_at: new Date(),
      });

      if (result.success) {
        await sendEmail({ nombre, email, comment: comentario, ip, pais, date: fechaHora });

        return res.render("contact", {
          title: "Contacto",
          data: { nombre: "", email: "", comentario: "" },
          message: "✅ ¡Mensaje enviado con éxito!",
          success: true,
          errors: [],
        });
      } else {
        return res.status(500).render("contact", {
          title: "Contacto",
          data: req.body,
          message: "❌ Error al guardar el mensaje.",
          success: false,
          errors: [],
        });
      }
    } catch (err) {
      console.error("❌ Error al procesar el contacto:", err);
      return next(err);
    }
  }

  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const lista = await ContactsController.model.getAllContacts();
      const contactos = lista.map(contacto => ({
        ...contacto,
        created_at: new Date(contacto.created_at),
      }));

      return res.render("admin_contacts", { contactos });
    } catch (err) {
      console.error("❌ Error obteniendo los contactos:", err);
      return next(err);
    }
  }
}