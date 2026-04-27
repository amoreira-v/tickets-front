Actúa como un desarrollador Frontend Senior experto en Angular 21. Ya tenemos las vistas y los servicios funcionando con datos simulados (Mocks). Es hora de conectarlos con el Backend real.

Por favor, proporciona:
1. La configuración del archivo src/environments/environment.ts para definir la URL base de la API del backend.
2. La actualización del AuthService para que los métodos de login y register realicen peticiones POST reales usando el HttpClient de Angular.
3. La actualización del TicketService para que el método getTickets() consuma el endpoint GET /api/tickets del servidor en lugar de los mocks.

Asegúrate de configurar la inyección de provideHttpClient() en el archivo app.config.ts (siguiendo el estándar de Standalone Components de Angular 21).

REQUISITO: Las respuestas del servidor siguen el formato { 'status': 'success', 'data': [...] }. Asegúrate de mapear correctamente los datos para que los componentes sigan funcionando sin cambios.
