/**
 * QuoteForm Island Component (Preact, client:load)
 * Full quote request form with validation, WhatsApp submission, and email backup.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */
import { useState } from 'preact/hooks';
import {
  validateQuoteRequest,
  validateName,
  validateMobile,
  validateEmail,
  validateWorkType,
  validateCarBrand,
  validateModelName,
  validateModelYear,
  WORK_TYPES,
} from '../../lib/validation';
import { buildWhatsAppUrl } from '../../lib/format';

const currentYear = new Date().getFullYear();

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    workType: '',
    carBrand: '',
    modelName: '',
    modelYear: '',
    preferredDate: '',
    preferredTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name': return validateName(value);
      case 'mobile': return validateMobile(value);
      case 'email': return validateEmail(value);
      case 'workType': return validateWorkType(value);
      case 'carBrand': return validateCarBrand(value);
      case 'modelName': return validateModelName(value);
      case 'modelYear': return validateModelYear(value);
      default: return null;
    }
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }
        return next;
      });
    }
  };

  const handleBlur = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate entire form
    const result = validateQuoteRequest(formData);

    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});

    // Build WhatsApp URL and open it
    const whatsappUrl = buildWhatsAppUrl({
      name: formData.name,
      workType: formData.workType,
      year: Number(formData.modelYear),
      brand: formData.carBrand,
      model: formData.modelName,
    });
    window.open(whatsappUrl, '_blank');

    // Send email backup via Netlify Function (fire and forget)
    try {
      await fetch('/.netlify/functions/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          modelYear: Number(formData.modelYear),
        }),
      });
    } catch {
      // Email failure is logged server-side; visitor still sees success
      console.warn('Email backup failed — logged for developer review.');
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div class="quote-form__success" role="alert">
        <h2>Thank You!</h2>
        <p>
          Your quote request has been received. We'll review your vehicle details
          and get back to you within 1 business day.
        </p>
        <p>
          A WhatsApp message has been opened for immediate communication with our
          team.
        </p>
      </div>
    );
  }

  return (
    <form class="quote-form" onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div class="quote-form__field">
        <label htmlFor="quote-name">Name *</label>
        <input
          type="text"
          id="quote-name"
          name="name"
          value={formData.name}
          onInput={handleChange}
          onBlur={handleBlur}
          maxLength={100}
          required
          aria-invalid={touched.name && !!errors.name}
          aria-describedby={errors.name ? 'quote-name-error' : undefined}
        />
        {touched.name && errors.name && (
          <span id="quote-name-error" class="quote-form__error" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Mobile */}
      <div class="quote-form__field">
        <label htmlFor="quote-mobile">Mobile Number *</label>
        <input
          type="tel"
          id="quote-mobile"
          name="mobile"
          value={formData.mobile}
          onInput={handleChange}
          onBlur={handleBlur}
          placeholder="4165551234"
          required
          aria-invalid={touched.mobile && !!errors.mobile}
          aria-describedby={errors.mobile ? 'quote-mobile-error' : undefined}
        />
        {touched.mobile && errors.mobile && (
          <span id="quote-mobile-error" class="quote-form__error" role="alert">
            {errors.mobile}
          </span>
        )}
      </div>

      {/* Email */}
      <div class="quote-form__field">
        <label htmlFor="quote-email">Email *</label>
        <input
          type="email"
          id="quote-email"
          name="email"
          value={formData.email}
          onInput={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'quote-email-error' : undefined}
        />
        {touched.email && errors.email && (
          <span id="quote-email-error" class="quote-form__error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* Work Type */}
      <div class="quote-form__field">
        <label htmlFor="quote-workType">Type of Work *</label>
        <select
          id="quote-workType"
          name="workType"
          value={formData.workType}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={touched.workType && !!errors.workType}
          aria-describedby={errors.workType ? 'quote-workType-error' : undefined}
        >
          <option value="">Select a service...</option>
          {WORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {touched.workType && errors.workType && (
          <span id="quote-workType-error" class="quote-form__error" role="alert">
            {errors.workType}
          </span>
        )}
      </div>

      {/* Car Brand */}
      <div class="quote-form__field">
        <label htmlFor="quote-carBrand">Car Brand *</label>
        <input
          type="text"
          id="quote-carBrand"
          name="carBrand"
          value={formData.carBrand}
          onInput={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={touched.carBrand && !!errors.carBrand}
          aria-describedby={errors.carBrand ? 'quote-carBrand-error' : undefined}
        />
        {touched.carBrand && errors.carBrand && (
          <span id="quote-carBrand-error" class="quote-form__error" role="alert">
            {errors.carBrand}
          </span>
        )}
      </div>

      {/* Model Name */}
      <div class="quote-form__field">
        <label htmlFor="quote-modelName">Model Name *</label>
        <input
          type="text"
          id="quote-modelName"
          name="modelName"
          value={formData.modelName}
          onInput={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={touched.modelName && !!errors.modelName}
          aria-describedby={errors.modelName ? 'quote-modelName-error' : undefined}
        />
        {touched.modelName && errors.modelName && (
          <span id="quote-modelName-error" class="quote-form__error" role="alert">
            {errors.modelName}
          </span>
        )}
      </div>

      {/* Model Year */}
      <div class="quote-form__field">
        <label htmlFor="quote-modelYear">Model Year *</label>
        <input
          type="number"
          id="quote-modelYear"
          name="modelYear"
          value={formData.modelYear}
          onInput={handleChange}
          onBlur={handleBlur}
          min={1980}
          max={currentYear + 1}
          placeholder={`1980–${currentYear + 1}`}
          required
          aria-invalid={touched.modelYear && !!errors.modelYear}
          aria-describedby={errors.modelYear ? 'quote-modelYear-error' : undefined}
        />
        {touched.modelYear && errors.modelYear && (
          <span id="quote-modelYear-error" class="quote-form__error" role="alert">
            {errors.modelYear}
          </span>
        )}
      </div>

      {/* Preferred Date (optional) */}
      <div class="quote-form__field">
        <label htmlFor="quote-preferredDate">Preferred Date (optional)</label>
        <input
          type="date"
          id="quote-preferredDate"
          name="preferredDate"
          value={formData.preferredDate}
          onInput={handleChange}
        />
      </div>

      {/* Preferred Time (optional) */}
      <div class="quote-form__field">
        <label htmlFor="quote-preferredTime">Preferred Time (optional)</label>
        <input
          type="time"
          id="quote-preferredTime"
          name="preferredTime"
          value={formData.preferredTime}
          onInput={handleChange}
        />
      </div>

      {/* Submit */}
      <button type="submit" class="quote-form__submit">
        Submit Quote Request
      </button>
    </form>
  );
}
