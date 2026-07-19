-- Adds storage for a user's reusable e-signature (used to sign loan
-- agreement documents). Ported alongside the SignatureEditorScreen from
-- scrtch-mobile, which stored a signature without any accompanying schema
-- change documented in that repo -- this is the missing migration.
--
-- No new table for subscriptions/entitlements is added here: this app uses
-- RevenueCat (react-native-purchases) as the source of truth for
-- subscription status, matching scrtch-mobile's purchases.ts precedent.
-- RevenueCat's SDK holds entitlement state client-side (CustomerInfo); if you
-- later need to gate server-side logic (e.g. a Supabase Edge Function) on
-- subscription status, that will need a webhook from RevenueCat into a new
-- table -- not required for the client-only paywall gating added here.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signature_url TEXT;
