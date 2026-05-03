"use client";

import type {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

import { get } from "react-hook-form";

import type { SelectOption } from "@/constants/registerOptions";

import form from "@/pages/BatchRegistration/styles/Form.module.scss";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean; // UI only
};

export default function SelectField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  options,
  placeholder,
  required,
}: Props<T>) {
  const error = get(errors, name);

  return (
    <div className={form.formGroup}>
      <label className={form.label}>
        {label} {required && "*"}
      </label>

      <div className={form.selectWrapper}>
        <select
          {...register(name)} // ✅ Zod handles validation
          className={`${form.select} ${error ? form.inputError : ""}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error?.message && (
        <p className={form.errorText}>
          {String(error.message)}
        </p>
      )}
    </div>
  );
}