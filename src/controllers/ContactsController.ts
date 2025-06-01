import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/emailServices"; 
import { getUserLocation } from "../utils/geolocation";     
import axios from "axios";
import { ContactsModel } from "../models/ContactsModel";  

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export class ContactsController {
  private static model = new ContactsModel();
  private static readonly RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; // 🔹 Eliminado valor estático

  static async contactPage(req: Request, res: Response) {
    res.render("contact", {
      title: "Contacto",
      data: { nombre: "", email: "", comentario: "" },
      message: null,
      success: false,
      errors: [],
    });
  }

  private static async validateRecaptcha(recaptchaToken: string): Promise<boolean> {
    try {
      if (!recaptchaToken) {
        console.error("❌ Error: reCAPTCHA token no recibido.");
        return false;
      }

      console.log(`🔍 Token recibido: ${recaptchaToken}`);
      console.log(`🔍 Clave secreta usada: ${ContactsController.RECAPTCHA_SECRET}`);

      const params = new URLSearchParams();
      params.append("secret", ContactsController.RECAPTCHA_SECRET || "");
      params.append("response", recaptchaToken);

      const recaptchaVerify = await axios.post("https://www.google.com/recaptcha/api/siteverify", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const recaptchaData: RecaptchaResponse = recaptchaVerify.data;
      console.log("🔍 Respuesta completa de Google reCAPTCHA:", recaptchaData);

      if (!recaptchaData.success) {
        console.error("❌ Error de reCAPTCHA:", recaptchaData["error-codes"]);
      }

      return recaptchaData.success;
    } catch (error) {
      console.error("❌ Error al validar reCAPTCHA:", error);
      return false;
    }
  }

  static async add(req: Request, res: Response, next: NextFunction) {
    console.log("📌 Datos recibidos en el formulario:", req.body);

    const errors = validationResult(req);
    const errorMessages = Array.from(new Set(errors.array().map((err) => err.msg)));

    if (!errors.isEmpty()) {
      return res.render("contact", {
        title: "Contacto",
        data: req.body,
        message: "Corrige los errores del formulario.",
        success: false,
        errors: errorMessages,
      });
    }

    try {
      // 🔹 Corrección en la captura del token reCAPTCHA
      const { nombre, email, comentario } = req.body;
      const recaptchaToken = req.body["g-recaptcha-response"] || req.body.recaptchaToken;

      if (!nombre || !email || !comentario || !recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos obligatorios o reCAPTCHA no verificado.",
        });
      }

      const isRecaptchaValid = await ContactsController.validateRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).render("contact", {
          title: "Contacto",
          data: req.body,
          message: "❌ Error de verificación reCAPTCHA, inténtalo nuevamente.",
          success: false,
          errors: ["⚠ reCAPTCHA inválido"],
        });
      }

      const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "0.0.0.0";  
      const pais = await getUserLocation(ip);  
      const fechaHora = new Date().toISOString();

      const result = await ContactsController.model.addContact({ nombre, email, mensaje: comentario, ip, pais, created_at: new Date() });

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
      const contactos = lista.map((contacto) => ({
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