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

    fecha_nacimiento = db.Column(db.Date)
    sexo = db.Column(db.String(50))
    estado_civil = db.Column(db.String(20))
    direccion = db.Column(db.String(255))
    telefono = db.Column(db.String(20))
    correo = db.Column(db.String(100))

    tipo_contrato = db.Column(db.String(50))
    jornada_laboral = db.Column(db.String(50))
    regimen_laboral = db.Column(db.String(50))
    estado = db.Column(db.String(20), default='ACTIVO')

    fecha_ingreso = db.Column(db.Date)
    fecha_cese = db.Column(db.Date)

    hora_ingreso = db.Column(db.String(10), nullable=True)
    hora_salida = db.Column(db.String(10), nullable=True)
    refrigerio_inicio = db.Column(db.String(10), nullable=True)
    refrigerio_fin = db.Column(db.String(10), nullable=True)

    usuarios = db.relationship('Usuario', backref='empleado', lazy=True)
    lecturas = db.relationship('EmpleadoLectura', backref='empleado', lazy=True)
    distribuciones = db.relationship('EmpleadoDistribucion', backref='empleado', lazy=True)
    inspecciones = db.relationship('EmpleadoInspecciones', backref='empleado', lazy=True)
    catastros = db.relationship('EmpleadoCatastro', backref='empleado', lazy=True)
    persuasivas = db.relationship('EmpleadoPersuasivas', backref='empleado', lazy=True)
    medidores = db.relationship('EmpleadoMedidores', backref='empleado', lazy=True)
    recaudaciones = db.relationship('EmpleadoRecaudacion', backref='empleado', lazy=True)
    administrativos = db.relationship('EmpleadoAdministrativo', backref='empleado', lazy=True)

    remuneraciones = db.relationship('Remuneracion', backref='empleado', lazy=True)
    descuentos = db.relationship('Descuento', backref='empleado', lazy=True)
    cuentas_bancarias = db.relationship('DatosBancarios', backref='empleado', lazy=True)
    beneficios = db.relationship('BeneficioSocial', backref='empleado', lazy=True)
    documentos = db.relationship('DocumentoEmpleado', backref='empleado', lazy=True)
    cargas = db.relationship('CargaFamiliar', backref='empleado', lazy=True)

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


class Imagen(db.Model):
    __tablename__ = 'imagenes'

    id = db.Column(db.BigInteger, primary_key=True)
    carpeta = db.Column(db.String(255), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    path = db.Column(db.Text)
    leyenda = db.Column(db.String(100))
    origen = db.Column(db.String(50), nullable=False)
    suministro = db.Column(db.String(15))

    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(),
                        onupdate=db.func.current_timestamp())

# =========================
# 💰 REMUNERACIONES
# =========================
class Remuneracion(db.Model):
    __tablename__ = 'remuneraciones'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)

    sueldo_basico = db.Column(db.Numeric(10, 2), nullable=False)
    asignacion_familiar = db.Column(db.Numeric(10, 2), default=0)
    bonificacion = db.Column(db.Numeric(10, 2), default=0)
    comisiones = db.Column(db.Numeric(10, 2), default=0)
    horas_extras = db.Column(db.Numeric(10, 2), default=0)

    moneda = db.Column(db.String(10), default='PEN')
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# 🧮 DESCUENTOS
# =========================
class Descuento(db.Model):
    __tablename__ = 'descuentos'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)

    tipo_descuento = db.Column(db.String(50))
    monto = db.Column(db.Numeric(10, 2))
    descripcion = db.Column(db.String(255))
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# 🏦 DATOS BANCARIOS
# =========================
class DatosBancarios(db.Model):
    __tablename__ = 'datos_bancarios'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)

    banco = db.Column(db.String(100))
    tipo_cuenta = db.Column(db.String(50))
    numero_cuenta = db.Column(db.String(50))
    cci = db.Column(db.String(50))


# =========================
# 📅 BENEFICIOS SOCIALES
# =========================
class BeneficioSocial(db.Model):
    __tablename__ = 'beneficios_sociales'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)

    cts = db.Column(db.Numeric(10, 2), default=0)
    gratificacion = db.Column(db.Numeric(10, 2), default=0)
    vacaciones_truncas = db.Column(db.Numeric(10, 2), default=0)
    liquidacion = db.Column(db.Numeric(10, 2), default=0)

    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# 📂 TIPOS DE DOCUMENTO
# =========================
class TipoDocumento(db.Model):
    __tablename__ = 'tipos_documento'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)


# =========================
# 📂 DOCUMENTOS EMPLEADO
# =========================
class DocumentoEmpleado(db.Model):
    __tablename__ = 'documentos_empleado'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)
    tipo_documento_id = db.Column(db.Integer, db.ForeignKey('tipos_documento.id'), nullable=False)

    nombre_archivo = db.Column(db.String(255))
    ruta_archivo = db.Column(db.String(255))
    fecha_emision = db.Column(db.Date)
    fecha_vencimiento = db.Column(db.Date)
    observaciones = db.Column(db.Text)

    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)


# =========================
# 👨‍👩‍👧‍👦 CARGAS FAMILIARES
# =========================
class CargaFamiliar(db.Model):
    __tablename__ = 'cargas_familiares'

    id = db.Column(db.Integer, primary_key=True)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)

    nombres = db.Column(db.String(150), nullable=False)
    parentesco = db.Column(db.String(50))
    fecha_nacimiento = db.Column(db.Date)
    dni = db.Column(db.String(20))

    es_dependiente = db.Column(db.Boolean, default=True)
    aplica_asignacion = db.Column(db.Boolean, default=True)

    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

    documentos = db.relationship('DocumentoCarga', backref='carga', lazy=True)


# =========================
# 📎 DOCUMENTOS CARGAS
# =========================
class DocumentoCarga(db.Model):
    __tablename__ = 'documentos_cargas'

    id = db.Column(db.Integer, primary_key=True)
    carga_id = db.Column(db.Integer, db.ForeignKey('cargas_familiares.id'), nullable=False)
    tipo_documento_id = db.Column(db.Integer, db.ForeignKey('tipos_documento.id'), nullable=False)

    ruta_archivo = db.Column(db.String(255))
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)

# =========================
# 📎 DOCUMENTOS EMPLEADO
# =========================
# class DocumentoEmpleado(db.Model):
#     __tablename__ = 'documentos_empleados'

#     id = db.Column(db.Integer, primary_key=True)
#     empleado_id = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)
#     tipo_documento_id = db.Column(db.Integer, db.ForeignKey('tipos_documento.id'), nullable=False)

#     ruta_archivo = db.Column(db.String(255))
#     fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)


# ==========================================
# 📦 MÓDULO DE INVENTARIO Y ALMACÉN
# ==========================================

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id_categoria = db.Column(db.Integer, primary_key=True)
    tipo_categoria = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(20), default='ACTIVO')
    codigo_prefijo = db.Column(db.String(10), unique=True, nullable=True)

    # Relación
    productos = db.relationship('Producto', backref='categoria', lazy=True)


class Producto(db.Model):
    __tablename__ = 'productos'
    id_producto = db.Column(db.Integer, primary_key=True)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categorias.id_categoria'), nullable=False)
    
    codigo_identificador = db.Column(db.String(50), unique=True, nullable=False)
    nombre_prod = db.Column(db.String(250), nullable=False)
    unidad_medida = db.Column(db.String(50))
    stock = db.Column(db.Numeric(10, 2), default=0.00)
    precio_igv = db.Column(db.Numeric(10, 2), default=0.00)
    estado = db.Column(db.String(20), default='ACTIVO')

    # Relaciones
    movimientos = db.relationship('MovimientoDetalle', backref='producto_rel', lazy=True)
    auditorias = db.relationship('InventarioAuditoria', backref='producto_auditado', lazy=True)


class Proveedor(db.Model):
    __tablename__ = 'proveedores'
    id_proveedor = db.Column(db.Integer, primary_key=True)
    ruc = db.Column(db.String(15), unique=True, nullable=False)
    razon_social = db.Column(db.String(250), nullable=False)
    nombre_comercial = db.Column(db.String(250))
    celular = db.Column(db.String(20))
    correo = db.Column(db.String(100))
    direccion = db.Column(db.String(255))
    estado = db.Column(db.String(20), default='ACTIVO')

    # Relación
    entradas = db.relationship('Entrada', backref='proveedor', lazy=True)


class Entrada(db.Model):
    __tablename__ = 'entradas'
    id_entrada = db.Column(db.Integer, primary_key=True)
    id_proveedor = db.Column(db.Integer, db.ForeignKey('proveedores.id_proveedor'), nullable=False)
    id_empleado_receptor = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)
    
    fecha_ingreso = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_factura = db.Column(db.Date)
    nro_factura = db.Column(db.String(50))
    nro_guia = db.Column(db.String(50))
    obs_entrada = db.Column(db.Text)
    adjunto_entrada = db.Column(db.String(255)) # Ruta del archivo

    # Relación
    detalles = db.relationship('MovimientoDetalle', backref='entrada_rel', lazy=True, cascade="all, delete-orphan")


class Salida(db.Model):
    __tablename__ = 'salidas'
    id_salida = db.Column(db.Integer, primary_key=True)
    id_empleado_solicitante = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)
    
    fecha_salida = db.Column(db.DateTime, default=datetime.utcnow)
    obs_salida = db.Column(db.Text)
    adjunto_salida = db.Column(db.String(255)) # Ruta del archivo
    empleado = db.relationship('Empleado', backref='solicitudes_salida', foreign_keys=[id_empleado_solicitante])
    # Relación
    detalles = db.relationship('MovimientoDetalle', backref='salida_rel', lazy=True, cascade="all, delete-orphan")


class MovimientoDetalle(db.Model):
    __tablename__ = 'movimientos_detalle'
    id_movimiento = db.Column(db.Integer, primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey('productos.id_producto'), nullable=False)
    id_entrada = db.Column(db.Integer, db.ForeignKey('entradas.id_entrada'), nullable=True)
    id_salida = db.Column(db.Integer, db.ForeignKey('salidas.id_salida'), nullable=True)
    id_lote_origen = db.Column(db.Integer, db.ForeignKey('movimientos_detalle.id_movimiento'), nullable=True)

    tipo_movimiento = db.Column(db.String(20), nullable=False)
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)

    observaciones = db.Column(db.Text, nullable=True)

    precio_unitario = db.Column(db.Numeric(10, 2), nullable=True) 
    estado = db.Column(db.String(20), default='ACTIVO')
    stock_restante = db.Column(db.Numeric(10, 2), nullable=True)
    stock_historico = db.Column(db.Numeric(10, 2), nullable=True)
    talla = db.Column(db.String(20), nullable=True)
    id_empleado_recupero = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=True)


class InventarioAuditoria(db.Model):
    __tablename__ = 'inventario_auditoria'
    id_auditoria = db.Column(db.Integer, primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey('productos.id_producto'), nullable=False)
    id_empleado_auditor = db.Column(db.Integer, db.ForeignKey('empleado.id_empleado'), nullable=False)
    
    fecha_registro_inventario = db.Column(db.DateTime, default=datetime.utcnow)
    stock_sistema = db.Column(db.Numeric(10, 2), nullable=False)
    conteo_fisico = db.Column(db.Numeric(10, 2), nullable=False)
    diferencia = db.Column(db.Numeric(10, 2), nullable=False)
    observaciones = db.Column(db.Text)

class MatrizValidacion(db.Model):
    __tablename__ = 'matriz_validacion'

    id_matriz = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # Campos extraídos directamente del CSV
    clicodfac = db.Column(db.String(50), nullable=True)  # Suministro
    medcodygo = db.Column(db.String(50), nullable=True)  # Código de Medidor
    lectura = db.Column(db.String(50), nullable=True)
    feclec = db.Column(db.String(20), nullable=True)
    horalec = db.Column(db.String(20), nullable=True)
    obs1 = db.Column(db.String(100), nullable=True)
    obs2 = db.Column(db.String(100), nullable=True)
    newmed = db.Column(db.String(50), nullable=True)
    operador = db.Column(db.String(150), nullable=True)

    ciclo = db.Column(db.String(50), nullable=True)
    carga = db.Column(db.String(50), nullable=True)
    periodo = db.Column(db.String(50), nullable=True)

    # Campos de gestión interna y validación (Solicitados)
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_validacion = db.Column(db.DateTime, nullable=True)
    estado = db.Column(db.String(50), default='PENDIENTE')
    nueva_lect = db.Column(db.String(50), nullable=True)
    nueva_obs = db.Column(db.String(100), nullable=True)
    nuevo_obs2 = db.Column(db.String(100), nullable=True)
    nuevo_med = db.Column(db.String(50), nullable=True)


class UnidadMedida(db.Model):
    __tablename__ = 'unidad_medida'
    id_unidad = db.Column(db.Integer, primary_key=True)
    nombre_unidad = db.Column(db.String(50), unique=True, nullable=False)




carta_referencia = db.Table('carta_referencia',
    db.Column('carta_origen_id', db.Integer, db.ForeignKey('cartas.id', ondelete='CASCADE'), primary_key=True),
    db.Column('carta_destino_id', db.Integer, db.ForeignKey('cartas.id', ondelete='CASCADE'), primary_key=True)
)

class Carta(db.Model):
    __tablename__ = 'cartas'

    id = db.Column(db.Integer, primary_key=True)
    numero_carta = db.Column(db.String(100), unique=True, nullable=False) # Ej: "Carta N° 045-2026-SEDALIB"
    asunto = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.Enum('EMITIDA', 'RECIBIDA', name='tipo_carta_enum'), nullable=False)
    
    # CORRECCIÓN 1: Ambos en True para evitar bloqueos en Base de Datos
    fecha_emision = db.Column(db.Date, nullable=True) 
    fecha_recepcion = db.Column(db.Date, nullable=True) 
    
    ruta_pdf = db.Column(db.String(255), nullable=False) # Ubicación del archivo escaneado
    estado = db.Column(db.Enum('PENDIENTE', 'ATENDIDA', 'ARCHIVADA', name='estado_carta_enum'), default='PENDIENTE')
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    fecha_limite = db.Column(db.Date, nullable=True)

    # RELACIÓN MUCHOS A MUCHOS (El núcleo de la trazabilidad)
    referencias_pasadas = db.relationship(
        'Carta',
        secondary=carta_referencia,
        primaryjoin=(id == carta_referencia.c.carta_origen_id),
        secondaryjoin=(id == carta_referencia.c.carta_destino_id),
        backref=db.backref('referencias_futuras', lazy='dynamic'), 
        lazy='subquery'
    )

    # CORRECCIÓN 2: Esta función es vital para que Flask pueda enviar los datos a tu HTML
    def to_dict(self):
        return {
            "id": self.id,
            "numero_carta": self.numero_carta,
            "asunto": self.asunto,
            "tipo": self.tipo,
            "fecha": self.fecha_emision.strftime('%d/%m/%Y') if self.tipo == 'EMITIDA' and self.fecha_emision else (self.fecha_recepcion.strftime('%d/%m/%Y') if self.fecha_recepcion else '-'),
            "fecha_limite": self.fecha_limite.strftime('%d/%m/%Y') if self.fecha_limite else '-',
            "estado": self.estado,
            "ruta_pdf": self.ruta_pdf
        }
