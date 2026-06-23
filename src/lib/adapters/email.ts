export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: string[];
}

export interface BatchEmailInput {
  emails: SendEmailInput[];
}

export interface EmailResult {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  error?: string;
}

export interface EmailProviderConfig {
  provider: 'resend' | 'brevo' | 'sendgrid';
  apiKey: string;
  senderAddress: string;
  senderName: string;
  replyTo: string;
}

export interface EmailProvider {
  sendEmail(input: SendEmailInput): Promise<EmailResult>;
  sendBatch(input: BatchEmailInput): Promise<EmailResult[]>;
}

export function createEmailProvider(config: EmailProviderConfig): EmailProvider {
  throw new Error('Phase 3 — not yet implemented');
}
