/**
 * Feature flags controlled via environment variables.
 * Defaults to false (disabled) when not set.
 *
 * ═══ HOW TO ENABLE FEATURES ═══
 *
 * 1. Create a `.env` file in the project root (or set vars in Netlify dashboard):
 *      FEATURE_BOOKING_ENABLED=true   ← enables Phase 2 booking UI
 *      FEATURE_EMAIL_ENABLED=true     ← enables Phase 3 email UI
 *
 * 2. Only the values "true" or "1" activate a flag. Any other value
 *    (including "false", empty string, or unset) keeps the feature hidden.
 *
 * 3. Flags are evaluated at BUILD TIME (Astro static mode). After changing
 *    a flag you must rebuild the site for the change to take effect.
 *
 * 4. When a flag is false, the FeatureFlag.astro wrapper renders nothing —
 *    zero bytes of gated HTML/CSS/JS are shipped to the client.
 *
 * ═══ USAGE IN ASTRO COMPONENTS ═══
 *
 * Option A — FeatureFlag wrapper component (preferred for slots):
 *   ---
 *   import FeatureFlag from '../components/shared/FeatureFlag.astro';
 *   ---
 *   <FeatureFlag feature="booking">
 *     <BookingWidget client:load />
 *   </FeatureFlag>
 *
 * Option B — Direct function call (for conditional logic in frontmatter):
 *   ---
 *   import { isFeatureEnabled } from '../lib/feature-flags';
 *   const showBooking = isFeatureEnabled('booking');
 *   ---
 *   {showBooking && <BookingWidget client:load />}
 *
 * ═══ ADDING NEW FLAGS ═══
 *
 * 1. Add the env var name to FEATURE_FLAGS below
 * 2. Add the env var to .env.example with default "false"
 * 3. Update the FeatureFlag.astro Props interface to include the new key
 */

const FEATURE_FLAGS = {
  booking: 'FEATURE_BOOKING_ENABLED',
  email: 'FEATURE_EMAIL_ENABLED',
} as const;

type FeatureName = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(feature: FeatureName): boolean {
  const envVar = FEATURE_FLAGS[feature];
  const value = import.meta.env[envVar];
  return value === 'true' || value === '1';
}

export function getEnabledFeatures(): FeatureName[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureName[]).filter(isFeatureEnabled);
}
