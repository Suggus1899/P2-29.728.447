import app from './app';
import dotenv from 'dotenv';
import { inicialiceDB } from './config/db';

dotenv.config(); // ✅ Cargar variables de entorno desde .env

const PORT = process.env.PORT || 3000;

inicialiceDB();

// ✅ Inicializar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Accede aquí: http://localhost:${PORT}`);
});