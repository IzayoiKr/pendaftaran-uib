"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import type { FieldErrors, FieldError } from "react-hook-form";
import { get } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  files: Partial<Record<Path<T>, File>>;
  filesPreview: Partial<Record<Path<T>, string>>;
  errors: FieldErrors<T>;
  maxSizeMB: number;
  control: Control<T>;
};

export default function FileInputField<T extends FieldValues>({
  label,
  name,
  files,
  filesPreview,
  errors,
  maxSizeMB,
  control,
}: Props<T>) {
  const error = get(errors, name) as FieldError | undefined;

  return (
    <div className="formGroup">
      <label className="label">
        {label} * (PDF, maks. {maxSizeMB}MB)
      </label>

      <div className="fileBox">
        <div className="fileInputWrapper">
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <input
                type="file"
                id={name}
                data-field={name}
                className="customFileInput"
                accept=".pdf,application/pdf"
                ref={field.ref}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > maxSizeMB * 1024 * 1024) {
                    toast.error(`File maksimal ${maxSizeMB}MB`);
                    e.target.value = "";
                    return;
                  }

                  if (file.type !== "application/pdf") {
                    toast.error("File harus PDF");
                    e.target.value = "";
                    return;
                  }

                  if (!file.name.toLowerCase().endsWith(".pdf")) {
                    toast.error("File harus PDF (.pdf)");
                    e.target.value = "";
                    return;
                  }

                  field.onChange(file);
                  e.target.value = "";
                  toast.success(`${file.name} berhasil dipilih`);
                }}
              />
            )}
          />

          <label
            htmlFor={name}
            className={`customFileLabel${files[name] ? " selected" : ""}`}
          >
            {files[name]?.name ?? "Pilih File PDF"}
          </label>
        </div>
      </div>

      {error && (
        <p className="errorText">
          {String(error?.message)}
        </p>
      )}

      <p className="uploadedDoc">
        Dokumen Terupload:
        {files[name] ? (
          <>
            <span> {files[name].name}</span>
            {" - "}
            {filesPreview[name] && (
              <a href={filesPreview[name]} download>
                Download
              </a>
            )}
          </>
        ) : (
          " Belum ada file"
        )}
      </p>
    </div>
  );
}