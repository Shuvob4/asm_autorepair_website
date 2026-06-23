# Phase 3 — Automated Email Notifications (Design Only)

This document describes the design for the automated email notification system. This is a **design-only** phase — no runtime implementation exists yet. The TypeScript interface is defined at `src/lib/adapters/email.ts`.

## Feature Flag

```
FEATURE_EMAIL_ENABLED=false
```

When set to `true`, email notification logic will be active. Default is `false` — zero email code executes in production until explicitly enabled.

---

## Email Template Schema

```typescript
interface EmailTemplate {
  id: string;
  name: string;           // e.g., "appointment_reminder_24h"
  subject: string;        // Supports {{variable}} interpolation
  body: string;           // HTML template with {{variables}}
  variables: string[];    // Expected template variables
}
```

### Template Examples

| Template Name | Subject | Variables |
|--------------|---------|-----------|
| `booking_confirmation` | `Your appointment at ASM AUTO Repair is confirmed` | `customerName`, `date`, `time`, `serviceType` |
| `reminder_24h` | `Reminder: Your appointment tomorrow at {{time}}` | `customerName`, `date`, `time`, `serviceType`, `address` |
| `reminder_1h` | `Your appointment is in 1 hour` | `customerName`, `time`, `serviceType` |
| `post_service_followup` | `How was your visit to ASM AUTO Repair?` | `customerName`, `serviceType`, `reviewUrl` |

### Template Variable Interpolation

Variables in templates use `{{variableName}}` syntax. At send time, the email engine replaces each `{{variable}}` with the corresponding value from the notification context.

```html
<!-- Example: reminder_24h body -->
<h1>Hi {{customerName}},</h1>
<p>This is a reminder that your <strong>{{serviceType}}</strong> appointment is scheduled for:</p>
<p><strong>{{date}} at {{time}}</strong></p>
<p>📍 296 Brock Ave, Toronto, ON M6K 2M4</p>
<p>If you need to reschedule, please call us at (416) 516-8181 or reply to this email.</p>
```

---

## Trigger Conditions

Emails are sent automatically based on time-relative triggers tied to appointment records.

| Trigger | Condition | Template |
|---------|-----------|----------|
| 24 hours before appointment | `appointment.date - 24h` | `reminder_24h` |
| 1 hour before appointment | `appointment.date - 1h` | `reminder_1h` |
| Post-service follow-up | `appointment.status === 'completed' + 24h` | `post_service_followup` |
| Booking confirmation | `appointment.status` changes to `confirmed` | `booking_confirmation` |

### Trigger Evaluation

A scheduled function (cron job or Netlify Scheduled Function) runs every 15 minutes:

1. Query appointments where `status === 'confirmed'`
2. For each appointment, calculate time until appointment
3. If within trigger window (e.g., 24h ± 15min), send the corresponding email
4. Mark the notification as sent to prevent duplicates

```typescript
interface TriggerCondition {
  type: 'time_before_appointment' | 'status_change' | 'post_completion';
  minutes: number;  // e.g., 1440 (24h), 60 (1h), -1440 (24h after)
}
```

---

## Provider Options

| Provider | Cost | Daily Limit (Free) | Key Features | Limitations |
|----------|------|-------------------|--------------|-------------|
| Resend | $0 (free tier) | 100 emails/day | Modern API, great DX, React email templates | 3,000/month cap on free tier |
| Brevo (ex-Sendinblue) | $0 (free tier) | 300 emails/day | Higher free limit, SMTP relay, marketing tools | Brevo branding on free tier |
| SendGrid | $15/month (Essentials) | 100/day (free) | Industry standard, deliverability tools, analytics | Free tier very limited (100/day) |

### Recommended Approach

Start with **Resend** (100 emails/day free, 3,000/month) for simplicity and modern developer experience. If volume exceeds 100/day, switch to **Brevo** (300/day free) or upgrade Resend ($20/month for 50K emails).

---

## Provider Configuration

```typescript
interface EmailProviderConfig {
  provider: 'resend' | 'brevo' | 'sendgrid';
  apiKey: string;            // Provider API key (stored in environment variable)
  senderAddress: string;     // e.g., "noreply@asmautorepair.ca"
  senderName: string;        // e.g., "ASM AUTO Repair"
  replyTo: string;           // e.g., "info@asmautorepair.ca"
}
```

### Environment Variables

```env
FEATURE_EMAIL_ENABLED=true
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_xxxxxxxxxxxx
EMAIL_SENDER=noreply@asmautorepair.ca
EMAIL_SENDER_NAME=ASM AUTO Repair
EMAIL_REPLY_TO=info@asmautorepair.ca
```

---

## TypeScript Interface Location

```
src/lib/adapters/email.ts
```

### Interface Summary

```typescript
interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<EmailResult>;
  sendBatch(input: BatchEmailInput): Promise<EmailResult[]>;
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: string[];
}

interface EmailResult {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  error?: string;
}
```

Implementations planned: `ResendAdapter`, `BrevoAdapter`, `SendGridAdapter`

---

## Error Handling

- If email send fails, log the error and retry once after 5 minutes
- After 2 failures, mark the notification as `failed` and alert the developer (via Netlify function logs)
- Never block appointment workflow on email failures — emails are best-effort notifications
- Store all send attempts in a notification log for debugging

---

## Data Flow

```
Appointment confirmed
  → Trigger: booking_confirmation email sent immediately
  → Scheduler checks every 15 min:
    → 24h before → reminder_24h email
    → 1h before → reminder_1h email
  → Appointment completed
    → 24h after → post_service_followup email
```
