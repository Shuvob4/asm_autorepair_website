import { describe, it, expect } from 'vitest';
import {
  validateQuoteRequest,
  validateName,
  validateMobile,
  validateEmail,
  validateWorkType,
  validateCarBrand,
  validateModelName,
  validateModelYear,
  validatePreferredDate,
  validatePreferredTime,
  WORK_TYPES,
} from '../validation';

describe('validateQuoteRequest', () => {
  const validData = {
    name: 'John Doe',
    mobile: '4165551234',
    email: 'john@example.com',
    workType: 'Oil Change',
    carBrand: 'Toyota',
    modelName: 'Corolla',
    modelYear: 2020,
  };

  it('returns valid for a correct full submission', () => {
    const result = validateQuoteRequest(validData);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.mobile).toBe('4165551234');
      expect(result.data.modelYear).toBe(2020);
    }
  });

  it('returns valid with optional fields included', () => {
    const result = validateQuoteRequest({
      ...validData,
      preferredDate: '2025-03-15',
      preferredTime: '14:30',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.preferredDate).toBe('2025-03-15');
      expect(result.data.preferredTime).toBe('14:30');
    }
  });

  it('returns errors for empty data', () => {
    const result = validateQuoteRequest({});
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.mobile).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.workType).toBeDefined();
      expect(result.errors.carBrand).toBeDefined();
      expect(result.errors.modelName).toBeDefined();
      expect(result.errors.modelYear).toBeDefined();
    }
  });

  it('does not include errors for valid fields', () => {
    const result = validateQuoteRequest({
      name: 'Jane',
      mobile: '1234567890',
      email: 'bad-email',
      workType: 'Oil Change',
      carBrand: 'Honda',
      modelName: 'Civic',
      modelYear: 2022,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.name).toBeUndefined();
      expect(result.errors.mobile).toBeUndefined();
      expect(result.errors.workType).toBeUndefined();
    }
  });

  it('strips mobile number to digits only in output', () => {
    const result = validateQuoteRequest({
      ...validData,
      mobile: '(416) 555-1234',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.mobile).toBe('4165551234');
    }
  });

  it('trims whitespace from string fields', () => {
    const result = validateQuoteRequest({
      ...validData,
      name: '  John Doe  ',
      email: ' john@example.com ',
      carBrand: ' Toyota ',
      modelName: ' Corolla ',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
      expect(result.data.carBrand).toBe('Toyota');
      expect(result.data.modelName).toBe('Corolla');
    }
  });

  it('handles modelYear as string input', () => {
    const result = validateQuoteRequest({
      ...validData,
      modelYear: '2020',
    });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.modelYear).toBe(2020);
    }
  });
});

describe('validateName', () => {
  it('returns null for valid name', () => {
    expect(validateName('John')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(validateName('')).toBe('Name is required');
  });

  it('rejects whitespace-only string', () => {
    expect(validateName('   ')).toBe('Name is required');
  });

  it('rejects name over 100 chars', () => {
    expect(validateName('a'.repeat(101))).toBe('Name must be 100 characters or less');
  });

  it('accepts exactly 100 chars', () => {
    expect(validateName('a'.repeat(100))).toBeNull();
  });
});

describe('validateMobile', () => {
  it('returns null for valid 10-digit number', () => {
    expect(validateMobile('4165551234')).toBeNull();
  });

  it('accepts formatted number with 10 digits', () => {
    expect(validateMobile('(416) 555-1234')).toBeNull();
  });

  it('rejects number with fewer than 10 digits', () => {
    expect(validateMobile('12345')).toBe('Mobile number must be exactly 10 digits');
  });

  it('rejects number with more than 10 digits', () => {
    expect(validateMobile('12345678901')).toBe('Mobile number must be exactly 10 digits');
  });

  it('rejects empty string', () => {
    expect(validateMobile('')).toBe('Mobile number is required');
  });
});

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('rejects email without @', () => {
    expect(validateEmail('userexample.com')).toBe('Please enter a valid email address');
  });

  it('rejects email without domain', () => {
    expect(validateEmail('user@')).toBe('Please enter a valid email address');
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe('Email is required');
  });
});

describe('validateWorkType', () => {
  it('accepts all valid work types', () => {
    for (const type of WORK_TYPES) {
      expect(validateWorkType(type)).toBeNull();
    }
  });

  it('rejects invalid work type', () => {
    expect(validateWorkType('Spaceship Repair')).toBe('Please select a valid type of work');
  });

  it('rejects empty string', () => {
    expect(validateWorkType('')).toBe('Type of work is required');
  });
});

describe('validateCarBrand', () => {
  it('returns null for non-empty value', () => {
    expect(validateCarBrand('Toyota')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(validateCarBrand('')).toBe('Car brand is required');
  });
});

describe('validateModelName', () => {
  it('returns null for non-empty value', () => {
    expect(validateModelName('Corolla')).toBeNull();
  });

  it('rejects empty string', () => {
    expect(validateModelName('')).toBe('Model name is required');
  });
});

describe('validateModelYear', () => {
  const currentYear = new Date().getFullYear();

  it('accepts valid year in range', () => {
    expect(validateModelYear(2020)).toBeNull();
  });

  it('accepts 1980 (minimum)', () => {
    expect(validateModelYear(1980)).toBeNull();
  });

  it('accepts currentYear + 1 (maximum)', () => {
    expect(validateModelYear(currentYear + 1)).toBeNull();
  });

  it('rejects year before 1980', () => {
    expect(validateModelYear(1979)).toContain('1980');
  });

  it('rejects year after currentYear + 1', () => {
    expect(validateModelYear(currentYear + 2)).toContain(`${currentYear + 1}`);
  });

  it('rejects non-integer', () => {
    expect(validateModelYear(2020.5)).toBe('Model year must be a valid number');
  });

  it('rejects empty value', () => {
    expect(validateModelYear('')).toBe('Model year is required');
  });
});

describe('validatePreferredDate', () => {
  it('returns null for empty/undefined (optional)', () => {
    expect(validatePreferredDate(undefined)).toBeNull();
    expect(validatePreferredDate(null)).toBeNull();
    expect(validatePreferredDate('')).toBeNull();
  });

  it('returns null for valid date string', () => {
    expect(validatePreferredDate('2025-03-15')).toBeNull();
  });

  it('rejects invalid date string', () => {
    expect(validatePreferredDate('not-a-date')).toBe('Please enter a valid date');
  });
});

describe('validatePreferredTime', () => {
  it('returns null for empty/undefined (optional)', () => {
    expect(validatePreferredTime(undefined)).toBeNull();
    expect(validatePreferredTime(null)).toBeNull();
    expect(validatePreferredTime('')).toBeNull();
  });

  it('returns null for valid HH:mm format', () => {
    expect(validatePreferredTime('14:30')).toBeNull();
    expect(validatePreferredTime('00:00')).toBeNull();
    expect(validatePreferredTime('23:59')).toBeNull();
  });

  it('rejects invalid time format', () => {
    expect(validatePreferredTime('2:30')).toContain('HH:mm');
    expect(validatePreferredTime('25:00')).toContain('HH:mm');
    expect(validatePreferredTime('14:60')).toContain('HH:mm');
    expect(validatePreferredTime('hello')).toContain('HH:mm');
  });
});
