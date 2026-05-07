"use client";

import { formatDuration, getPlatformName } from "@/lib/utils";
import type { VideoInfo as VideoInfoType } from "@/types/video";
import { Play, Clock, User, Calendar } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface VideoInfoProps {
  info: VideoInfoType;
}

export function VideoInfo({ info }: VideoInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-border bg-white shadow-subtle">
      {info.thumbnail && (
        <div className="relative aspect-video bg-warm-accent overflow-hidden">
          <img
            src={info.thumbnail}
            alt={info.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-3">
              <Play className="h-6 w-6 text-white" fill="white" />
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <h2 className="font-semibold text-warm-text line-clamp-2 leading-snug">
          {info.title || t("video.no_info", "暂无视频信息")}
        </h2>
        <div className="space-y-1.5 text-sm text-warm-muted">
          {info.author && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span>{info.author}</span>
            </div>
          )}
          {info.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDuration(info.duration)}</span>
            </div>
          )}
          {info.uploadDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{info.uploadDate}</span>
            </div>
          )}
        </div>
        <div className="pt-1">
          <span className="inline-block rounded-md bg-warm-accent px-2.5 py-1 text-xs font-medium text-warm-muted">
            {getPlatformName(info.platform)}
          </span>
        </div>
      </div>
    </div>
  );
}
