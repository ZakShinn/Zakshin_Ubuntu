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

  if (field.type === "checkbox") {
    return (
      <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted/50 p-3 transition-all hover:border-ubuntu-orange/30 hover:bg-surface-muted">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-ubuntu-orange focus:ring-ubuntu-orange/30"
        />
        <div>
          <span className="text-sm font-medium text-content">{field.label}</span>
          {field.helpText && (
            <p className="mt-0.5 text-xs text-content-faint">{field.helpText}</p>
          )}
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-content">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={clsx("input-modern", error && "border-red-500 focus:ring-red-500/20")}
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
          className={clsx("input-modern resize-y", error && "border-red-500 focus:ring-red-500/20")}
        />
      ) : (
        <div className="relative">
          <input
            id={id}
            type={field.type === "password" && !showPassword ? "password" : "text"}
            value={String(value ?? "")}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={clsx(
              "input-modern",
              field.type === "password" && "pr-10",
              error && "border-red-500 focus:ring-red-500/20"
            )}
          />
          {field.type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-content-faint transition-colors hover:text-content"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}

      {field.helpText && (
        <p className="text-xs text-content-faint">{field.helpText}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
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
