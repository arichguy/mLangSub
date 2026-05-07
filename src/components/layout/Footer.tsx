"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

const SUPPORTED_PLATFORMS = [
  "YouTube", "Bilibili", "Viki", "Dailymotion",
  "iQiyi", "WeTV", "Hotstar", "Viu",
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-warm-border bg-white mt-20">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/images/logo.svg"
                alt="mLangSub"
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-semibold">mLangSub</span>
            </div>
            <p className="text-sm text-warm-muted leading-relaxed">
              {t("footer.description", "从 YouTube、Bilibili 等 50+ 视频平台提取多语言字幕。")}
            </p>
          </div>

          {/* Supported platforms */}
          <div>
            <h4 className="font-medium text-sm mb-3 text-warm-text">
              {t("footer.supported_platforms", "支持平台")}
            </h4>
            <ul className="grid grid-cols-2 gap-1">
              {SUPPORTED_PLATFORMS.map((p) => (
                <li key={p} className="text-sm text-warm-muted">{p}</li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-sm mb-3 text-warm-text">
              {t("footer.links", "链接")}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {t("footer.terms", "使用条款")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {t("footer.privacy", "隐私政策")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-warm-muted hover:text-warm-orange transition-colors">
                  {t("footer.contact", "联系我们")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-warm-border pt-6 text-center text-sm text-warm-muted">
          {t("footer.copyright", "© 2026 mLangSub. 保留所有权利.")}
        </div>
      </div>
    </footer>
  );
}
