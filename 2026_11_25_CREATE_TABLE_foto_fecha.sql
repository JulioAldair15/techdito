-- Fecha de cada foto del historial (cuando se subio al servidor de fotos).
-- El sistema la crea solo la primera vez; este script es por si se prefiere crearla a mano.
CREATE TABLE IF NOT EXISTS foto_fecha (
    clave     CHAR(40)  NOT NULL PRIMARY KEY,
    fecha     DATETIME  NULL,
    revisado  DATETIME  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
