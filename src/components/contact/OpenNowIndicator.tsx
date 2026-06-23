import { useState, useEffect } from 'preact/hooks';
import { getOpenNowStatus } from '../../lib/open-now';
import type { DayHours } from '../../lib/open-now';
import businessInfo from '../../data/business-info.json';

const hours: DayHours[] = businessInfo.hours as DayHours[];

const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  open: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  closed: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
  dotGreen: {
    backgroundColor: '#22c55e',
  },
  dotGrey: {
    backgroundColor: '#9ca3af',
  },
} as const;

export default function OpenNowIndicator() {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    nextOpening?: { day: string; time: string };
  } | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const result = getOpenNowStatus(hours);
      setStatus({ isOpen: result.isOpen, nextOpening: result.nextOpening });
    };

    updateStatus();

    // Update every minute to stay current
    const interval = setInterval(updateStatus, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Don't render until client-side status is determined
  if (status === null) {
    return null;
  }

  if (status.isOpen) {
    return (
      <div style={{ ...styles.container, ...styles.open }} role="status" aria-live="polite">
        <span style={{ ...styles.dot, ...styles.dotGreen }} aria-hidden="true" />
        <span>Open Now</span>
      </div>
    );
  }

  const nextOpeningText = status.nextOpening
    ? `Opens ${status.nextOpening.day} ${status.nextOpening.time}`
    : '';

  return (
    <div style={{ ...styles.container, ...styles.closed }} role="status" aria-live="polite">
      <span style={{ ...styles.dot, ...styles.dotGrey }} aria-hidden="true" />
      <span>
        Closed{nextOpeningText && ` · ${nextOpeningText}`}
      </span>
    </div>
  );
}
