"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentMiddleware = exports.validateTranslationRequest = exports.validateContactMiddleware = exports.validateId = void 0;
const express_validator_1 = require("express-validator");
/* Middleware para validar parámetros en la URL */
exports.validateId = [
    (0, express_validator_1.param)('id').optional().isUUID().withMessage('El ID debe ser un UUID válido'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        next();
    },
];
/* Middleware para validar el formulario de contacto */
exports.validateContactMiddleware = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('⚠ Correo inválido'),
    (0, express_validator_1.body)('nombre')
        .trim()
        .isString()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage('⚠ El nombre debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('comment')
        .trim()
        .isString()
        .notEmpty()
        .isLength({ min: 10, max: 500 })
        .withMessage('⚠ El comentario debe contener entre 10 y 500 caracteres'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("contact", {
                title: "Contacto",
                message: "Corrige los errores del formulario.",
                success: false,
                errors: Array.from(new Set(errors.array().map(err => err.msg))),
                data: req.body
            });
        }
        next();
    },
];
/* Middleware para validar una solicitud de traducción */
exports.validateTranslationRequest = [
    (0, express_validator_1.body)('text')
        .trim()
        .isString()
        .isLength({ min: 5, max: 500 })
        .withMessage('⚠ El texto debe contener entre 5 y 500 caracteres'),
    (0, express_validator_1.body)('language')
        .isString()
        .isIn(['es', 'en', 'fr', 'de'])
        .withMessage('⚠ El idioma debe ser uno de: es, en, fr, de'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        next();
    },
];
/*- Middleware para validar una solicitud de pago */
exports.validatePaymentMiddleware = [
    (0, express_validator_1.body)('cardName').trim().notEmpty().withMessage('⚠ El nombre en la tarjeta es obligatorio.'),
    (0, express_validator_1.body)('email').trim().isEmail().normalizeEmail().withMessage('⚠ Correo inválido.'),
    (0, express_validator_1.body)('cardNumber').matches(/^\d{13,19}$/).withMessage('⚠ Número de tarjeta inválido. Debe contener entre 13 y 19 dígitos.'),
    (0, express_validator_1.body)('expMonth').isInt({ min: 1, max: 12 }).withMessage('⚠ Mes de expiración inválido.'),
    (0, express_validator_1.body)('expYear').isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 }).withMessage('⚠ Año de expiración inválido.'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('⚠ El monto debe ser mayor que cero.'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("payment", {
                message: " Corrige los errores del formulario.",
                success: false,
                errors: Array.from(new Set(errors.array().map(err => err.msg))),
                data: req.body
            });
        }
        next();
    }
];
