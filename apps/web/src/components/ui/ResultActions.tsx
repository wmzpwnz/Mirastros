'use client';

import React from 'react';
import Link from 'next/link';

interface ResultActionsProps {
  onNewConsultation: () => void;
  onClarify?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  newConsultationLabel?: string;
  clarifyLabel?: string;
  saveLabel?: string;
  shareLabel?: string;
  downloadLabel?: string;
  historyLink?: string;
}

export function ResultActions({
  onNewConsultation,
  onClarify,
  onSave,
  onShare,
  onDownload,
  newConsultationLabel = 'Новая консультация',
  clarifyLabel = 'Уточнить',
  saveLabel = 'Сохранить',
  shareLabel = 'Поделиться',
  downloadLabel = 'Скачать',
  historyLink = '/history',
}: ResultActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* New Consultation Button */}
      <button
        onClick={onNewConsultation}
        className="flex-1 min-w-[150px] py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
      >
        {newConsultationLabel}
      </button>

      {/* Clarify Button */}
      {onClarify && (
        <button
          onClick={onClarify}
          className="flex-1 min-w-[150px] py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
        >
          {clarifyLabel}
        </button>
      )}

      {/* Save Button */}
      {onSave && (
        <button
          onClick={onSave}
          className="flex-1 min-w-[150px] py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
        >
          {saveLabel}
        </button>
      )}

      {/* Share Button */}
      {onShare && (
        <button
          onClick={onShare}
          className="flex-1 min-w-[150px] py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
        >
          {shareLabel}
        </button>
      )}

      {/* Download Button */}
      {onDownload && (
        <button
          onClick={onDownload}
          className="flex-1 min-w-[150px] py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-lg transition"
        >
          {downloadLabel}
        </button>
      )}

      {/* History Link */}
      {historyLink && (
        <Link
          href={historyLink}
          className="flex-1 min-w-[150px] py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition text-center"
        >
          История
        </Link>
      )}
    </div>
  );
}
