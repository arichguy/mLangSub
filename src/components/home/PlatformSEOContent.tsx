"use client";

import { UrlInput } from "./UrlInput";
import { CheckCircle, Download, Zap, Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PlatformSEOContentProps {
  info: {
    name: string;
    title: string;
    description: string;
  };
}

export function PlatformSEOContent({ info }: PlatformSEOContentProps) {
  const { t } = useTranslation();

  const features = [
    { icon: Download, title: t("subtitle.format", "多格式支持"), desc: "SRT、VTT、TXT、ASS、HTML" },
    { icon: Globe, title: t("subtitle.language", "多语言字幕"), desc: t("app.description", "自动检测多语言字幕") },
    { icon: Zap, title: t("subtitle.bilingual_title", "双语字幕"), desc: t("subtitle.download_bilingual", "两种语言字幕合并下载") },
    { icon: CheckCircle, title: t("subtitle.cc_subtitles", "CC 字幕"), desc: t("home.step2_desc", "智能识别字幕类型") },
  ];

  return (
    <div className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-warm-text mb-4">
          {info.name} {t("app.tagline", "字幕下载器")}
        </h1>
        <p className="text-warm-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          {info.description}
        </p>
      </div>

      <UrlInput
        onAnalyze={(url) => {
          window.location.href = `/?url=${encodeURIComponent(url)}`;
        }}
        isLoading={false}
        placeholder={`${t("home.placeholder", "粘贴")} ${info.name} ${t("home.placeholder", "视频链接")}...`}
      />

      <div className="mx-auto max-w-3xl mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <div key={i} className="rounded-2xl border border-warm-border bg-white p-5 shadow-subtle text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-warm-accent mb-3">
              <feature.icon className="h-5 w-5 text-warm-orange" />
            </div>
            <h3 className="font-semibold text-warm-text mb-1.5">{feature.title}</h3>
            <p className="text-xs text-warm-muted">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl mt-16">
        <h2 className="text-xl font-bold text-warm-text text-center mb-8">{t("platform.faq", "常见问题")}</h2>
        <div className="space-y-3">
          <details className="group rounded-xl border border-warm-border bg-white shadow-subtle">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-warm-text">
              {t("home.step1_title", "如何下载字幕？")} ({info.name})
              <span className="text-warm-muted group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="px-5 pb-4 text-sm text-warm-muted leading-relaxed">
              {t("home.step1_desc", "粘贴视频链接，点击分析，选择语言和格式即可下载。")}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
