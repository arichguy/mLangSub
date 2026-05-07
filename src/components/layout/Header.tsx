"use client";

import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { locales, localeLabels } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/context";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-warm-border bg-warm-bg/95 backdrop-blur supports-[backdrop-filter]:bg-warm-bg/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.svg"
            alt={t("app.name", "mLangSub")}
            className="h-9 w-9 rounded-lg"
          />
          <div className="hidden sm:block">
            <div className="font-semibold text-warm-text">{t("app.name", "mLangSub")}</div>
            <div className="text-xs text-warm-muted">{t("app.tagline", "字幕下载工具")}</div>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-warm-text hover:bg-warm-accent transition-colors"
          >
            {t("nav.home", "首页")}
          </a>
          <a
            href="/admin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-warm-muted hover:text-warm-text hover:bg-warm-accent transition-colors"
          >
            {t("nav.admin", "管理")}
          </a>

          {/* Language switcher */}
          <div className="relative ml-2">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-warm-muted hover:text-warm-text hover:bg-warm-accent transition-colors"
            >
              <Globe className="h-4 w-4" />
              {localeLabels[locale]}
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 max-h-80 overflow-y-auto rounded-lg border border-warm-border bg-white py-1 shadow-card z-50">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocale(loc);
                      setLangMenuOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-warm-accent transition-colors",
                      locale === loc
                        ? "font-semibold text-warm-orange"
                        : "text-warm-text"
                    )}
                  >
                    {localeLabels[loc]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-warm-muted hover:bg-warm-accent md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-warm-border bg-white px-4 py-3 md:hidden">
          <a
            href="/"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-warm-text hover:bg-warm-accent"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.home", "首页")}
          </a>
          <a
            href="/admin"
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-warm-muted hover:bg-warm-accent"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.admin", "管理")}
          </a>
          <div className="mt-2 border-t border-warm-border pt-2">
            <span className="px-3 text-xs text-warm-muted">{t("nav.language", "语言")}:</span>
            <div className="mt-1 flex flex-wrap gap-1 px-2">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs",
                    locale === loc
                      ? "bg-warm-orange text-white"
                      : "text-warm-muted hover:bg-warm-accent"
                  )}
                >
                  {localeLabels[loc]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
