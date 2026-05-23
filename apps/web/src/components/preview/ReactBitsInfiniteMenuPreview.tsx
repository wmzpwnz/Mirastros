'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { TunnelInfiniteMenuItem } from '../../constants/tunnelInfiniteMenuItems';
import InfiniteMenuCanvas from './reactbits/InfiniteMenuCanvas';
import type { InfiniteMenuCanvasItem } from './reactbits/InfiniteMenuCanvas';

interface ReactBitsInfiniteMenuPreviewProps {
  items: TunnelInfiniteMenuItem[];
}

export default function ReactBitsInfiniteMenuPreview({ items }: ReactBitsInfiniteMenuPreviewProps) {
  const [selectedItem, setSelectedItem] = useState<TunnelInfiniteMenuItem | null>(null);

  const canvasItems = useMemo<InfiniteMenuCanvasItem[]>(
    () =>
      items.map(item => ({
        image: item.image,
        link: item.href,
        title: item.title,
        description: item.description,
        video: item.video,
      })),
    [items]
  );

  return (
    <>
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.2),rgba(2,4,12,0.96)_60%)]" />
        <InfiniteMenuCanvas
          items={canvasItems}
          scale={1.0}
          onAction={item => {
            const selected = items.find(candidate => candidate.href === item.link) ?? null;
            setSelectedItem(selected);
          }}
        />
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setSelectedItem(null)}>
          <div
            className="w-[min(920px,96vw)] overflow-hidden rounded-2xl border border-white/20 bg-[#060a14]"
            onClick={event => event.stopPropagation()}
          >
            <div className="grid gap-0 md:grid-cols-[1.2fr,1fr]">
              <video
                src={selectedItem.video}
                className="h-full min-h-[280px] w-full object-cover"
                controls
                muted
                autoPlay
                loop
                playsInline
              />
              <div className="flex flex-col p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-mirastros-gold/80">Service Preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedItem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{selectedItem.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={selectedItem.href}
                    className="rounded-full border border-mirastros-gold/50 bg-mirastros-gold/20 px-4 py-2 text-sm font-medium text-mirastros-gold transition hover:bg-mirastros-gold/30"
                  >
                    Перейти в сервис
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
