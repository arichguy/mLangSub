"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./context";
import type { Locale } from "./config";

const cache = new Map<Locale, Record<string, unknown>>();

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let val: unknown = obj;
  for (const k of keys) {
    if (val == null || typeof val !== "object") return undefined;
    val = (val as Record<string, unknown>)[k];
  }
  return typeof val === "string" ? val : undefined;
}

export function useTranslation() {
  const { locale } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, unknown> | null>(
    cache.get(locale) ?? null
  );

  useEffect(() => {
    if (cache.has(locale)) {
      setTranslations(cache.get(locale)!);
      return;
    }
    let cancelled = false;
    fetch(`/locales/${locale}.json`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          cache.set(locale, data);
          setTranslations(data);
        }
      })
      .catch(() => {
        if (!cancelled && locale !== "zh-CN") {
          fetch("/locales/zh-CN.json")
            .then((r) => r.json())
            .then((data) => {
              cache.set(locale, data);
              setTranslations(data);
            });
        }
      });
    return () => { cancelled = true; };
  }, [locale]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (!translations) return fallback ?? key;
      return getNested(translations, key) ?? fallback ?? key;
    },
    [translations]
  );

  return { t, locale };
}
