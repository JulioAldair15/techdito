-- =============================================================================
-- MONITOREO DE OPERARIOS (app móvil -> web)
-- El sistema las crea solo la primera vez que se usan; este script es por si el
-- usuario de la base de datos no tiene permiso para crear tablas.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ubicacion_operario (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    id_usuario   INT NOT NULL,
    fecha_hora   DATETIME NOT NULL,          -- hora de Lima en que el celular tomó el punto
    lat          DOUBLE NOT NULL,
    lon          DOUBLE NOT NULL,
    precision_m  FLOAT NULL,                 -- precisión del GPS en metros
    velocidad    FLOAT NULL,                 -- m/s
    bateria      SMALLINT NULL,              -- %
    recibido     DATETIME NULL,              -- cuándo llegó al servidor
    PRIMARY KEY (id),
    UNIQUE KEY uq_ubic_usuario_fecha (id_usuario, fecha_hora),
    KEY ix_ubic_fecha (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS estado_dispositivo (
    id_usuario       INT NOT NULL,
    ultimo_contacto  DATETIME NULL,
    fecha_ubicacion  DATETIME NULL,
    lat              DOUBLE NULL,
    lon              DOUBLE NULL,
    precision_m      FLOAT NULL,
    velocidad        FLOAT NULL,
    bateria          SMALLINT NULL,
    cargando         TINYINT(1) NULL,
    gps_activo       TINYINT(1) NULL,
    red              VARCHAR(20) NULL,
    version_app      VARCHAR(30) NULL,
    modelo           VARCHAR(80) NULL,
    alerta           TINYINT(1) NOT NULL DEFAULT 0,   -- celular marcado como robado/perdido
    alerta_desde     DATETIME NULL,
    alerta_por       VARCHAR(80) NULL,
    PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
