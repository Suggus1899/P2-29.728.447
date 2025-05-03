import { Router, Request, Response, NextFunction } from 'express';
import { capitalize } from '../utils/helpers'; // Para capitalizar títulos
import { validateContactMiddleware } from '../middlewares/validation'; // Middleware de validación
import { ContactsController } from '../controllers/ContactsController'; // Controlador de contactos

const router = Router();

// Rutas generales
const pages = ['index', 'about', 'services', 'traductions'];
pages.forEach((page) => {
    router.get(`/${page === 'index' ? '' : page}`, (req: Request, res: Response) => {
        res.render(page, { title: `${capitalize(page)} - LoveDoc` });
    });
});

// Rutas de contacto
router.get('/contact', ContactsController.contactPage); // Muestra el formulario
// Usa el spread operator para descomponer el middleware y evitar el error de tipado
router.post('/contact/add', ...validateContactMiddleware, ContactsController.add); // Procesa el formulario con validación

// Ruta de administración para ver contactos almacenados
router.get('/admin/contacts', ContactsController.index);

// Middleware de manejo de errores dinámicos (404 y errores internos)
router.use((req: Request, res: Response) => {
    res.status(404).render('error', {
        errorCode: 404,
        errorMessage: `Página no encontrada: ${req.originalUrl}`,
    });
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error en la aplicación:", err);
    res.status(err.status || 500).render('error', {
        errorCode: err.status || 500,
        errorMessage: err.message || "Error interno del servidor",
    });
});

export default router;