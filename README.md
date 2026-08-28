# ownlibrary

Panel web para administrar una biblioteca: catálogo de ejemplares, usuarios y un resumen del estado de la colección.

## Funcionalidades

- Inicio de sesión con usuarios de demostración.
- Vista general con métricas de disponibilidad, préstamos y mantenimiento.
- Búsqueda por título, autor o ISBN.
- Filtros por estado del ejemplar.
- Alta, edición y eliminación de libros.
- Alta de usuarios con rol y estado.
- Tema claro y oscuro.
- API REST local con persistencia en `server/data.json`.

## Requisitos

- Node.js y npm.

## Instalación

```bash
npm install
```

## Desarrollo

El siguiente comando inicia Vite y la API Express al mismo tiempo:

```bash
npm run dev
```

La aplicación web estará disponible en `http://localhost:5173` y la API en `http://localhost:3001`.

También puedes iniciar cada parte por separado:

```bash
npm run dev:client
npm run dev:server
```

## Otros comandos

```bash
npm run build    # Genera la compilación de producción
npm run preview  # Sirve la compilación generada
```

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Comprueba el estado de la API |
| `GET` | `/api/books` | Lista los libros |
| `POST` | `/api/books` | Añade un libro |
| `PUT` | `/api/books/:id` | Actualiza un libro |
| `DELETE` | `/api/books/:id` | Elimina un libro |
| `GET` | `/api/users` | Lista los usuarios |
| `POST` | `/api/users` | Añade un usuario |

Las rutas de libros y usuarios leen y escriben en `server/data.json`.

## Acceso de demostración

- Email: `lucia@ownlibrary.local`
- Contraseña: `lucia123`

Los usuarios y contraseñas incluidos son únicamente datos de demostración. No uses esta autenticación ni el almacenamiento local de datos en producción sin implementar controles de seguridad adecuados.

## Tecnologías

- React 18
- Vite
- Express
- Lucide React
