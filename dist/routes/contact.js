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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ContactsController_1 = require("../controllers/ContactsController");
const router = (0, express_1.Router)();
// Ruta de contacto con mejor estructura y seguridad
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("contact", { title: "Contactos" });
    }
    catch (err) {
        console.error("Error al cargar la página de contacto:", err);
        next(new Error("Error al mostrar la página de contacto"));
    }
}));
// Ruta de contacto mejorada con `NextFunction` para manejar errores correctamente
router.post("/contact/add", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ContactsController_1.ContactsController.add(req, res);
    }
    catch (err) {
        console.error("Error en el formulario de contacto:", err);
        next(new Error("Error al procesar el formulario de contacto"));
    }
}));
exports.default = router;
