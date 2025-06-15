import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/emailServices"; 
import { getUserLocation } from "../utils/geolocation";     
import axios from "axios";
import { ContactsModel } from "../models/ContactsModel";  

export class ContactsController {
  private static model = new ContactsModel();
  private static readonly RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

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
    if (!recaptchaToken) {
      console.error("Error: reCAPTCHA token no recibido.");
      return false;
    }

    try {
      const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", {
        secret: ContactsController.RECAPTCHA_SECRET,
        response: recaptchaToken,
      });

      return response.data.success;
    } catch (error) {
      console.error("Error al validar reCAPTCHA:", error);
      return false;
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
        message: "ME rror de verificación reCAPTCHA, inténtalo nuevamente.",
        success: false,
        errors: ["GreCAPTCHA inválido"],
      });
    }

    try {
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
}