import type { Handler, HandlerEvent } from '@netlify/functions';

/**
 * Netlify serverless function to handle quote request submissions.
 *
 * Features:
 * 1. Sends notification email to shop (SHOP_EMAIL)
 * 2. Sends confirmation email to the customer
 * 3. Logs submission to Google Sheet (for tracking/Excel export)
 * 4. Always returns 200 to visitor regardless of backend failures
 *
 * Environment variables:
 * - RESEND_API_KEY: Resend API key for sending emails
 * - SHOP_EMAIL: Shop notification recipient
 * - GOOGLE_SHEET_WEBHOOK_URL: Google Apps Script web app URL for Sheet logging
 */

const SHOP_EMAIL = process.env.SHOP_EMAIL || 'hossainliyana@gmail.com';

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

// --- Email to Shop (notification) ---
function formatShopEmailHtml(data: QuoteRequest): string {
  const lines = [
    '<h2>New Quote Request</h2>',
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
  lines.push('<p style="margin-top: 16px; color: #666;">Submitted via ASM AUTO Repair website.</p>');

  return lines.join('\n');
}

// --- Email to Customer (confirmation) ---
function formatCustomerEmailHtml(data: QuoteRequest): string {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
      <div style="background: #0A0A0A; padding: 24px; text-align: center;">
        <h1 style="color: #F5C400; font-size: 24px; margin: 0;">ASM AUTO Repair</h1>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="margin-top: 0;">Hi ${data.name},</h2>
        <p>Thank you for your quote request! We've received your details and our team will review them shortly.</p>
        <p><strong>Here's a summary of your request:</strong></p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #EAEAEA; font-weight: bold;">Service</td><td style="padding: 8px; border: 1px solid #EAEAEA;">${data.workType}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #EAEAEA; font-weight: bold;">Vehicle</td><td style="padding: 8px; border: 1px solid #EAEAEA;">${data.modelYear} ${data.carBrand} ${data.modelName}</td></tr>
          ${data.preferredDate ? `<tr><td style="padding: 8px; border: 1px solid #EAEAEA; font-weight: bold;">Preferred Date</td><td style="padding: 8px; border: 1px solid #EAEAEA;">${data.preferredDate}</td></tr>` : ''}
          ${data.preferredTime ? `<tr><td style="padding: 8px; border: 1px solid #EAEAEA; font-weight: bold;">Preferred Time</td><td style="padding: 8px; border: 1px solid #EAEAEA;">${data.preferredTime}</td></tr>` : ''}
        </table>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Our team will review your request within 1 business day</li>
          <li>We'll contact you at ${data.mobile} with an estimate</li>
          <li>No obligation — feel free to ask questions anytime</li>
        </ul>
        <p>Need to reach us sooner? Call or WhatsApp us at <a href="tel:+14165168181" style="color: #F5C400;">(416) 516-8181</a></p>
      </div>
      <div style="background: #0A0A0A; padding: 16px 24px; text-align: center;">
        <p style="color: #8B8B8B; font-size: 12px; margin: 0;">ASM AUTO Repair · 296 Brock Ave, Toronto, ON M6K 2M4</p>
      </div>
    </div>
  `;
}

// --- Log to Google Sheet ---
async function logToGoogleSheet(data: QuoteRequest): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('GOOGLE_SHEET_WEBHOOK_URL not configured — skipping sheet logging.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        workType: data.workType,
        carBrand: data.carBrand,
        modelName: data.modelName,
        modelYear: data.modelYear,
        preferredDate: data.preferredDate || '',
        preferredTime: data.preferredTime || '',
      }),
    });

    if (!response.ok) {
      console.error('Google Sheet webhook error:', response.status);
    } else {
      console.log('Quote logged to Google Sheet for:', data.name);
    }
  } catch (error) {
    console.error('Failed to log to Google Sheet:', error);
  }
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

    // Validate
    const validation = validateQuoteData(data);
    if (!validation.valid) {
      console.error('Validation failed:', validation.errors);
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
      // 1. Send notification email to SHOP
      try {
        const shopResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ASM AUTO Repair <noreply@asmautorepair.ca>',
            to: [SHOP_EMAIL],
            subject: `New Quote: ${quoteData.workType} — ${quoteData.name}`,
            html: formatShopEmailHtml(quoteData),
            reply_to: quoteData.email,
          }),
        });

        if (!shopResponse.ok) {
          console.error('Shop email error:', await shopResponse.text());
        } else {
          console.log('Shop notification email sent for:', quoteData.name);
        }
      } catch (err) {
        console.error('Failed to send shop email:', err);
      }

      // 2. Send confirmation email to CUSTOMER
      try {
        const customerResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ASM AUTO Repair <noreply@asmautorepair.ca>',
            to: [quoteData.email],
            subject: `Your Quote Request — ASM AUTO Repair`,
            html: formatCustomerEmailHtml(quoteData),
            reply_to: SHOP_EMAIL,
          }),
        });

        if (!customerResponse.ok) {
          console.error('Customer email error:', await customerResponse.text());
        } else {
          console.log('Customer confirmation email sent to:', quoteData.email);
        }
      } catch (err) {
        console.error('Failed to send customer email:', err);
      }
    } else {
      console.log('RESEND_API_KEY not configured. Quote received:', JSON.stringify(quoteData, null, 2));
    }

    // 3. Log to Google Sheet (for quote tracking / Excel export)
    await logToGoogleSheet(quoteData);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Quote function error:', error);
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  }
};
