/* =============================================================================
 * MONITOREO DE OPERARIOS
 * -----------------------------------------------------------------------------
 * Ubicación de los celulares con la app TECHDITO (servicio en segundo plano).
 *   - En vivo: lista + mapa, estado de conexión, batería, GPS y modo robo.
 *   - Recorrido: línea del día, paradas, reproductor por hora y batería.
 * Necesita Leaflet (ya cargado en inicio.html). Se inicia solo la primera vez
 * que se abre la sección #monitoreo.
 * ============================================================================= */
(function () {
    'use strict';

    const REFRESCO_MS = 30000;
    const ESTADOS = {
        en_linea:  { nombre: 'En línea',  color: '#16a34a', fondo: '#dcfce7' },
        reciente:  { nombre: 'Reciente',  color: '#d97706', fondo: '#fef3c7' },
        sin_senal: { nombre: 'Sin señal', color: '#64748b', fondo: '#e2e8f0' },
        sin_datos: { nombre: 'Sin datos', color: '#94a3b8', fondo: '#f1f5f9' }
    };

    // ------------------------------------------------------------- estilos
    const CSS = `
#mo-app{font-family:inherit;color:#1e293b}
.mo-wrap{display:flex;flex-direction:column;gap:14px;min-height:calc(100vh - 100px)}
.mo-cab{display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px}
.mo-cab-tit{display:flex;align-items:center;gap:12px;min-width:240px;flex:1}
.mo-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;display:flex;
  align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0;box-shadow:0 6px 16px rgba(37,99,235,.25)}
.mo-cab h2{margin:0;font-size:1.35rem;font-weight:700;color:#1e293b}
.mo-cab p{margin:2px 0 0;font-size:.82rem;color:#64748b}
.mo-tabs{display:flex;background:#f1f5f9;border-radius:10px;padding:4px;gap:4px}
.mo-tab{border:none;background:transparent;color:#475569;font:inherit;font-size:.82rem;font-weight:600;padding:8px 14px;border-radius:8px;
  cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .15s;white-space:nowrap}
.mo-tab:hover{color:#1e293b}
.mo-tab.mo-activo{background:#fff;color:#2563eb;box-shadow:0 1px 4px rgba(15,23,42,.12)}
.mo-refresco{display:flex;align-items:center;gap:8px;font-size:.74rem;color:#64748b;white-space:nowrap}
.mo-pulso{width:8px;height:8px;border-radius:50%;background:#16a34a;box-shadow:0 0 0 0 rgba(22,163,74,.5);animation:mo-pulso 2s infinite}
@keyframes mo-pulso{0%{box-shadow:0 0 0 0 rgba(22,163,74,.5)}70%{box-shadow:0 0 0 8px rgba(22,163,74,0)}100%{box-shadow:0 0 0 0 rgba(22,163,74,0)}}
.mo-ico{width:36px;height:36px;border-radius:9px;border:1px solid #e2e8f0;background:#fff;color:#475569;cursor:pointer;display:inline-flex;
  align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.mo-ico:hover{background:#f1f5f9;color:#1e293b}
.mo-ico.mo-girando i{animation:mo-giro .8s linear infinite}
@keyframes mo-giro{to{transform:rotate(360deg)}}
.mo-cuerpo{display:flex;flex:1;min-height:560px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.mo-panel{width:380px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid #e2e8f0;background:#fff;min-height:0}
.mo-mapa-caja{flex:1;position:relative;min-height:420px;background:#e2e8f0}
#mo-mapa{position:absolute;inset:0}
.mo-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px;border-bottom:1px solid #eef2f7;background:#f8fafc}
.mo-stat{border:1px solid #e2e8f0;background:#fff;border-radius:10px;padding:8px 6px;text-align:center;cursor:pointer;transition:all .15s}
.mo-stat:hover{border-color:#94a3b8}
.mo-stat.mo-activo{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
.mo-stat b{display:block;font-size:1.2rem;line-height:1.1;font-variant-numeric:tabular-nums}
.mo-stat span{display:block;font-size:.62rem;font-weight:700;color:#64748b;letter-spacing:.02em;margin-top:2px}
.mo-buscar{padding:10px 12px;border-bottom:1px solid #eef2f7}
.mo-buscar-caja{display:flex;align-items:center;gap:8px;border:1px solid #cbd5e1;border-radius:999px;padding:0 12px;height:38px;transition:all .15s}
.mo-buscar-caja:focus-within{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.12)}
.mo-buscar-caja i{color:#94a3b8;font-size:.8rem}
.mo-buscar-caja input{border:none;outline:none;flex:1;min-width:0;font:inherit;font-size:.85rem;background:transparent}
.mo-lista{flex:1;overflow-y:auto;min-height:0}
.mo-fila{display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid #f1f5f9;cursor:pointer;border-left:4px solid transparent;transition:background .15s}
.mo-fila:hover{background:#f8fafc}
.mo-fila.mo-activo{background:#eff6ff;border-left-color:#2563eb}
.mo-fila.mo-en-alerta{background:#fef2f2}
.mo-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;
  color:#fff;flex-shrink:0;position:relative}
.mo-av::after{content:"";position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;border:2px solid #fff;background:var(--mo-est)}
.mo-fila-txt{flex:1;min-width:0}
.mo-fila-txt b{display:block;font-size:.86rem;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mo-fila-txt span{display:block;font-size:.72rem;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mo-fila-der{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.mo-bat{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;font-variant-numeric:tabular-nums}
.mo-etq{font-size:.62rem;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:.02em;white-space:nowrap}
.mo-vacio{padding:48px 24px;text-align:center;color:#94a3b8}
.mo-vacio i{font-size:2.6rem;opacity:.5;margin-bottom:12px;display:block}
.mo-vacio b{display:block;color:#475569;margin-bottom:6px}
.mo-vacio p{margin:0;font-size:.8rem;line-height:1.5}
.mo-pin{position:relative;width:38px;height:38px}
.mo-pin-c{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;
  font-size:.78rem;border:3px solid #fff;box-shadow:0 4px 12px rgba(15,23,42,.35);background:var(--mo-col)}
.mo-pin-b{position:absolute;left:50%;top:34px;transform:translateX(-50%);background:#fff;border-radius:999px;padding:0 5px;font-size:.6rem;
  font-weight:800;box-shadow:0 1px 4px rgba(15,23,42,.3);white-space:nowrap;color:#0f172a}
.mo-pin.mo-alerta .mo-pin-c{animation:mo-alerta 1.2s infinite}
@keyframes mo-alerta{0%{box-shadow:0 0 0 0 rgba(220,38,38,.7)}70%{box-shadow:0 0 0 16px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}
.mo-pin.mo-viejo .mo-pin-c{filter:grayscale(.85);opacity:.8}
.mo-pop{min-width:240px;font-family:inherit}
.mo-pop h4{margin:0 0 2px;font-size:.95rem;color:#0f172a}
.mo-pop small{color:#64748b;font-size:.72rem}
.mo-pop-g{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}
.mo-pop-d{background:#f8fafc;border:1px solid #eef2f7;border-radius:8px;padding:5px 8px}
.mo-pop-d em{display:block;font-style:normal;font-size:.6rem;font-weight:800;color:#94a3b8;letter-spacing:.04em}
.mo-pop-d span{font-size:.78rem;font-weight:600;color:#1e293b}
.mo-acc{display:flex;flex-wrap:wrap;gap:6px}
.mo-b{flex:1;min-width:100px;height:34px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;color:#1e293b;font:inherit;font-size:.74rem;
  font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:all .15s}
.mo-b:hover{background:#f1f5f9}
.mo-b.mo-prim{background:#2563eb;border-color:#2563eb;color:#fff}
.mo-b.mo-prim:hover{background:#1d4ed8}
.mo-b.mo-peligro{background:#fff;border-color:#fecaca;color:#dc2626}
.mo-b.mo-peligro:hover{background:#fef2f2}
.mo-b.mo-peligro.mo-on{background:#dc2626;border-color:#dc2626;color:#fff}
.mo-form{padding:14px;border-bottom:1px solid #eef2f7;display:flex;flex-direction:column;gap:10px;background:#f8fafc}
.mo-form label{font-size:.66rem;font-weight:800;color:#64748b;letter-spacing:.06em;display:block;margin-bottom:4px}
.mo-sel,.mo-fecha{width:100%;box-sizing:border-box;height:38px;border:1px solid #cbd5e1;border-radius:9px;padding:0 10px;font:inherit;
  font-size:.85rem;background:#fff;color:#0f172a;outline:none}
.mo-sel:focus,.mo-fecha:focus{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.12)}
.mo-fila-f{display:flex;gap:6px;align-items:flex-end}
.mo-fila-f>div{flex:1;min-width:0}
.mo-dias{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:thin}
.mo-dia{border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:4px 10px;font-size:.7rem;font-weight:700;color:#475569;
  cursor:pointer;white-space:nowrap}
.mo-dia.mo-activo{background:#2563eb;border-color:#2563eb;color:#fff}
.mo-rec{flex:1;overflow-y:auto;min-height:0;padding:12px 14px 20px}
.mo-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px}
.mo-kpi{border:1px solid #eef2f7;border-radius:10px;padding:9px 11px;background:#fff}
.mo-kpi em{display:block;font-style:normal;font-size:.62rem;font-weight:800;color:#94a3b8;letter-spacing:.05em}
.mo-kpi b{display:block;font-size:1.1rem;color:#0f172a;font-variant-numeric:tabular-nums;margin-top:2px}
.mo-sec-t{font-size:.66rem;font-weight:800;letter-spacing:.08em;color:#64748b;margin:14px 0 8px;display:flex;align-items:center;gap:8px}
.mo-sec-t::after{content:"";flex:1;height:1px;background:#eef2f7}
.mo-bat-graf{border:1px solid #eef2f7;border-radius:10px;padding:8px;background:#fff}
.mo-tl{position:relative;padding-left:18px}
.mo-tl::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:#e2e8f0}
.mo-tl-i{position:relative;padding:6px 8px;border-radius:8px;cursor:pointer;font-size:.78rem;margin-bottom:2px}
.mo-tl-i:hover{background:#f1f5f9}
.mo-tl-i::before{content:"";position:absolute;left:-16px;top:11px;width:10px;height:10px;border-radius:50%;background:var(--mo-col,#2563eb);
  border:2px solid #fff;box-shadow:0 0 0 1px var(--mo-col,#2563eb)}
.mo-tl-i b{color:#0f172a}
.mo-tl-i span{color:#64748b;display:block;font-size:.7rem}
.mo-player{position:absolute;left:12px;right:12px;bottom:12px;z-index:500;background:rgba(255,255,255,.97);border:1px solid #e2e8f0;
  border-radius:12px;padding:10px 12px;box-shadow:0 8px 24px rgba(15,23,42,.16);display:none;align-items:center;gap:10px}
.mo-player.mo-visible{display:flex}
.mo-player input[type=range]{flex:1;accent-color:#2563eb;min-width:0}
.mo-player-t{font-size:.78rem;font-weight:800;color:#0f172a;font-variant-numeric:tabular-nums;white-space:nowrap;min-width:92px;text-align:right}
.mo-play{width:36px;height:36px;border-radius:50%;border:none;background:#2563eb;color:#fff;cursor:pointer;flex-shrink:0}
.mo-play:hover{background:#1d4ed8}
.mo-vel{height:30px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;font:inherit;font-size:.72rem;font-weight:700;padding:0 6px}
.mo-ley{position:absolute;top:12px;left:56px;z-index:500;background:rgba(255,255,255,.95);border:1px solid #e2e8f0;border-radius:10px;
  padding:6px 10px;font-size:.7rem;color:#475569;display:flex;gap:12px;flex-wrap:wrap;box-shadow:0 2px 8px rgba(15,23,42,.08)}
.mo-ley span{display:inline-flex;align-items:center;gap:5px}
.mo-ley i{width:9px;height:9px;border-radius:50%;display:inline-block}
.mo-aviso{margin:12px;padding:10px 12px;border-radius:10px;font-size:.78rem;line-height:1.45;background:#fffbeb;border:1px solid #fde68a;color:#92400e}
.mo-aviso.mo-error{background:#fef2f2;border-color:#fecaca;color:#991b1b}
.mo-parada-ic{width:26px;height:26px;border-radius:50%;background:#f59e0b;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.35);
  display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:800}
.mo-ext-ic{width:30px;height:30px;border-radius:50%;color:#fff;border:3px solid #fff;box-shadow:0 2px 8px rgba(15,23,42,.35);display:flex;
  align-items:center;justify-content:center;font-size:.72rem}
.mo-yo-ic{width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.3)}
@media (max-width:1100px){.mo-panel{width:330px}}
@media (max-width:900px){
  .mo-cuerpo{flex-direction:column;min-height:0}
  .mo-panel{width:auto;border-right:none;border-bottom:1px solid #e2e8f0;max-height:none}
  .mo-mapa-caja{order:-1;height:58vh;min-height:320px;flex:none}
  .mo-lista{max-height:46vh}
  .mo-rec{max-height:none}
}
@media (max-width:600px){
  .mo-cab{padding:12px}
  .mo-cab h2{font-size:1.1rem}
  .mo-tabs{width:100%}
  .mo-tab{flex:1;justify-content:center}
  .mo-stats{grid-template-columns:repeat(2,1fr)}
  .mo-ley{left:12px;right:12px;top:auto;bottom:12px}
  .mo-player{bottom:12px}
  .mo-player-t{min-width:70px}
}`;

    // ------------------------------------------------------------- utilidades
    function el(tag, attrs, hijos) {
        const n = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                const v = attrs[k];
                if (v === undefined || v === null || v === false) return;
                if (k === 'text') n.textContent = v;
                else if (k === 'html') n.innerHTML = v;
                else if (k === 'class') n.className = v;
                else if (k === 'style') n.style.cssText = v;
                else if (k.indexOf('on') === 0 && typeof v === 'function') n.addEventListener(k.slice(2), v);
                else n.setAttribute(k, v === true ? '' : v);
            });
        }
        (hijos || []).forEach(function (h) {
            if (h === null || h === undefined || h === false) return;
            n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
        });
        return n;
    }
    function icono(c) { return el('i', { class: 'fas ' + c, 'aria-hidden': 'true' }); }
    function esc(t) {
        return String(t === null || t === undefined ? '' : t).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function iniciales(nombre) {
        const p = String(nombre || '?').trim().split(/\s+/);
        return ((p[0] || '?')[0] + (p.length > 1 ? p[1][0] : '')).toUpperCase();
    }
    function colorDe(id) {
        const paleta = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#db2777', '#4f46e5', '#0d9488', '#ea580c', '#9333ea'];
        return paleta[Math.abs(Number(id) || 0) % paleta.length];
    }
    function hace(seg) {
        if (seg === null || seg === undefined) return 'sin datos';
        if (seg < 60) return 'hace un momento';
        const m = Math.round(seg / 60);
        if (m < 60) return 'hace ' + m + ' min';
        const h = Math.floor(m / 60);
        if (h < 24) return 'hace ' + h + ' h ' + (m % 60 ? (m % 60) + ' min' : '');
        const d = Math.floor(h / 24);
        return 'hace ' + d + (d === 1 ? ' día' : ' días');
    }
    function hoyISO() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function sumarDias(iso, n) {
        const p = iso.split('-').map(Number);
        const d = new Date(p[0], p[1] - 1, p[2] + n);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    function fechaBonita(iso) {
        const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
        const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const p = iso.split('-').map(Number);
        const d = new Date(p[0], p[1] - 1, p[2]);
        return dias[d.getDay()] + ' ' + p[2] + ' ' + meses[p[1] - 1];
    }
    function colorBateria(b, cargando) {
        if (cargando) return '#16a34a';
        if (b === null || b === undefined) return '#94a3b8';
        if (b <= 15) return '#dc2626';
        if (b <= 35) return '#d97706';
        return '#16a34a';
    }
    function iconoBateria(b, cargando) {
        if (cargando) return 'fa-charging-station';
        if (b === null || b === undefined) return 'fa-battery-empty';
        if (b >= 85) return 'fa-battery-full';
        if (b >= 60) return 'fa-battery-three-quarters';
        if (b >= 35) return 'fa-battery-half';
        if (b >= 12) return 'fa-battery-quarter';
        return 'fa-battery-empty';
    }
    function minutosTexto(m) {
        if (m < 60) return m + ' min';
        return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
    }
    async function pedir(url, opciones) {
        const r = await fetch(url, Object.assign({ credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } }, opciones || {}));
        let datos = null;
        try { datos = await r.json(); } catch (e) { datos = null; }
        if (!r.ok || !datos || datos.success === false) {
            const msg = (datos && (datos.error || datos.message)) || ('Error del servidor (' + r.status + ')');
            const err = new Error(msg);
            err.status = r.status;
            throw err;
        }
        return datos;
    }

    // ------------------------------------------------------------- módulo
    const M = {
        listo: false,
        vista: 'vivo',
        operarios: [],
        filtroTexto: '',
        filtroEstado: 'todos',
        seleccionado: null,
        bateriaBaja: 15,
        mapa: null,
        capaVivo: null,
        capaRec: null,
        marcadores: {},
        timer: null,
        rec: null,
        reproductor: { idx: 0, play: null, marcador: null, velocidad: 4 },

        iniciar: function () {
            if (this.listo) return;
            const raiz = document.getElementById('mo-app');
            if (!raiz || typeof L === 'undefined') return;
            this.listo = true;
            if (!document.getElementById('mo-estilos')) {
                document.head.appendChild(el('style', { id: 'mo-estilos', text: CSS }));
            }
            this.construir(raiz);
            this.crearMapa();
            this.cambiarVista('vivo');
        },

        // ---------------------------------------------------------- estructura
        construir: function (raiz) {
            const self = this;
            this.tabVivo = el('button', { type: 'button', class: 'mo-tab mo-activo', onclick: () => self.cambiarVista('vivo') },
                [icono('fa-broadcast-tower'), 'En vivo']);
            this.tabRec = el('button', { type: 'button', class: 'mo-tab', onclick: () => self.cambiarVista('recorrido') },
                [icono('fa-route'), 'Recorrido']);
            this.txtRefresco = el('span', { text: 'Cargando…' });
            this.btnRefrescar = el('button', { type: 'button', class: 'mo-ico', title: 'Actualizar ahora',
                onclick: () => self.vista === 'vivo' ? self.cargarVivo(true) : self.cargarRecorrido() }, [icono('fa-sync-alt')]);

            const cab = el('div', { class: 'mo-cab' }, [
                el('div', { class: 'mo-cab-tit' }, [
                    el('div', { class: 'mo-logo' }, [icono('fa-satellite-dish')]),
                    el('div', {}, [el('h2', { text: 'Monitoreo de operarios' }),
                                   el('p', { text: 'Ubicación de los celulares con la app TECHDITO' })])
                ]),
                el('div', { class: 'mo-tabs' }, [this.tabVivo, this.tabRec]),
                el('div', { class: 'mo-refresco' }, [el('span', { class: 'mo-pulso' }), this.txtRefresco, this.btnRefrescar])
            ]);

            this.panel = el('aside', { class: 'mo-panel' });
            this.mapaCaja = el('div', { class: 'mo-mapa-caja' }, [el('div', { id: 'mo-mapa' })]);
            this.leyenda = el('div', { class: 'mo-ley' }, Object.keys(ESTADOS).slice(0, 3).map(function (k) {
                return el('span', {}, [el('i', { style: 'background:' + ESTADOS[k].color }), ESTADOS[k].nombre]);
            }).concat([el('span', {}, [el('i', { style: 'background:#dc2626' }), 'Robo / pérdida'])]));
            this.mapaCaja.appendChild(this.leyenda);
            this.player = this.construirReproductor();
            this.mapaCaja.appendChild(this.player);

            raiz.innerHTML = '';
            raiz.appendChild(el('div', { class: 'mo-wrap' }, [cab, el('div', { class: 'mo-cuerpo' }, [this.panel, this.mapaCaja])]));
        },

        crearMapa: function () {
            const capas = {};
            try {
                if (window.rtApp && typeof window.rtApp._capasBase === 'function') Object.assign(capas, window.rtApp._capasBase());
            } catch (e) { /* se usa la capa por defecto */ }
            if (!Object.keys(capas).length) {
                capas['Calles (OpenStreetMap)'] = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { maxZoom: 19, attribution: '&copy; OpenStreetMap' });
            }
            capas['Satélite'] = L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                { maxZoom: 19, attribution: 'Imágenes &copy; Esri' });
            this.mapa = L.map('mo-mapa', { zoomControl: true, preferCanvas: true }).setView([-8.1116, -79.0288], 13);
            capas[Object.keys(capas)[0]].addTo(this.mapa);
            L.control.layers(capas, null, { position: 'topright' }).addTo(this.mapa);
            this.capaVivo = L.layerGroup().addTo(this.mapa);
            this.capaRec = L.layerGroup();
            const self = this;
            window.addEventListener('resize', function () { if (self.visible()) self.mapa.invalidateSize(); });
        },

        visible: function () {
            const s = document.getElementById('monitoreo');
            return !!s && s.style.display !== 'none' && (s.classList.contains('active') || s.offsetParent !== null);
        },

        cambiarVista: function (v) {
            this.vista = v;
            this.tabVivo.classList.toggle('mo-activo', v === 'vivo');
            this.tabRec.classList.toggle('mo-activo', v === 'recorrido');
            this.detenerReproduccion();
            if (v === 'vivo') {
                this.mapa.removeLayer(this.capaRec);
                this.capaVivo.addTo(this.mapa);
                this.player.classList.remove('mo-visible');
                this.leyenda.style.display = '';
                this.pintarPanelVivo();
                this.cargarVivo(true);
                this.programar();
            } else {
                this.mapa.removeLayer(this.capaVivo);
                this.capaRec.addTo(this.mapa);
                this.leyenda.style.display = 'none';
                this.pintarPanelRecorrido();
                this.cargarRecorrido();
            }
            setTimeout(() => this.mapa.invalidateSize(), 60);
        },

        programar: function () {
            clearInterval(this.timer);
            const self = this;
            this.timer = setInterval(function () {
                if (self.vista === 'vivo' && self.visible() && !document.hidden) self.cargarVivo(false);
            }, REFRESCO_MS);
        },

        // ---------------------------------------------------------- EN VIVO
        pintarPanelVivo: function () {
            const self = this;
            this.panel.innerHTML = '';
            this.cajaStats = el('div', { class: 'mo-stats' });
            this.inputBuscar = el('input', { type: 'search', placeholder: 'Buscar operario…', value: this.filtroTexto,
                oninput: function () { self.filtroTexto = this.value; self.pintarLista(); } });
            this.lista = el('div', { class: 'mo-lista' }, [el('div', { class: 'mo-vacio' }, [icono('fa-spinner fa-spin'), el('p', { text: 'Cargando operarios…' })])]);
            this.panel.appendChild(this.cajaStats);
            this.panel.appendChild(el('div', { class: 'mo-buscar' }, [el('div', { class: 'mo-buscar-caja' }, [icono('fa-search'), this.inputBuscar])]));
            this.panel.appendChild(this.lista);
            this.pintarStats();
            this.pintarLista();
        },

        cargarVivo: async function (primera) {
            this.btnRefrescar.classList.add('mo-girando');
            try {
                const d = await pedir('/api/monitoreo/en_vivo');
                this.operarios = d.operarios || [];
                this.bateriaBaja = d.bateria_baja || 15;
                this.txtRefresco.textContent = 'Actualizado ' + String(d.ahora || '').slice(11, 16);
                this.error = null;
                if (this.vista === 'vivo') {
                    this.pintarStats();
                    this.pintarLista();
                    this.pintarMarcadores(primera);
                }
            } catch (e) {
                this.error = e.message;
                this.txtRefresco.textContent = 'Sin conexión con el servidor';
                if (this.vista === 'vivo') this.pintarLista();
            } finally {
                this.btnRefrescar.classList.remove('mo-girando');
            }
        },

        cuenta: function () {
            const c = { todos: this.operarios.length, en_linea: 0, sin_senal: 0, bateria: 0, alerta: 0 };
            this.operarios.forEach((o) => {
                if (o.estado === 'en_linea') c.en_linea++;
                if (o.estado === 'sin_senal' || o.estado === 'sin_datos') c.sin_senal++;
                if (o.bateria !== null && o.bateria !== undefined && o.bateria <= this.bateriaBaja && !o.cargando) c.bateria++;
                if (o.alerta) c.alerta++;
            });
            return c;
        },

        pintarStats: function () {
            if (!this.cajaStats) return;
            const c = this.cuenta();
            const self = this;
            const defs = [
                ['en_linea', c.en_linea, 'EN LÍNEA', '#16a34a'],
                ['sin_senal', c.sin_senal, 'SIN SEÑAL', '#64748b'],
                ['bateria', c.bateria, 'BATERÍA BAJA', '#d97706'],
                ['alerta', c.alerta, 'EN ALERTA', '#dc2626']
            ];
            this.cajaStats.innerHTML = '';
            defs.forEach(function (d) {
                self.cajaStats.appendChild(el('div', {
                    class: 'mo-stat' + (self.filtroEstado === d[0] ? ' mo-activo' : ''), title: 'Filtrar',
                    onclick: function () { self.filtroEstado = self.filtroEstado === d[0] ? 'todos' : d[0]; self.pintarStats(); self.pintarLista(); }
                }, [el('b', { text: String(d[1]), style: 'color:' + d[3] }), el('span', { text: d[2] })]));
            });
        },

        filtrados: function () {
            const t = this.filtroTexto.trim().toLowerCase();
            const f = this.filtroEstado;
            return this.operarios.filter((o) => {
                if (t && (o.nombre + ' ' + (o.usuario || '')).toLowerCase().indexOf(t) < 0) return false;
                if (f === 'en_linea') return o.estado === 'en_linea';
                if (f === 'sin_senal') return o.estado === 'sin_senal' || o.estado === 'sin_datos';
                if (f === 'bateria') return o.bateria !== null && o.bateria !== undefined && o.bateria <= this.bateriaBaja && !o.cargando;
                if (f === 'alerta') return o.alerta;
                return true;
            });
        },

        pintarLista: function () {
            if (!this.lista) return;
            const self = this;
            this.lista.innerHTML = '';
            if (this.error && !this.operarios.length) {
                this.lista.appendChild(el('div', { class: 'mo-aviso mo-error' }, [this.error]));
                return;
            }
            if (!this.operarios.length) {
                this.lista.appendChild(el('div', { class: 'mo-vacio' }, [
                    icono('fa-mobile-alt'), el('b', { text: 'Aún no hay celulares enviando su ubicación' }),
                    el('p', { text: 'Aparecerán aquí cuando cada operario inicie sesión en la app actualizada y acepte los permisos de ubicación.' })]));
                return;
            }
            const filas = this.filtrados();
            if (!filas.length) {
                this.lista.appendChild(el('div', { class: 'mo-vacio' }, [icono('fa-filter'), el('b', { text: 'Ningún operario con ese filtro' })]));
                return;
            }
            filas.forEach(function (o) {
                const est = ESTADOS[o.estado] || ESTADOS.sin_datos;
                const av = el('div', { class: 'mo-av', text: iniciales(o.nombre),
                    style: 'background:' + colorDe(o.id) + ';--mo-est:' + est.color });
                const linea2 = (o.alerta ? '⚠ Modo robo · ' : '') + hace(o.hace_contacto_s) +
                    (o.gps === false ? ' · GPS apagado' : '');
                const der = el('div', { class: 'mo-fila-der' }, [
                    el('span', { class: 'mo-bat', style: 'color:' + colorBateria(o.bateria, o.cargando) }, [
                        icono(iconoBateria(o.bateria, o.cargando)), (o.bateria === null || o.bateria === undefined) ? '—' : o.bateria + '%']),
                    el('span', { class: 'mo-etq', text: est.nombre, style: 'color:' + est.color + ';background:' + est.fondo })
                ]);
                self.lista.appendChild(el('div', {
                    class: 'mo-fila' + (self.seleccionado === o.id ? ' mo-activo' : '') + (o.alerta ? ' mo-en-alerta' : ''),
                    onclick: function () { self.enfocar(o.id); }
                }, [av, el('div', { class: 'mo-fila-txt' }, [el('b', { text: o.nombre }), el('span', { text: linea2 })]), der]));
            });
        },

        pintarMarcadores: function (encuadrar) {
            const self = this;
            const vistos = {};
            const puntos = [];
            this.operarios.forEach(function (o) {
                if (o.lat === null || o.lon === null || o.lat === undefined) return;
                vistos[o.id] = true;
                puntos.push([o.lat, o.lon]);
                const est = ESTADOS[o.estado] || ESTADOS.sin_datos;
                const col = o.alerta ? '#dc2626' : colorDe(o.id);
                const html = '<div class="mo-pin' + (o.alerta ? ' mo-alerta' : '') + (o.estado === 'sin_senal' ? ' mo-viejo' : '') + '">' +
                    '<div class="mo-pin-c" style="--mo-col:' + col + ';box-shadow:0 0 0 3px ' + est.color + ',0 4px 12px rgba(15,23,42,.35)">' +
                    esc(iniciales(o.nombre)) + '</div>' +
                    '<div class="mo-pin-b" style="color:' + colorBateria(o.bateria, o.cargando) + '">' +
                    (o.bateria === null || o.bateria === undefined ? '—' : esc(o.bateria) + '%') + '</div></div>';
                const icon = L.divIcon({ html: html, className: '', iconSize: [38, 50], iconAnchor: [19, 19], popupAnchor: [0, -18] });
                let m = self.marcadores[o.id];
                if (!m) {
                    m = L.marker([o.lat, o.lon], { icon: icon, riseOnHover: true });
                    m.bindPopup(function () { return self.popup(self.operarios.find((x) => x.id === o.id) || o); }, { maxWidth: 320, minWidth: 260 });
                    m.on('click', function () { self.seleccionado = o.id; self.pintarLista(); });
                    m.addTo(self.capaVivo);
                    self.marcadores[o.id] = m;
                } else {
                    m.setLatLng([o.lat, o.lon]);
                    m.setIcon(icon);
                    if (m.isPopupOpen()) m.setPopupContent(self.popup(o));
                }
                m.setZIndexOffset(o.alerta ? 1000 : (o.estado === 'en_linea' ? 500 : 0));
            });
            Object.keys(this.marcadores).forEach(function (id) {
                if (!vistos[id]) { self.capaVivo.removeLayer(self.marcadores[id]); delete self.marcadores[id]; }
            });
            if (encuadrar && puntos.length) {
                if (puntos.length === 1) this.mapa.setView(puntos[0], 16);
                else this.mapa.fitBounds(L.latLngBounds(puntos).pad(0.15), { maxZoom: 16 });
            }
        },

        popup: function (o) {
            const self = this;
            const est = ESTADOS[o.estado] || ESTADOS.sin_datos;
            const dato = function (t, v) { return el('div', { class: 'mo-pop-d' }, [el('em', { text: t }), el('span', { text: v })]); };
            const vel = (o.velocidad !== null && o.velocidad !== undefined) ? Math.round(o.velocidad * 3.6) + ' km/h' : '—';
            const bat = (o.bateria === null || o.bateria === undefined) ? '—' : o.bateria + '%' + (o.cargando ? ' · cargando' : '');
            const caja = el('div', { class: 'mo-pop' }, [
                el('h4', { text: o.nombre }),
                el('small', { text: (o.usuario || '') + ' · ' + est.nombre + ' · ' + hace(o.hace_contacto_s) }),
                o.alerta ? el('div', { class: 'mo-aviso mo-error', style: 'margin:8px 0 0',
                    text: 'Marcado como robado/perdido' + (o.alerta_desde ? ' desde ' + o.alerta_desde.slice(11) : '') +
                          '. El celular envía su ubicación cada 20 segundos.' }) : null,
                el('div', { class: 'mo-pop-g' }, [
                    dato('ÚLTIMA UBICACIÓN', o.fecha_ubicacion ? o.fecha_ubicacion.slice(11, 16) + ' (' + hace(o.hace_ubicacion_s) + ')' : '—'),
                    dato('BATERÍA', bat),
                    dato('PRECISIÓN', o.precision_m ? '± ' + Math.round(o.precision_m) + ' m' : '—'),
                    dato('VELOCIDAD', vel),
                    dato('GPS', o.gps === false ? 'Apagado' : (o.gps ? 'Encendido' : '—')),
                    dato('RED', o.red || '—'),
                    dato('CELULAR', o.modelo || '—'),
                    dato('APP', o.version || '—')
                ]),
                el('div', { class: 'mo-acc' }, [
                    el('button', { type: 'button', class: 'mo-b mo-prim', onclick: function () { self.mapa.closePopup(); self.verRecorrido(o.id); } },
                        [icono('fa-route'), 'Recorrido de hoy']),
                    el('a', { class: 'mo-b', target: '_blank', rel: 'noopener',
                        href: 'https://www.google.com/maps/search/?api=1&query=' + o.lat + ',' + o.lon }, [icono('fa-map-marked-alt'), 'Google Maps']),
                    el('button', { type: 'button', class: 'mo-b mo-peligro' + (o.alerta ? ' mo-on' : ''),
                        onclick: function () { self.alternarAlerta(o); } },
                        [icono(o.alerta ? 'fa-shield-alt' : 'fa-exclamation-triangle'), o.alerta ? 'Quitar modo robo' : 'Marcar robado / perdido'])
                ])
            ]);
            return caja;
        },

        enfocar: function (id) {
            const o = this.operarios.find((x) => x.id === id);
            this.seleccionado = id;
            this.pintarLista();
            if (!o || o.lat === null || o.lat === undefined) return;
            this.mapa.setView([o.lat, o.lon], Math.max(this.mapa.getZoom(), 16), { animate: true });
            const m = this.marcadores[id];
            if (m) m.openPopup();
            if (window.innerWidth <= 900) this.mapaCaja.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        alternarAlerta: async function (o) {
            const activar = !o.alerta;
            const msg = activar
                ? '¿Marcar el celular de ' + o.nombre + ' como ROBADO o PERDIDO?\n\nEl celular enviará su ubicación cada 20 segundos (gasta más batería) hasta que quites la alerta.'
                : '¿Quitar el modo robo/pérdida del celular de ' + o.nombre + '?';
            if (!window.confirm(msg)) return;
            try {
                await pedir('/api/monitoreo/alerta', { method: 'POST', body: JSON.stringify({ usuario: o.id, activa: activar }) });
                this.mapa.closePopup();
                await this.cargarVivo(false);
            } catch (e) {
                window.alert(e.message);
            }
        },

        // ---------------------------------------------------------- RECORRIDO
        pintarPanelRecorrido: function () {
            const self = this;
            this.panel.innerHTML = '';
            if (!this.recUsuario && this.seleccionado) this.recUsuario = this.seleccionado;
            if (!this.recFecha) this.recFecha = hoyISO();

            this.selOperario = el('select', { class: 'mo-sel', onchange: function () { self.recUsuario = Number(this.value) || null; self.cargarRecorrido(); } });
            this.llenarOperarios();
            this.inputFecha = el('input', { type: 'date', class: 'mo-fecha', value: this.recFecha, max: hoyISO(),
                onchange: function () { if (this.value) { self.recFecha = this.value; self.cargarRecorrido(); } } });
            const ant = el('button', { type: 'button', class: 'mo-ico', title: 'Día anterior', onclick: function () { self.moverDia(-1); } }, [icono('fa-chevron-left')]);
            const sig = el('button', { type: 'button', class: 'mo-ico', title: 'Día siguiente', onclick: function () { self.moverDia(1); } }, [icono('fa-chevron-right')]);
            this.cajaDias = el('div', { class: 'mo-dias' });
            this.cajaRec = el('div', { class: 'mo-rec' });
            this.panel.appendChild(el('div', { class: 'mo-form' }, [
                el('div', {}, [el('label', { text: 'OPERARIO' }), this.selOperario]),
                el('div', { class: 'mo-fila-f' }, [el('div', {}, [el('label', { text: 'FECHA' }), this.inputFecha]), ant, sig]),
                this.cajaDias
            ]));
            this.panel.appendChild(this.cajaRec);
            if (!this.operarios.length) this.cargarVivo(false).then(() => self.llenarOperarios());
        },

        llenarOperarios: function () {
            if (!this.selOperario) return;
            const sel = this.selOperario;
            sel.innerHTML = '';
            sel.appendChild(el('option', { value: '', text: this.operarios.length ? 'Elige un operario…' : 'Sin operarios con la app' }));
            this.operarios.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach((o) => {
                sel.appendChild(el('option', { value: String(o.id), text: o.nombre + (o.usuario ? ' (' + o.usuario + ')' : ''),
                    selected: this.recUsuario === o.id }));
            });
        },

        moverDia: function (n) {
            const nuevo = sumarDias(this.recFecha || hoyISO(), n);
            if (nuevo > hoyISO()) return;
            this.recFecha = nuevo;
            this.inputFecha.value = nuevo;
            this.cargarRecorrido();
        },

        verRecorrido: function (id) {
            this.recUsuario = id;
            this.recFecha = hoyISO();
            this.cambiarVista('recorrido');
        },

        cargarRecorrido: async function () {
            if (!this.cajaRec) return;
            this.detenerReproduccion();
            this.capaRec.clearLayers();
            this.player.classList.remove('mo-visible');
            if (!this.recUsuario) {
                this.cajaRec.innerHTML = '';
                this.cajaRec.appendChild(el('div', { class: 'mo-vacio' }, [icono('fa-user-clock'), el('b', { text: 'Elige un operario' }),
                    el('p', { text: 'Verás su recorrido del día en el mapa, sus paradas y su batería.' })]));
                return;
            }
            this.cajaRec.innerHTML = '';
            this.cajaRec.appendChild(el('div', { class: 'mo-vacio' }, [icono('fa-spinner fa-spin'), el('p', { text: 'Cargando recorrido…' })]));
            this.btnRefrescar.classList.add('mo-girando');
            try {
                const d = await pedir('/api/monitoreo/recorrido?usuario=' + encodeURIComponent(this.recUsuario) +
                    '&fecha=' + encodeURIComponent(this.recFecha));
                this.rec = d;
                this.txtRefresco.textContent = 'Recorrido del ' + fechaBonita(d.fecha);
                this.pintarDias(d.dias_con_datos || []);
                this.pintarRecorrido();
            } catch (e) {
                this.cajaRec.innerHTML = '';
                this.cajaRec.appendChild(el('div', { class: 'mo-aviso mo-error' }, [e.message]));
            } finally {
                this.btnRefrescar.classList.remove('mo-girando');
            }
        },

        pintarDias: function (dias) {
            const self = this;
            this.cajaDias.innerHTML = '';
            dias.slice(-14).reverse().forEach(function (iso) {
                self.cajaDias.appendChild(el('button', { type: 'button', class: 'mo-dia' + (iso === self.recFecha ? ' mo-activo' : ''),
                    text: fechaBonita(iso), onclick: function () { self.recFecha = iso; self.inputFecha.value = iso; self.cargarRecorrido(); } }));
            });
            this.cajaDias.style.display = dias.length ? '' : 'none';
        },

        pintarRecorrido: function () {
            const self = this;
            const d = this.rec;
            const pts = d.puntos || [];
            const r = d.resumen || {};
            const caja = this.cajaRec;
            caja.innerHTML = '';
            if (!pts.length) {
                caja.appendChild(el('div', { class: 'mo-vacio' }, [icono('fa-map'), el('b', { text: 'Sin recorrido este día' }),
                    el('p', { text: 'El celular no envió ubicaciones en esta fecha. Prueba con uno de los días marcados arriba.' })]));
                return;
            }
            const kpi = function (t, v) { return el('div', { class: 'mo-kpi' }, [el('em', { text: t }), el('b', { text: v })]); };
            caja.appendChild(el('div', { class: 'mo-kpis' }, [
                kpi('DISTANCIA', (r.distancia_km || 0).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' km'),
                kpi('PRIMER / ÚLTIMO', (r.inicio || '—') + ' – ' + (r.fin || '—')),
                kpi('EN MOVIMIENTO', minutosTexto(r.minutos_en_movimiento || 0)),
                kpi('PARADAS', (r.paradas || []).length + ' · ' + minutosTexto(r.minutos_detenido || 0))
            ]));

            // batería del día
            const bats = pts.filter((p) => p.bat !== null && p.bat !== undefined);
            if (bats.length > 1) {
                caja.appendChild(el('div', { class: 'mo-sec-t', text: 'BATERÍA DEL DÍA' }));
                caja.appendChild(el('div', { class: 'mo-bat-graf', html: this.graficoBateria(bats) }));
            }

            // línea de tiempo: inicio, paradas, final
            caja.appendChild(el('div', { class: 'mo-sec-t', text: 'LÍNEA DE TIEMPO' }));
            const tl = el('div', { class: 'mo-tl' });
            const item = function (col, titulo, sub, lat, lon) {
                return el('div', { class: 'mo-tl-i', style: '--mo-col:' + col,
                    onclick: function () { self.mapa.setView([lat, lon], 18, { animate: true }); } },
                    [el('b', { text: titulo }), el('span', { text: sub })]);
            };
            tl.appendChild(item('#16a34a', 'Inicio · ' + pts[0].t.slice(0, 5), 'Primer punto del día', pts[0].lat, pts[0].lon));
            (r.paradas || []).forEach(function (p, i) {
                tl.appendChild(item('#f59e0b', 'Parada ' + (i + 1) + ' · ' + p.desde + ' – ' + p.hasta,
                    'Detenido ' + minutosTexto(p.minutos), p.lat, p.lon));
            });
            const u = pts[pts.length - 1];
            tl.appendChild(item('#dc2626', 'Último punto · ' + u.t.slice(0, 5),
                (u.bat !== null && u.bat !== undefined ? 'Batería ' + u.bat + '%' : 'Fin del recorrido'), u.lat, u.lon));
            caja.appendChild(tl);

            // mapa
            const linea = pts.map((p) => [p.lat, p.lon]);
            L.polyline(linea, { color: '#ffffff', weight: 9, opacity: 0.95, lineJoin: 'round' }).addTo(this.capaRec);
            L.polyline(linea, { color: '#2563eb', weight: 5, opacity: 0.95, lineJoin: 'round' }).addTo(this.capaRec);
            const ext = function (col, ic, p, txt) {
                return L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15],
                    html: '<div class="mo-ext-ic" style="background:' + col + '"><i class="fas ' + ic + '"></i></div>' }) })
                    .bindTooltip(txt, { direction: 'top', offset: [0, -14] });
            };
            ext('#16a34a', 'fa-play', pts[0], 'Inicio ' + pts[0].t.slice(0, 5)).addTo(this.capaRec);
            (r.paradas || []).forEach(function (p, i) {
                L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 13],
                    html: '<div class="mo-parada-ic">' + (p.minutos >= 100 ? Math.round(p.minutos / 60) + 'h' : p.minutos + "'") + '</div>' }) })
                    .bindTooltip('Parada ' + (i + 1) + ': ' + p.desde + ' – ' + p.hasta + ' (' + minutosTexto(p.minutos) + ')',
                        { direction: 'top', offset: [0, -12] })
                    .addTo(self.capaRec);
            });
            ext('#dc2626', 'fa-flag-checkered', u, 'Último punto ' + u.t.slice(0, 5)).addTo(this.capaRec);
            this.mapa.fitBounds(L.latLngBounds(linea).pad(0.12), { maxZoom: 17 });

            // reproductor
            this.reproductor.idx = 0;
            this.rango.max = String(pts.length - 1);
            this.rango.value = '0';
            this.reproductor.marcador = L.marker([pts[0].lat, pts[0].lon], { icon: L.divIcon({ className: '', iconSize: [18, 18],
                iconAnchor: [9, 9], html: '<div class="mo-yo-ic"></div>' }), zIndexOffset: 2000 }).addTo(this.capaRec);
            this.moverReproductor(0);
            this.player.classList.add('mo-visible');
        },

        graficoBateria: function (bats) {
            const W = 320, H = 70, P = 4;
            const seg = function (t) { const p = t.split(':').map(Number); return p[0] * 3600 + p[1] * 60 + (p[2] || 0); };
            const t0 = seg(bats[0].t), t1 = Math.max(seg(bats[bats.length - 1].t), t0 + 1);
            const x = function (t) { return P + (seg(t) - t0) / (t1 - t0) * (W - 2 * P); };
            const y = function (b) { return P + (100 - b) / 100 * (H - 2 * P); };
            const d = bats.map((p, i) => (i ? 'L' : 'M') + x(p.t).toFixed(1) + ' ' + y(p.bat).toFixed(1)).join(' ');
            const area = d + ' L' + x(bats[bats.length - 1].t).toFixed(1) + ' ' + (H - P) + ' L' + x(bats[0].t).toFixed(1) + ' ' + (H - P) + ' Z';
            const ult = bats[bats.length - 1].bat;
            const col = colorBateria(ult, false);
            return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" preserveAspectRatio="none" role="img" ' +
                'aria-label="Batería durante el día">' +
                '<line x1="0" x2="' + W + '" y1="' + y(15) + '" y2="' + y(15) + '" stroke="#fecaca" stroke-dasharray="4 4"/>' +
                '<path d="' + area + '" fill="' + col + '" opacity=".12"/>' +
                '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>' +
                '<div style="display:flex;justify-content:space-between;font-size:.66rem;color:#94a3b8;margin-top:2px">' +
                '<span>' + esc(bats[0].t.slice(0, 5)) + ' · ' + esc(bats[0].bat) + '%</span>' +
                '<span>' + esc(bats[bats.length - 1].t.slice(0, 5)) + ' · ' + esc(ult) + '%</span></div>';
        },

        construirReproductor: function () {
            const self = this;
            this.btnPlay = el('button', { type: 'button', class: 'mo-play', title: 'Reproducir recorrido', onclick: function () { self.alternarReproduccion(); } },
                [icono('fa-play')]);
            this.rango = el('input', { type: 'range', min: '0', max: '0', value: '0', 'aria-label': 'Hora del recorrido',
                oninput: function () { self.detenerReproduccion(); self.moverReproductor(Number(this.value)); } });
            this.txtHora = el('span', { class: 'mo-player-t', text: '--:--' });
            this.selVel = el('select', { class: 'mo-vel', title: 'Velocidad', onchange: function () { self.reproductor.velocidad = Number(this.value); } },
                [el('option', { value: '2', text: '2x' }), el('option', { value: '4', text: '4x', selected: true }),
                 el('option', { value: '10', text: '10x' }), el('option', { value: '25', text: '25x' })]);
            return el('div', { class: 'mo-player' }, [this.btnPlay, this.rango, this.txtHora, this.selVel]);
        },

        moverReproductor: function (i) {
            const pts = (this.rec && this.rec.puntos) || [];
            if (!pts.length) return;
            i = Math.max(0, Math.min(pts.length - 1, i));
            this.reproductor.idx = i;
            const p = pts[i];
            if (this.reproductor.marcador) this.reproductor.marcador.setLatLng([p.lat, p.lon]);
            this.rango.value = String(i);
            this.txtHora.textContent = p.t.slice(0, 5) + (p.bat !== null && p.bat !== undefined ? ' · ' + p.bat + '%' : '');
        },

        alternarReproduccion: function () {
            if (this.reproductor.play) { this.detenerReproduccion(); return; }
            const pts = (this.rec && this.rec.puntos) || [];
            if (pts.length < 2) return;
            if (this.reproductor.idx >= pts.length - 1) this.moverReproductor(0);
            const self = this;
            this.btnPlay.innerHTML = '<i class="fas fa-pause"></i>';
            this.reproductor.play = setInterval(function () {
                const sig = self.reproductor.idx + Math.max(1, Math.round(self.reproductor.velocidad / 2));
                if (sig >= pts.length) { self.moverReproductor(pts.length - 1); self.detenerReproduccion(); return; }
                self.moverReproductor(sig);
                const ll = [pts[sig].lat, pts[sig].lon];
                if (!self.mapa.getBounds().pad(-0.1).contains(ll)) self.mapa.panTo(ll);
            }, 250);
        },

        detenerReproduccion: function () {
            if (this.reproductor.play) clearInterval(this.reproductor.play);
            this.reproductor.play = null;
            if (this.btnPlay) this.btnPlay.innerHTML = '<i class="fas fa-play"></i>';
        }
    };

    window.moApp = M;

    // Se inicia la primera vez que se muestra la sección (showSection la pone en display:block)
    function vigilar() {
        const s = document.getElementById('monitoreo');
        if (!s) return;
        const revisar = function () {
            const visible = s.style.display === 'block' || s.classList.contains('active');
            if (!visible) return;
            if (!M.listo) M.iniciar();
            else {
                setTimeout(function () { M.mapa.invalidateSize(); }, 60);
                if (M.vista === 'vivo') M.cargarVivo(false);
            }
        };
        new MutationObserver(revisar).observe(s, { attributes: true, attributeFilter: ['style', 'class'] });
        revisar();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vigilar);
    else vigilar();
})();
