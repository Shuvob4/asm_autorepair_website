import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * Netlify serverless function to send quote request emails.
 *
 * Behavior:
 * 1. Accepts POST requests with QuoteRequest JSON body
 * 2. Validates incoming data server-side (defense in depth)
 * 3. If RESEND_API_KEY env var is set, sends email via Resend API
 * 4. If no API key is configured, logs the request and returns 200
 * 5. Always returns 200 (visitor sees success regardless of email outcome)
 * 6. Logs failures for developer review (console.error)
 * 7. Includes CORS headers for the frontend
 *
 * Requirements: 7.3, 7.7
 */

const SHOP_EMAIL = process.env.SHOP_EMAIL || 'info@asmautorepair.ca';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QuoteRequest {
  name: string;
  mobile: string;
  email: string;
  workType: string;
  carBrand: string;
  modelName: string;
  modelYear: number;
  preferredDate?: string;
  preferredTime?: string;
}

function validateQuoteData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!data.mobile || typeof data.mobile !== 'string') {
    errors.push('Mobile number is required');
  }
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  if (!data.workType || typeof data.workType !== 'string') {
    errors.push('Type of work is required');
  }
  if (!data.carBrand || typeof data.carBrand !== 'string') {
    errors.push('Car brand is required');
  }
  if (!data.modelName || typeof data.modelName !== 'string') {
    errors.push('Model name is required');
  }
  if (data.modelYear === undefined || data.modelYear === null) {
    errors.push('Model year is required');
  } else {
    const year = Number(data.modelYear);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1980 || year > currentYear + 1) {
      errors.push(`Model year must be between 1980 and ${currentYear + 1}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function formatEmailHtml(data: QuoteRequest): string {
  const lines = [
    '<h2>New Quote Request from ASM AUTO Repair Website</h2>',
    '<table style="border-collapse: collapse; width: 100%; max-width: 600px;">',
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Mobile</td><td style="padding: 8px; border: 1px solid #ddd;">${data.mobile}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type of Work</td><td style="padding: 8px; border: 1px solid #ddd;">${data.workType}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Car Brand</td><td style="padding: 8px; border: 1px solid #ddd;">${data.carBrand}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Model</td><td style="padding: 8px; border: 1px solid #ddd;">${data.modelName}</td></tr>`,
    `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Year</td><td style="padding: 8px; border: 1px solid #ddd;">${data.modelYear}</td></tr>`,
  ];

  if (data.preferredDate) {
    lines.push(`<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Preferred Date</td><td style="padding: 8px; border: 1px solid #ddd;">${data.preferredDate}</td></tr>`);
  }
  if (data.preferredTime) {
    lines.push(`<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Preferred Time</td><td style="padding: 8px; border: 1px solid #ddd;">${data.preferredTime}</td></tr>`);
  }

  lines.push('</table>');
  lines.push('<p style="margin-top: 16px; color: #666;">This quote request was submitted via the ASM AUTO Repair website.</p>');

  return lines.join('\n');
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');

    // Validate basic fields exist (defense in depth)
    const validation = validateQuoteData(data);
    if (!validation.valid) {
      console.error('Validation failed:', validation.errors);
      // Still return 200 — visitor sees success regardless (Requirement 7.7)
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }

    const quoteData: QuoteRequest = {
      name: data.name.trim(),
      mobile: data.mobile,
      email: data.email.trim(),
      workType: data.workType,
      carBrand: data.carBrand.trim(),
      modelName: data.modelName.trim(),
      modelYear: Number(data.modelYear),
      preferredDate: data.preferredDate || undefined,
      preferredTime: data.preferredTime || undefined,
    };

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send email via Resend API
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ASM AUTO Repair <noreply@asmautorepair.ca>',
            to: [SHOP_EMAIL],
            subject: `Quote Request: ${quoteData.workType} — ${quoteData.name}`,
            html: formatEmailHtml(quoteData),
            reply_to: quoteData.email,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Resend API error:', response.status, errorBody);
        } else {
          console.log('Quote email sent successfully for:', quoteData.name);
        }
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
      }
    } else {
      // No API key configured — log the request for developer review
      console.log('RESEND_API_KEY not configured. Quote request received:', JSON.stringify(quoteData, null, 2));
    }

    // Always return 200 — visitor sees success regardless of email outcome
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Email function error:', error);
    // Return 200 even on unexpected errors (Requirement 7.7)
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  }
};
