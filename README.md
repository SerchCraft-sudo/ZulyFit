# ZulyFit 2.0

Aplicación web instalable (PWA) para organizar rutinas en casa, consultar ejercicios y registrar sesiones.

## Novedades de la versión 2.0
- Biblioteca de 50 ejercicios con búsqueda y filtros por grupo muscular.
- Indicaciones de ejecución, equipo opcional y una pequeña animación visual por ejercicio.
- Añadir ejercicios de la biblioteca a cualquiera de las rutinas.
- 8 rutinas prediseñadas y editables.
- Seis temas: rosa, morado, naranja, azul, blanco y negro; además de un color personalizado.
- El tema elegido y las preferencias se guardan localmente.
- Las instalaciones anteriores incorporan las nuevas rutinas sin borrar las rutinas personalizadas ni las sesiones ya guardadas.

## Archivos
- `index.html`: estructura y pantallas.
- `style.css`: diseño adaptable, temas y animaciones.
- `app.js`: biblioteca, rutinas, sesiones, temporizador, calendario, progreso y respaldo local.
- `manifest.json` y `service-worker.js`: instalación y caché básica para uso sin conexión.
- `icon.svg`: icono de la app.

## Publicar gratis con GitHub Pages
1. Descomprime `ZulyFit_proyecto_v2.zip`.
2. Abre la carpeta `ZulyFit`.
3. Sube **el contenido de esa carpeta** a la raíz del repositorio GitHub (debe quedar `index.html` en la raíz).
4. En el repositorio abre **Settings → Pages**.
5. En **Build and deployment**, elige **Deploy from a branch**, selecciona `main` y `/(root)`, y guarda.
6. Cuando termine la publicación, abre la dirección de GitHub Pages en Chrome.
7. En el teléfono usa el menú de Chrome → **Instalar app** o **Añadir a pantalla de inicio**.

## Datos y privacidad
- Rutinas, preferencias y sesiones se guardan en el almacenamiento local del navegador/dispositivo.
- No hay cuentas ni sincronización automática entre dispositivos.
- Usa **Progreso → Exportar mis datos** para crear un respaldo e **Ajustes → Importar respaldo** para recuperarlo.
- Al actualizar el repositorio, no uses el botón de restablecer datos en la aplicación. La migración conserva los datos locales existentes.
- La hora de recordatorio queda guardada como preferencia; esta versión no envía notificaciones automáticas.

## Nota sobre las animaciones
Las tarjetas incluyen iconos animados como apoyo visual y texto de técnica. No son videos ni animaciones anatómicas completas; realiza cada movimiento de forma cómoda y detente si aparece dolor o malestar.
