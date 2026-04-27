# Ticket Management System - Frontend (Angular 21)

Este es el cliente frontend para la plataforma de gestión de tickets, construido con las últimas tecnologías de Angular 21, Signals y Standalone Components.

## Requisitos Previos

*   **Node.js**: Versión 20 o superior.
*   **Angular CLI**: (Opcional, pero recomendado) `npm install -g @angular/cli`.

## Instalación

1.  Clona el repositorio o navega a la carpeta del proyecto.
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```

## Ejecución del Proyecto

Para iniciar el servidor de desarrollo, simplemente ejecuta:

```bash
npm start
```

La aplicación se levantará automáticamente en [http://localhost:4200](http://localhost:4200). 

> **Nota**: El sistema realizará un "Health Check" automático al cargar para verificar que el Backend esté disponible en la URL configurada en `src/environments/environment.ts`.

## Comandos Útiles

*   `npm run build`: Genera el bundle de producción en la carpeta `dist/`.
*   `npm run test`: Ejecuta la suite de pruebas unitarias con Vitest.
*   `npm run watch`: Compilación continua para desarrollo.

## Arquitectura

*   **Core**: Servicios globales (Auth, API Interceptors, Guards).
*   **Shared**: Componentes UI reutilizables.
*   **Features**: Módulos de negocio (Auth, Tickets, Admin).
*   **Standalone**: Cada componente gestiona sus propias dependencias, optimizando el lazy loading.

## Perfiles de Prueba (Mock/Backend)

*   **Admin**: `admin@empresa.com` / Cualquier password (min 6 caracteres).
*   **Soporte**: `support@empresa.com`
*   **Cliente**: `test@empresa.com`
