"use client";

import { LayoutDashboard as DashboardIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DashboardProps {
  stats: {
    overview: {
      totalAccessLogs: number;
      totalDownloads: number;
      totalBilingual: number;
      uniqueIPs: number;
      cacheHitRate: string;
    };
  } | null;
}

export function Dashboard({ stats }: DashboardProps) {
  const { t } = useTranslation();
  if (!stats) return null;

  const cards = [
    { label: t("admin.total_visits", "总访问"), value: stats.overview.totalAccessLogs },
    { label: t("admin.total_downloads", "下载量"), value: stats.overview.totalDownloads },
    { label: t("admin.bilingual_count", "双语字幕"), value: stats.overview.totalBilingual },
    { label: t("admin.unique_ips", "独立IP"), value: stats.overview.uniqueIPs },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DashboardIcon className="h-5 w-5 text-warm-orange" />
        <h2 className="text-lg font-semibold text-warm-text">{t("admin.dashboard", "仪表盘概览")}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <div key={item.label} className="rounded-2xl border border-warm-border bg-white p-4">
            <p className="text-xs text-warm-muted">{item.label}</p>
            <p className="text-2xl font-bold text-warm-text mt-1">{item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
