import { Router, Request, Response, NextFunction } from "express";
import { ContactsController } from "../controllers/ContactsController";

const router = Router();

// Ruta de contacto con mejor estructura y seguridad
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.render("contact", { title: "Contactos" });
    } catch (err) {
        console.error("Error al cargar la página de contacto:", err);
        next(new Error("Error al mostrar la página de contacto"));
    }
});

// Ruta de contacto mejorada con `NextFunction` para manejar errores correctamente
router.post("/contact/add", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await ContactsController.add(req, res, next);
    } catch (err) {
        console.error("Error en el formulario de contacto:", err);
        next(new Error("Error al procesar el formulario de contacto"));
    }
});

export default router;