"use client";

import type {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

import { get } from "react-hook-form";

import type { SelectOption } from "@/constants/registerOptions";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
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
    <div className="formGroup">
      <label className="label">
        {label} {required && "*"}
      </label>

      <div className="selectWrapper">
        <select
          {...register(name)}
          defaultValue=""
          className={`select ${error ? "inputError" : ""}`}
          data-field={name}
        >
          {placeholder && (
            <option value="" disabled hidden>
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
        <p className="errorText">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}