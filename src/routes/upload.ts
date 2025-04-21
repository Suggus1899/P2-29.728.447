import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads')); // Carpeta de almacenamiento
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Nombre único basado en timestamp
    },
});

// Validación de formatos permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/epub+zip'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido: Solo se aceptan PDF, DOC y EPUB'), false);
    }
};

// Aumento del límite de tamaño a **150MB**
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }, // 🔥 Máximo 150MB
});