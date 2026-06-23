/**
 * Form validation logic for the QuoteRequest form.
 * Provides both full-form validation and individual field validators
 * for on-blur validation in the form component.
 *
 * Requirements: 7.1, 7.4
 */

export const WORK_TYPES = [
  'Oil Change',
  'Brake Repair',
  'Engine Diagnostics',
  'Electrical Repair',
  'Transmission Service',
  'Suspension Repair',
  'A/C Service',
  'Tire Services',
  'General Maintenance',
  'Pre-Purchase Inspection',
  'Other',
] as const;

export interface QuoteRequest {
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

export type ValidationResult =
  | { valid: true; data: QuoteRequest }
  | { valid: false; errors: Record<string, string> };

// --- Individual field validators ---
// Each returns an error message string if invalid, or null if valid.

export function validateName(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Name is required';
  }
  if (value.trim().length > 100) {
    return 'Name must be 100 characters or less';
  }
  return null;
}

export function validateMobile(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Mobile number is required';
  }
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    return 'Mobile number must be exactly 10 digits';
  }
  return null;
}

export function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Email is required';
  }
  // Basic email validation: must contain @ with something before and a domain after
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateWorkType(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Type of work is required';
  }
  if (!(WORK_TYPES as readonly string[]).includes(value)) {
    return 'Please select a valid type of work';
  }
  return null;
}

export function validateCarBrand(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Car brand is required';
  }
  return null;
}

export function validateModelName(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'Model name is required';
  }
  return null;
}

export function validateModelYear(value: unknown): string | null {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  if (value === undefined || value === null || value === '') {
    return 'Model year is required';
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);

  if (!Number.isInteger(numValue)) {
    return 'Model year must be a valid number';
  }
  if (numValue < 1980 || numValue > maxYear) {
    return `Model year must be between 1980 and ${maxYear}`;
  }
  return null;
}

export function validatePreferredDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null; // Optional field
  }
  if (typeof value !== 'string') {
    return 'Preferred date must be a valid date';
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  return null;
}

export function validatePreferredTime(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null; // Optional field
  }
  if (typeof value !== 'string') {
    return 'Preferred time must be in HH:mm format';
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(value)) {
    return 'Preferred time must be in HH:mm format (e.g., 14:30)';
  }
  return null;
}

// --- Full form validation ---

export function validateQuoteRequest(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const mobileError = validateMobile(data.mobile);
  if (mobileError) errors.mobile = mobileError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const workTypeError = validateWorkType(data.workType);
  if (workTypeError) errors.workType = workTypeError;

  const carBrandError = validateCarBrand(data.carBrand);
  if (carBrandError) errors.carBrand = carBrandError;

  const modelNameError = validateModelName(data.modelName);
  if (modelNameError) errors.modelName = modelNameError;

  const modelYearError = validateModelYear(data.modelYear);
  if (modelYearError) errors.modelYear = modelYearError;

  const preferredDateError = validatePreferredDate(data.preferredDate);
  if (preferredDateError) errors.preferredDate = preferredDateError;

  const preferredTimeError = validatePreferredTime(data.preferredTime);
  if (preferredTimeError) errors.preferredTime = preferredTimeError;

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  // Build validated data object
  const validatedData: QuoteRequest = {
    name: (data.name as string).trim(),
    mobile: (data.mobile as string).replace(/\D/g, ''),
    email: (data.email as string).trim(),
    workType: data.workType as string,
    carBrand: (data.carBrand as string).trim(),
    modelName: (data.modelName as string).trim(),
    modelYear: typeof data.modelYear === 'string'
      ? parseInt(data.modelYear, 10)
      : Number(data.modelYear),
  };

  // Add optional fields only if provided
  if (data.preferredDate && typeof data.preferredDate === 'string' && data.preferredDate.trim() !== '') {
    validatedData.preferredDate = data.preferredDate;
  }
  if (data.preferredTime && typeof data.preferredTime === 'string' && data.preferredTime.trim() !== '') {
    validatedData.preferredTime = data.preferredTime;
  }

  return { valid: true, data: validatedData };
}
