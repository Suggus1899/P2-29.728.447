import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/* Middleware para validar parámetros en la URL */
export const validateId = [
    param('id').optional().isUUID().withMessage('El ID debe ser un UUID válido'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        next();
    },
];

/* Middleware para validar el formulario de contacto */
export const validateContactMiddleware = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('⚠ Correo inválido'),
    
    body('nombre')
        .trim()
        .isString()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage('⚠ El nombre debe tener al menos 2 caracteres'),

    body('comment')
        .trim()
        .isString()
        .notEmpty()
        .isLength({ min: 10, max: 500 })
        .withMessage('⚠ El comentario debe contener entre 10 y 500 caracteres'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
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
export const validateTranslationRequest = [
    body('text')
        .trim()
        .isString()
        .isLength({ min: 5, max: 500 })
        .withMessage('⚠ El texto debe contener entre 5 y 500 caracteres'),

    body('language')
        .isString()
        .isIn(['es', 'en', 'fr', 'de'])
        .withMessage('⚠ El idioma debe ser uno de: es, en, fr, de'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, errors: errors.array() });
            return;
        }
        next();
    },
];

/*- Middleware para validar una solicitud de pago */
export const validatePaymentMiddleware = [
    body('cardName').trim().notEmpty().withMessage('⚠ El nombre en la tarjeta es obligatorio.'),
    body('email').trim().isEmail().normalizeEmail().withMessage('⚠ Correo inválido.'),
    body('cardNumber').matches(/^\d{13,19}$/).withMessage('⚠ Número de tarjeta inválido. Debe contener entre 13 y 19 dígitos.'),
    body('expMonth').isInt({ min: 1, max: 12 }).withMessage('⚠ Mes de expiración inválido.'),
    body('expYear').isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 10 }).withMessage('⚠ Año de expiración inválido.'),
    body('amount').isFloat({ min: 0.01 }).withMessage('⚠ El monto debe ser mayor que cero.'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
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