import app from './app';
import dotenv from 'dotenv';

dotenv.config(); // ✅ Cargar variables de entorno desde .env

const PORT = process.env.PORT || 3000;

// ✅ Inicializar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Accede aquí: http://localhost:${PORT}`);
});