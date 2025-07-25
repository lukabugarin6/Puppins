// hooks/useFormValidation.ts
import { capitalize } from "@/utils/helpers";
import { useState } from "react";

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  email?: boolean;
  custom?: (value: string) => string | null;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

export const useFormValidation = (
  initialValues: any,
  rules: ValidationRules
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string): string => {
    const rule = rules[name];
    if (!rule) return "";

    if (rule.required && !value.trim()) {
      return `${capitalize(name)} je obavezan`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${capitalize(name)} mora imati najmanje ${rule.minLength} karaktera`;
    }

    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return "Unesite valjan email";
      }
    }

    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    return "";
  };

  const setValue = (name: string, value: string) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));

    // Obriši grešku kada korisnik počne da kuca
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName] || "");
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const setFieldError = (name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    values,
    errors,
    setValue,
    validate,
    setFieldError,
    clearErrors,
  };
};
