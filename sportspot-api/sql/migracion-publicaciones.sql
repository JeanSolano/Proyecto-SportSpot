-- Migracion ADITIVA para publicaciones (feed: promociones y eventos).
-- Segura sobre una BD existente (IF NOT EXISTS).  npm run migrate:publicaciones

CREATE TABLE IF NOT EXISTS publicaciones (
  id_publicacion      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento) ON DELETE CASCADE,
  tipo                VARCHAR(20) NOT NULL DEFAULT 'publicacion',
  titulo              VARCHAR(150) NOT NULL,
  descripcion         TEXT,
  imagen              TEXT,
  fecha_evento        TIMESTAMP,
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publicaciones_estab ON publicaciones (id_establecimiento);
