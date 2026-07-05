-- ============================================================================
--  SportSpot - schema.sql  (base de datos PostgreSQL "sportspot")
--  Basado en el modelo de docs/BD.MD, con 3 ajustes acordados:
--    1) Se agregan  planes  y  suscripciones  (modelo hibrido / paywall del panel web).
--    2) Pagos alineados a PayPal Sandbox (log_pagos con metodo_pago='paypal' + order/capture).
--    3) Doble horario: horarios_operacion (establecimiento) + cancha_horarios (por cancha,
--       manipulable por el dueno). Ademas se agrega tabla  favoritos.
--
--  Ejecutar:  psql -U <usuario> -d sportspot -f sql/schema.sql   (o  npm run migrate)
--  Nota: el script es idempotente (borra y recrea) para desarrollo.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- para gen_random_uuid()

-- ---- Borrado en orden inverso de dependencias (idempotente) ----
DROP TABLE IF EXISTS favoritos CASCADE;
DROP TABLE IF EXISTS resenas CASCADE;
DROP TABLE IF EXISTS creditos_favor CASCADE;
DROP TABLE IF EXISTS no_shows CASCADE;
DROP TABLE IF EXISTS log_pagos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS cancha_imagenes CASCADE;
DROP TABLE IF EXISTS cancha_horarios CASCADE;
DROP TABLE IF EXISTS canchas CASCADE;
DROP TABLE IF EXISTS horarios_operacion CASCADE;
DROP TABLE IF EXISTS establecimiento_amenidades CASCADE;
DROP TABLE IF EXISTS establecimientos CASCADE;
DROP TABLE IF EXISTS suscripciones CASCADE;
DROP TABLE IF EXISTS oauth_providers CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS amenidades CASCADE;
DROP TABLE IF EXISTS tipos_deporte CASCADE;
DROP TABLE IF EXISTS planes CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================================
--  CATALOGOS
-- ============================================================================

CREATE TABLE roles (
  id_rol       SERIAL PRIMARY KEY,
  nombre_rol   VARCHAR(30) NOT NULL UNIQUE,
  descripcion  VARCHAR(100)
);

-- Planes de suscripcion (modelo hibrido: cuota mensual + comision por reserva)
CREATE TABLE planes (
  id_plan                 SERIAL PRIMARY KEY,
  nombre                  VARCHAR(30) NOT NULL UNIQUE,           -- Basico | Pro | Premium
  limite_establecimientos INTEGER NOT NULL CHECK (limite_establecimientos > 0),
  precio_mensual          DECIMAL(8,2) NOT NULL CHECK (precio_mensual >= 0),
  comision_pct            DECIMAL(5,2) NOT NULL CHECK (comision_pct >= 0)
);

CREATE TABLE tipos_deporte (
  id_tipo      SERIAL PRIMARY KEY,
  nombre       VARCHAR(50) NOT NULL UNIQUE,
  icono        VARCHAR(50),
  spec_schema  JSONB
);

CREATE TABLE amenidades (
  id_amenidad  SERIAL PRIMARY KEY,
  nombre       VARCHAR(80) NOT NULL UNIQUE,
  icono        VARCHAR(50),
  categoria    VARCHAR(50)
);

-- ============================================================================
--  USUARIOS Y AUTENTICACION
-- ============================================================================

CREATE TABLE usuarios (
  id_usuario   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       VARCHAR(100) NOT NULL,
  correo       VARCHAR(150) UNIQUE,
  contrasena   VARCHAR(255),                 -- hash bcrypt; NULL para usuarios solo-OAuth
  telefono     VARCHAR(20),
  avatar_url   VARCHAR(500),
  id_rol       INTEGER NOT NULL REFERENCES roles(id_rol),
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE oauth_providers (
  id_oauth          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario        UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  provider          VARCHAR(30) NOT NULL,                 -- google | apple
  provider_user_id  VARCHAR(255) NOT NULL,
  access_token      TEXT,
  refresh_token     TEXT,
  expires_at        TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

-- Suscripcion del dueno (activa el paywall del panel web)
CREATE TABLE suscripciones (
  id_suscripcion  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_dueno        UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_plan         INTEGER NOT NULL REFERENCES planes(id_plan),
  estado          VARCHAR(20) NOT NULL DEFAULT 'activa',   -- activa | cancelada | vencida
  proveedor       VARCHAR(30) DEFAULT 'paypal-sandbox',
  fecha_inicio    TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_fin       TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
--  ESTABLECIMIENTOS Y CANCHAS
-- ============================================================================

CREATE TABLE establecimientos (
  id_establecimiento  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_dueno            UUID NOT NULL REFERENCES usuarios(id_usuario),
  nombre              VARCHAR(150) NOT NULL,
  descripcion         TEXT,
  direccion           TEXT NOT NULL,
  ubicacion_lat       DECIMAL(10,7) NOT NULL,
  ubicacion_lng       DECIMAL(10,7) NOT NULL,
  telefono            VARCHAR(20),
  correo              VARCHAR(150),
  estado              VARCHAR(20) NOT NULL DEFAULT 'pendiente',   -- activo | inactivo | pendiente
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_estab_dueno ON establecimientos (id_dueno);

CREATE TABLE establecimiento_amenidades (
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento) ON DELETE CASCADE,
  id_amenidad         INTEGER NOT NULL REFERENCES amenidades(id_amenidad),
  notas               VARCHAR(200),
  PRIMARY KEY (id_establecimiento, id_amenidad)
);

-- Horario de operacion del establecimiento (apertura/cierre por dia)
CREATE TABLE horarios_operacion (
  id_horario          SERIAL PRIMARY KEY,
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento) ON DELETE CASCADE,
  dia_semana          SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),  -- 0=Dom ... 6=Sab
  hora_apertura       TIME NOT NULL,
  hora_cierre         TIME NOT NULL,
  UNIQUE (id_establecimiento, dia_semana)
);

CREATE TABLE canchas (
  id_cancha            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_establecimiento   UUID NOT NULL REFERENCES establecimientos(id_establecimiento) ON DELETE CASCADE,
  id_tipo_deporte      INTEGER NOT NULL REFERENCES tipos_deporte(id_tipo),
  nombre               VARCHAR(100) NOT NULL,
  descripcion          TEXT,
  precio_hora          DECIMAL(8,2) NOT NULL CHECK (precio_hora > 0),
  capacidad_jugadores  INTEGER CHECK (capacidad_jugadores > 0),
  estado               VARCHAR(20) NOT NULL DEFAULT 'activa',   -- activa | mantenimiento | inactiva
  specs                JSONB,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_canchas_estab ON canchas (id_establecimiento);

-- Disponibilidad por cancha (bloques que el dueno habilita/bloquea) -- RF-12
CREATE TABLE cancha_horarios (
  id_cancha_horario  SERIAL PRIMARY KEY,
  id_cancha          UUID NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  dia_semana         SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio        TIME NOT NULL,
  hora_fin           TIME NOT NULL CHECK (hora_fin > hora_inicio),
  bloqueado          BOOLEAN NOT NULL DEFAULT FALSE,   -- el dueno puede bloquear/liberar
  UNIQUE (id_cancha, dia_semana, hora_inicio)
);

CREATE TABLE cancha_imagenes (
  id_imagen     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cancha     UUID NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  url           VARCHAR(500) NOT NULL,
  es_principal  BOOLEAN NOT NULL DEFAULT FALSE,
  orden         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
--  RESERVAS Y PAGOS
-- ============================================================================

CREATE TABLE reservas (
  id_reserva          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios(id_usuario),
  id_cancha           UUID NOT NULL REFERENCES canchas(id_cancha),
  fecha_reserva       DATE NOT NULL,
  hora_inicio         TIME NOT NULL,
  hora_fin            TIME NOT NULL CHECK (hora_fin > hora_inicio),
  precio_total        DECIMAL(8,2) NOT NULL CHECK (precio_total > 0),
  monto_abono         DECIMAL(8,2) NOT NULL DEFAULT 0 CHECK (monto_abono >= 0),
  comision_pct        DECIMAL(5,2),                     -- comision SportSpot segun plan del dueno
  comision_monto      DECIMAL(8,2),                     -- para reportes contables (RF-13)
  estado              VARCHAR(30) NOT NULL DEFAULT 'pendiente_pago',
                      -- pendiente_pago | confirmada | cancelada | completada | no_show
  cancelada_por       VARCHAR(20),                      -- usuario | establecimiento | sistema
  motivo_cancelacion  TEXT,
  cancelado_en        TIMESTAMP,
  veces_reagendada    SMALLINT NOT NULL DEFAULT 0 CHECK (veces_reagendada >= 0),
  reagendada_en       TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reservas_usuario ON reservas (id_usuario);
CREATE INDEX idx_reservas_cancha  ON reservas (id_cancha);

-- Registro de pagos (PayPal Sandbox). Sirve a reservas y a suscripciones.
CREATE TABLE log_pagos (
  id_pago            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pago        VARCHAR(20) NOT NULL UNIQUE,        -- 'PAG-' + timestamp
  tipo_origen        VARCHAR(20) NOT NULL,               -- reserva | suscripcion
  id_reserva         UUID REFERENCES reservas(id_reserva),
  id_suscripcion     UUID REFERENCES suscripciones(id_suscripcion),
  id_usuario         UUID NOT NULL REFERENCES usuarios(id_usuario),
  monto              DECIMAL(8,2) NOT NULL CHECK (monto > 0),
  moneda             VARCHAR(10) NOT NULL DEFAULT 'USD',
  tipo               VARCHAR(20) NOT NULL,               -- abono | pago_completo | suscripcion | reembolso
  metodo_pago        VARCHAR(30) NOT NULL DEFAULT 'paypal',  -- paypal | yappy | tarjeta
  paypal_order_id    VARCHAR(60),
  paypal_capture_id  VARCHAR(60),
  referencia_externa VARCHAR(100),
  estado             VARCHAR(20) NOT NULL,               -- pendiente | aprobado | fallido | reembolsado
  metadata           JSONB,
  fecha_pago         TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pagos_usuario ON log_pagos (id_usuario);

-- ============================================================================
--  CONTINGENCIAS Y SOCIAL
-- ============================================================================

CREATE TABLE no_shows (
  id_no_show          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_reserva          UUID NOT NULL UNIQUE REFERENCES reservas(id_reserva),
  id_usuario          UUID NOT NULL REFERENCES usuarios(id_usuario),
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento),
  fecha               DATE NOT NULL,
  penalidad_aplicada  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE creditos_favor (
  id_credito          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario          UUID NOT NULL REFERENCES usuarios(id_usuario),
  id_establecimiento  UUID NOT NULL REFERENCES establecimientos(id_establecimiento),
  horas_disponibles   DECIMAL(4,2) NOT NULL CHECK (horas_disponibles >= 0),
  motivo              TEXT,
  id_reserva_origen   UUID REFERENCES reservas(id_reserva),
  expira_en           DATE,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE resenas (
  id_resena     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario    UUID NOT NULL REFERENCES usuarios(id_usuario),
  id_cancha     UUID NOT NULL REFERENCES canchas(id_cancha),
  id_reserva    UUID REFERENCES reservas(id_reserva),
  calificacion  SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario    TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (id_usuario, id_reserva)
);

-- Favoritos del deportista (funcion pendiente en la app movil)
CREATE TABLE favoritos (
  id_usuario  UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_cancha   UUID NOT NULL REFERENCES canchas(id_cancha) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_usuario, id_cancha)
);

-- ============================================================================
--  DATOS SEMILLA
-- ============================================================================

INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('Cliente',   'Deportista que descubre, reserva y paga canchas.'),
  ('Dueno',     'Propietario que administra establecimientos y canchas.'),
  ('Gerente',   'Personal con permisos de gestion del establecimiento.'),
  ('Contador',  'Acceso a reportes contables y financieros.'),
  ('Marketing', 'Gestion de publicaciones y promociones.'),
  ('Admin',     'Administrador de la plataforma SportSpot.');

INSERT INTO planes (nombre, limite_establecimientos, precio_mensual, comision_pct) VALUES
  ('Basico',  1,  9.99, 8.00),
  ('Pro',     3, 24.99, 6.00),
  ('Premium', 10, 49.99, 4.00);

INSERT INTO tipos_deporte (nombre, icono) VALUES
  ('Futbol 5',  'soccer'),
  ('Futbol 7',  'soccer'),
  ('Basketball','basketball'),
  ('Baseball',  'baseball'),
  ('Padel',     'tennis'),
  ('Tenis',     'tennis'),
  ('Voleibol',  'volleyball'),
  ('Natacion',  'swim');

INSERT INTO amenidades (nombre, icono, categoria) VALUES
  ('Techo',           'umbrella', 'instalaciones'),
  ('Banos',           'toilet',   'servicios'),
  ('Gimnasio',        'dumbbell', 'instalaciones'),
  ('Vestidores',      'door',     'instalaciones'),
  ('Estacionamiento', 'parking',  'servicios'),
  ('Iluminacion',     'bulb',     'instalaciones'),
  ('Cafeteria',       'coffee',   'servicios'),
  ('WiFi',            'wifi',     'servicios'),
  ('Duchas',          'shower',   'servicios'),
  ('Tienda',          'store',    'servicios');

-- Usuarios de prueba (contrasena de ambos: "demo1234")
INSERT INTO usuarios (nombre, correo, contrasena, telefono, id_rol) VALUES
  ('Carlos Mendez', 'dueno@sportspot.com', '$2b$10$3aFxqaSI1RxHOmABo7MFT.e5sOPRw3WXA6N4JDGQIXcJeaKUaijT2', '+507 6000-0001',
     (SELECT id_rol FROM roles WHERE nombre_rol = 'Dueno')),
  ('Ana Torres',    'ana@sportspot.com',   '$2b$10$3aFxqaSI1RxHOmABo7MFT.e5sOPRw3WXA6N4JDGQIXcJeaKUaijT2', '+507 6000-0002',
     (SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente'));

-- Suscripcion Pro para el dueno de prueba
INSERT INTO suscripciones (id_dueno, id_plan, estado) VALUES
  ((SELECT id_usuario FROM usuarios WHERE correo = 'dueno@sportspot.com'),
   (SELECT id_plan FROM planes WHERE nombre = 'Pro'), 'activa');

-- Establecimiento de prueba
INSERT INTO establecimientos (id_dueno, nombre, descripcion, direccion, ubicacion_lat, ubicacion_lng, telefono, estado) VALUES
  ((SELECT id_usuario FROM usuarios WHERE correo = 'dueno@sportspot.com'),
   'Club Deportivo Albrook', 'Complejo con canchas techadas e iluminadas.',
   'Albrook, Ciudad de Panama', 8.9936000, -79.5498000, '+507 300-0000', 'activo');

-- Amenidades del establecimiento
INSERT INTO establecimiento_amenidades (id_establecimiento, id_amenidad, notas) VALUES
  ((SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
   (SELECT id_amenidad FROM amenidades WHERE nombre = 'Techo'), 'Canchas techadas'),
  ((SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
   (SELECT id_amenidad FROM amenidades WHERE nombre = 'Estacionamiento'), NULL),
  ((SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
   (SELECT id_amenidad FROM amenidades WHERE nombre = 'Banos'), NULL);

-- Horario de operacion (Lunes a Sabado 6:00 - 22:00)
INSERT INTO horarios_operacion (id_establecimiento, dia_semana, hora_apertura, hora_cierre)
SELECT (SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
       d, '06:00', '22:00'
FROM generate_series(1, 6) AS d;

-- Canchas del establecimiento
INSERT INTO canchas (id_establecimiento, id_tipo_deporte, nombre, precio_hora, capacidad_jugadores) VALUES
  ((SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
   (SELECT id_tipo FROM tipos_deporte WHERE nombre = 'Basketball'), 'Cancha 1', 15.00, 10),
  ((SELECT id_establecimiento FROM establecimientos WHERE nombre = 'Club Deportivo Albrook'),
   (SELECT id_tipo FROM tipos_deporte WHERE nombre = 'Futbol 5'), 'Cancha 2', 25.00, 10);

-- Disponibilidad por cancha (Lun-Vie, bloques de las tardes)
INSERT INTO cancha_horarios (id_cancha, dia_semana, hora_inicio, hora_fin)
SELECT (SELECT id_cancha FROM canchas WHERE nombre = 'Cancha 1'), d, h, (h + INTERVAL '1 hour')::TIME
FROM generate_series(1, 5) AS d,
     (VALUES ('17:00'::TIME), ('18:00'::TIME), ('19:00'::TIME)) AS horas(h);

-- Reserva de ejemplo (Ana reserva Cancha 1 manana a las 18:00, ya confirmada)
INSERT INTO reservas (id_usuario, id_cancha, fecha_reserva, hora_inicio, hora_fin, precio_total, comision_pct, comision_monto, estado) VALUES
  ((SELECT id_usuario FROM usuarios WHERE correo = 'ana@sportspot.com'),
   (SELECT id_cancha FROM canchas WHERE nombre = 'Cancha 1'),
   CURRENT_DATE + 1, '18:00', '19:00', 15.00, 6.00, 0.90, 'confirmada');

-- ============================================================================
--  Fin del schema.  Verificar con:  \dt   y   SELECT * FROM roles;
-- ============================================================================
