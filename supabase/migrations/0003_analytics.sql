-- Google Analytics: the GA4 measurement id, edited in the control panel (Setări). Empty means
-- analytics is off: no consent banner is shown and nothing from Google is loaded.

alter table public.site_settings
  add column ga_measurement_id text not null default ''
  check (ga_measurement_id = '' or ga_measurement_id ~ '^G-[A-Z0-9]{4,20}$');
