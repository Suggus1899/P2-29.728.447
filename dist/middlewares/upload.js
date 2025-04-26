"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ruta dinámica de almacenamiento (puedes adaptarla)
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// Verificación de existencia de la carpeta antes de guardar archivos
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// Configuración de almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // Guardar archivos en "uploads/"
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único basado en timestamp
    },
});
// Validación de formatos permitidos
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/epub+zip'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.epub'];
    // Verificar tipo de archivo
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Formato no permitido: Solo se aceptan PDF, DOC y EPUB'), false);
    }
    // Verificar extensión del archivo
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Extensión no permitida: ${ext}. Solo PDF, DOC y EPUB.`), false);
    }
    cb(null, true);
};
// Aumento del límite de tamaño a **150MB**
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }, // Máximo 150MB
});
