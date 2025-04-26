"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helpers_1 = require("../utils/helpers"); // Movemos la función a un módulo separado
const router = (0, express_1.Router)();
// ✅ Rutas generales
const pages = ['index', 'about', 'contact', 'services', 'traductions'];
pages.forEach((page) => {
    router.get(`/${page === 'index' ? '' : page}`, (req, res) => {
        res.render(page, { title: `${(0, helpers_1.capitalize)(page)} - LoveDoc` });
    });
});
// ✅ Middleware para manejo de errores con códigos dinámicos
router.use((req, res) => {
    res.status(404).render('error', {
        errorCode: 404,
        errorMessage: `Página no encontrada: ${req.originalUrl}`,
    });
});
exports.default = router;
