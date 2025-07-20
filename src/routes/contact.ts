import { Router } from "express";
import { ContactsController } from "../controllers/ContactsController";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { body } from "express-validator";

const router = Router();

// Mostrar formulario de contacto
router.get("/", ContactsController.contactPage);

// Procesar envío del formulario con validación
router.post(
  "/contact/add",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio."),
    body("email").isEmail().withMessage("Debe ser un correo válido."),
    body("comentario").notEmpty().withMessage("Debes escribir un comentario."),
  ],
  ContactsController.add
);

// Vista protegida para ver los mensajes recibidos
router.get("/admin/contacts", isAuthenticated, ContactsController.index);

export default router;