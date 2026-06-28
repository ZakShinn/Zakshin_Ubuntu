"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FormFieldConfig } from "@/lib/types";
import { getFieldError } from "@/lib/validators";
import clsx from "clsx";

interface FormFieldProps {
  field: FormFieldConfig;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string | null;
}

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const id = `field-${field.name}`;

  const baseInputClass = clsx(
    "w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-800 dark:text-white",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-ubuntu-orange focus:ring-ubuntu-orange dark:border-gray-600"
  );

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-ubuntu-orange focus:ring-ubuntu-orange"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
        {field.helpText && (
          <span className="text-xs text-gray-500">({field.helpText})</span>
        )}
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseInputClass}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" || field.type === "multiline-ips" ? (
        <textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === "multiline-ips" ? 3 : 4}
          className={baseInputClass}
        />
      ) : (
        <div className="relative">
          <input
            id={id}
            type={field.type === "password" && !showPassword ? "password" : "text"}
            value={String(value ?? "")}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
          {field.type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}

      {field.helpText && (
        <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function validateForm(
  fields: FormFieldConfig[],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const val = String(values[field.name] ?? "");
    if (field.required && !val && field.type !== "checkbox") {
      errors[field.name] = "Trường bắt buộc";
      continue;
    }
    if (field.validate) {
      const err = getFieldError(field.validate, val);
      if (err) errors[field.name] = err;
    }
  }
  return errors;
}
