# Phase 2 — Online Appointment Booking (Design Only)

This document describes the design for the online appointment booking feature. This is a **design-only** phase — no runtime implementation exists yet. The TypeScript interface is defined at `src/lib/adapters/booking.ts`.

## Feature Flag

```
FEATURE_BOOKING_ENABLED=false
```

When set to `true`, booking UI components will render. Default is `false` — zero booking code shipped to production until explicitly enabled.

---

## Appointment Schema

```typescript
interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  serviceType: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  date: string;          // ISO date (e.g., "2024-03-15")
  time: string;          // HH:mm (e.g., "14:30")
  duration: number;      // minutes (e.g., 60)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;     // ISO datetime
  updatedAt: string;     // ISO datetime
  calendarEventId?: string;  // External calendar reference
  notes?: string;
}
```

### Field Details

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | Yes | UUID or provider-generated |
| customerName | string | Yes | Max 100 characters |
| phone | string | Yes | 10-digit format |
| email | string | Yes | Valid email |
| serviceType | string | Yes | From predefined service list |
| vehicle.brand | string | Yes | — |
| vehicle.model | string | Yes | — |
| vehicle.year | number | Yes | 1980 to current year + 1 |
| date | string | Yes | ISO date, must be a future date |
| time | string | Yes | Within business hours |
| duration | number | Yes | 30, 60, 90, or 120 minutes |
| status | enum | Yes | pending → confirmed → completed/cancelled |
| calendarEventId | string | No | Set after calendar sync |
| notes | string | No | Max 500 characters |

---

## Integration Points

### Google Calendar Event Creation

When an appointment is confirmed:

1. Create a Google Calendar event with:
   - Title: `{serviceType} — {customerName}`
   - Start: `{date}T{time}` in America/Toronto timezone
   - Duration: `{duration}` minutes
   - Description: Vehicle info, phone, email, notes
   - Location: "296 Brock Ave, Toronto, ON M6K 2M4"
2. Store the returned `calendarEventId` on the appointment record
3. If the appointment is cancelled, delete or cancel the calendar event

### Excel/Sheet Auto-Generation

For record-keeping and accounting:

1. On appointment creation/update, append a row to a Google Sheet with all appointment fields
2. Sheet columns: Date, Time, Customer, Phone, Email, Service, Vehicle, Status, Notes
3. Sheet can be downloaded as Excel (.xlsx) for offline records
4. Trigger: Google Apps Script `onEdit` or a scheduled sync function

---

## Provider Options

| Provider | Cost | Key Features | Limitations |
|----------|------|--------------|-------------|
| Cal.com | Free (self-hosted) | Open-source, full API, custom workflows | Requires self-hosting for free tier |
| Google Calendar Appointment Slots | Free | Native Google integration, familiar UI | Limited customization, no embeddable widget |
| Calendly | $8–$12/month (Standard) | Polished embed widget, email reminders | Paid for useful features, limited API on free tier |
| Acuity (Squarespace) | $16/month (Emerging) | Intake forms, packages, gift certificates | Higher cost, Squarespace ecosystem |

### Recommended Approach

Start with **Cal.com** (self-hosted on existing VPS or Railway free tier) for zero cost with full API access. Fall back to **Google Calendar Appointment Slots** if self-hosting is not feasible.

---

## TypeScript Interface Location

```
src/lib/adapters/booking.ts
```

### Interface Summary

```typescript
interface BookingProvider {
  getAvailableSlots(startDate: string, endDate: string): Promise<BookingSlot[]>;
  createAppointment(input: CreateAppointmentInput): Promise<AppointmentResult>;
  getAppointment(id: string): Promise<Appointment | null>;
  updateAppointment(id: string, updates: Partial<CreateAppointmentInput>): Promise<AppointmentResult>;
  cancelAppointment(id: string, reason?: string): Promise<{ success: boolean }>;
}
```

Implementations planned: `CalComAdapter`, `GoogleCalendarAdapter`, `CalendlyAdapter`, `AcuityAdapter`

---

## UI Flow (Future Implementation)

1. Visitor selects a service type
2. Calendar widget shows available dates/times (from `getAvailableSlots`)
3. Visitor fills in contact info and vehicle details
4. Form submits → `createAppointment` → status: `pending`
5. Shop confirms via dashboard → status: `confirmed` → Google Calendar event created
6. Visitor receives confirmation (email — Phase 3)

---

## Status Transitions

```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
```

Only the shop operator can transition `pending → confirmed`. Visitors can cancel from a confirmation link.
