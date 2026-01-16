from app import db
from datetime import datetime

class Empleado(db.Model):
    __tablename__ = 'empleado'
    id_empleado = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    apellidos = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    cod_ope = db.Column(db.String(250), nullable=True)

    usuarios = db.relationship('Usuario', backref='empleado', lazy=True)
    lecturas = db.relationship('EmpleadoLectura', backref='empleado', lazy=True)
    distribuciones = db.relationship('EmpleadoDistribucion', backref='empleado', lazy=True)
    inspecciones = db.relationship('EmpleadoInspecciones', backref='empleado', lazy=True)
    catastros = db.relationship('EmpleadoCatastro', backref='empleado', lazy=True)
    persuasivas = db.relationship('EmpleadoPersuasivas', backref='empleado', lazy=True)
    medidores = db.relationship('EmpleadoMedidores', backref='empleado', lazy=True)
    recaudaciones = db.relationship('EmpleadoRecaudacion', backref='empleado', lazy=True)
    administrativos = db.relationship('EmpleadoAdministrativo', backref='empleado', lazy=True)

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id_usuario = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(255), nullable=True)
    contraseña = db.Column(db.String(255), nullable=True)
    tipousu = db.Column(db.String(255), nullable=True)
    rol = db.Column(db.String(255), nullable=False)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)


class AuditoriaAcceso(db.Model):
    __tablename__ = 'auditoria_acceso'
    id = db.Column(db.Integer, primary_key=True)
    id_usuario_a = db.Column(db.Integer, nullable=False)
    usuario = db.Column(db.String(50), nullable=False)
    evento = db.Column(db.String(50), nullable=False)  
    modulo = db.Column(db.String(100), nullable=True)  
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    duracion_sesion = db.Column(db.Integer)

class EmpleadoLectura(db.Model):
    __tablename__ = 'empleado_lectura'
    id_lectura = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoDistribucion(db.Model):
    __tablename__ = 'empleado_distribucion'
    id_distribucion = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoInspecciones(db.Model):
    __tablename__ = 'empleado_inspecciones'
    id_inspecciones = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoCatastro(db.Model):
    __tablename__ = 'empleado_catastro'
    id_catastro = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoPersuasivas(db.Model):
    __tablename__ = 'empleado_persuasivas'
    id_persuasivas = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoMedidores(db.Model):
    __tablename__ = 'empleado_medidores'
    id_medidores = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoNorte(db.Model):
    __tablename__ = 'empleado_norte'
    id_norte = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoRecaudacion(db.Model):
    __tablename__ = 'empleado_recaudacion'
    id_recaudacion = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.String(10), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class EmpleadoAdministrativo(db.Model):
    __tablename__ = 'empleado_administrativo'
    id_administrativo = db.Column(db.Integer, primary_key=True)
    nombres = db.Column(db.String(250), nullable=True)
    dni = db.Column(db.String(250), nullable=True)
    cargo = db.Column(db.String(250), nullable=True)
    area = db.Column(db.String(250), nullable=True)
    mes = db.Column(db.String(250), nullable=True)
    fec_asist = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(250), nullable=True)
    justificacion = db.Column(db.String(250), nullable=True)
    pasajes = db.Column(db.Numeric(10, 2), nullable=True)
    ruta = db.Column(db.String(255), nullable=True)
    viaticos = db.Column(db.Numeric(10, 2), nullable=True)
    cod_ope = db.Column(db.String(255), nullable=True)
    hora_ingreso = db.Column(db.Time, nullable=True)
    hora_salida = db.Column(db.Time, nullable=True)
    id_empleado = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)

class ReporteLectura(db.Model):
    __tablename__ = 'reporte_lectura'

    id_reportelectura = db.Column(db.Integer, primary_key=True)
    CLICODFAC = db.Column(db.String(255), nullable=True)
    NOMBRE = db.Column(db.String(255), nullable=True)
    URBANIZAC = db.Column(db.String(255), nullable=True)
    CALLE = db.Column(db.String(255), nullable=True)
    CLIMUNRO = db.Column(db.String(255), nullable=True)
    MEDCODYGO = db.Column(db.String(255), nullable=True)
    LECTURA = db.Column(db.String(255), nullable=True)
    FECLEC = db.Column(db.String(255), nullable=True)
    OBS1 = db.Column(db.String(255), nullable=True)
    OBS2 = db.Column(db.String(255), nullable=True)
    REFUBIME = db.Column(db.String(255), nullable=True)
    NEWMED = db.Column(db.String(255), nullable=True)
    CICLO = db.Column(db.String(255), nullable=True)
    CARGA = db.Column(db.String(255), nullable=True)
    ORDENRUTA = db.Column(db.String(255), nullable=True)
    TIPOLECTURA = db.Column(db.String(255), nullable=True)
    NOMBREOPERADOR = db.Column(db.String(255), nullable=True)
    PROMEDIOSEDALIB = db.Column(db.String(255), nullable=True)


class Material(db.Model):
    __tablename__ = 'materiales'
    id_material = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), unique=True, nullable=False)
    asignaciones = db.relationship('MaterialAsignado', backref='material_rel', lazy=True)


class CargaDia(db.Model):
    __tablename__ = 'carga_dia'
    id_carga = db.Column(db.Integer, primary_key=True)
    suministro = db.Column(db.String(255), nullable=True)
    direccion = db.Column(db.String(255), nullable=True)
    actividad = db.Column(db.String(100), nullable=True)
    fecha_ejecutar = db.Column(db.Date, nullable=True)
    operario = db.Column(db.String(255), nullable=True) 
    materiales_asignados = db.relationship('MaterialAsignado', backref='carga_rel', lazy=True)


class MaterialAsignado(db.Model):
    __tablename__ = 'material_asignado'
    id_asignado = db.Column(db.Integer, primary_key=True)
    cantidad = db.Column(db.Numeric(10, 2), nullable=True)

    id_carga = db.Column(db.Integer, db.ForeignKey('carga_dia.id_carga'), nullable=False)
    id_material = db.Column(db.Integer, db.ForeignKey('materiales.id_material'), nullable=False)
    cargas_ejecutadas = db.relationship('CargaEjecutada', backref='asignacion_rel', lazy=True)


class CargaEjecutada(db.Model):
    __tablename__ = 'carga_ejecutada'
    id_ejecucion = db.Column(db.Integer, primary_key=True)
    fecha_ejecucion = db.Column(db.Date, nullable=True)
    cantidad_u = db.Column(db.Numeric(10, 2), nullable=True)
    material_u = db.Column(db.String(255), nullable=True) 
    
    id_asignado = db.Column(db.Integer, db.ForeignKey('material_asignado.id_asignado'), nullable=False)
    devolucion = db.relationship('MaterialDevuelto', backref='ejecucion_rel', uselist=False, lazy=True)
    

class MaterialDevuelto(db.Model):
    __tablename__ = 'material_devuelto'
    id_devuelto = db.Column(db.Integer, primary_key=True)
    devuelto = db.Column(db.Numeric(10, 2), nullable=True)
    pendiente_dev = db.Column(db.Numeric(10, 2), nullable=True)

    id_ejecucion = db.Column(db.Integer, db.ForeignKey('carga_ejecutada.id_ejecucion'), nullable=False)


class DataCatastroV2(db.Model):
    __tablename__ = 'data_catastro'

    id_data = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agrupado = db.Column(db.String(255), nullable=True)
    codigo_cliente = db.Column(db.String(255), nullable=True)
    cod_cat_nuevo_cliente = db.Column(db.String(255), nullable=True)
    suministro_p = db.Column(db.String(255), nullable=True)
    nombre = db.Column(db.String(255), nullable=True)
    sector = db.Column(db.String(100), nullable=True)
    manzana = db.Column(db.String(100), nullable=True)
    lote = db.Column(db.String(100), nullable=True)
    ciclo = db.Column(db.String(50), nullable=True)
    este = db.Column(db.Numeric(10, 2), nullable=True)
    norte = db.Column(db.Numeric(10, 2), nullable=True)
    codigo_inspeccion_perdidas = db.Column(db.String(255), nullable=True)
    fecha_empadronamiento = db.Column(db.Date, nullable=True)


class RegistroTrabajo(db.Model):
    __tablename__ = 'registro_trabajo'

    id_registro = db.Column(db.String(50), primary_key=True) 
    codigo_inspeccion_perdidas = db.Column(db.String(50), nullable=True)
    suministro = db.Column(db.String(50), nullable=True)
    nombre = db.Column(db.String(255), nullable=True)
    ciclo = db.Column(db.String(20), nullable=True)
    localidad = db.Column(db.String(100), nullable=True)
    urba = db.Column(db.String(100), nullable=True)
    calle2 = db.Column(db.String(255), nullable=True)
    nromuni = db.Column(db.String(50), nullable=True)
    numero_documento = db.Column(db.String(20), nullable=True)
    latitud = db.Column(db.Numeric(11, 8), nullable=True)
    longitud = db.Column(db.Numeric(11, 8), nullable=True)
    este = db.Column(db.String(50), nullable=True) 
    norte = db.Column(db.String(50), nullable=True) 
    fecha_cargue = db.Column(db.Date, nullable=True)
    operario = db.Column(db.String(100), nullable=True)
    fecha_ini_ejecucion = db.Column(db.Date, nullable=True)
    hora_ini_ejecucion = db.Column(db.Time, nullable=True) 
    fecha_fin_ejecucion = db.Column(db.Date, nullable=True)
    hora_fin_ejecucion = db.Column(db.Time, nullable=True) 
    estado = db.Column(db.String(50), nullable=True)
    actividad = db.Column(db.String(100), nullable=True)
