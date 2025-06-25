import app from './app';
import dotenv from 'dotenv';
import { initializeDB } from './config/db';

dotenv.config(); 

const PORT = process.env.PORT || 3000;

initializeDB();

// Inicializar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Accede aquí: http://localhost:${PORT}`);
});