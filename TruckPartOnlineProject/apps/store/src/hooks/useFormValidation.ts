import { useState, useCallback } from "react";
import { ZodError } from "zod";
import type { ZodSchema } from "zod";

export function useFormValidation<T>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (err) {
        if (err instanceof ZodError) {
          const fieldErrors: Record<string, string> = {};
          err.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (path && !fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    },
    [schema],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return { errors, validate, clearErrors, clearFieldError };
}
