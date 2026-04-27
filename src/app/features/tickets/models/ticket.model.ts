export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Ticket {
  id: number | string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  user_id: number | string;
  assigned_to: number | string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketResponse {
  status: string;
  data: Ticket[];
}
