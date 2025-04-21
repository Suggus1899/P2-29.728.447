import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ruta dinámica de almacenamiento (puedes adaptarla)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Verificación de existencia de la carpeta antes de guardar archivos
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); // Guardar archivos en "uploads/"
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único basado en timestamp
    },
});

// Validación de formatos permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/epub+zip'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.epub'];

    // Verificar tipo de archivo
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Formato no permitido: Solo se aceptan PDF, DOC y EPUB'), false);
    }

    // Verificar extensión del archivo
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error(`Extensión no permitida: ${ext}. Solo PDF, DOC y EPUB.`), false);
    }

    cb(null, true);
};

// Aumento del límite de tamaño a **150MB**
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }, // Máximo 150MB
});