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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const express_validator_1 = require("express-validator");
const ContactsModel_1 = __importDefault(require("../models/ContactsModel"));
const geolocation_1 = require("../utils/geolocation");
const emailServices_1 = require("../utils/emailServices");
class ContactsController {
    static contactPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render("contact", {
                title: "Contacto",
                data: { nombre: "", email: "", comment: "" },
                message: null,
                success: false,
                errors: []
            });
        });
    }
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            console.log("📌 Datos recibidos en el formulario:", req.body);
            const errors = (0, express_validator_1.validationResult)(req);
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
                const recaptchaVerify = yield (0, node_fetch_1.default)(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`, {
                    method: "POST"
                });
                const recaptchaData = (yield recaptchaVerify.json());
                if (!recaptchaData.success) {
                    return res.render("contact", {
                        title: "Contacto",
                        data: req.body,
                        message: "❌ Error de verificación reCAPTCHA, inténtalo nuevamente.",
                        success: false,
                        errors: ["reCAPTCHA inválido"]
                    });
                }
                const email = ((_a = req.body.email) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                const nombre = ((_b = req.body.nombre) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                const comment = ((_c = req.body.comment) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                const ip = req.headers["x-forwarded-for"] || req.ip || "0.0.0.0";
                const pais = yield (0, geolocation_1.getUserLocation)(ip);
                const date = new Date().toISOString();
                const result = yield ContactsModel_1.default.saveContact(email, nombre, comment, ip, pais, date);
                if (result.success) {
                    // Enviar notificación por correo electrónico
                    yield (0, emailServices_1.sendEmail)({ nombre, email, comment, ip, pais, date });
                    res.render("contact", {
                        title: "Contacto",
                        data: { nombre: "", email: "", comment: "" },
                        message: "¡Mensaje enviado con éxito!",
                        success: true,
                        errors: []
                    });
                }
                else {
                    res.status(500).render("contact", {
                        title: "Contacto",
                        data: req.body,
                        message: "Error al guardar el mensaje.",
                        success: false,
                        errors: []
                    });
                }
            }
            catch (error) {
                console.error("Error en ContactsController.add:", error);
                res.status(500).render("contact", {
                    title: "Contacto",
                    data: req.body,
                    message: "Error interno del servidor.",
                    success: false,
                    errors: []
                });
            }
        });
    }
    // Método para obtener y mostrar la lista de contactos
    static index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield ContactsModel_1.default.getContacts();
                res.render("admin/contacts", { contacts, message: null, errors: [] });
            }
            catch (error) {
                console.error("Error en ContactsController.index:", error);
                res.status(500).render("admin/contacts", {
                    contacts: [],
                    message: "Error al cargar los contactos.",
                    errors: ["Error interno al obtener los contactos"]
                });
            }
        });
    }
}
exports.ContactsController = ContactsController;
