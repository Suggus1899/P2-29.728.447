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
const helpers_1 = require("../utils/helpers");
const validation_1 = require("../middlewares/validation");
const ContactsController_1 = require("../controllers/ContactsController");
const PaymentsController_1 = require("../controllers/PaymentsController");
const PaymentsModel_1 = require("../models/PaymentsModel");
const router = (0, express_1.Router)();
// Rutas generales optimizadas
const pages = ['index', 'about', 'services', 'traductions'].map(page => ({
    path: `/${page === 'index' ? '' : page}`,
    title: `${(0, helpers_1.capitalize)(page)} - LoveDoc`
}));
pages.forEach(({ path, title }) => {
    router.get(path, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.render(path.replace('/', ''), { title });
    }));
});
// Rutas de contacto con validación y manejo de errores mejorados
router.get('/contact', ContactsController_1.ContactsController.contactPage);
router.post('/contact/add', validation_1.validateContactMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ContactsController_1.ContactsController.add(req, res);
    }
    catch (err) {
        console.error("Error en el formulario de contacto:", err);
        next(new Error("Error al procesar el formulario de contacto"));
    }
}));
// Ruta de administración de contactos
router.get('/admin/contacts', ContactsController_1.ContactsController.index);
// Rutas de pago con manejo de errores mejorado
router.get('/payment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("payment", {
        title: "Pago",
        message: null,
        success: false,
        errors: [],
        data: { cardName: "", email: "", cardNumber: "", expMonth: "", expYear: "", amount: "" }
    });
}));
router.post('/payment/process', validation_1.validatePaymentMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield PaymentsController_1.PaymentController.process(req, res, next);
    }
    catch (err) {
        console.error("Error en el proceso de pago:", err);
        const errorMessage = err instanceof Error ? err.message : "Error interno desconocido";
        next(new Error(errorMessage));
    }
}));
// Ruta de administración de pagos
router.get('/admin/payments', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield PaymentsModel_1.PaymentModel.getAllPayments();
        res.render("admin/payments", { payments });
    }
    catch (err) {
        console.error("Error al obtener pagos:", err);
        next(new Error("Error al cargar la lista de pagos"));
    }
}));
// Middleware de manejo de errores global mejorado
router.use((req, res) => {
    res.status(404).render('error', {
        errorCode: 404,
        errorMessage: `Página no encontrada: ${req.originalUrl}`,
    });
});
router.use((err, req, res, next) => {
    console.error("Error en la aplicación:", err);
    res.status(err.status || 500).render('error', {
        errorCode: err.status || 500,
        errorMessage: err.message || "Error interno del servidor",
    });
});
exports.default = router;
