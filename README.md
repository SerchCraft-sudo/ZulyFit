# ZulyFit

Aplicación web instalable (PWA) para rutinas en casa.

## Archivos
- `index.html`: estructura de la aplicación.
- `style.css`: diseño adaptable a móvil y computadora.
- `app.js`: rutinas editables, sesiones, temporizador, calendario y respaldo local.
- `manifest.json` y `service-worker.js`: instalación y funcionamiento básico sin conexión.
- `icon.svg`: icono de la app.

## Publicar gratis con GitHub Pages
1. Crea una cuenta o inicia sesión en https://github.com/.
2. Crea un repositorio nuevo, por ejemplo `zulyfit`.
3. Sube **todos** los archivos de esta carpeta a la raíz del repositorio.
4. En el repositorio abre **Settings → Pages**.
5. En **Build and deployment**, elige **Deploy from a branch**; selecciona `main` y `/ (root)`, y guarda.
6. Espera a que GitHub Pages publique el sitio. La dirección será similar a `https://TU-USUARIO.github.io/zulyfit/`.
7. Abre esa dirección en Chrome desde el teléfono. Usa el menú ⋮ → **Instalar app** o **Añadir a pantalla de inicio**.

## Importante
- Los datos se guardan localmente en el navegador/dispositivo. No hay cuentas ni sincronización en la nube.
- Usa **Ajustes → Exportar mis datos** para guardar un respaldo e **Importar respaldo** para recuperarlo.
- La hora de recordatorio es una preferencia guardada; esta versión no manda notificaciones automáticas.
- Para actualizar la app, reemplaza los archivos del repositorio. Si el teléfono conserva una versión antigua, cierra y vuelve a abrir la app o borra los datos del sitio.
- El contenido propone ejercicios generales de bajo impacto y se puede editar. Ajusten repeticiones y descansos según comodidad; detengan la sesión si aparece dolor o malestar.
