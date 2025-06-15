import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/emailServices"; 
import { getUserLocation } from "../utils/geolocation";     
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { ContactsModel } from "../models/ContactsModel";  

export class ContactsController {
  private static model = new ContactsModel();
  private static readonly PROJECT_ID = "lovedoc-463000";
  private static readonly RECAPTCHA_SITE_KEY = "6LcBJ2ErAAAAAF8BMn0ZexpWjAy8O_DFEvmFoVPC";

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
      const client = new RecaptchaEnterpriseServiceClient();
      const projectPath = client.projectPath(ContactsController.PROJECT_ID);

      const request = {
        assessment: {
          event: {
            token,
            siteKey: ContactsController.RECAPTCHA_SITE_KEY,
          },
        },
        parent: projectPath,
      };

      const [response] = await client.createAssessment(request);

      if (!response || !response.tokenProperties || !response.tokenProperties.valid) {
        console.error(`❌ Token inválido: ${response?.tokenProperties?.invalidReason ?? "No especificado"}`);
        return null;
      }

      if (response.tokenProperties.action !== action) {
        console.error("❌ La acción del token no coincide con la esperada.");
        return null;
      }

      const riskScore = response.riskAnalysis?.score ?? null;
      console.log(`✅ Puntuación de reCAPTCHA: ${riskScore}`);

      response.riskAnalysis?.reasons?.forEach(reason => console.log(reason));

      return riskScore;
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
    const recaptchaScore = await ContactsController.validateRecaptcha(recaptchaToken, "CONTACT");

    if (recaptchaScore === null || recaptchaScore < 0.5) {
      return res.status(400).json({ success: false, message: "❌ reCAPTCHA falló. Posible actividad sospechosa." });
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

  // 🔹 Nueva función index() para listar los contactos en /admin/contacts
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