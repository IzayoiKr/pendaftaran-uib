"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { TubeSpinnerIcon } from "@/components/Icons/AnimatedIcons";
import { CheckIcon, SearchIcon, XIcon } from "@/components/Icons/Icons";
import styles from "./SearchableField.module.scss";

interface SearchResult {
    value: string;
    label: string;
    source?: "indonesia" | "global";
    country?: string;
}

interface SearchableFieldProps {
    label: string;
    name: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    searchEndpoint: "/search/university" | "/search/school";
    minQueryLength?: number;
    debounceMs?: number;
    allowManualEntry?: boolean;
    manualEntryLabel?: string;
    value?: string;
    onChange?: (value: string) => void;
    onResultSelect?: (result: SearchResult) => void;
}

async function fetchResults(
    endpoint: string,
    query: string,
    signal: AbortSignal,
): Promise<SearchResult[]> {
    const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
        signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

export default function SearchableField({
    label,
    name,
    required,
    error,
    placeholder,
    searchEndpoint,
    minQueryLength = 2,
    debounceMs = 300,
    allowManualEntry = true,
    manualEntryLabel,
    value: propValue,
    onChange,
    onResultSelect,
}: SearchableFieldProps) {
    const t = useTranslations("options");
    const value = propValue ?? "";
    const [query, setQuery] = useState(value);
    const [selected, setSelected] = useState<SearchResult | null>(
        value ? { value, label: value } : null,
    );
    const [isManual, setIsManual] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isInternalChange = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isManualRef = useRef(false);
    const hasAutoOpened = useRef(false);
    const prevValueRef = useRef(value);

    const [debouncedQuery] = useDebounce(query, debounceMs);
    const safeDebouncedQuery = debouncedQuery ?? "";

    const {
        data: results = [],
        isFetching,
        isError,
    } = useQuery({
        queryKey: ["search", searchEndpoint, debouncedQuery],
        queryFn: ({ signal }) =>
            fetchResults(searchEndpoint, safeDebouncedQuery, signal),
        enabled:
            !isManual && !selected && debouncedQuery.length >= minQueryLength,
        staleTime: 24 * 60 * 60 * 1000,
        placeholderData: (prev) => prev,
    });

    useEffect(() => {
        isManualRef.current = isManual;
    }, [isManual]);

    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        if (value === prevValueRef.current) return;

        prevValueRef.current = value;
        setQuery(value ?? "");
        setSelected(value ? { value, label: value } : null);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (
            results.length > 0 &&
            !selected &&
            !isManual &&
            !hasAutoOpened.current
        ) {
            hasAutoOpened.current = true;
            setIsOpen(true);
        }
    }, [results, selected, isManual]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSelected(null);
        hasAutoOpened.current = false;

        if (isManualRef.current) {
            if (!val) {
                setIsManual(false);
            }
            isInternalChange.current = true;
            onChange?.(val);
            return;
        }

        if (value) {
            isInternalChange.current = true;
            onChange?.("");
        }

        if (val.length < minQueryLength) {
            setIsOpen(false);
        }
    };

    const handleSelect = (result: SearchResult) => {
        isInternalChange.current = true;
        setSelected(result);
        setQuery(result.value);
        setIsOpen(false);
        setIsManual(false);
        hasAutoOpened.current = false;
        onResultSelect?.(result);
        onChange?.(result.value);
    };

    const handleManualToggle = () => {
        isInternalChange.current = true;
        setIsManual(true);
        setIsOpen(false);
        setSelected(null);
        setQuery("");
        hasAutoOpened.current = false;
        onChange?.("");
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const handleClear = () => {
        isInternalChange.current = true;
        setQuery("");
        setSelected(null);
        setIsManual(false);
        setIsOpen(false);
        hasAutoOpened.current = false;
        onChange?.("");
        inputRef.current?.focus();
    };

    const showSpinner = isFetching && !selected && !isManual;

    return (
        <div className={styles.formField} ref={wrapperRef}>
            <label>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>

            <div
                className={`${styles.searchInputWrapper} ${error ? styles.hasError : ""}`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    name={isManual ? name : undefined}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (
                            !isManual &&
                            query.length >= minQueryLength &&
                            results.length > 0
                        ) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={
                        isManual
                            ? manualEntryLabel || t("manualEntry")
                            : placeholder
                    }
                    autoComplete="off"
                    className={isManual ? styles.manualInput : ""}
                />
                <div className={styles.inputActions}>
                    {showSpinner && (
                        <span className={styles.spinnerWrap}>
                            <TubeSpinnerIcon />
                        </span>
                    )}
                    {query && !showSpinner && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={styles.clearBtn}
                            aria-label="Clear"
                        >
                            <XIcon />
                        </button>
                    )}
                    <span className={styles.searchIcon}>
                        {selected && !isManual ? (
                            <CheckIcon className={styles.checkIcon} />
                        ) : (
                            <SearchIcon />
                        )}
                    </span>
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <ul className={styles.dropdown} role="listbox">
                    {results.map((result, idx) => (
                        <li
                            key={`${result.value}-${idx}`}
                            className={styles.dropdownItem}
                            onClick={() => handleSelect(result)}
                            role="option"
                            aria-selected={selected?.value === result.value}
                        >
                            <span className={styles.resultLabel}>
                                {result.label}
                            </span>
                            {result.source && (
                                <span
                                    className={`${styles.sourceTag} ${styles[result.source]}`}
                                >
                                    {result.country ??
                                        (result.source === "indonesia"
                                            ? "ID"
                                            : "Global")}
                                </span>
                            )}
                        </li>
                    ))}
                    {allowManualEntry && (
                        <li
                            className={styles.dropdownItemManual}
                            onClick={handleManualToggle}
                        >
                            <span>{manualEntryLabel || t("manualEntry")}</span>
                        </li>
                    )}
                </ul>
            )}

            {isOpen &&
                !isFetching &&
                results.length === 0 &&
                query.length >= minQueryLength && (
                    <div className={styles.dropdownEmpty}>
                        <p>{t("notFound")}</p>
                        {allowManualEntry && (
                            <button
                                type="button"
                                onClick={handleManualToggle}
                                className={styles.manualBtn}
                            >
                                {manualEntryLabel || t("manualEntry")}
                            </button>
                        )}
                    </div>
                )}

            {!isManual && selected && (
                <input type="hidden" name={name} value={selected.value} />
            )}

            {isError && (
                <span className={styles.error}>{t("searchError")}</span>
            )}
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
