"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

interface StatsChartProps {
  data: { date: string; total: number; download: number }[];
  title?: string;
}

export function StatsChart({ data, title }: StatsChartProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("admin.trend_7d", "7天趋势");

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.download)), 1);

  return (
    <div className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle">
      <h3 className="font-semibold text-warm-text mb-4">{displayTitle}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse items-center gap-0.5">
              <div
                className="w-full rounded-t bg-warm-orange/70 transition-all"
                style={{ height: `${(day.download / maxValue) * 120}px` }}
                title={`${day.download} ${t("admin.downloads", "下载")}`}
              />
              <div
                className="w-full rounded-t bg-warm-accent transition-all"
                style={{ height: `${((day.total - day.download) / maxValue) * 120}px` }}
                title={`${day.total} ${t("admin.visits", "访问")}`}
              />
            </div>
            <span className="text-[10px] text-warm-muted">{day.date.slice(5)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-warm-accent" />
          <span className="text-xs text-warm-muted">{t("admin.visits", "访问")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-warm-orange/70" />
          <span className="text-xs text-warm-muted">{t("admin.downloads", "下载")}</span>
        </div>
      </div>
    </div>
  );
}
