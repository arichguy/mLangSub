"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProgressBarProps {
  isLoading: boolean;
  status?: string;
}

export function ProgressBar({ isLoading, status }: ProgressBarProps) {
  const { t } = useTranslation();

  if (!isLoading) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="flex gap-1.5">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
      <span className="text-sm text-warm-muted animate-pulse">
        {status || t("progress.analyzing", "正在分析视频...")}
      </span>
    </div>
  );
}
