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
const express_validator_1 = require("express-validator");
const ContactsModel_1 = __importDefault(require("../models/ContactsModel"));
class ContactsController {
    // Renderiza la vista del formulario de contacto con datos vacíos
    static contactPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.render("contact", {
                title: "Contacto",
                data: { nombre: "", email: "", lastname: "", comment: "" },
                message: null,
                success: false,
                errors: []
            });
        });
    }
    // Guarda los datos del formulario en la base de datos
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const errors = (0, express_validator_1.validationResult)(req);
            // Filtrar errores duplicados usando `msg`
            const errorMessages = Array.from(new Set(errors.array().map(err => err.msg)));
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
                const { email, nombre, lastname, comment } = req.body;
                const ip = (_a = req.ip) !== null && _a !== void 0 ? _a : "0.0.0.0";
                const date = new Date().toISOString();
                const result = yield ContactsModel_1.default.saveContact(email, nombre, lastname, comment, ip, date);
                if (result.success) {
                    res.render("contact", {
                        title: "Contacto",
                        data: { nombre: "", email: "", lastname: "", comment: "" },
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
    // Obtiene y muestra la lista de contactos en `/admin/contacts`
    static index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield ContactsModel_1.default.getContacts();
                res.render("admin/contacts", { contacts });
            }
            catch (error) {
                console.error("Error en ContactsController.index:", error);
                res.status(500).render("admin/contacts", {
                    contacts: [],
                    message: "Error al cargar los contactos."
                });
            }
        });
    }
}
exports.ContactsController = ContactsController;
