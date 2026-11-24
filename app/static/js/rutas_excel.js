/* =============================================================================
 * RUTEO QUE YA VIENE EN EL EXCEL  +  PLANOS PARA IMPRIMIR
 * -----------------------------------------------------------------------------
 * Extiende rtApp (script.js) sin tocarlo. Se carga DESPUES de script.js.
 *   - En el modal: "¿Quién arma el ruteo?" -> el sistema | mi Excel ya viene
 *     ruteado. Con la segunda, se eligen la columna de carga (obligatoria) y la
 *     de orden (opcional) y el sistema solo arma las cargas y los planos.
 *   - Botón "Imprimir planos" (todas las cargas) y un botón por carga: abre
 *     una hoja lista para imprimir o guardar como PDF, con el mapa, los puntos
 *     numerados en orden de visita y la lista de suministros.
 * ============================================================================= */
(function () {
    'use strict';
    if (typeof rtApp === 'undefined') {
        console.warn('rutas_excel.js: rtApp no está cargado (¿se incluyó antes que script.js?)');
        return;
    }
    const A = rtApp;
    const orig = {
        cambiarActividad: A.cambiarActividad,
        cerrarModal: A.cerrarModal,
        poblarCamposDireccion: A.poblarCamposDireccion,
        procesarArchivo: A.procesarArchivo,
        _recalcular: A._recalcular,
        renderizarListaCargas: A.renderizarListaCargas,
        renderizarResumen: A.renderizarResumen,
        _cabeceraDetalle: A._cabeceraDetalle,
        _toggleBotonExport: A._toggleBotonExport
    };

    A.ruteo = 'sistema';       // 'sistema' | 'excel'
    A.configRuteo = null;

    // ------------------------------------------------------------- modal
    A.modoRuteo = function () {
        const r = document.querySelector('input[name="modo_ruteo"]:checked');
        return r ? r.value : 'sistema';
    };

    A.cambiarModoRuteo = function () {
        this.cambiarActividad();
    };

    A.cambiarActividad = function () {
        orig.cambiarActividad.apply(this, arguments);
        const excel = this.modoRuteo() === 'excel';
        const box = document.getElementById('rt-box-ruteo-excel');
        if (box) box.style.display = excel ? 'block' : 'none';
        if (excel) {
            // El reparto lo hizo el supervisor: técnicos, criterio y límite no aplican
            ['rt-wrap-tecnicos', 'rt-wrap-criterio', 'rt-wrap-limite', 'rt-reparto-preview']
                .forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });
            this.poblarColsRuteo();
        }
        const btn = document.getElementById('rt-btn-submit');
        if (btn && !btn.disabled) {
            btn.innerHTML = excel
                ? '<i class="fas fa-map-marked-alt"></i> Generar cargas y planos'
                : '<i class="fas fa-magic"></i> Procesar Data';
        }
    };

    // Recuerda la última forma elegida: el supervisor que trabaja con su
    // propio ruteo no tiene que volver a marcarla cada vez.
    A.cerrarModal = function () {
        const modo = this.modoRuteo();
        orig.cerrarModal.apply(this, arguments);
        const r = document.querySelector('input[name="modo_ruteo"][value="' + modo + '"]');
        if (r) { r.checked = true; this.cambiarActividad(); }
    };

    A.poblarCamposDireccion = function () {
        const out = orig.poblarCamposDireccion.apply(this, arguments);
        this.poblarColsRuteo();
        return out;
    };

    const RX_CARGA = /^(N[°º]?\s*)?(CARGA|OPERARIO|TECNICO|TÉCNICO|CUADRILLA|RUTA|LECTOR|NOTIFICADOR|PERSONAL|RESPONSABLE|ASIGNADO)\b/i;
    const RX_ORDEN = /^(ORDEN|SECUENCIA|SECUENCIAL|CORRELATIVO|ITEM|N[°º]?\s*ORDEN|NRO\.?\s*ORDEN|ORDEN\s*(DE\s*)?(RUTA|VISITA))$/i;
    const RX_NO_ORDEN = /TRABAJO|\bOT\b|SERVICIO|COMPRA|PEDIDO/i;

    A.poblarColsRuteo = function () {
        const llenar = (id, sugerir) => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const previo = sel.value;
            sel.innerHTML = '';
            sel.appendChild(this._el('option', {
                value: '',
                text: id === 'rt-col-orden' ? '-- Sin columna de orden (el sistema ordena) --'
                                            : '-- Elegir columna --'
            }));
            let elegido = false;
            (this.columnasExcel || []).forEach((col) => {
                const opt = this._el('option', { value: col, text: String(col) });
                if (col === previo || (!previo && !elegido && sugerir(String(col).trim()))) {
                    opt.selected = true;
                    elegido = true;
                }
                sel.appendChild(opt);
            });
        };
        llenar('rt-col-carga', (c) => RX_CARGA.test(c));
        llenar('rt-col-orden', (c) => RX_ORDEN.test(c) && !RX_NO_ORDEN.test(c));
    };

    // ------------------------------------------------------------ procesar
    A.procesarArchivo = async function (e) {
        if (this.modoRuteo() !== 'excel') {
            this.ruteo = 'sistema';
            this.configRuteo = null;
            return orig.procesarArchivo.apply(this, arguments);
        }
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('rt-btn-submit');

        const input1 = document.getElementById('rt-file-input-1');
        if (!(input1 && input1.files && input1.files.length)) {
            alert('Sube el Excel principal.');
            return;
        }
        const selAct = document.getElementById('rt-actividad-select');
        const actividad = selAct ? selAct.value : '';
        if (!actividad) { alert('Selecciona la actividad.'); return; }

        const selCarga = document.getElementById('rt-col-carga');
        const selOrden = document.getElementById('rt-col-orden');
        const colCarga = selCarga ? selCarga.value : '';
        const colOrden = selOrden ? selOrden.value : '';
        if (!colCarga) {
            alert('Elige la columna que dice a qué carga u operario va cada suministro.');
            if (selCarga) selCarga.focus();
            return;
        }
        if (colOrden && colOrden === colCarga) {
            alert('La columna de orden no puede ser la misma que la de carga.');
            return;
        }

        const radioManual = document.querySelector('input[name="tipo_mapeo"][value="manual"]');
        if (radioManual && radioManual.checked) {
            const sel = form.querySelector('select[name="col_suministro"]');
            if (!sel || !sel.value) { alert('Debes seleccionar la columna de Suministro.'); return; }
        }

        const selCruce = document.getElementById('rt-col-cruce');
        const colCruce = (actividad === 'ACCIONES PERSUASIVAS' && selCruce) ? selCruce.value : '';
        const input2 = document.getElementById('rt-file-input-2');
        const hay2 = !!(input2 && input2.files && input2.files.length);
        if (actividad === 'ACCIONES PERSUASIVAS' && hay2 && !colCruce) {
            alert('Selecciona la columna de cruce entre los dos archivos.');
            return;
        }

        const fd = new FormData(form);
        ['tecnicos', 'criterio_reparto', 'limite_carga'].forEach((k) => fd.delete(k));
        const chkCoords = document.getElementById('rt-chk-coords');
        fd.set('validar_coordenadas', (!chkCoords || chkCoords.checked) ? '1' : '0');
        const chkDir = document.getElementById('rt-chk-direcciones');
        fd.set('validar_direcciones', (!chkDir || chkDir.checked) ? '1' : '0');
        fd.set('actividad', actividad);
        fd.set('col_carga', colCarga);
        if (colOrden) fd.set('col_orden', colOrden); else fd.delete('col_orden');
        if (colCruce) fd.set('col_cruce', colCruce);
        const camposDir = this._camposDireccion();
        if (camposDir.length) fd.set('cols_direccion', camposDir.join('|'));

        this.archivoPrincipal = input1.files[0];
        this.colCruce = colCruce;
        this.actividad = actividad;

        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), this.TIMEOUT_MS);
        try {
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                btn.disabled = true;
            }
            const resp = await fetch('/api/rutas_desde_excel',
                                     { method: 'POST', body: fd, signal: ctrl.signal });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(data.error || ('Error ' + resp.status));

            this.ruteo = 'excel';
            this.configRuteo = data.config || {};
            this.datosRutas = Array.isArray(data.rutas) ? data.rutas : [];
            this.resumen = data.resumen || null;
            this.noProgramados = Array.isArray(data.no_programados) ? data.no_programados : [];
            this.planPersonal = data.plan_personal || null;
            this.asignacion = data.asignacion || null;
            this.modo = 'masiva';     // la forma de las cargas la decidió el Excel
            this.tecnicosDia = this.datosRutas.length || 1;
            this.historial = [];
            this.seleccion = null;
            this._rutaActiva = null;
            this._toggleBotonExport();
            this.cerrarModal();
            this.renderizarResumen(data);
            this.renderizarBarraEdicion();
            this.renderizarListaCargas();
            this.cerrarDetalle();
        } catch (err) {
            alert(err.name === 'AbortError'
                ? 'El proceso tardó demasiado. Reduce el archivo o revisa el servidor.'
                : ('Error al procesar: ' + err.message));
        } finally {
            clearTimeout(t);
            if (btn) {
                btn.disabled = false;
                this.cambiarActividad();      // restaura el texto del botón
            }
        }
    };

    // Recalcular SIN cambiar el orden ni la carga de nadie (por ejemplo, al
    // aplicar una ubicación propuesta). Las cargas del sistema siguen igual.
    A._recalcular = async function (respaldo, mensajeOk, confirmado) {
        if (this.ruteo !== 'excel') return orig._recalcular.apply(this, arguments);
        const btnBar = document.getElementById('rt-barra-edicion');
        try {
            if (btnBar) btnBar.style.opacity = '0.5';
            const resp = await fetch('/api/recalcular_cargas_excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actividad: this.actividad || '',
                    cargas: this.datosRutas.map((r) => ({
                        id: r.id, nombre: r.nombre, fecha: r.fecha, fecha_iso: r.fecha_iso,
                        localidad: r.localidad, registros: r.registros
                    }))
                })
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(data.error || ('Error ' + resp.status));

            this.historial.push(respaldo);
            if (this.historial.length > 30) this.historial.shift();
            const previaActiva = this._rutaActiva;
            this.datosRutas = data.rutas;
            this._reconstruirAsignacion();
            this._rutaActiva = this._reanclarActiva(previaActiva);
            this.renderizarListaCargas();
            this.renderizarBarraEdicion();
            if (this._rutaActiva) this.pintarMapa(false);
            if (mensajeOk) this._aviso(mensajeOk);
            return true;
        } catch (err) {
            alert('No se pudo recalcular: ' + err.message);
            this._restaurar(respaldo);
            return false;
        } finally {
            if (btnBar) btnBar.style.opacity = '1';
        }
    };

    // ------------------------------------------------------------- vistas
    A._toggleBotonExport = function () {
        const out = orig._toggleBotonExport.apply(this, arguments);
        const b = document.getElementById('rt-btn-planos');
        if (b) b.style.display = (this.datosRutas && this.datosRutas.length) ? 'inline-flex' : 'none';
        return out;
    };

    A._botonPlano = function (ids, compacto) {
        return this._el('button', {
            type: 'button',
            title: 'Imprimir o guardar en PDF el plano de esta carga',
            style: 'border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:6px;' +
                   'cursor:pointer;font-size:0.72rem;font-weight:700;' +
                   (compacto ? 'padding:5px 8px;margin-left:8px;' : 'padding:4px 10px;'),
            onclick: (ev) => { ev.stopPropagation(); this.imprimirPlanos(ids); }
        }, [this._el('i', { class: 'fas fa-print' }), compacto ? '' : ' Plano']);
    };

    A.renderizarListaCargas = function () {
        const out = orig.renderizarListaCargas.apply(this, arguments);
        (this.datosRutas || []).forEach((ruta) => {
            const row = document.getElementById('rt-row-' + ruta.id);
            if (!row) return;
            const medio = row.children[1];
            if (ruta.nombre && medio) {
                medio.insertBefore(this._el('div', {
                    style: 'font-size:0.74rem;font-weight:800;color:#0f766e;margin-bottom:2px;' +
                           'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
                    text: '👷 ' + ruta.nombre
                }), medio.firstChild);
            }
            const flecha = row.lastChild;
            row.insertBefore(this._botonPlano([ruta.id], true), flecha);
        });
        return out;
    };

    A._cabeceraDetalle = function (lista, verDia) {
        const out = orig._cabeceraDetalle.apply(this, arguments);
        const titulo = document.getElementById('rt-detalle-titulo');
        const fila = titulo && titulo.firstChild;
        if (!fila) return out;
        if (!verDia && this._rutaActiva) {
            if (this._rutaActiva.nombre) {
                fila.insertBefore(this._el('span', {
                    style: 'background:#ccfbf1;color:#0f766e;border-radius:6px;padding:3px 9px;' +
                           'font-size:0.75rem;font-weight:800;',
                    text: '👷 ' + this._rutaActiva.nombre
                }), fila.children[1] || null);
            }
            fila.appendChild(this._botonPlano([this._rutaActiva.id], false));
        } else if (verDia && lista && lista.length) {
            fila.appendChild(this._botonPlano(lista.map((r) => r.id), false));
        }
        return out;
    };

    A.renderizarResumen = function (data) {
        const out = orig.renderizarResumen.apply(this, arguments);
        const cfg = (data && data.config) || {};
        if (cfg.ruteo !== 'excel') return out;
        const cont = document.getElementById('rt-resumen');
        if (!cont) return out;
        const r = (data && data.resumen) || {};
        const partes = ['Ruteo tomado del Excel', 'carga: ' + cfg.col_carga,
                        cfg.col_orden ? 'orden: ' + cfg.col_orden
                                      : 'orden: lo calculó el sistema dentro de cada carga'];
        const caja = this._el('div', {
            style: 'margin:10px 14px 0;padding:8px 11px;border-radius:6px;background:#ecfeff;' +
                   'border:1px solid #a5f3fc;color:#155e75;font-size:0.73rem;font-weight:600;'
        }, ['📋 ' + partes.join('  ·  ')]);
        const avisos = [];
        if (r.sin_carga_en_excel) avisos.push(r.sin_carga_en_excel + ' sin carga en el Excel (ver No programados)');
        if (r.sin_orden_en_excel) avisos.push(r.sin_orden_en_excel + ' sin número de orden (van al final de su carga)');
        if (r.duplicados_eliminados) avisos.push(r.duplicados_eliminados + ' suministros repetidos: se dejó la primera fila');
        if (avisos.length) {
            caja.appendChild(this._el('div', {
                style: 'margin-top:4px;color:#b45309;font-weight:600;', text: '⚠ ' + avisos.join('  ·  ')
            }));
        }
        cont.insertBefore(caja, cont.firstChild);
        return out;
    };

    // ======================================================= PLANOS (PDF)
    A.imprimirPlanos = function (ids) {
        const todas = this.datosRutas || [];
        const lista = (ids && ids.length) ? todas.filter((r) => ids.indexOf(r.id) !== -1) : todas;
        if (!lista.length) { alert('Primero genera las cargas.'); return; }
        if (lista.length > 40 &&
            !confirm('Vas a preparar ' + lista.length + ' planos. Puede tardar un poco en ' +
                     'cargar todos los mapas. ¿Continuar?')) return;

        const w = window.open('', '_blank');
        if (!w) {
            alert('El navegador bloqueó la ventana de los planos. Permite las ventanas ' +
                  'emergentes para este sitio y vuelve a intentarlo.');
            return;
        }
        // 'Tipo' solo cuando hubo cruce agua/desagüe: si todos dicen AGUA no aporta
        const conTipo = todas.some((r) => (r.registros || []).some((x) => x.tipo_servicio === 'AGUA Y DESAGUE'));
        const conFranja = lista.some((r) => (r.registros || []).some((x) => x.franja_horaria));
        const datos = {
            actividad: this.actividad || '',
            generado: new Date().toLocaleString('es-PE'),
            conTipo: conTipo,
            conFranja: conFranja,
            cargas: lista.map((r) => ({
                id: r.id,
                nombre: r.nombre || '',
                fecha: r.fecha || '',
                localidad: r.localidad || r.zona || '',
                cantidad: r.cantidad,
                km: r.km_total,
                hora: r.hora || '',
                color: this._colorDe(r),
                puntos: (r.registros || []).map((x) => {
                    const pos = this._latLng(x);
                    return {
                        orden: x.orden,
                        sum: x.suministro || '',
                        dir: this._direccion(x),
                        urb: x.urbanizacion || '',
                        loc: x.localidad || '',
                        hora: x.hora_estimada || '',
                        franja: x.franja_horaria || '',
                        tipo: x.tipo_servicio || '',
                        revisar: x.estado_direccion === 'revisar',
                        pos: pos
                    };
                })
            }))
        };
        const titulo = lista.length === 1
            ? 'Plano C' + lista[0].id + (lista[0].nombre ? ' - ' + lista[0].nombre : '')
            : 'Planos ' + (this.actividad || '') + ' (' + lista.length + ' cargas)';
        w.document.open();
        w.document.write(this._htmlPlanos(datos, titulo));
        w.document.close();
    };

    A._htmlPlanos = function (datos, titulo) {
        const json = JSON.stringify(datos).replace(/</g, '\\u003c');
        const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        return '<!doctype html><html lang="es"><head><meta charset="utf-8">' +
            '<title>' + esc(titulo) + '</title>' +
            '<style>' + PLANO_CSS + '</style></head><body class="gris">' +
            '<div class="barra no-print"><span id="estado">Cargando mapas…</span>' +
            '<button id="btn-imp" onclick="window.print()">Imprimir / Guardar PDF</button>' +
            '<label><input type="checkbox" id="chk-gris" checked> Mapa en gris</label>' +
            '<label>Tamaño de los puntos <select id="sel-tam">' +
            '<option value="chico">Chico</option><option value="mediano" selected>Mediano</option>' +
            '<option value="grande">Grande</option></select></label>' +
            '<label><input type="checkbox" id="chk-lineas" checked> Líneas del recorrido</label>' +
            '<label><input type="checkbox" id="chk-flechas" checked> Flechas de sentido</label>' +
            '<label><input type="checkbox" id="chk-lista" checked> Imprimir lista de visitas</label>' +
            '<span class="ayuda">Zoom de cada mapa: botones + / − (o Ctrl + rueda del mouse). ' +
            'Arrastra el mapa para moverlo; ⟲ vuelve al encuadre original.</span></div>' +
            '<div id="planos"></div>' +
            '<script>window.__PLANOS__ = ' + json + ';<\/script>' +
            '<script>(' + PLANO_JS.toString() + ')();<\/script>' +
            '</body></html>';
    };

    const PLANO_CSS = [
        '@page { size: A4 landscape; margin: 8mm; }',
        '* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
        'body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; background: #e2e8f0; }',
        '.barra { position: sticky; top: 0; z-index: 2000; background: #0f172a; color: #fff; padding: 10px 16px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: 13px; }',
        '.barra button { background: #2563eb; color: #fff; border: 0; border-radius: 6px; padding: 7px 14px; font-weight: 700; cursor: pointer; }',
        '.barra label { cursor: pointer; } .barra .ayuda { color: #94a3b8; font-size: 12px; }',
        '.hoja { background: #fff; width: 281mm; margin: 12px auto; padding: 0; }',
        '.hoja + .hoja { page-break-before: always; break-before: page; }',
        '.cab { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 3px; margin-bottom: 3px; }',
        '.cab h1 { font-size: 18px; margin: 0; } .cab h1 small { font-size: 13px; color: #475569; font-weight: 600; }',
        '.cab .sub { font-size: 11px; color: #334155; margin-top: 1px; }',
        '.cab .der { text-align: right; font-size: 11.5px; color: #334155; }',
        '.mapa { width: 281mm; height: 166mm; border: 1px solid #475569; overflow: hidden; contain: strict; }',
        '.det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 4mm; }',
        '.det h3 { font-size: 11.5px; margin: 0 0 1mm; }',
        '.mapa-det { width: 138.5mm; height: 77mm; border: 1px solid #475569; overflow: hidden; contain: strict; }',
        '.punto-real { width: 6px; height: 6px; border-radius: 50%; background: #0f172a; border: 1px solid #fff; }',
        '.gris .leaflet-tile-pane { filter: grayscale(100%) contrast(1.08) brightness(1.03); }',
        '.ley { font-size: 10px; color: #334155; margin: 2px 0 0; }',
        '.num { color: #fff; background: #1e3a8a; text-align: center; border: 1.5px solid #fff; box-shadow: 0 0 0 1px #0f172a, 0 1px 2px rgba(0,0,0,.3); }',
        '.num.ini { background: #16a34a; } .num.fin { background: #dc2626; } .num.rev { border-color: #f59e0b; }',
        '.tag { display: inline-block; font: bold 9px/1 Arial; color: #fff; padding: 2px 4px; border-radius: 3px; white-space: nowrap; border: 1px solid #fff; }',
        '.tag.t-ini { background: #16a34a; } .tag.t-fin { background: #dc2626; }',
        '.det-tag { display: inline-block; background: #0f172a; color: #fff; font: bold 10.5px/1.2 Arial; padding: 3px 5px; border-radius: 4px; white-space: nowrap; border: 1px solid #fff; box-shadow: 0 1px 2px rgba(0,0,0,.35); }',
        '.det-tag small { display: block; font-size: 9.5px; font-weight: 600; color: #fde68a; }',
        '.punto-zona { width: 9px; height: 9px; border-radius: 50%; background: #1e3a8a; border: 1.5px solid #fff; box-shadow: 0 0 0 1px #0f172a; }',
        '.punto-zona.ini { background: #16a34a; } .punto-zona.fin { background: #dc2626; }',
        '.flecha svg { display: block; }',
        'table { width: 100%; border-collapse: collapse; font-size: 10.5px; }',
        'thead { display: table-header-group; }',
        'th { background: #e2e8f0; text-align: left; border: 1px solid #64748b; padding: 4px 5px; }',
        'td { border: 1px solid #94a3b8; padding: 4px 5px; vertical-align: top; }',
        'tr { page-break-inside: avoid; break-inside: avoid; }',
        'td.n { text-align: center; font-weight: bold; font-size: 12px; width: 9mm; }',
        'td.obs { width: 45mm; }',
        'tr.sin td { background: #fef2f2; }',
        '.firmas { display: flex; justify-content: space-around; margin-top: 14mm; font-size: 11px; page-break-inside: avoid; }',
        '.firmas div { width: 80mm; border-top: 1px solid #0f172a; text-align: center; padding-top: 3px; }',
        '.pie { font-size: 8.5px; color: #64748b; margin-top: 4px; }',
        '.mapa-wrap { position: relative; }',
        '.sin-lista .hoja-lista { display: none !important; }',
        '.mapa, .mapa-det { cursor: grab; }',
        '.ctl { position: absolute; top: 8px; right: 8px; z-index: 1000; display: flex; flex-direction: column; gap: 4px; }',
        '.ctl button { width: 30px; height: 30px; border: 1px solid #94a3b8; background: #fff; border-radius: 6px; font: bold 17px/1 Arial; color: #0f172a; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.25); padding: 0; }',
        '.ctl button:hover { background: #eff6ff; }',
        '@media print { body { background: #fff; } .no-print { display: none !important; } .hoja { margin: 0; } }'
    ].join('\n');

    // Corre DENTRO de la ventana de los planos (no tiene acceso a rtApp)
    const PLANO_JS = function () {
        var D = window.__PLANOS__;
        var cont = document.getElementById('planos');
        var OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var LINEA = '#ea580c';                 // naranja: resalta sobre el mapa gris
        function el(tag, cls, txt) {
            var n = document.createElement(tag);
            if (cls) n.className = cls;
            if (txt !== undefined && txt !== null) n.textContent = txt;
            return n;
        }
        function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
        function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
        function cabecera(c, extra) {
            var cab = el('div', 'cab');
            var izq = el('div');
            var h = el('h1', null, 'Carga C' + c.id + (c.nombre ? '  —  ' + c.nombre : ''));
            if (extra) { h.appendChild(el('small', null, '   ·  ' + extra)); }
            izq.appendChild(h);
            izq.appendChild(el('div', 'sub', [D.actividad, c.localidad, c.fecha].filter(Boolean).join('  ·  ')));
            var der = el('div', 'der');
            der.appendChild(el('div', null, c.cantidad + ' suministros  ·  ' + (c.km || 0) + ' km'));
            der.appendChild(el('div', null, c.hora ? 'Horario estimado: ' + c.hora : ''));
            cab.appendChild(izq); cab.appendChild(der);
            return cab;
        }
        function rango(nums) {             // [30,31,32,35] -> '30-32, 35'
            var out = [], i = 0;
            while (i < nums.length) {
                var j = i;
                while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
                out.push(j > i ? nums[i] + '–' + nums[j] : String(nums[i]));
                i = j + 1;
            }
            return out.join(', ');
        }

        // --- preferencias (se recuerdan para la proxima vez) -----------------
        // t: diametro del circulo, f: letra, l: linea, c: borde blanco de la linea, a: flecha
        var TAMANOS = {
            chico:   { t: 13, f: 8,   l: 2,   c: 4.5, a: 11 },
            mediano: { t: 15, f: 9,   l: 2.5, c: 5.5, a: 13 },
            grande:  { t: 19, f: 10.5, l: 3,  c: 6,   a: 14 }
        };
        var T = 15, LW = 2.5, CW = 5.5, AW = 13, FLECHAS = true, LINEAS = true;
        var estilo = document.createElement('style');
        document.head.appendChild(estilo);
        function aplicarTamano(nombre) {
            var z = TAMANOS[nombre] || TAMANOS.mediano;
            T = z.t; LW = z.l; CW = z.c; AW = z.a;
            estilo.textContent = '.num { min-width: ' + z.t + 'px; height: ' + z.t + 'px; padding: 0 2px; ' +
                'border-radius: ' + (z.t / 2) + 'px; font: bold ' + z.f + 'px/' + (z.t - 3) + 'px Arial; }' +
                '.num.n3 { font-size: ' + (z.f - 1) + 'px; } .num.rev { border-width: 2px; line-height: ' +
                (z.t - 4) + 'px; }';
        }
        var sel = document.getElementById('sel-tam');
        var chkF = document.getElementById('chk-flechas');
        var chkG = document.getElementById('chk-gris');
        var tamGuardado = leer('rt-plano-tam');
        if (!TAMANOS[tamGuardado]) tamGuardado = 'mediano';
        if (sel) sel.value = tamGuardado;
        aplicarTamano(tamGuardado);
        FLECHAS = leer('rt-plano-flechas') !== '0';
        if (chkF) chkF.checked = FLECHAS;
        // Lineas entre los puntos: sin ellas tampoco hay flechas (van sobre la linea)
        var chkLin = document.getElementById('chk-lineas');
        LINEAS = leer('rt-plano-lineas') !== '0';
        if (chkLin) chkLin.checked = LINEAS;
        function estadoFlechas() {
            if (!chkF) return;
            chkF.disabled = !LINEAS;
            if (chkF.parentNode) chkF.parentNode.style.opacity = LINEAS ? '1' : '0.45';
        }
        estadoFlechas();
        var gris = leer('rt-plano-gris') !== '0';
        if (chkG) chkG.checked = gris;
        document.body.classList.toggle('gris', gris);
        // Lista de visitas (con las firmas): se puede dejar fuera de la impresion
        var chkL = document.getElementById('chk-lista');
        var conLista = leer('rt-plano-lista') !== '0';
        if (chkL) {
            chkL.checked = conLista;
            chkL.addEventListener('change', function () {
                document.body.classList.toggle('sin-lista', !chkL.checked);
                guardar('rt-plano-lista', chkL.checked ? '1' : '0');
            });
        }
        document.body.classList.toggle('sin-lista', !conLista);

        // --- hojas de cada carga ----------------------------------------------
        var trabajos = [];
        D.cargas.forEach(function (c, k) {
            var sinPos = c.puntos.filter(function (p) { return !p.pos; }).length;
            var hMapa = el('section', 'hoja');
            hMapa.appendChild(cabecera(c));
            var wrap = el('div', 'mapa-wrap');
            var m = el('div', 'mapa'); m.id = 'mapa' + k;
            wrap.appendChild(m);
            hMapa.appendChild(wrap);
            var ley = el('div', 'ley');
            hMapa.appendChild(ley);
            cont.appendChild(hMapa);

            var hLista = el('section', 'hoja hoja-lista');
            hLista.appendChild(cabecera(c, 'lista de visitas'));
            var t = el('table'); var th = el('thead'); var tr = el('tr');
            var cols = ['N°', 'Suministro', 'Dirección', 'Urb. / sector', 'Hora est.'];
            if (D.conFranja) cols.push('Franja');
            if (D.conTipo) cols.push('Tipo');
            cols.push('Observación');
            cols.forEach(function (h) { tr.appendChild(el('th', null, h)); });
            th.appendChild(tr); t.appendChild(th);
            var tb = el('tbody');
            c.puntos.forEach(function (p) {
                var f = el('tr', p.pos ? '' : 'sin');
                f.appendChild(el('td', 'n', p.orden));
                f.appendChild(el('td', null, p.sum));
                f.appendChild(el('td', null, p.dir + (p.pos ? '' : '  (sin coordenada)')));
                f.appendChild(el('td', null, [p.urb, p.loc].filter(Boolean).join(' · ')));
                f.appendChild(el('td', null, p.hora));
                if (D.conFranja) f.appendChild(el('td', null, p.franja));
                if (D.conTipo) f.appendChild(el('td', null, p.tipo));
                f.appendChild(el('td', 'obs', ''));
                tb.appendChild(f);
            });
            t.appendChild(tb);
            hLista.appendChild(t);
            var firmas = el('div', 'firmas');
            firmas.appendChild(el('div', null, 'Operario'));
            firmas.appendChild(el('div', null, 'Supervisor'));
            hLista.appendChild(firmas);
            hLista.appendChild(el('div', 'pie', 'Generado el ' + D.generado + '  ·  Mapa © colaboradores de OpenStreetMap'));
            cont.appendChild(hLista);
            trabajos.push({ c: c, div: m.id, hMapa: hMapa, hLista: hLista, ley: ley, sinPos: sinPos,
                            firma: null, hojasDet: [] });
        });
        function leyenda(t, conZonas) {
            t.ley.textContent = 'Número = orden de visita  ·  verde: INICIO  ·  rojo: FIN  ·  ' +
                (LINEAS && FLECHAS ? 'flechas: sentido del recorrido  ·  ' : '') +
                'borde ámbar: ubicación por revisar' +
                (t.sinPos ? '  ·  ' + t.sinPos + ' sin coordenada (no figuran en el mapa; ubicar por dirección)' : '') +
                (conZonas ? '  ·  recuadros: puntos muy juntos, con sus números en la hoja siguiente' : '');
        }

        // --- aviso de "listo" cuando llegan los mosaicos ----------------------
        // (ya no se abre la impresion sola: primero se ajusta el zoom)
        var pendientes = 0, creados = false, listo = false;
        function terminar() {
            if (listo) return;
            listo = true;
            var e = document.getElementById('estado');
            if (e) e.textContent = 'Planos listos (' + trabajos.length + '). Ajusta el zoom si quieres y pulsa «Imprimir».';
        }
        function revisar() { if (creados && pendientes <= 0) terminar(); }
        function tarea() {
            pendientes += 1;
            var hecho = false;
            return function () { if (!hecho) { hecho = true; pendientes -= 1; revisar(); } };
        }

        function flechas(map, ll, capa) {
            for (var i = 0; i + 1 < ll.length; i++) {
                var a = map.latLngToContainerPoint(ll[i]), b = map.latLngToContainerPoint(ll[i + 1]);
                var dx = b.x - a.x, dy = b.y - a.y;
                if (Math.sqrt(dx * dx + dy * dy) < 55) continue;   // tramo corto: la flecha taparia los numeros
                var ang = Math.atan2(dy, dx) * 180 / Math.PI;
                var mid = map.containerPointToLatLng([(a.x + b.x) / 2, (a.y + b.y) / 2]);
                L.marker(mid, { interactive: false, keyboard: false, icon: L.divIcon({
                    className: '', iconSize: [AW, AW], iconAnchor: [AW / 2, AW / 2],
                    html: '<div class="flecha" style="transform:rotate(' + ang.toFixed(1) + 'deg)">' +
                          '<svg width="' + AW + '" height="' + AW + '" viewBox="0 0 20 20"><path d="M3 3 L18 10 L3 17 L7 10 Z" ' +
                          'fill="#0f172a" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg></div>' }) }).addTo(capa);
            }
        }

        // Grupos de puntos cuyos circulos se tocarian en pantalla
        function agrupar(P, umbral) {
            var n = P.length, par = [], i, j;
            for (i = 0; i < n; i++) par[i] = i;
            function raiz(a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }
            for (i = 0; i < n; i++) {
                for (j = i + 1; j < n; j++) {
                    var dx = P[i].x - P[j].x, dy = P[i].y - P[j].y;
                    if (dx * dx + dy * dy < umbral * umbral) par[raiz(j)] = raiz(i);
                }
            }
            var g = {};
            for (i = 0; i < n; i++) { var r = raiz(i); (g[r] = g[r] || []).push(i); }
            return Object.keys(g).map(function (k) { return g[k]; });
        }

        // Separa los numeros que se taparian: cada circulo se empuja lo justo
        // para que se lea, y el que se movio queda unido a su punto real.
        function desencimar(P, minD, activos, W, H) {
            var Q = P.map(function (p) { return { x: p.x, y: p.y }; });
            var A = activos, n = A.length, borde = T / 2 + 2;
            for (var it = 0; it < 120; it++) {
                var movio = false;
                for (var ii = 0; ii < n; ii++) {
                    for (var jj = ii + 1; jj < n; jj++) {
                        var i = A[ii], j = A[jj];
                        var dx = Q[j].x - Q[i].x, dy = Q[j].y - Q[i].y;
                        var d = Math.sqrt(dx * dx + dy * dy);
                        if (d >= minD) continue;
                        if (d < 0.5) {                    // mismo punto: direccion fija por orden
                            var ang = j * 2.39996;
                            dx = Math.cos(ang); dy = Math.sin(ang); d = 1;
                        }
                        var emp = (minD - d) / 2 + 0.3, ux = dx / d, uy = dy / d;
                        Q[i].x -= ux * emp; Q[i].y -= uy * emp;
                        Q[j].x += ux * emp; Q[j].y += uy * emp;
                        movio = true;
                    }
                }
                for (var kk = 0; kk < n; kk++) {
                    var k = A[kk];
                    if (it < 80) {                        // que no se alejen de su sitio
                        Q[k].x += (P[k].x - Q[k].x) * 0.03;
                        Q[k].y += (P[k].y - Q[k].y) * 0.03;
                    }
                    if (P[k].x >= 0 && P[k].x <= W && P[k].y >= 0 && P[k].y <= H) {
                        Q[k].x = Math.min(Math.max(Q[k].x, borde), W - borde);
                        Q[k].y = Math.min(Math.max(Q[k].y, borde), H - borde);
                    }
                }
                if (!movio && it >= 80) break;
            }
            return Q;
        }

        // Elige, entre varias posiciones, la que menos tapa numeros u otras etiquetas
        function solape(a, b) {
            var w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            var h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            return (w > 0 && h > 0) ? w * h : 0;
        }
        function colocar(cands, w, h, ocupados, W, H) {
            var mejor = null;
            cands.forEach(function (c, k) {
                var caja = { x: c[0], y: c[1], w: w, h: h }, costo = k * 0.5;
                ocupados.forEach(function (o) { costo += solape(caja, o); });
                if (caja.x < 2 || caja.y < 2 || caja.x + w > W - 2 || caja.y + h > H - 2) costo += 5000;
                if (!mejor || costo < mejor.costo) mejor = { caja: caja, costo: costo };
            });
            ocupados.push(mejor.caja);
            return mejor.caja;
        }
        function etiqueta(res, caja, html, z) {
            L.marker(res.map.containerPointToLatLng([caja.x, caja.y]), {
                interactive: false, keyboard: false, zIndexOffset: z,
                icon: L.divIcon({ className: '', iconSize: null, iconAnchor: [0, 0], html: html }) }).addTo(res.capa);
        }

        // --- mapas: el usuario puede acercar, alejar y mover cada uno ---------
        var pintores = [], nDet = 0;
        function crearMapa(divId, c, pts, encuadre, colapsar, alPintar) {
            var div = document.getElementById(divId);
            var map = L.map(divId, { zoomControl: false, attributionControl: false,
                                     zoomSnap: 0.25, zoomDelta: 0.25,
                                     scrollWheelZoom: false,          // la rueda sola mueve la pagina
                                     doubleClickZoom: false, boxZoom: false, keyboard: false,
                                     zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false });
            var mosaicos = L.tileLayer(OSM, { maxZoom: 19 });
            var fin = tarea();
            mosaicos.on('load', fin);
            setTimeout(fin, 15000);                 // si un mosaico no llega, no se traba
            mosaicos.addTo(map);
            var capa = L.layerGroup().addTo(map);
            var ll = pts.map(function (p) { return p.pos; });
            function encuadrar() {
                if (!ll.length) map.setView([-8.1, -79.03], 13);
                else if (encuadre) map.fitBounds(encuadre, { padding: [75, 75], maxZoom: 19 });
                else if (ll.length === 1) map.setView(ll[0], 17);
                else map.fitBounds(L.latLngBounds(ll), { padding: [40, 40], maxZoom: 18 });
            }
            encuadrar();
            if (!ll.length) fin();
            var reg = { map: map, vivo: true };

            function pintar() {
                if (!reg.vivo) return;
                capa.clearLayers();
                var tam = map.getSize();
                var res = { map: map, capa: capa, grandes: [], P: [], Q: [], ocupados: [], tam: tam };
                if (!ll.length) { if (alPintar) alPintar(res); return; }
                if (LINEAS && ll.length > 1) {
                    L.polyline(ll, { color: '#ffffff', weight: CW, opacity: 0.85, interactive: false }).addTo(capa);
                    L.polyline(ll, { color: LINEA, weight: LW, opacity: 1, interactive: false }).addTo(capa);
                    if (FLECHAS) flechas(map, ll, capa);
                }
                var P = pts.map(function (p) { return map.latLngToContainerPoint(p.pos); });
                // 5 o mas puntos pegados: en el plano general van como puntos chicos
                // dentro de un recuadro, y con sus numeros en la hoja de ampliaciones
                var grandes = colapsar ? agrupar(P, T).filter(function (g) { return g.length >= 5; }) : [];
                var enZona = {};
                grandes.forEach(function (g) { g.forEach(function (k) { enZona[k] = true; }); });
                var activos = [];
                for (var a = 0; a < P.length; a++) if (!enZona[a]) activos.push(a);
                var Q = desencimar(P, T + 3, activos, tam.x, tam.y);
                var ocupados = [], extremos = [];
                P.forEach(function (pp, k) {
                    ocupados.push(enZona[k] ? { x: pp.x - 5, y: pp.y - 5, w: 10, h: 10 }
                                            : { x: Q[k].x - T / 2 - 1, y: Q[k].y - T / 2 - 1, w: T + 2, h: T + 2 });
                });
                pts.forEach(function (p, i) {
                    var donde = p.pos;
                    var ini = i === 0, ult = i === pts.length - 1 && pts.length > 1;
                    if (enZona[i]) {
                        L.marker(p.pos, { interactive: false, keyboard: false, zIndexOffset: (ini || ult) ? 900 : 0,
                                          icon: L.divIcon({ className: '', iconSize: [9, 9], iconAnchor: [4.5, 4.5],
                                                            html: '<div class="punto-zona' + (ini ? ' ini' : '') +
                                                                  (ult ? ' fin' : '') + '"></div>' }) }).addTo(capa);
                        if (ini || ult) extremos.push({ ini: ini, x: P[i].x, y: P[i].y, r: 5 });
                        return;
                    }
                    if (Math.abs(Q[i].x - P[i].x) + Math.abs(Q[i].y - P[i].y) > 3) {
                        donde = map.containerPointToLatLng([Q[i].x, Q[i].y]);
                        L.polyline([p.pos, donde], { color: '#0f172a', weight: 1, opacity: 0.9,
                                                     interactive: false }).addTo(capa);
                        L.marker(p.pos, { interactive: false, keyboard: false, icon: L.divIcon({
                            className: '', iconSize: [6, 6], iconAnchor: [3, 3],
                            html: '<div class="punto-real"></div>' }) }).addTo(capa);
                    }
                    var cls = 'num' + (ini ? ' ini' : '') + (ult ? ' fin' : '') + (p.revisar ? ' rev' : '') +
                              (String(p.orden).length > 2 ? ' n3' : '');
                    L.marker(donde, { interactive: false, keyboard: false,
                                      zIndexOffset: (ini || ult) ? 1000 : 0,
                                      icon: L.divIcon({ className: '', iconSize: [T, T], iconAnchor: [T / 2, T / 2],
                                                        html: '<div class="' + cls + '">' + p.orden + '</div>' }) })
                        .addTo(capa);
                    if (ini || ult) extremos.push({ ini: ini, x: Q[i].x, y: Q[i].y, r: T / 2 + 1 });
                });
                res.grandes = grandes; res.P = P; res.Q = Q; res.ocupados = ocupados;
                extremos.forEach(function (e) {
                    var w = e.ini ? 38 : 23, h = 14, d = e.r + 2;
                    var caja = colocar([[e.x + d, e.y - h / 2], [e.x - d - w, e.y - h / 2],
                                        [e.x - w / 2, e.y - d - h], [e.x - w / 2, e.y + d],
                                        [e.x + d - 4, e.y - d - h + 4], [e.x - d - w + 4, e.y - d - h + 4],
                                        [e.x + d - 4, e.y + d - 4], [e.x - d - w + 4, e.y + d - 4]],
                                       w, h, ocupados, tam.x, tam.y);
                    etiqueta(res, caja, '<div class="tag ' + (e.ini ? 't-ini">INICIO' : 't-fin">FIN') + '</div>', 1100);
                });
                if (alPintar) alPintar(res);
            }
            reg.pintar = pintar;
            pintar();
            map.on('moveend', pintar);              // tras cada zoom o arrastre del usuario

            // Botones de zoom fuera del mapa: no salen en la impresion
            var ctl = el('div', 'ctl no-print');
            [['+', 'Acercar', function () { map.zoomIn(0.25); }],
             ['−', 'Alejar', function () { map.zoomOut(0.25); }],
             ['⟲', 'Volver al encuadre original', encuadrar]].forEach(function (b) {
                var bt = el('button', null, b[0]);
                bt.type = 'button';
                bt.title = b[1];
                bt.addEventListener('click', b[2]);
                ctl.appendChild(bt);
            });
            div.parentNode.appendChild(ctl);
            // Ctrl + rueda: zoom fino donde esta el mouse (sin Ctrl, la rueda
            // mueve la pagina como siempre)
            div.addEventListener('wheel', function (ev) {
                if (!ev.ctrlKey) return;
                ev.preventDefault();
                map.setZoomAround(map.mouseEventToContainerPoint(ev),
                                  map.getZoom() + (ev.deltaY < 0 ? 0.25 : -0.25));
            }, { passive: false });
            L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 160 }).addTo(map);
            pintores.push(reg);
            return reg;
        }
        function quitarMapa(reg) {
            reg.vivo = false;
            try { reg.map.remove(); } catch (e) { /* ya no estaba */ }
            pintores = pintores.filter(function (r) { return r !== reg; });
        }

        // Grupos grandes de puntos encimados en el plano general: se juntan los
        // vecinos en zonas y cada zona va ampliada en una hoja aparte.
        function zonas(res, pts) {
            var P = res.P;
            var cajas = res.grandes.map(function (g) {
                var xs = g.map(function (k) { return P[k].x; }), ys = g.map(function (k) { return P[k].y; });
                return { g: g.slice(), x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs),
                         y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
            });
            var junto = true;
            while (junto && cajas.length > 1) {
                junto = false;
                for (var i = 0; i < cajas.length && !junto; i++) {
                    for (var j = i + 1; j < cajas.length && !junto; j++) {
                        var a = cajas[i], b = cajas[j], m = 40;
                        if (a.x0 - m <= b.x1 && b.x0 - m <= a.x1 && a.y0 - m <= b.y1 && b.y0 - m <= a.y1) {
                            cajas[i] = { g: a.g.concat(b.g), x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1),
                                         y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) };
                            cajas.splice(j, 1);
                            junto = true;
                        }
                    }
                }
            }
            cajas.sort(function (a, b) { return b.g.length - a.g.length; });
            return cajas.slice(0, 8).map(function (z) {
                var ords = z.g.map(function (k) { return pts[k].orden; }).sort(function (x, y) { return x - y; });
                return { caja: z, etiqueta: rango(ords),
                         bounds: L.latLngBounds(z.g.map(function (k) { return pts[k].pos; })) };
            });
        }

        // Recuadros del plano general (se redibujan con cada zoom) y hojas de
        // ampliacion (se rehacen solo si cambian los grupos)
        function zonasYDetalles(t, res, pts) {
            var lista = zonas(res, pts);
            lista.forEach(function (z, i) {
                var q = z.caja, pad = 14;
                var nw = res.map.containerPointToLatLng([q.x0 - pad, q.y0 - pad]);
                var se = res.map.containerPointToLatLng([q.x1 + pad, q.y1 + pad]);
                L.rectangle(L.latLngBounds([nw, se]), { color: '#0f172a', weight: 2, dashArray: '6,4',
                                                        fill: false, interactive: false }).addTo(res.capa);
                var tw = 14 + 5.6 * Math.max(10, ('puntos ' + z.etiqueta).length), th = 32;
                var x0 = q.x0 - pad, x1 = q.x1 + pad, y0 = q.y0 - pad, y1 = q.y1 + pad;
                res.ocupados.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
                var lab = colocar([[x0, y0 - th - 3], [x1 - tw, y0 - th - 3], [x0, y1 + 3], [x1 - tw, y1 + 3],
                                   [x1 + 4, y0], [x0 - tw - 4, y0], [x1 + 4, y1 - th], [x0 - tw - 4, y1 - th]],
                                  tw, th, res.ocupados, res.tam.x, res.tam.y);
                etiqueta(res, lab, '<div class="det-tag">Detalle ' + (i + 1) +
                                   '<small>puntos ' + z.etiqueta + '</small></div>', 1200);
            });
            leyenda(t, lista.length > 0);
            var firma = lista.map(function (z) { return z.etiqueta; }).join('|');
            if (firma === t.firma) return;
            t.firma = firma;
            t.hojasDet.forEach(function (h) {
                h._regs.forEach(quitarMapa);
                if (h.parentNode) h.parentNode.removeChild(h);
            });
            t.hojasDet = [];
            var hoja = null, grid = null;
            lista.forEach(function (z, i) {
                if (i % 4 === 0) {                        // 4 ampliaciones por hoja
                    hoja = el('section', 'hoja');
                    hoja._regs = [];
                    hoja.appendChild(cabecera(t.c, 'ampliación de las zonas con puntos juntos'));
                    grid = el('div', 'det-grid');
                    hoja.appendChild(grid);
                    cont.insertBefore(hoja, t.hLista);
                    t.hojasDet.push(hoja);
                }
                var caja = el('div', 'det');
                caja.appendChild(el('h3', null, 'Detalle ' + (i + 1) + '  ·  puntos ' + z.etiqueta));
                var wrap = el('div', 'mapa-wrap');
                var md = el('div', 'mapa-det'); md.id = 'det' + (++nDet);
                wrap.appendChild(md);
                caja.appendChild(wrap);
                grid.appendChild(caja);
                hoja._regs.push(crearMapa(md.id, t.c, pts, z.bounds, false, null));
            });
        }

        function dibujar() {
            trabajos.forEach(function (t) {
                var pts = t.c.puntos.filter(function (p) { return p.pos; });
                crearMapa(t.div, t.c, pts, null, true, function (res) { zonasYDetalles(t, res, pts); });
            });
            creados = true;
            revisar();
        }
        function repintarTodo() {
            pintores.slice().forEach(function (r) { if (r.vivo) r.pintar(); });
        }

        if (sel) sel.addEventListener('change', function () {
            guardar('rt-plano-tam', sel.value);
            aplicarTamano(sel.value);
            if (window.L) repintarTodo();
        });
        if (chkF) chkF.addEventListener('change', function () {
            FLECHAS = chkF.checked;
            guardar('rt-plano-flechas', FLECHAS ? '1' : '0');
            if (window.L) repintarTodo();
        });
        if (chkLin) chkLin.addEventListener('change', function () {
            LINEAS = chkLin.checked;
            guardar('rt-plano-lineas', LINEAS ? '1' : '0');
            estadoFlechas();
            if (window.L) repintarTodo();
        });
        if (chkG) chkG.addEventListener('change', function () {
            document.body.classList.toggle('gris', chkG.checked);
            guardar('rt-plano-gris', chkG.checked ? '1' : '0');
        });

        // Leaflet se carga DESPUES de armar las hojas: si el mapa no llega (sin
        // internet), la lista igual queda lista para imprimir.
        function sinMapa() {
            var e = document.getElementById('estado');
            if (e) e.textContent = 'No se pudo cargar el mapa (¿sin internet?). La lista sí se puede imprimir.';
            trabajos.forEach(function (t) { leyenda(t, false); });
        }
        if (window.L) { dibujar(); return; }
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
        var sc = document.createElement('script');
        sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        var resuelto = false;
        sc.onload = function () { resuelto = true; if (window.L) dibujar(); else sinMapa(); };
        sc.onerror = function () { resuelto = true; sinMapa(); };
        setTimeout(function () { if (!resuelto && !window.L) sinMapa(); }, 15000);
        document.head.appendChild(sc);
    };
})();
