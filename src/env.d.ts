/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly FEATURE_BOOKING_ENABLED: string;
  readonly FEATURE_EMAIL_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
