import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware para validar parámetros en la URL
export const validateId = [
    param('id')
        .isUUID()
        .withMessage('El ID debe ser un UUID válido'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

// Middleware para validar el cuerpo de una solicitud de traducción
export const validateTranslationRequest = [
    body('text')
        .isString()
        .isLength({ min: 5 })
        .withMessage('El texto debe contener al menos 5 caracteres'),
    body('language')
        .isString()
        .isIn(['es', 'en', 'fr', 'de'])
        .withMessage('El idioma debe ser uno de: es, en, fr, de'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];