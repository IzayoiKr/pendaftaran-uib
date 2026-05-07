"use client";

import type {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

import { get } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

export default function InputField<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  type = "text",
  placeholder,
  required,
  maxLength,
  inputMode,
}: Props<T>) {
  const error = get(errors, name);

  return (
    <div className="formGroup">
      <label className="label">
        {label} {required && "*"}
      </label>

      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`input ${error ? "inputError" : ""}`}
      />

      {error?.message && (
        <p className="errorText">
          {String(error.message)}
        </p>
      )}
    </div>
  );
}