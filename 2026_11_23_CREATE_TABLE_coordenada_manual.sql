-- Ubicaciones fijadas a mano por el supervisor en el mapa de Rutas.
-- El sistema la crea solo la primera vez que se usa; este archivo es por si
-- prefieres crearla a mano.
CREATE TABLE IF NOT EXISTS coordenada_manual (
    suministro       VARCHAR(50)    NOT NULL,
    lat              DECIMAL(11, 8) NOT NULL,
    lon              DECIMAL(11, 8) NOT NULL,
    lat_anterior     DECIMAL(11, 8) NULL,
    lon_anterior     DECIMAL(11, 8) NULL,
    origen_anterior  VARCHAR(60)    NULL,
    direccion        VARCHAR(300)   NULL,
    localidad        VARCHAR(100)   NULL,
    id_usuario       INT            NULL,
    usuario          VARCHAR(150)   NULL,
    fecha            DATETIME       NULL,
    PRIMARY KEY (suministro)
) DEFAULT CHARSET = utf8mb4;
