/**
 * MobileNav — Preact island for mobile navigation overlay.
 * Hydrated with client:load — immediately interactive on mobile.
 *
 * Triggered by the hamburger button (#hamburger-toggle) in Header.astro.
 * Features:
 * - Fullscreen overlay with all nav links + CTA
 * - Close via ✕ button, link click, or Escape key
 * - Focus trap when open (Tab stays within overlay)
 * - Body scroll lock when open
 * - Updates aria-expanded on hamburger button
 * - Slide-in animation from right
 * - z-index: var(--z-nav) layer (200+)
 *
 * Requirements: 8.2, 8.3, 17.2, 17.4
 */
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
  { label: 'Posts', href: '/posts' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Listen for hamburger button clicks
  useEffect(() => {
    const hamburger = document.getElementById('hamburger-toggle');
    if (!hamburger) return;

    const handleClick = () => {
      open();
    };

    hamburger.addEventListener('click', handleClick);
    return () => hamburger.removeEventListener('click', handleClick);
  }, [open]);

  // Update aria-expanded on hamburger button
  useEffect(() => {
    const hamburger = document.getElementById('hamburger-toggle');
    if (hamburger) {
      hamburger.setAttribute('aria-expanded', String(isOpen));
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus management: move focus to close button when opened
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        // Return focus to hamburger
        const hamburger = document.getElementById('hamburger-toggle');
        if (hamburger) hamburger.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      class="mobile-nav-overlay"
      id="mobile-nav-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Close button */}
      <button
        class="mobile-nav-close"
        onClick={close}
        aria-label="Close navigation menu"
        type="button"
        ref={closeButtonRef}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Navigation links */}
      <nav class="mobile-nav-content" aria-label="Mobile navigation">
        <ul class="mobile-nav-list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href} class="mobile-nav-item">
              <a href={href} class="mobile-nav-link" onClick={close}>
                {label}
              </a>
            </li>
          ))}
          <li class="mobile-nav-item">
            <a href="/quote" class="mobile-nav-link mobile-nav-cta" onClick={close}>
              Get a Quote
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
