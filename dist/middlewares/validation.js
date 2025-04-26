"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTranslationRequest = exports.validateId = void 0;
const express_validator_1 = require("express-validator");
// Middleware para validar parámetros en la URL
exports.validateId = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('El ID debe ser un UUID válido'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
// Middleware para validar el cuerpo de una solicitud de traducción
exports.validateTranslationRequest = [
    (0, express_validator_1.body)('text')
        .isString()
        .isLength({ min: 5 })
        .withMessage('El texto debe contener al menos 5 caracteres'),
    (0, express_validator_1.body)('language')
        .isString()
        .isIn(['es', 'en', 'fr', 'de'])
        .withMessage('El idioma debe ser uno de: es, en, fr, de'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
