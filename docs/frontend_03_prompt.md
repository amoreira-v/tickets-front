Actúa como desarrollador Frontend Senior. Necesito configurar el TicketService en Angular para que devuelva datos simulados que coincidan exactamente con el contrato de la prueba técnica.

1. Utiliza el siguiente JSON como base para el mock del método getTickets() :
{ "status": "success", "data": [ { "id": "123e4567-e89b-12d3-a456-426614174000", "title": "Problema de acceso a VPN", "description": "No puedo conectarme a la VPN de la empresa...", "status": "OPEN", "priority": "HIGH", "user_id": "987e6543-e21b-12d3-a456-426614174000", "assigned_to": null, "created_at": "2026-04-25T10:00:00Z", "updated_at": "2026-04-25T10:00:00Z" } ] }
2. El servicio debe retornar un Observable que emita esta estructura.
3. Crea un componente de lista (TicketListComponent) muy básico que consuma este servicio y lo imprima en consola o en una tabla simple para verificar que la interfaz de TypeScript y el JSON encajan perfectamente.
