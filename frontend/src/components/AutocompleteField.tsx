"use client";

import type {
  UseFormSetValue,
  FieldValues,
  Path,
} from "react-hook-form";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;

  query: string;
  setQuery: (val: string) => void;

  open: boolean;
  setOpen: (val: boolean) => void;

  filtered: string[];

  setValue: UseFormSetValue<T>;

  placeholder?: string;
  error?: string;

  styles: any;
};

export default function AutocompleteField<T extends FieldValues>({
  label,
  name,
  query,
  setQuery,
  open,
  setOpen,
  filtered,
  setValue,
  placeholder,
  error,
  styles,
}: Props<T>) {
  const { getValues } = useFormContext();

  useEffect(() => {
    const current = getValues(name);

    if (current && current !== query) {
      setQuery(current as string);
    }
  }, [getValues, name]);
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>

      <div className={styles.selectWrapper}>
        <input
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);

            if (!query.trim()) {
              setValue(name, "" as any, {
                shouldValidate: true,
                shouldDirty: true,
              });
              return;
            }

            setValue(name, query as any, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />

        {open && (
          <div className={styles.dropdown}>
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <div
                  key={i}
                  className={styles.option}
                  onMouseDown={() => {
                    setQuery(item);
                    setValue(name, item as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setOpen(false);
                  }}
                >
                  {item}
                </div>
              ))
            ) : (
              query.trim() && (
                <>
                  {/* 🔴 NOT FOUND LABEL */}
                  <div className={styles.optionDisabled}>
                    {name === "asal_sekolah"
                      ? "Sekolah tidak ditemukan"
                      : "Universitas tidak ditemukan"}
                  </div>

                  {/* 🟢 GUNAKAN INPUT USER */}
                  <div
                    className={styles.option}
                    onMouseDown={() => {
                      setValue(name, query as any, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setOpen(false);
                    }}
                  >
                    Gunakan: "{query}"
                  </div>
                </>
              )
            )}
          </div>
        )}
      </div>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
