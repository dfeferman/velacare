-- Aktiviere pg_cron und pg_net (in Supabase bereits als Extensions verfügbar)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Job idempotent anlegen: erst entfernen falls vorhanden, dann neu anlegen
SELECT cron.unschedule('velacare-monthly-reminder') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'velacare-monthly-reminder'
);

SELECT cron.schedule(
  'velacare-monthly-reminder',
  '0 9 1 * *',
  $cron$
  SELECT net.http_post(
    url    := current_setting('app.base_url') || '/api/cron/monthly-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body   := '{}'::jsonb
  );
  $cron$
);

-- HINWEIS: Nach der Migration manuell im Supabase SQL-Editor ausführen:
-- ALTER DATABASE postgres SET app.base_url = 'https://velacare.de';
-- ALTER DATABASE postgres SET app.cron_secret = '<CRON_SECRET>';
