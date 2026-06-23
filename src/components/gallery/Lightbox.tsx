/**
 * Lightbox — Preact island for fullscreen gallery image viewing.
 * Hydrated with client:visible — only loads JS when gallery scrolls into view.
 *
 * Requirements: 4.3
 */
import { useState, useEffect, useCallback } from 'preact/hooks';

interface LightboxProps {
  images: { src: string; alt: string }[];
}

export default function Lightbox({ images }: LightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') close();
    },
    [activeIndex, close]
  );

  // Listen for custom event from GalleryGrid clicks
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ index: number }>).detail;
      if (detail && typeof detail.index === 'number') {
        setActiveIndex(detail.index);
      }
    };

    document.addEventListener('gallery:open', handleOpen);
    return () => document.removeEventListener('gallery:open', handleOpen);
  }, []);

  // Keyboard listeners
  useEffect(() => {
    if (activeIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, handleKeyDown]);

  if (activeIndex === null || !images[activeIndex]) return null;

  const currentImage = images[activeIndex];

  return (
    <div
      class="lightbox-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('lightbox-overlay')) {
          close();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      <button
        class="lightbox-close"
        onClick={close}
        aria-label="Close lightbox"
        type="button"
      >
        ✕
      </button>
      <img
        class="lightbox-image"
        src={currentImage.src}
        alt={currentImage.alt}
      />
    </div>
  );
}
