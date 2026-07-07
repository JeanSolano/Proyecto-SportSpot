-- Migracion ADITIVA para logo y fotos del establecimiento.
-- Segura de correr sobre una BD existente: no borra datos (IF NOT EXISTS).
--   npm run migrate:imagenes

ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE TABLE IF NOT EXISTS establecimiento_imagenes (
  id_imagen           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento) ON DELETE CASCADE,
  url                 TEXT NOT NULL,
  es_principal        BOOLEAN NOT NULL DEFAULT FALSE,
  orden               INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estab_imagenes ON establecimiento_imagenes (id_establecimiento);
