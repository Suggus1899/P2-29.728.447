"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Aquí creamos el router
//Home
router.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});
//Acerca de
router.get('/about', (req, res) => {
    res.render('about', { title: 'Sobre nosotros' });
});
//Servicios
router.get('/services', (req, res) => {
    res.send('Servicios disponibles.');
});
//Traducciones
router.get('/translations', (req, res) => {
    res.render('translations', { title: 'Traducciones' });
});
//Manejo de erroes
router.get('/error', (req, res) => {
    res.render('error', { title: 'Error' });
});
exports.default = router; // Exportamos el router correctamente
