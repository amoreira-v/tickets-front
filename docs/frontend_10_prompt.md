Actúa como un Lead Frontend Developer experto en Angular 21. Necesito implementar un sistema de navegación dinámica basado en los permisos que vienen del servidor.

Por favor, realiza lo siguiente:
1. AuthService Update: Modifica el servicio de autenticación para que, tras un login exitoso, guarde el array de funciones en el estado de la aplicación (puedes usar un Signal de Angular o localStorage).
2. Componente Sidebar/Navbar: Crea un componente de navegación que recorra el array de funciones del usuario logueado usando la sentencia @for.
3. Generación de Menú: Los enlaces del menú deben generarse dinámicamente usando el path, name e icon recibidos del backend. Si una función no está en el array del usuario, el enlace no debe existir en el DOM .
