-- Cache de lo que respondio el GIS de Sedalib por suministro (centro del lote, UTM 17S).
-- El sistema la crea solo la primera vez; este script es por si se prefiere crearla a mano.
CREATE TABLE IF NOT EXISTS coordenada_gis_sedalib (
    suministro  VARCHAR(50)    NOT NULL PRIMARY KEY,
    este        DECIMAL(12,3)  NULL,
    norte       DECIMAL(12,3)  NULL,
    encontrado  TINYINT(1)     NOT NULL DEFAULT 0,
    fecha       DATETIME       NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
