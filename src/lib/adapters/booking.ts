export interface BookingSlot {
  date: string;       // ISO date
  time: string;       // HH:mm
  available: boolean;
}

export interface CreateAppointmentInput {
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  vehicle: { brand: string; model: string; year: number };
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export interface AppointmentResult {
  id: string;
  calendarEventId?: string;
  status: 'pending' | 'confirmed';
  confirmationUrl?: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  vehicle: { brand: string; model: string; year: number };
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  calendarEventId?: string;
  notes?: string;
}

export interface BookingProvider {
  getAvailableSlots(startDate: string, endDate: string): Promise<BookingSlot[]>;
  createAppointment(input: CreateAppointmentInput): Promise<AppointmentResult>;
  getAppointment(id: string): Promise<Appointment | null>;
  updateAppointment(id: string, updates: Partial<CreateAppointmentInput>): Promise<AppointmentResult>;
  cancelAppointment(id: string, reason?: string): Promise<{ success: boolean }>;
}

export function createBookingProvider(config: {
  provider: 'calcom' | 'google-calendar' | 'calendly' | 'acuity';
  apiKey: string;
  calendarId?: string;
}): BookingProvider {
  throw new Error('Phase 2 — not yet implemented');
}
