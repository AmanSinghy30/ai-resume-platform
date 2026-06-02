import { useState } from 'react';

type Rules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isPhone?: boolean;
};

type FieldRules = Record<string, Rules>;
type Errors = Record<string, string>;

export function useFormValidation(rules: FieldRules) {
  const [errors, setErrors] = useState<Errors>({});

  const validate = (values: Record<string, string>): boolean => {
    const newErrors: Errors = {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = values[field] || '';

      if (rule.required && !value.trim()) {
        newErrors[field] = `${field} is required`;
      } else if (rule.minLength && value.length < rule.minLength) {
        newErrors[field] = `Minimum ${rule.minLength} characters required`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = `Maximum ${rule.maxLength} characters allowed`;
      } else if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field] = 'Enter a valid email address';
      } else if (rule.isPhone && value && !/^[0-9]{10}$/.test(value)) {
        newErrors[field] = 'Enter a valid 10-digit phone number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  return { errors, validate, clearError };
}