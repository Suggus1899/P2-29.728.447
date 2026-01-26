# Manual de Instalación y Puesta en Marcha

## Requisitos previos
- Node.js (v16 o superior)
- npm (v8 o superior)
- Git (opcional, para clonar el repositorio)

## Instalación

1. **Clona el repositorio o descarga el código fuente:**
   ```sh
   git clone https://github.com/Suggus1899/P2-29.728.447.git
   cd P2-29.728.447
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Configura las variables de entorno:**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Ejemplo de contenido:
     ```env
     SESSION_SECRET=tu_clave_secreta
     GOOGLE_CLIENT_ID=tu_id_google
     GOOGLE_CLIENT_SECRET=tu_secreto_google
     GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
     BASE_URL=http://localhost:3000
     ```

4. **Compila el proyecto (opcional si usas nodemon/ts-node):**
   ```sh
   npx tsc
   ```

## Ejecución del servidor

1. **Modo desarrollo (recomendado):**
   ```sh
   npm run dev
   ```
   Esto inicia el servidor con recarga automática usando nodemon y ts-node.

2. **Modo producción:**
   ```sh
   npm run build
   npm start
   ```

3. **Accede a la aplicación:**
   - Abre tu navegador y entra a: [http://localhost:3000](http://localhost:3000)

## Notas adicionales
- La base de datos SQLite se crea automáticamente al iniciar el servidor.
- El usuario admin se genera por defecto: usuario `admin` / contraseña `admin123`.
- Si tienes problemas, revisa la consola para mensajes de error.

---

© 2026 LoveDoc. Todos los derechos reservados.
