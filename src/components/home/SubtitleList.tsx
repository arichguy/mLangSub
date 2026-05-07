"use client";

import { SubtitleItem } from "./SubtitleItem";
import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SubtitleListProps {
  ccSubtitles: SubtitleTrack[];
  autoTranslated: SubtitleTrack[];
  onDownload: (track: SubtitleTrack, format: SubtitleFormat) => void;
  downloadingLang?: string;
}

export function SubtitleList({
  ccSubtitles,
  autoTranslated,
  onDownload,
  downloadingLang,
}: SubtitleListProps) {
  const { t } = useTranslation();

  if (ccSubtitles.length === 0 && autoTranslated.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {ccSubtitles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-3">
            {t("subtitle.cc_subtitles", "CC 字幕")}
            <span className="ml-2 text-xs font-normal text-warm-muted normal-case tracking-normal">
              ({t("subtitle.count_languages", "{count} 个语言").replace("{count}", String(ccSubtitles.length))})
            </span>
          </h3>
          <div className="space-y-2">
            {ccSubtitles.map((track) => (
              <SubtitleItem
                key={`cc-${track.langCode}`}
                track={track}
                onDownload={onDownload}
                isLoading={downloadingLang === track.langCode}
              />
            ))}
          </div>
        </section>
      )}

      {autoTranslated.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-warm-text uppercase tracking-wide mb-3">
            {t("subtitle.auto_translated", "自动翻译字幕")}
            <span className="ml-2 text-xs font-normal text-warm-muted normal-case tracking-normal">
              ({t("subtitle.count_languages", "{count} 个语言").replace("{count}", String(autoTranslated.length))})
            </span>
          </h3>
          <div className="space-y-2">
            {autoTranslated.map((track) => (
              <SubtitleItem
                key={`auto-${track.langCode}`}
                track={track}
                onDownload={onDownload}
                isLoading={downloadingLang === track.langCode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
