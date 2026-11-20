<!-- mobile-factory:hero -->
<div align="center">

# 📚 Lectura Viva

**Una página a la vez.**

[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE) [![Expo](https://img.shields.io/badge/Expo-57-183F35)](https://expo.dev/sdk/57)

[Funciones](#funciones) · [Instalación](#instalación) · [Arquitectura](#arquitectura) · [Pruebas](#pruebas)

</div>

Una bitácora de lectura personal con biblioteca, sesiones, notas y estadísticas. Las semillas son ficticias.

## Funciones

- Inicio con progreso, biblioteca buscable, detalle e historial, creación y edición, registro de sesiones y estadísticas.
- Validación de páginas disponibles, minutos y confirmación al eliminar.
- Persistencia mediante MobileLab 1.1.0 y SQLite.

## Instalación

Node 22, Expo SDK 57 y React Native 0.86. Instala MobileLab 1.1.0 desde [Releases](https://github.com/GianSandoval5/MobileLab/releases), verifica el checksum publicado y ejecuta `mobilelab start` desde la raíz. En otra terminal, `npm ci` y `npm start`. Para Android, `npm run android`; para iOS, `npm run ios`.

La API HTTP local es /api/books; el emulador Android usa http://10.0.2.2:4566 y el simulador iOS http://127.0.0.1:4566. En dispositivo físico configura EXPO_PUBLIC_MOBILELAB_URL con la IP LAN del equipo y permite conexiones al sandbox solo en una red de desarrollo confiable. El proceso debe estar activo; los datos se conservan tras reiniciar. No es un backend de producción.

## Arquitectura

src/features/library contiene domain (libro, sesión, reglas, contrato), data (DTO y repositorio HTTP), presentation (UI y estado); src/shared contiene cliente HTTP inyectable. Para producción reemplaza el repositorio/inyección por un servicio HTTPS con autenticación, autorización y migraciones, manteniendo las reglas del dominio.

## Pruebas

Ejecuta `npm test -- --runInBand --coverage`, `npm run typecheck`, `npx expo install --check` y `npx expo export --platform android`. Para la integración real ejecuta `MOBILELAB_BIN=/ruta/mobilelab python3 scripts/verify_mobilelab.py`. La comprobación crea un sandbox temporal, verifica CRUD y reinicia el servicio. Los resultados se registran en Actions del publicador. No se garantiza compilación nativa iOS ni Android APK.

## Autor

Gian Sandoval — Arquitecto Mobile. [GitHub](https://github.com/GianSandoval5) · [LinkedIn](https://www.linkedin.com/in/giansandoval/) · [Web](https://giansandoval.com). Repositorio: https://github.com/GianSandoval5/react-native-lectura-viva. Si te resulta útil, deja una ⭐.

Licencia [MIT](LICENSE).


## Conecta con Gian Sandoval

Si este proyecto te sirve, deja una ⭐ en el repositorio para apoyar la serie de proyectos abiertos.

- GitHub: https://github.com/GianSandoval5
- LinkedIn: https://www.linkedin.com/in/giansandoval/
- Web: https://giansandoval.com

**Gian Sandoval — Arquitecto Mobile**
