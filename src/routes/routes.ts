import { Router } from 'express';
import { capitalize } from '../utils/helpers'; // Movemos la función a un módulo separado

const router = Router();

// ✅ Rutas generales
const pages = ['index', 'about', 'contact', 'services', 'traductions'];
pages.forEach((page) => {
    router.get(`/${page === 'index' ? '' : page}`, (req, res) => {
        res.render(page, { title: `${capitalize(page)} - LoveDoc` });
    });
});

// ✅ Middleware para manejo de errores con códigos dinámicos
router.use((req, res) => {
    res.status(404).render('error', {
        errorCode: 404,
        errorMessage: `Página no encontrada: ${req.originalUrl}`,
    });
});

export default router;