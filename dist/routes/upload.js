"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configuración de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads')); // Carpeta de almacenamiento
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único basado en timestamp
    },
});
// Validación de formatos permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/epub+zip'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Formato no permitido: Solo se aceptan PDF, DOC y EPUB'), false);
    }
};
// Aumento del límite de tamaño a **150MB**
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }, // 🔥 Máximo 150MB
});
