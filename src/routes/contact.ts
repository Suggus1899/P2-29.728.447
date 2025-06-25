import { Router } from "express";
import { ContactsController } from "../controllers/ContactsController";

const router = Router();

// Mostrar formulario de contacto
router.get("/", ContactsController.contactPage);

// Procesar envío del formulario
router.post("/contact/add", ContactsController.add);

export default router;