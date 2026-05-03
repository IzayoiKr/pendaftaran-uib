"use client";

import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";

type Options = {
  localList: string[];
  endpoint: string;
  debounceMs?: number;
  minLength?: number;
  maxResults?: number;
  threshold?: number;
};

export default function useEntitySearch({
  localList,
  endpoint,
  debounceMs = 300,
  minLength = 2,
  maxResults = 10,
  threshold = 0.3,
}: Options) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [apiResults, setApiResults] = useState<string[]>([]);

  const fuse = useMemo(
    () =>
      new Fuse(localList, {
        threshold,
        ignoreLocation: true,
      }),
    [localList, threshold]
  );

  const localResults = useMemo(() => {
    const q = query.trim();
    if (q.length < minLength) return [];
    return fuse.search(q).map((r) => r.item).slice(0, maxResults);
  }, [query, fuse, minLength, maxResults]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < minLength) {
      setApiResults([]);
      return;
    }

    const controller = new AbortController();

    const delay = setTimeout(async () => {
      try {
        const res = await fetch(
          `${endpoint}?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setApiResults(Array.isArray(data) ? data.slice(0, maxResults) : []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(delay);
    };
  }, [query, endpoint, debounceMs, minLength, maxResults]);

  const filtered = useMemo(() => {
    return Array.from(new Set([...localResults, ...apiResults])).slice(0, maxResults);
  }, [localResults, apiResults, maxResults]);

  return {
    query,
    setQuery,
    open,
    setOpen,
    filtered,
  };
}