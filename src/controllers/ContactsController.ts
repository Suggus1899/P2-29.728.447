import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/emailServices"; 
import { getUserLocation } from "../utils/geolocation";     
import axios from "axios";
import fetch from "node-fetch";
import { ContactsModel } from "../models/ContactsModel";  

// Definir la estructura esperada de la respuesta de reCAPTCHA
interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export class ContactsController {
  private static model = new ContactsModel();
  private static readonly RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || "TU_CLAVE_RECAPTCHA";

  // Página de contacto
  static async contactPage(req: Request, res: Response) {
    res.render("contact", {
      title: "Contacto",
      data: { nombre: "", email: "", comentario: "" },
      message: null,
      success: false,
      errors: [],
    });
  }

  // Validar reCAPTCHA con Google
  private static async validateRecaptcha(recaptchaToken: string): Promise<boolean> {
    try {
      if (!recaptchaToken) {
        console.error(" Error: reCAPTCHA token no recibido.");
        return false;
      }

      const params = new URLSearchParams();
      params.append("secret", ContactsController.RECAPTCHA_SECRET);
      params.append("response", recaptchaToken);

      console.log(`🔍 Verificando reCAPTCHA con Google: response=${recaptchaToken}`);

      const recaptchaVerify = await axios.post("https://www.google.com/recaptcha/api/siteverify", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const recaptchaData: RecaptchaResponse = recaptchaVerify.data;
      console.log("Respuesta de Google reCAPTCHA:", recaptchaData);

      return recaptchaData.success;
    } catch (error) {
      console.error("Error al validar reCAPTCHA:", error);
      return false;
    }
  }

  //  Agregar un contacto después de validar reCAPTCHA
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
      const { nombre, email, comentario, recaptchaToken } = req.body;

      if (!nombre || !email || !comentario || !recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Faltan campos obligatorios o reCAPTCHA no verificado.",
        });
      }

      const isRecaptchaValid = await ContactsController.validateRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        return res.status(400).json({
          success: false,
          message: "Fallo en la verificación de reCAPTCHA.",
        });
      }

      // Capturar la IP y ubicación
      const ip = req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "0.0.0.0";  
      const pais = await getUserLocation(ip);  
      const fechaHora = new Date().toISOString();

      const result = await ContactsController.model.addContact({ nombre, email, mensaje: comentario, ip, pais, created_at: new Date() });

      if (result.success) {  
        await sendEmail({ nombre, email, comment: comentario, ip, pais, date: fechaHora });  

        return res.render("contact", {
          title: "Contacto",
          data: { nombre: "", email: "", comentario: "" },
          message: "¡Mensaje enviado con éxito!",
          success: true,
          errors: [],
        });
      } else {
        return res.status(500).render("contact", {
          title: "Contacto",
          data: req.body,
          message: "Error al guardar el mensaje.",
          success: false,
          errors: [],
        });
      }
    } catch (err) {
      console.error("Error al procesar el contacto:", err);
      return next(err);
    }
  }

  // Obtener todos los contactos
  static async index(req: Request, res: Response, next: NextFunction) {
    try {
      const lista = await ContactsController.model.getAllContacts(); 
      const contactos = lista.map((contacto) => ({
        ...contacto,
        created_at: new Date(contacto.created_at),
      }));

      return res.render("admin_contacts", { contactos });
    } catch (err) {
      console.error("Error obteniendo los contactos:", err);
      return next(err);
    }
  }
}