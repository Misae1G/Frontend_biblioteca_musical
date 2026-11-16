# Frontend: Sistema de Gestión de la Biblioteca Musical

Interfaz web, adaptable a computadoras, tabletas y celulares, para administrar la biblioteca musical de una orquesta.

## Tecnologías

- React 18 y Vite
- Tailwind CSS v4
- React Router
- React Hook Form
- Zustand
- Axios

## Requisitos

- Node.js LTS
- Git
- El backend en ejecución (ver el repositorio del backend)

## Instalación

```bash
git clone <URL-del-repositorio>
cd Frontend
npm install
```

## Configuración

Copia `.env.example` como `.env`:

```
VITE_BACKEND_URL=http://localhost:3000/api
```

Todo lo que va en este archivo es público (se incluye en el código del navegador). Nunca pongas claves secretas aquí.

## Ejecución

```bash
npm run dev       # desarrollo
npm run build     # compilar para producción
npm run lint      # revisar el código
npm run preview   # probar la compilación
```

## Estructura

```
src/
├── api/        # configuración de Axios y llamadas a la API
├── assets/     # imágenes y recursos
├── components/ # componentes reutilizables (ui/ y por módulo)
├── hooks/      # hooks personalizados
├── layout/     # estructuras de página por rol
├── pages/      # auth/, admin/, biblioteca/
├── routes/     # rutas y protección por rol
├── store/      # estado de sesión (Zustand)
└── utils/
```

## Estado del proyecto

En desarrollo. Fase actual: planificación y preparación.