"use client";

import { useState, useCallback } from "react";
import type { AnalyzeResponse } from "@/types/video";

type TFunc = (key: string, fallback?: string) => string;

interface AnalyzeState {
  isLoading: boolean;
  data: AnalyzeResponse | null;
  error: string | null;
  csrfToken: string | null;
}

export function useAnalyze(t?: TFunc) {
  const [state, setState] = useState<AnalyzeState>({
    isLoading: false,
    data: null,
    error: null,
    csrfToken: null,
  });

  const analyze = useCallback(async (url: string) => {
    setState({ isLoading: true, data: null, error: null, csrfToken: null });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const body = await res.json();
      const data: AnalyzeResponse = body;

      if (!res.ok || !data.success) {
        setState({
          isLoading: false,
          data: null,
          error: data.message || data.error || (t ? t("errors.analyze_failed", "分析失败") : "分析失败"),
          csrfToken: null,
        });
        return;
      }

      setState({
        isLoading: false,
        data,
        error: null,
        csrfToken: body.csrf || null,
      });
    } catch (err) {
      setState({
        isLoading: false,
        data: null,
        error: t ? t("errors.network_error", "网络连接失败，请稍后重试") : "网络连接失败，请稍后重试",
        csrfToken: null,
      });
    }
  }, [t]);

  const reset = useCallback(() => {
    setState({ isLoading: false, data: null, error: null, csrfToken: null });
  }, []);

  return { ...state, analyze, reset };
}
