/* =============================================================================
 * RUTAS · BUSCADOR POR SUMINISTRO
 * -----------------------------------------------------------------------------
 * Extiende rtApp (script.js). Se carga DESPUES de script.js y rutas_excel.js.
 *   - Buscador en la cabecera del módulo (y atajo con la tecla "/").
 *   - Pinta el predio en el mapa con un pin propio y, si catastro y el GIS no
 *     coinciden, muestra también las otras ubicaciones y la distancia.
 *   - Ficha lateral: dirección y datos de catastro, si está en el ruteo
 *     cargado, y el historial de fotos (lecturas y órdenes) por fecha.
 *   - Visor de fotos a pantalla completa (flechas, zoom, girar, tira inferior).
 * ============================================================================= */
(function () {
    'use strict';
    if (typeof rtApp === 'undefined') {
        console.warn('rutas_consulta.js: rtApp no está cargado');
        return;
    }
    const A = rtApp;

    const FAMILIAS = {
        lecturas:       { nombre: 'Lecturas',             color: '#2563eb', icono: 'fa-tachometer-alt' },
        inspecciones:   { nombre: 'Inspecciones',         color: '#7c3aed', icono: 'fa-clipboard-check' },
        comunicaciones: { nombre: 'Comunicaciones',       color: '#0891b2', icono: 'fa-envelope-open-text' },
        cortes:         { nombre: 'Cortes y reaperturas', color: '#dc2626', icono: 'fa-tint-slash' },
        catastro:       { nombre: 'Catastro',             color: '#0f766e', icono: 'fa-map-marked-alt' },
        medidores:      { nombre: 'Medidores',            color: '#d97706', icono: 'fa-tools' },
        otros:          { nombre: 'Otros',                color: '#64748b', icono: 'fa-camera' }
    };
    const ORIGENES = {
        manual:      { nombre: 'Fijado a mano',            corto: 'Fijado a mano', color: '#1d4ed8', icono: 'fa-hand-pointer' },
        gis_sedalib: { nombre: 'Lote exacto · GIS Sedalib', corto: 'GIS Sedalib',   color: '#0f766e', icono: 'fa-crosshairs' },
        catastro:    { nombre: 'Catastro',                  corto: 'Catastro',      color: '#475569', icono: 'fa-map' },
        catastro_v2: { nombre: 'Catastro (padrón)',         corto: 'Padrón',        color: '#64748b', icono: 'fa-map' }
    };
    const CLAVE_RECIENTES = 'rt-consultas-recientes';
    const CLAVE_ANCHO = 'rt-ficha-ancho';
    const ANCHO_MIN = 400;          // px
    const ANCHO_MAX = 0.8;          // fracción del panel del mapa
    const ANCHO_AMPLIO = 0.62;      // botón "ampliar"

    // ------------------------------------------------------------- estilos
    const CSS = `
.rt-busq{position:relative;display:flex;align-items:center}
.rt-busq-caja{display:flex;align-items:center;gap:8px;height:40px;width:270px;padding:0 6px 0 12px;border:1px solid #cbd5e1;
  border-radius:999px;background:#fff;transition:all .18s}
.rt-busq-caja:focus-within{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.12);width:310px}
.rt-busq-caja.rt-error{border-color:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.12);animation:rt-temblor .3s}
.rt-busq-caja i.fa-search{color:#94a3b8;font-size:.85rem}
.rt-busq-caja input{flex:1;min-width:0;border:none;outline:none;font-size:.88rem;color:#0f172a;background:transparent;
  font-variant-numeric:tabular-nums;letter-spacing:.02em}
.rt-busq-caja input::placeholder{color:#94a3b8;letter-spacing:0}
.rt-busq-tecla{font-size:.68rem;color:#64748b;border:1px solid #e2e8f0;border-radius:5px;padding:1px 6px;background:#f8fafc}
.rt-busq-ir{width:30px;height:30px;border-radius:50%;border:none;background:#2563eb;color:#fff;cursor:pointer;display:flex;
  align-items:center;justify-content:center;flex-shrink:0}
.rt-busq-ir:hover{background:#1d4ed8}
.rt-busq-menu{position:absolute;top:46px;left:0;right:0;background:#fff;border:1px solid #e2e8f0;border-radius:12px;
  box-shadow:0 12px 32px rgba(15,23,42,.14);padding:6px;z-index:1200;display:none}
.rt-busq-menu.rt-abierto{display:block}
.rt-busq-menu h6{margin:4px 8px 6px;font-size:.66rem;letter-spacing:.06em;color:#94a3b8;font-weight:800}
.rt-busq-op{display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;font-size:.82rem;color:#334155}
.rt-busq-op:hover,.rt-busq-op.rt-activo{background:#f1f5f9}
.rt-busq-op b{font-variant-numeric:tabular-nums;color:#0f172a}
.rt-busq-op span{margin-left:auto;font-size:.7rem;color:#94a3b8}
.rt-busq-msg{position:absolute;top:46px;left:12px;font-size:.72rem;color:#dc2626;font-weight:600;white-space:nowrap}
@keyframes rt-temblor{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

.rt-ficha{position:absolute;top:0;right:0;bottom:0;width:560px;max-width:100%;background:#fff;z-index:800;
  display:flex;flex-direction:column;box-shadow:-12px 0 32px rgba(15,23,42,.16);border-left:1px solid #e2e8f0;
  transform:translateX(105%);transition:transform .28s cubic-bezier(.2,.8,.2,1),width .22s ease}
.rt-ficha.rt-abierta{transform:translateX(0)}
.rt-ficha-cab{padding:16px 18px 12px;border-bottom:1px solid #eef2f7;background:linear-gradient(180deg,#f8fafc,#fff)}
.rt-ficha-sobre{font-size:.66rem;font-weight:800;letter-spacing:.08em;color:#94a3b8}
.rt-ficha-num{display:flex;align-items:center;gap:8px;margin-top:2px}
.rt-ficha-num strong{font-size:1.55rem;font-weight:800;color:#0f172a;font-variant-numeric:tabular-nums;letter-spacing:.02em}
.rt-ficha-ico{width:30px;height:30px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;color:#64748b;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;transition:all .15s}
.rt-ficha-ico:hover{background:#f1f5f9;color:#0f172a}
.rt-ficha-cerrar{position:absolute;top:14px;right:14px}
.rt-ficha-ampliar{position:absolute;top:14px;right:52px}
.rt-ficha-asa{position:absolute;left:-6px;top:0;bottom:0;width:12px;cursor:col-resize;z-index:2;display:flex;align-items:center;justify-content:center}
.rt-ficha-asa::before{content:"";position:absolute;left:5px;top:0;bottom:0;width:2px;background:transparent;transition:background .15s}
.rt-ficha-asa:hover::before,.rt-ficha-asa.rt-moviendo::before{background:#2563eb}
.rt-ficha-asa span{width:6px;height:44px;border-radius:4px;background:#cbd5e1;border:1px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,.2);position:relative}
.rt-ficha-asa:hover span,.rt-ficha-asa.rt-moviendo span{background:#2563eb}
.rt-redimensionando,.rt-redimensionando *{cursor:col-resize!important;user-select:none!important}
.rt-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.rt-chip{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;padding:4px 10px;border-radius:999px;
  border:1px solid transparent;white-space:nowrap}
.rt-ficha-cuerpo{flex:1;overflow-y:auto;padding:14px 18px 26px;scroll-behavior:smooth}
.rt-sec{margin-bottom:18px}
.rt-sec-t{font-size:.68rem;font-weight:800;letter-spacing:.08em;color:#64748b;margin:0 0 8px;display:flex;align-items:center;gap:8px}
.rt-sec-t::after{content:"";flex:1;height:1px;background:#eef2f7}
.rt-dir{font-size:1.02rem;font-weight:700;color:#0f172a;line-height:1.35}
.rt-dir-sub{font-size:.8rem;color:#64748b;margin-top:2px}
.rt-datos{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:12px}
.rt-dato{background:#f8fafc;border:1px solid #eef2f7;border-radius:10px;padding:8px 10px;min-width:0}
.rt-dato small{display:block;font-size:.64rem;font-weight:800;letter-spacing:.05em;color:#94a3b8}
.rt-dato span{display:block;font-size:.8rem;color:#1e293b;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-acciones{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.rt-accion{flex:1;min-width:110px;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:36px;border-radius:9px;
  border:1px solid #cbd5e1;background:#fff;color:#1e293b;font-size:.76rem;font-weight:700;cursor:pointer;text-decoration:none;transition:all .15s}
.rt-accion:hover{background:#f1f5f9;border-color:#94a3b8}
.rt-accion.rt-prim{background:#2563eb;border-color:#2563eb;color:#fff}
.rt-accion.rt-prim:hover{background:#1d4ed8}
.rt-otras{margin-top:10px;border:1px solid #eef2f7;border-radius:10px;overflow:hidden}
.rt-otra{display:flex;align-items:center;gap:9px;padding:8px 10px;font-size:.76rem;color:#334155;cursor:pointer}
.rt-otra+.rt-otra{border-top:1px solid #eef2f7}
.rt-otra:hover{background:#f8fafc}
.rt-otra em{font-style:normal;margin-left:auto;font-weight:700;font-variant-numeric:tabular-nums}
.rt-punto{width:10px;height:10px;border-radius:50%;flex-shrink:0;box-shadow:0 0 0 2px #fff,0 0 0 3px currentColor}
.rt-alerta{display:flex;gap:9px;align-items:flex-start;background:#fffbeb;border:1px solid #fde68a;color:#92400e;border-radius:10px;
  padding:9px 11px;font-size:.75rem;line-height:1.45;margin-top:10px}
.rt-enruta{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;
  border-radius:12px;padding:12px}
.rt-enruta-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;flex-shrink:0}
.rt-enruta b{display:block;color:#1e293b;font-size:.85rem}
.rt-enruta span{display:block;color:#64748b;font-size:.74rem}
.rt-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
.rt-stat{border:1px solid #eef2f7;border-radius:10px;padding:9px 10px;background:#fff}
.rt-stat b{display:block;font-size:1.15rem;color:#0f172a;font-variant-numeric:tabular-nums;line-height:1.1}
.rt-stat span{font-size:.66rem;color:#94a3b8;font-weight:700;letter-spacing:.03em}
.rt-filtros{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.rt-filtro{display:inline-flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;padding:5px 10px;border-radius:999px;cursor:pointer;
  border:1px solid #e2e8f0;background:#fff;color:#475569;white-space:nowrap;transition:all .15s}
.rt-filtro:hover{border-color:#94a3b8}
.rt-filtro.rt-on{background:#0f172a;border-color:#0f172a;color:#fff}
.rt-filtro i{font-size:.6rem}
.rt-anio{font-size:.78rem;font-weight:800;color:#0f172a;margin:14px 0 8px;display:flex;align-items:center;gap:8px}
.rt-anio span{font-size:.68rem;font-weight:700;color:#94a3b8}
.rt-linea{position:relative;padding-left:22px}
.rt-linea::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:#e2e8f0;border-radius:2px}
.rt-visita{position:relative;margin-bottom:12px;animation:rt-entrar .35s ease both}
.rt-visita-dot{position:absolute;left:-22px;top:12px;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #cbd5e1}
.rt-visita-card{border:1px solid #e2e8f0;border-radius:12px;padding:10px 11px;background:#fff;transition:box-shadow .15s,border-color .15s}
.rt-visita-card:hover{box-shadow:0 6px 18px rgba(15,23,42,.08);border-color:#cbd5e1}
.rt-visita-fecha{font-size:.7rem;font-weight:700;color:#64748b;display:flex;gap:6px;align-items:center}
.rt-visita-fecha em{font-style:normal;font-weight:600;color:#94a3b8}
.rt-visita-t{font-size:.86rem;font-weight:800;color:#0f172a;margin:3px 0 2px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.rt-visita-m{font-size:.7rem;color:#94a3b8;font-variant-numeric:tabular-nums}
.rt-tag{font-size:.6rem;font-weight:800;letter-spacing:.04em;padding:2px 6px;border-radius:5px}
.rt-fotos{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.rt-foto{position:relative;aspect-ratio:3/4;border-radius:8px;overflow:hidden;cursor:zoom-in;border:none;padding:0;
  background:linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);background-size:200% 100%;animation:rt-brillo 1.2s linear infinite}
.rt-foto img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .3s,transform .3s}
.rt-foto img.rt-lista{opacity:1}
.rt-foto:hover img{transform:scale(1.06)}
.rt-foto.rt-cargada{animation:none;background:#e2e8f0}
.rt-foto.rt-rota{animation:none;background:#f8fafc;display:flex;align-items:center;justify-content:center;color:#cbd5e1;cursor:default}
.rt-foto-mas{position:absolute;inset:0;background:rgba(15,23,42,.55);color:#fff;font-weight:800;font-size:1rem;display:flex;
  align-items:center;justify-content:center}
.rt-vacio{text-align:center;color:#94a3b8;padding:22px 10px;font-size:.8rem}
.rt-vacio i{font-size:2rem;margin-bottom:8px;display:block;color:#cbd5e1}
.rt-nota{font-size:.68rem;color:#94a3b8;margin-top:10px;line-height:1.5}
.rt-esq{border-radius:8px;background:linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%);background-size:200% 100%;animation:rt-brillo 1.2s linear infinite}
@keyframes rt-brillo{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes rt-entrar{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

.rt-pin{position:relative;width:38px;height:50px}
.rt-pin-cuerpo{position:absolute;left:2px;top:0;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
  border:3px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center}
.rt-pin-cuerpo i{transform:rotate(45deg);color:#fff;font-size:.85rem}
.rt-pin-pulso{position:absolute;left:50%;bottom:0;width:18px;height:8px;margin-left:-9px;border-radius:50%;animation:rt-pulso 1.8s ease-out infinite}
@keyframes rt-pulso{0%{transform:scale(.5);opacity:.9}100%{transform:scale(3.4);opacity:0}}
.rt-pin-etq{background:#0f172a;color:#fff;border:none;border-radius:6px;font-weight:800;font-size:.72rem;padding:3px 7px;
  box-shadow:0 4px 10px rgba(15,23,42,.3);font-variant-numeric:tabular-nums}
.rt-pin-etq::before{border-top-color:#0f172a!important}
.rt-dist-etq{background:#fff;border:1px solid #cbd5e1;color:#334155;font-weight:700;font-size:.68rem;border-radius:6px;padding:2px 6px}

.rt-visor{position:fixed;inset:0;z-index:5000;background:rgba(2,6,23,.97);display:flex;flex-direction:column;color:#e2e8f0;
  animation:rt-aparecer .2s ease}
@keyframes rt-aparecer{from{opacity:0}to{opacity:1}}
.rt-visor-cab{display:flex;align-items:center;gap:12px;padding:12px 18px}
.rt-visor-t{flex:1;min-width:0}
.rt-visor-t b{display:block;font-size:.95rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-visor-t span{font-size:.75rem;color:#94a3b8}
.rt-visor-cont{font-size:.78rem;color:#cbd5e1;font-variant-numeric:tabular-nums;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.08)}
.rt-visor-btn{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);
  color:#e2e8f0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;transition:background .15s}
.rt-visor-btn:hover{background:rgba(255,255,255,.16);color:#fff}
.rt-visor-escena{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;user-select:none}
.rt-visor-escena img{max-width:92%;max-height:100%;object-fit:contain;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,.5);
  transition:transform .25s ease,opacity .2s;cursor:zoom-in}
.rt-visor-escena img.rt-zoom{cursor:grab;transition:opacity .2s}
.rt-visor-flecha{position:absolute;top:50%;margin-top:-26px;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;
  background:rgba(255,255,255,.1);color:#fff;font-size:1.1rem;display:flex;align-items:center;justify-content:center;transition:background .15s}
.rt-visor-flecha:hover{background:rgba(255,255,255,.22)}
.rt-visor-flecha.rt-izq{left:18px}.rt-visor-flecha.rt-der{right:18px}
.rt-visor-tira{display:flex;gap:6px;padding:10px 18px 14px;overflow-x:auto;scrollbar-width:thin}
.rt-visor-mini{flex-shrink:0;width:54px;height:72px;border-radius:6px;overflow:hidden;opacity:.45;cursor:pointer;border:2px solid transparent;
  padding:0;background:#1e293b;transition:opacity .15s}
.rt-visor-mini:hover{opacity:.8}
.rt-visor-mini.rt-on{opacity:1;border-color:#60a5fa}
.rt-visor-mini img{width:100%;height:100%;object-fit:cover;display:block}
.rt-visor-sep{flex-shrink:0;align-self:center;font-size:.62rem;color:#64748b;writing-mode:vertical-rl;transform:rotate(180deg);padding:0 2px}
.rt-foto-check{position:absolute;top:6px;left:6px;width:24px;height:24px;border-radius:50%;border:2px solid #fff;
  background:rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;color:transparent;font-size:.66rem;
  opacity:0;transition:all .15s;z-index:2;box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer}
.rt-foto-check:hover{transform:scale(1.12);background:rgba(15,23,42,.55)}
.rt-foto:hover .rt-foto-check,.rt-ficha.rt-con-seleccion .rt-foto-check{opacity:1}
.rt-foto.rt-elegida{box-shadow:inset 0 0 0 3px #25d366}
.rt-foto.rt-elegida img{transform:scale(.92);border-radius:6px}
.rt-foto.rt-elegida .rt-foto-check{opacity:1;background:#25d366;border-color:#fff;color:#fff}
.rt-visita-sel{margin-left:auto;font-size:.68rem;font-weight:700;color:#2563eb;background:none;border:none;cursor:pointer;padding:0 2px}
.rt-visita-sel:hover{text-decoration:underline}
.rt-visita-pie{display:flex;align-items:center;gap:8px}
.rt-sel-barra{position:absolute;left:14px;right:14px;bottom:14px;background:#0f172a;color:#fff;border-radius:14px;padding:10px 10px 10px 14px;
  display:flex;align-items:center;gap:8px;box-shadow:0 14px 34px rgba(15,23,42,.38);transform:translateY(150%);
  transition:transform .25s cubic-bezier(.2,.8,.2,1);z-index:5}
.rt-sel-barra.rt-visible{transform:none}
.rt-sel-barra .rt-sel-txt{flex:1;min-width:0}
.rt-sel-barra b{display:block;font-size:.84rem}
.rt-sel-barra small{display:block;color:#94a3b8;font-size:.68rem}
.rt-btn-wa{background:#25d366;color:#053b1d;border:none;border-radius:10px;height:38px;padding:0 14px;font-weight:800;font-size:.8rem;
  cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.rt-btn-wa i{font-size:1.1rem}
.rt-btn-wa:hover{background:#1fbe5a}
.rt-btn-osc{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:10px;height:38px;min-width:38px;
  padding:0 11px;font-weight:700;font-size:.76rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.rt-btn-osc:hover{background:rgba(255,255,255,.2)}
.rt-ficha.rt-con-barra .rt-ficha-cuerpo{padding-bottom:96px}
.rt-visor-sel{background:rgba(37,211,102,.12)!important;border-color:rgba(37,211,102,.5)!important}
.rt-visor-sel.rt-on{background:#25d366!important;color:#053b1d!important;border-color:#25d366!important}
.rt-visor-enviar{height:38px;border-radius:10px;border:none;background:#25d366;color:#053b1d;font-weight:800;font-size:.8rem;padding:0 12px;
  cursor:pointer;display:none;align-items:center;gap:7px}
.rt-visor-enviar.rt-visible{display:inline-flex}
.rt-visor-mini{position:relative}
.rt-visor-mini.rt-elegida::after{content:"\\f00c";font-family:"Font Awesome 6 Free","Font Awesome 5 Free";font-weight:900;position:absolute;
  top:3px;right:3px;width:16px;height:16px;border-radius:50%;background:#25d366;color:#fff;font-size:.55rem;display:flex;
  align-items:center;justify-content:center}
.rt-modal-wa{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:6000;display:flex;align-items:center;justify-content:center;
  animation:rt-aparecer .2s ease}
.rt-modal-wa-caja{background:#fff;border-radius:16px;width:min(540px,94vw);max-height:92vh;display:flex;flex-direction:column;
  box-shadow:0 30px 80px rgba(15,23,42,.35);overflow:hidden}
.rt-modal-wa-cab{background:#25d366;color:#053b1d;padding:16px 18px;display:flex;align-items:center;gap:12px}
.rt-modal-wa-cab i{font-size:1.9rem}
.rt-modal-wa-cab b{display:block;font-size:1.02rem}
.rt-modal-wa-cab span{font-size:.76rem;opacity:.85}
.rt-modal-wa-cuerpo{padding:6px 18px 10px;overflow-y:auto}
.rt-paso{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9}
.rt-paso:last-child{border-bottom:none}
.rt-paso-n{width:28px;height:28px;border-radius:50%;background:#e2e8f0;color:#475569;font-weight:800;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;font-size:.8rem;transition:all .2s}
.rt-paso.rt-hecho .rt-paso-n{background:#25d366;color:#fff}
.rt-paso-c{flex:1;min-width:0}
.rt-paso-c b{display:block;font-size:.86rem;color:#0f172a}
.rt-paso-c span{display:block;font-size:.76rem;color:#64748b;line-height:1.5;margin-top:2px}
.rt-paso-c kbd{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;padding:0 5px;font-size:.7rem;color:#0f172a}
.rt-miniaturas{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.rt-miniaturas img{width:44px;height:58px;object-fit:cover;border-radius:6px;background:#e2e8f0}
.rt-texto-wa{margin-top:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:8px 10px;font-size:.76rem;color:#14532d;font-family:inherit;line-height:1.5;
  white-space:pre-wrap;max-height:130px;overflow:auto}
.rt-modal-wa-pie{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;background:#f8fafc;border-top:1px solid #eef2f7;flex-wrap:wrap}
.rt-aviso-flot{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#0f172a;color:#fff;border-radius:10px;
  padding:10px 16px;font-size:.8rem;font-weight:600;z-index:7000;box-shadow:0 10px 30px rgba(15,23,42,.35);animation:rt-aparecer .2s}
.rt-inicio-busca{display:flex;align-items:center;gap:12px;border:1px solid #e2e8f0;border-radius:10px;padding:11px 12px;background:#fff;
  cursor:pointer;text-align:left;width:100%;font:inherit;transition:all .15s}
.rt-inicio-busca:hover{border-color:#93c5fd;background:#f8fbff}
.rt-inicio-busca i{width:34px;height:34px;border-radius:9px;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rt-inicio-busca b{display:block;color:#1e293b;font-size:.85rem}
.rt-inicio-busca span{display:block;color:#64748b;font-size:.74rem;margin-top:1px}
`;
    function ponerEstilos() {
        if (document.getElementById('rt-consulta-css')) return;
        const st = document.createElement('style');
        st.id = 'rt-consulta-css';
        st.textContent = CSS;
        document.head.appendChild(st);
    }

    // ------------------------------------------------------------- utiles
    const el = (tag, attrs, hijos) => A._el(tag, attrs, hijos);
    const icono = (clases, estilo) => el('i', { class: 'fas ' + clases, style: estilo || '', 'aria-hidden': 'true' });

    function capitalizar(t) {
        t = String(t || '').trim().toLowerCase();
        return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
    }
    function aFecha(txt) {               // "2025-05-03 16:16" (hora de Lima) -> Date local
        const m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?/.exec(txt || '');
        return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : null;
    }
    function textoFecha(v) {
        const f = aFecha(v.fecha);
        if (!f) return 'Sin fecha';
        if (v.precision === 'mes') {
            return capitalizar(f.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }));
        }
        const dia = f.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
        const hora = f.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' });
        return dia.replace('.', '') + ' · ' + hora;
    }
    function hace(txt) {
        const f = aFecha(txt);
        if (!f || typeof Intl.RelativeTimeFormat === 'undefined') return '';
        const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
        const dias = Math.round((f - new Date()) / 86400000);
        if (Math.abs(dias) < 30) return rtf.format(dias, 'day');
        const meses = Math.round(dias / 30.4);
        if (Math.abs(meses) < 12) return rtf.format(meses, 'month');
        return rtf.format(Math.round(dias / 365), 'year');
    }
    function tituloVisita(v) {
        let t = String(v.leyenda || '');
        if (v.supervision) t = t.replace(/^SUP\s+/i, '');
        return v.categoria === 'lecturas' ? t : capitalizar(t);
    }
    function recientes() {
        try { return JSON.parse(localStorage.getItem(CLAVE_RECIENTES) || '[]').slice(0, 8); }
        catch (e) { return []; }
    }
    function guardarReciente(s, loc) {
        try {
            const l = recientes().filter((x) => x.s !== s);
            l.unshift({ s: s, loc: loc || '', t: Date.now() });
            localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(l.slice(0, 8)));
        } catch (e) { /* sin almacenamiento: no pasa nada */ }
    }
    function copiar(texto, boton) {
        const ok = () => {
            if (!boton) return;
            const previo = boton.innerHTML;
            boton.innerHTML = '<i class="fas fa-check" style="color:#16a34a"></i>';
            setTimeout(() => { boton.innerHTML = previo; }, 1200);
        };
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(texto).then(() => { ok(); return true; }, () => false);
        }
        const t = document.createElement('textarea');
        t.value = texto;
        t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select();
        let hecho = false;
        try { hecho = document.execCommand('copy'); if (hecho) ok(); } catch (e) { }
        t.remove();
        return Promise.resolve(hecho);
    }
    function avisar(texto) {
        const v = document.querySelector('.rt-aviso-flot');
        if (v) v.remove();
        const d = document.createElement('div');
        d.className = 'rt-aviso-flot';
        d.textContent = texto;
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 2600);
    }
    function slug(t) {
        return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'foto';
    }
    const MAX_SELECCION = 30;

    // ------------------------------------------------------ buscador (cabecera)
    A._montarBuscador = function () {
        if (document.getElementById('rt-busq')) return;
        const cab = document.querySelector('#rutas .rt-header');
        if (!cab) return;
        ponerEstilos();
        const botones = cab.lastElementChild;
        const input = el('input', {
            id: 'rt-busq-input', type: 'search', inputmode: 'numeric', autocomplete: 'off',
            maxlength: '15', placeholder: 'Buscar suministro', 'aria-label': 'Buscar suministro'
        });
        const menu = el('div', { class: 'rt-busq-menu', id: 'rt-busq-menu', role: 'listbox' });
        const msg = el('div', { class: 'rt-busq-msg', id: 'rt-busq-msg' });
        const caja = el('div', { class: 'rt-busq-caja', id: 'rt-busq-caja' }, [
            icono('fa-search'), input,
            el('span', { class: 'rt-busq-tecla', title: 'Atajo: tecla /', text: '/' }),
            el('button', { type: 'button', class: 'rt-busq-ir', title: 'Buscar', 'aria-label': 'Buscar',
                           onclick: () => this.buscarSuministro(input.value) }, [icono('fa-arrow-right', 'font-size:.75rem')])
        ]);
        const cont = el('div', { class: 'rt-busq', id: 'rt-busq' }, [caja, menu, msg]);
        if (botones && botones.style) botones.insertBefore(cont, botones.firstChild);
        else cab.appendChild(cont);

        let activo = -1;
        const pintarMenu = () => {
            const l = recientes();
            menu.innerHTML = '';
            activo = -1;
            if (!l.length) { menu.classList.remove('rt-abierto'); return; }
            menu.appendChild(el('h6', { text: 'BÚSQUEDAS RECIENTES' }));
            l.forEach((r) => {
                menu.appendChild(el('div', {
                    class: 'rt-busq-op', role: 'option', 'data-s': r.s,
                    onmousedown: (ev) => { ev.preventDefault(); input.value = r.s; this.buscarSuministro(r.s); }
                }, [icono('fa-history', 'color:#94a3b8'), el('b', { text: r.s }),
                    r.loc ? el('small', { text: r.loc, style: 'color:#64748b' }) : null,
                    el('span', { text: hace(new Date(r.t).toISOString().slice(0, 10)) })]));
            });
            menu.classList.add('rt-abierto');
        };
        input.addEventListener('focus', () => { if (!input.value) pintarMenu(); });
        input.addEventListener('blur', () => setTimeout(() => menu.classList.remove('rt-abierto'), 120));
        input.addEventListener('input', () => {
            const limpio = input.value.replace(/\D/g, '');
            if (limpio !== input.value) input.value = limpio;
            caja.classList.remove('rt-error'); msg.textContent = '';
            if (input.value) menu.classList.remove('rt-abierto'); else pintarMenu();
        });
        input.addEventListener('keydown', (ev) => {
            const ops = menu.querySelectorAll('.rt-busq-op');
            if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
                if (!menu.classList.contains('rt-abierto') || !ops.length) return;
                ev.preventDefault();
                activo = (activo + (ev.key === 'ArrowDown' ? 1 : -1) + ops.length) % ops.length;
                ops.forEach((o, i) => o.classList.toggle('rt-activo', i === activo));
            } else if (ev.key === 'Enter') {
                ev.preventDefault();
                if (activo >= 0 && ops[activo]) input.value = ops[activo].getAttribute('data-s');
                menu.classList.remove('rt-abierto');
                this.buscarSuministro(input.value);
            } else if (ev.key === 'Escape') {
                menu.classList.remove('rt-abierto'); input.blur();
            }
        });
        // Atajo "/" mientras se está en Rutas
        document.addEventListener('keydown', (ev) => {
            if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
            const t = ev.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
            const sec = document.getElementById('rutas');
            if (!sec || !sec.offsetParent) return;
            ev.preventDefault();
            input.focus();
        });
    };

    A._errorBusqueda = function (texto) {
        const caja = document.getElementById('rt-busq-caja');
        const msg = document.getElementById('rt-busq-msg');
        if (caja) { caja.classList.remove('rt-error'); void caja.offsetWidth; caja.classList.add('rt-error'); }
        if (msg) msg.textContent = texto;
    };

    // ------------------------------------------------------------ búsqueda
    A.buscarSuministro = async function (valor) {
        const s = String(valor || '').replace(/\D/g, '');
        if (s.length < 4) { this._errorBusqueda('Escribe el número de suministro (solo dígitos).'); return; }
        const input = document.getElementById('rt-busq-input');
        if (input) { input.value = s; input.blur(); }
        const pedido = (this._consultaPedido || 0) + 1;
        this._consultaPedido = pedido;
        this._abrirFicha(s);
        this._fichaCargando(s);
        try {
            const resp = await fetch('/api/rutas/consulta_suministro', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suministro: s })
            });
            const data = await resp.json().catch(() => ({}));
            if (pedido !== this._consultaPedido) return;            // llegó otra búsqueda después
            if (resp.status === 401) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
            if (!resp.ok || !data.success) throw new Error(data.error || ('Error ' + resp.status));
            this._consulta = data;
            this._consultaFiltro = 'todo';
            this._sel = new Map();
            guardarReciente(s, (data.datos || {}).localidad);
            this._pintarConsultaMapa(data);
            this._pintarFicha(data);
        } catch (err) {
            if (pedido !== this._consultaPedido) return;
            this._fichaError(s, err.message || 'No se pudo consultar el suministro.');
        }
    };

    // --------------------------------------------------------------- mapa
    A._capaDeConsulta = function () {
        if (!this.map) return null;
        if (!this._capaConsulta) this._capaConsulta = L.layerGroup().addTo(this.map);
        return this._capaConsulta;
    };

    A._pinConsulta = function (origen, numero) {
        const o = ORIGENES[origen] || ORIGENES.catastro;
        return L.marker([0, 0], {
            zIndexOffset: 1000, title: 'Suministro ' + numero,
            icon: L.divIcon({
                className: '', iconSize: [38, 50], iconAnchor: [19, 48], tooltipAnchor: [0, -46],
                html: '<div class="rt-pin"><div class="rt-pin-pulso" style="background:' + o.color + '55"></div>' +
                      '<div class="rt-pin-cuerpo" style="background:' + o.color + '"><i class="fas fa-home"></i></div></div>'
            })
        });
    };

    A._pintarConsultaMapa = function (data) {
        const lista = data.ubicaciones || [];
        const preparar = () => {
            if (!this.inicializarMapa || !this.inicializarMapa()) return;
            const capa = this._capaDeConsulta();
            if (!capa) return;
            capa.clearLayers();
            if (!lista.length) return;
            const prin = lista[0];
            const pPrin = [prin.lat, prin.lon];
            const bounds = [pPrin];
            lista.slice(1).forEach((p) => {
                const o = ORIGENES[p.origen] || ORIGENES.catastro;
                const pos = [p.lat, p.lon];
                if (p.distancia_m < 3) return;
                bounds.push(pos);
                L.polyline([pPrin, pos], { color: o.color, weight: 2, dashArray: '6,6', opacity: 0.8 }).addTo(capa);
                L.circleMarker(pos, { radius: 7, color: '#fff', weight: 2, fillColor: o.color, fillOpacity: 1 })
                    .bindTooltip(o.corto + ' · ' + this._distanciaTxt(p.distancia_m),
                                 { permanent: true, direction: 'right', className: 'rt-dist-etq', offset: [8, 0] })
                    .addTo(capa);
            });
            const pin = this._pinConsulta(prin.origen, data.suministro).setLatLng(pPrin);
            pin.bindTooltip(data.suministro, { permanent: true, direction: 'top', className: 'rt-pin-etq' });
            pin.on('click', () => this._abrirFicha(data.suministro, true));
            pin.addTo(capa);

            const ficha = document.getElementById('rt-ficha');
            const ancho = ficha && ficha.classList.contains('rt-abierta') ? ficha.offsetWidth : 0;
            this.map.invalidateSize();
            const lejos = bounds.length > 1 && lista.some((p) => p.distancia_m > 250);
            if (lejos) {
                this.map.fitBounds(L.latLngBounds(bounds),
                                   { paddingTopLeft: [50, 60], paddingBottomRight: [ancho + 50, 50], maxZoom: 18 });
            } else {
                this.map.setView(pPrin, 18, { animate: false });
                if (ancho) this.map.panBy([ancho / 2, 0], { animate: false });
            }
        };
        // si el panel del mapa se está abriendo, se espera a que termine
        setTimeout(preparar, this._panelRecienAbierto ? 430 : 0);
    };

    A._distanciaTxt = function (m) {
        return m >= 1000 ? (Math.round(m / 100) / 10) + ' km' : m + ' m';
    };

    A._centrarConsulta = function (idx) {
        const d = this._consulta;
        if (!d || !this.map) return;
        const p = (d.ubicaciones || [])[idx || 0];
        if (!p) return;
        const ficha = document.getElementById('rt-ficha');
        const ancho = ficha && ficha.classList.contains('rt-abierta') ? ficha.offsetWidth : 0;
        this.map.setView([p.lat, p.lon], 18);
        if (ancho) this.map.panBy([ancho / 2, 0]);
    };

    // -------------------------------------------------------------- ficha
    A._abrirFicha = function (s, soloMostrar) {
        ponerEstilos();
        const der = document.querySelector('.rt-panel-der');
        if (!der) return;
        der.style.position = 'relative';
        const layout = document.getElementById('rt-layout');
        this._panelRecienAbierto = !(layout && layout.classList.contains('rt-open'));
        if (this._panelRecienAbierto) this._abrirPanel();
        // Desde la pantalla de inicio, el panel "Empieza aquí" no aporta nada a
        // la consulta: se esconde y el mapa ocupa todo el ancho.
        if (this._enInicio && !this._modoConsulta) {
            this._ponerModoConsulta(true);
            this._panelRecienAbierto = true;           // esperar a que el mapa se ensanche
        }
        if (!this._rutaActiva) {
            const t = document.getElementById('rt-detalle-titulo');
            const sub = document.getElementById('rt-detalle-sub');
            if (t) t.textContent = 'Consulta de suministro';
            if (sub) sub.textContent = 'Ubicación e historial de fotos del predio';
        }
        let ficha = document.getElementById('rt-ficha');
        if (!ficha) {
            ficha = el('aside', { id: 'rt-ficha', class: 'rt-ficha', role: 'dialog', 'aria-label': 'Ficha del suministro' });
            der.appendChild(ficha);
        }
        // el ancho se calcula con el panel ya en su tamaño final
        setTimeout(() => this._aplicarAnchoFicha(), this._panelRecienAbierto ? 430 : 0);
        requestAnimationFrame(() => ficha.classList.add('rt-abierta'));
        if (soloMostrar && this._consulta && this._consulta.suministro === s) return;
    };

    A._ponerModoConsulta = function (activo) {
        const izq = document.querySelector('.rt-panel-izq');
        const der = document.querySelector('.rt-panel-der');
        this._modoConsulta = !!activo;
        if (!izq || !der) return;
        if (activo) {
            izq.style.width = '0%';
            izq.style.minWidth = '0';
            izq.style.overflow = 'hidden';
            izq.style.borderRight = 'none';
            der.style.width = '100%';
        } else {
            izq.style.overflow = '';
            izq.style.minWidth = '';
        }
    };

    // ------------------------------------------------ ancho de la ficha
    A._anchoPanelMapa = function () {
        const der = document.querySelector('.rt-panel-der');
        return der ? der.getBoundingClientRect().width : 0;
    };

    A._anchoFichaDeseado = function () {
        const panel = this._anchoPanelMapa();
        let guardado = null;
        try { guardado = localStorage.getItem(CLAVE_ANCHO); } catch (e) { }
        let w;
        if (guardado === 'amplio') w = panel * ANCHO_AMPLIO;
        else if (guardado && !isNaN(+guardado)) w = +guardado;
        else w = Math.min(760, Math.max(520, panel * 0.42));       // por defecto
        return Math.round(Math.max(ANCHO_MIN, Math.min(w, panel * ANCHO_MAX)));
    };

    A._aplicarAnchoFicha = function (w, guardar) {
        const ficha = document.getElementById('rt-ficha');
        if (!ficha) return;
        const panel = this._anchoPanelMapa();
        if (!panel) return;
        w = Math.round(Math.max(ANCHO_MIN, Math.min(w || this._anchoFichaDeseado(), panel * ANCHO_MAX)));
        const cambio = Math.abs((this._anchoFicha || 0) - w) > 2;
        ficha.style.width = w + 'px';
        this._anchoFicha = w;
        this._iconoAncho();
        if (guardar) {
            try { localStorage.setItem(CLAVE_ANCHO, guardar === 'amplio' ? 'amplio' : String(w)); } catch (e) { }
        }
        if (cambio && this._consulta) this._repintarFotos();
    };

    A._esAmplia = function () {
        const panel = this._anchoPanelMapa();
        return !!(panel && this._anchoFicha && this._anchoFicha >= panel * (ANCHO_AMPLIO - 0.04));
    };

    A._iconoAncho = function () {
        const btn = document.getElementById('rt-ficha-ampliar');
        if (!btn) return;
        const amplia = this._esAmplia();
        btn.innerHTML = amplia ? '<i class="fas fa-compress-alt"></i>' : '<i class="fas fa-expand-alt"></i>';
        btn.title = amplia ? 'Reducir la ficha' : 'Ampliar la ficha';
    };

    A.alternarAnchoFicha = function () {
        const ficha = document.getElementById('rt-ficha');
        const panel = this._anchoPanelMapa();
        if (!ficha || !panel) return;
        if (this._esAmplia()) {
            try { localStorage.removeItem(CLAVE_ANCHO); } catch (e) { }
            this._aplicarAnchoFicha(null, false);
        } else {
            this._aplicarAnchoFicha(panel * ANCHO_AMPLIO, 'amplio');
        }
        setTimeout(() => this._recentrarConsulta(), 300);
    };

    // Asa en el borde izquierdo de la ficha para arrastrar su ancho
    A._asaFicha = function () {
        const asa = el('div', { class: 'rt-ficha-asa', title: 'Arrastra para cambiar el ancho',
                                role: 'separator', 'aria-orientation': 'vertical' }, [el('span')]);
        asa.addEventListener('mousedown', (ev) => {
            ev.preventDefault();
            const der = document.querySelector('.rt-panel-der');
            const ficha = document.getElementById('rt-ficha');
            if (!der || !ficha) return;
            const derecha = der.getBoundingClientRect().right;
            ficha.style.transition = 'none';
            asa.classList.add('rt-moviendo');
            document.body.classList.add('rt-redimensionando');
            const mover = (e) => {
                const w = Math.max(ANCHO_MIN, Math.min(derecha - e.clientX, this._anchoPanelMapa() * ANCHO_MAX));
                ficha.style.width = Math.round(w) + 'px';
            };
            const soltar = () => {
                document.removeEventListener('mousemove', mover);
                document.removeEventListener('mouseup', soltar);
                asa.classList.remove('rt-moviendo');
                document.body.classList.remove('rt-redimensionando');
                ficha.style.transition = '';
                this._aplicarAnchoFicha(ficha.offsetWidth, true);
                this._recentrarConsulta();
            };
            document.addEventListener('mousemove', mover);
            document.addEventListener('mouseup', soltar);
        });
        asa.addEventListener('dblclick', () => this.alternarAnchoFicha());
        return asa;
    };

    // Vuelve a poner el pin a la vista, en el espacio libre que deja la ficha
    A._recentrarConsulta = function () {
        if (!this.map || !this._consulta || !(this._consulta.ubicaciones || []).length) return;
        const ficha = document.getElementById('rt-ficha');
        const ancho = ficha && ficha.classList.contains('rt-abierta') ? ficha.offsetWidth : 0;
        const p = this._consulta.ubicaciones[0];
        this.map.setView([p.lat, p.lon], this.map.getZoom(), { animate: false });
        if (ancho) this.map.panBy([ancho / 2, 0], { animate: true });
    };

    A._repintarFotos = function () {
        const cont = document.getElementById('rt-linea-fotos');
        if (cont && this._consulta) this._pintarLinea(cont, this._consulta);
    };

    // Cuántas fotos por visita caben en una fila con el ancho actual
    A._fotosPorFila = function () {
        const w = this._anchoFicha || 560;
        const util = w - 36 - 22 - 24;               // márgenes de la ficha, línea y tarjeta
        return Math.max(3, Math.min(8, Math.floor((util + 6) / (104 + 6))));
    };

    A.cerrarConsulta = function () {
        const ficha = document.getElementById('rt-ficha');
        if (ficha) ficha.classList.remove('rt-abierta');
        if (this._capaConsulta) this._capaConsulta.clearLayers();
        this._consulta = null;
        this._consultaPedido = (this._consultaPedido || 0) + 1;
        if (this._modoConsulta) this._ponerModoConsulta(false);
        if (!this._rutaActiva) {
            if (this._hayResultado && this._hayResultado()) this.cerrarDetalle();
            else if (this.mostrarInicio) this.mostrarInicio();
        }
    };

    A._cabeceraFicha = function (s, chips) {
        const btnCopiar = el('button', { type: 'button', class: 'rt-ficha-ico', title: 'Copiar número' }, [icono('fa-copy')]);
        btnCopiar.addEventListener('click', () => copiar(s, btnCopiar));
        return el('div', { class: 'rt-ficha-cab' }, [
            el('div', { class: 'rt-ficha-sobre', text: 'SUMINISTRO' }),
            el('div', { class: 'rt-ficha-num' }, [el('strong', { text: s }), btnCopiar]),
            chips ? el('div', { class: 'rt-chips' }, chips) : null,
            el('button', { type: 'button', class: 'rt-ficha-ico rt-ficha-ampliar', id: 'rt-ficha-ampliar',
                           title: 'Ampliar la ficha', 'aria-label': 'Ampliar o reducir la ficha',
                           onclick: () => this.alternarAnchoFicha() }, [icono('fa-expand-alt')]),
            el('button', { type: 'button', class: 'rt-ficha-ico rt-ficha-cerrar', title: 'Cerrar (Esc)',
                           'aria-label': 'Cerrar', onclick: () => this.cerrarConsulta() }, [icono('fa-times')])
        ]);
    };

    A._fichaCargando = function (s) {
        const ficha = document.getElementById('rt-ficha');
        if (!ficha) return;
        ficha.innerHTML = '';
        const esq = (w, h, extra) => el('div', { class: 'rt-esq', style: 'width:' + w + ';height:' + h + 'px;' + (extra || '') });
        const cuerpo = el('div', { class: 'rt-ficha-cuerpo' }, [
            esq('70%', 18), esq('45%', 12, 'margin-top:8px'),
            el('div', { class: 'rt-datos' }, [esq('100%', 44), esq('100%', 44), esq('100%', 44), esq('100%', 44)]),
            esq('100%', 36, 'margin-top:14px'),
            el('div', { class: 'rt-stats', style: 'margin-top:22px' }, [esq('100%', 50), esq('100%', 50), esq('100%', 50)]),
            esq('100%', 120, 'margin-top:6px'), esq('100%', 120, 'margin-top:10px')
        ]);
        ficha.appendChild(this._asaFicha());
        ficha.appendChild(this._cabeceraFicha(s, [el('span', { class: 'rt-chip', style: 'background:#f1f5f9;color:#64748b' },
            [icono('fa-circle-notch fa-spin'), 'Buscando ubicación y fotos…'])]));
        ficha.appendChild(cuerpo);
    };

    A._fichaError = function (s, texto) {
        const ficha = document.getElementById('rt-ficha');
        if (!ficha) return;
        ficha.innerHTML = '';
        ficha.appendChild(this._asaFicha());
        ficha.appendChild(this._cabeceraFicha(s));
        ficha.appendChild(el('div', { class: 'rt-ficha-cuerpo' }, [
            el('div', { class: 'rt-vacio' }, [icono('fa-exclamation-triangle', 'color:#f59e0b'),
                el('div', { text: texto, style: 'color:#475569;font-weight:600' })]),
            el('div', { class: 'rt-acciones' }, [el('button', {
                type: 'button', class: 'rt-accion rt-prim', onclick: () => this.buscarSuministro(s)
            }, [icono('fa-redo'), 'Intentar de nuevo'])])
        ]));
    };

    A._enRuteo = function (s) {
        const sin0 = s.replace(/^0+/, '');
        for (let i = 0; i < (this.datosRutas || []).length; i++) {
            const ruta = this.datosRutas[i];
            const regs = ruta.registros || [];
            for (let j = 0; j < regs.length; j++) {
                const r = String(regs[j].suministro || '').trim();
                if (r === s || r.replace(/^0+/, '') === sin0) {
                    return { ruta: ruta, item: regs[j], color: this.COLORES[i % this.COLORES.length], total: regs.length };
                }
            }
        }
        return null;
    };

    A._pintarFicha = function (data) {
        const ficha = document.getElementById('rt-ficha');
        if (!ficha) return;
        const s = data.suministro;
        const d = data.datos || {};
        const ubic = data.ubicaciones || [];
        const prin = ubic[0];
        const o = prin ? ORIGENES[prin.origen] || ORIGENES.catastro : null;

        const chips = [];
        if (o) {
            chips.push(el('span', { class: 'rt-chip', style: 'background:' + o.color + '14;color:' + o.color + ';border-color:' + o.color + '33' },
                [icono(o.icono), o.nombre]));
        } else {
            chips.push(el('span', { class: 'rt-chip', style: 'background:#fffbeb;color:#b45309;border-color:#fde68a' },
                [icono('fa-question-circle'), 'Sin ubicación registrada']));
        }
        if (d.localidad) {
            chips.push(el('span', { class: 'rt-chip', style: 'background:#f1f5f9;color:#475569' },
                [icono('fa-map-pin'), capitalizar(d.localidad)]));
        }

        ficha.innerHTML = '';
        ficha.appendChild(this._asaFicha());
        ficha.appendChild(this._cabeceraFicha(s, chips));
        this._iconoAncho();
        const cuerpo = el('div', { class: 'rt-ficha-cuerpo' });
        ficha.appendChild(cuerpo);

        // --- dónde está
        const sec = el('div', { class: 'rt-sec' }, [el('div', { class: 'rt-sec-t', text: 'UBICACIÓN' })]);
        const direccion = [d.calle, d.numero].filter(Boolean).join(' ');
        sec.appendChild(el('div', { class: 'rt-dir', text: direccion || 'Dirección no registrada en catastro' }));
        const sub = [d.urbanizacion, d.localidad].filter(Boolean).map(capitalizar).join(' · ');
        if (sub) sec.appendChild(el('div', { class: 'rt-dir-sub', text: sub }));

        const datos = [];
        if (d.titular) datos.push(['TITULAR', d.titular]);
        if (d.medidor) datos.push(['MEDIDOR', d.medidor]);
        if (d.ciclo) datos.push(['CICLO', d.ciclo]);
        const sml = [d.sector && ('Sec. ' + d.sector), d.manzana && ('Mz. ' + d.manzana), d.lote && ('Lt. ' + d.lote)].filter(Boolean);
        if (sml.length) datos.push(['SECTOR · MZ · LOTE', sml.join(' · ')]);
        if (datos.length) {
            sec.appendChild(el('div', { class: 'rt-datos' }, datos.map((x) =>
                el('div', { class: 'rt-dato', title: String(x[1]) }, [el('small', { text: x[0] }), el('span', { text: String(x[1]) })]))));
        }

        if (prin) {
            const coords = prin.lat.toFixed(6) + ', ' + prin.lon.toFixed(6);
            const btnCoords = el('button', { type: 'button', class: 'rt-accion', title: coords }, [icono('fa-copy'), 'Coordenadas']);
            btnCoords.addEventListener('click', () => copiar(coords, btnCoords));
            sec.appendChild(el('div', { class: 'rt-acciones' }, [
                el('a', { class: 'rt-accion rt-prim', target: '_blank', rel: 'noopener',
                          href: 'https://www.google.com/maps/dir/?api=1&destination=' + prin.lat + ',' + prin.lon },
                   [icono('fa-route'), 'Cómo llegar']),
                el('button', { type: 'button', class: 'rt-accion', onclick: () => this._centrarConsulta(0) },
                   [icono('fa-crosshairs'), 'Centrar']),
                btnCoords
            ]));
            if (ubic.length > 1) {
                const otras = el('div', { class: 'rt-otras' });
                ubic.forEach((p, i) => {
                    const oo = ORIGENES[p.origen] || ORIGENES.catastro;
                    otras.appendChild(el('div', { class: 'rt-otra', title: 'Ver en el mapa', onclick: () => this._centrarConsulta(i) }, [
                        el('span', { class: 'rt-punto', style: 'background:' + oo.color + ';color:' + oo.color }),
                        el('span', { text: oo.nombre + (i === 0 ? ' (la que se usa)' : '') }),
                        el('em', { text: i === 0 ? '—' : this._distanciaTxt(p.distancia_m),
                                   style: p.distancia_m > 50 ? 'color:#b45309' : 'color:#16a34a' })
                    ]));
                });
                sec.appendChild(otras);
                const lejos = ubic.slice(1).filter((p) => p.distancia_m > 50);
                if (lejos.length) {
                    const peor = lejos.reduce((a, b) => (b.distancia_m > a.distancia_m ? b : a));
                    sec.appendChild(el('div', { class: 'rt-alerta' }, [icono('fa-exclamation-triangle', 'margin-top:2px'),
                        el('span', { text: (ORIGENES[peor.origen] || {}).corto + ' ubica este predio a ' +
                            this._distanciaTxt(peor.distancia_m) + ' de ' + (o.corto || 'la ubicación principal') +
                            '. En el mapa se ven las dos.' })]));
                }
            }
        } else {
            sec.appendChild(el('div', { class: 'rt-alerta' }, [icono('fa-info-circle', 'margin-top:2px'),
                el('span', { text: 'No encontramos este suministro ni en catastro ni en el GIS de Sedalib. Igual te mostramos sus fotos.' })]));
        }
        cuerpo.appendChild(sec);

        // --- ¿está en el ruteo cargado?
        const enr = this._enRuteo(s);
        if (enr) {
            const it = enr.item;
            cuerpo.appendChild(el('div', { class: 'rt-sec' }, [
                el('div', { class: 'rt-sec-t', text: 'EN TU RUTEO' }),
                el('div', { class: 'rt-enruta' }, [
                    el('div', { class: 'rt-enruta-ico', style: 'background:' + enr.color, text: 'C' + enr.ruta.id }),
                    el('div', { style: 'flex:1;min-width:0' }, [
                        el('b', { text: 'Carga ' + enr.ruta.id + ' · visita ' + (it.orden || '?') + ' de ' + enr.total }),
                        el('span', { text: [enr.ruta.fecha, it.franja_horaria || it.hora_estimada].filter(Boolean).join(' · ') })
                    ]),
                    el('button', { type: 'button', class: 'rt-accion', style: 'flex:0 0 auto;min-width:0;padding:0 12px',
                                   onclick: () => this._irACarga(enr.ruta.id, s) }, ['Ver carga ', icono('fa-arrow-right')])
                ])
            ]));
        }

        // --- historial de fotos
        cuerpo.appendChild(this._seccionFotos(data));
        ficha.appendChild(this._barraSeleccion());
        this._actualizarSeleccion();
    };

    // ------------------------------------------------------- selección de fotos
    A._estaElegida = function (url) { return !!(this._sel && this._sel.has(url)); };

    A._alternarFoto = function (foto, visita, forzar) {
        if (!this._sel) this._sel = new Map();
        const quitar = forzar === undefined ? this._sel.has(foto.url) : !forzar;
        if (quitar) this._sel.delete(foto.url);
        else {
            if (!this._sel.has(foto.url) && this._sel.size >= MAX_SELECCION) {
                avisar('Puedes elegir hasta ' + MAX_SELECCION + ' fotos por envío.');
                return false;
            }
            this._sel.set(foto.url, { url: foto.url, archivo: foto.archivo, fecha: foto.fecha, visita: visita });
        }
        this._actualizarSeleccion();
        return true;
    };

    A._textoElegirVisita = function (v) {
        const todas = v.fotos.every((f) => this._estaElegida(f.url));
        return todas ? 'Quitar' : (v.fotos.length > 1 ? 'Elegir las ' + v.fotos.length : 'Elegir');
    };

    A._alternarVisita = function (v) {
        const todas = v.fotos.every((f) => this._estaElegida(f.url));
        for (const f of v.fotos) {
            if (!this._alternarFoto(f, v, !todas)) break;
        }
    };

    A.limpiarSeleccion = function () {
        if (this._sel) this._sel.clear();
        this._actualizarSeleccion();
    };

    A._actualizarSeleccion = function () {
        const n = this._sel ? this._sel.size : 0;
        const ficha = document.getElementById('rt-ficha');
        if (ficha) {
            ficha.classList.toggle('rt-con-seleccion', n > 0);
            ficha.classList.toggle('rt-con-barra', n > 0);
            ficha.querySelectorAll('.rt-foto[data-url]').forEach((b) => {
                const si = this._estaElegida(b.getAttribute('data-url'));
                b.classList.toggle('rt-elegida', si);
                const c = b.querySelector('.rt-foto-check');
                if (c) c.setAttribute('aria-checked', si ? 'true' : 'false');
            });
            ficha.querySelectorAll('.rt-visita-sel').forEach((btn) => {
                const v = ((this._consulta || {}).visitas || []).find((x) => String(x.id) === btn.getAttribute('data-visita'));
                if (v) btn.textContent = this._textoElegirVisita(v);
            });
        }
        const barra = document.getElementById('rt-sel-barra');
        if (barra) {
            barra.classList.toggle('rt-visible', n > 0);
            const visitas = new Set([...(this._sel || new Map()).values()].map((f) => f.visita));
            const b = barra.querySelector('b'), s = barra.querySelector('small');
            if (b) b.textContent = n + (n === 1 ? ' foto elegida' : ' fotos elegidas');
            if (s) s.textContent = visitas.size > 1 ? 'De ' + visitas.size + ' visitas distintas' : 'Lista para enviar o descargar';
        }
        if (this._visor && this._visor.refrescarSel) this._visor.refrescarSel();
    };

    A._barraSeleccion = function () {
        return el('div', { class: 'rt-sel-barra', id: 'rt-sel-barra', role: 'region', 'aria-label': 'Fotos elegidas' }, [
            el('div', { class: 'rt-sel-txt' }, [el('b'), el('small')]),
            el('button', { type: 'button', class: 'rt-btn-wa', title: 'Enviar las fotos elegidas por WhatsApp',
                           onclick: () => this.enviarPorWhatsapp() }, [el('i', { class: 'fab fa-whatsapp', 'aria-hidden': 'true' }), 'WhatsApp']),
            el('button', { type: 'button', class: 'rt-btn-osc', title: 'Descargar las fotos elegidas',
                           onclick: () => this.descargarSeleccion() }, [icono('fa-download')]),
            el('button', { type: 'button', class: 'rt-btn-osc', title: 'Quitar la selección',
                           onclick: () => this.limpiarSeleccion() }, [icono('fa-times')])
        ]);
    };

    // ---------------------------------------------------- enviar / descargar
    A._fotosElegidas = function () {
        // en el orden del historial (de la más nueva a la más vieja)
        const orden = [], vistas = new Set();
        ((this._consulta || {}).visitas || []).forEach((v) => v.fotos.forEach((f) => {
            if (this._estaElegida(f.url) && !vistas.has(f.url)) { vistas.add(f.url); orden.push(this._sel.get(f.url)); }
        }));
        return orden;
    };

    A._nombreFoto = function (f, n) {
        const s = (this._consulta || {}).suministro || 'suministro';
        const fe = f.fecha ? f.fecha.slice(0, 10)
                 : (f.visita.fecha ? f.visita.fecha.slice(0, f.visita.precision === 'mes' ? 7 : 10) : 'sin-fecha');
        return s + '_' + fe + '_' + slug(tituloVisita(f.visita)) + '_' + n + '.jpg';
    };

    A._urlDescarga = function (f, n) {
        return '/api/rutas/foto?u=' + encodeURIComponent(f.url) + '&n=' + encodeURIComponent(this._nombreFoto(f, n));
    };

    A._textoParaEnviar = function () {
        const d = this._consulta || {};
        const datos = d.datos || {};
        const p = (d.ubicaciones || [])[0];
        const lineas = ['📍 Suministro ' + d.suministro];
        const dir = [[datos.calle, datos.numero].filter(Boolean).join(' '), capitalizar(datos.localidad || '')].filter(Boolean).join(' · ');
        if (dir) lineas.push(dir);
        if (p) lineas.push('Ubicación: https://www.google.com/maps?q=' + p.lat.toFixed(6) + ',' + p.lon.toFixed(6));
        const porVisita = new Map();
        this._fotosElegidas().forEach((f) => porVisita.set(f.visita, (porVisita.get(f.visita) || 0) + 1));
        porVisita.forEach((n, v) => {
            lineas.push('📷 ' + tituloVisita(v) + (v.fecha && v.precision === 'dia' ? ' · ' + textoFecha(v).split(' · ')[0] : '') +
                        ' (' + n + (n === 1 ? ' foto)' : ' fotos)'));
        });
        return lineas.join('\n');
    };

    A._descargar = async function (fotos, alAvanzar) {
        for (let i = 0; i < fotos.length; i++) {
            const a = document.createElement('a');
            a.href = this._urlDescarga(fotos[i], i + 1);
            a.download = this._nombreFoto(fotos[i], i + 1);
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
            if (alAvanzar) alAvanzar(i + 1);
            await new Promise((r) => setTimeout(r, 400));     // el navegador no junta descargas tan seguidas
        }
    };

    A.descargarSeleccion = async function () {
        const fotos = this._fotosElegidas();
        if (!fotos.length) return;
        avisar('Descargando ' + fotos.length + (fotos.length === 1 ? ' foto…' : ' fotos…'));
        await this._descargar(fotos);
    };

    A.enviarPorWhatsapp = async function () {
        const fotos = this._fotosElegidas();
        if (!fotos.length) return;
        const texto = this._textoParaEnviar();
        // Con HTTPS el navegador puede pasar las fotos directo a WhatsApp (menú Compartir)
        if (window.isSecureContext && navigator.canShare && navigator.share) {
            try {
                avisar('Preparando las fotos…');
                const archivos = [];
                for (let i = 0; i < fotos.length; i++) {
                    const r = await fetch(this._urlDescarga(fotos[i], i + 1));
                    if (!r.ok) throw new Error('foto');
                    const blob = await r.blob();
                    archivos.push(new File([blob], this._nombreFoto(fotos[i], i + 1), { type: blob.type || 'image/jpeg' }));
                }
                if (navigator.canShare({ files: archivos })) {
                    await navigator.share({ files: archivos, text: texto });
                    return;
                }
            } catch (err) {
                if (err && err.name === 'AbortError') return;        // el usuario cerró el menú
            }
        }
        this._guiaWhatsapp(fotos, texto);
    };

    // Sin HTTPS no hay forma de pasarle archivos a WhatsApp Web desde otra página:
    // se descargan con un nombre claro y se deja el texto copiado para pegarlo.
    A._guiaWhatsapp = function (fotos, texto) {
        const viejo = document.getElementById('rt-modal-wa');
        if (viejo) viejo.remove();
        const s = (this._consulta || {}).suministro || '';
        const paso = (n, titulo, detalle, extra) => el('div', { class: 'rt-paso' }, [
            el('div', { class: 'rt-paso-n', text: String(n) }),
            el('div', { class: 'rt-paso-c' }, [el('b', { text: titulo }), detalle, extra || null])]);
        const det1 = el('span', { text: 'Se guardan en tu carpeta de Descargas con nombres que empiezan con ' + s + '_.' });
        const minis = el('div', { class: 'rt-miniaturas' }, fotos.slice(0, 12).map((f) =>
            el('img', { src: f.url, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' })));
        const p1 = paso(1, 'Descargando ' + fotos.length + (fotos.length === 1 ? ' foto' : ' fotos'), det1, minis);
        const caja = el('pre', { class: 'rt-texto-wa', text: texto });
        const btnCopiar = el('button', { type: 'button', class: 'rt-accion', style: 'flex:0 0 auto;min-width:0;margin-top:8px;padding:0 12px;height:32px' },
                             [icono('fa-copy'), 'Copiar otra vez']);
        const det2 = el('span', { text: 'Ya está copiado: en WhatsApp lo pegas con Ctrl+V como descripción.' });
        const p2 = paso(2, 'Texto con los datos del predio', det2, el('div', {}, [caja, btnCopiar]));
        const det3 = el('span');
        det3.innerHTML = 'Ve a tu pestaña de WhatsApp, abre el chat y pulsa <kbd>📎</kbd> → <b style="display:inline">Fotos y videos</b>. ' +
            'Elige las fotos descargadas y pega el texto. También puedes arrastrarlas al chat desde la lista de descargas del navegador.';
        const p3 = paso(3, 'Envíalas por WhatsApp', det3);
        const cerrar = () => { modal.remove(); document.removeEventListener('keydown', teclas, true); };
        const teclas = (ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); cerrar(); } };
        const modal = el('div', { class: 'rt-modal-wa', id: 'rt-modal-wa', role: 'dialog', 'aria-modal': 'true',
                                  'aria-label': 'Enviar fotos por WhatsApp',
                                  onclick: (ev) => { if (ev.target === modal) cerrar(); } }, [
            el('div', { class: 'rt-modal-wa-caja' }, [
                el('div', { class: 'rt-modal-wa-cab' }, [el('i', { class: 'fab fa-whatsapp', 'aria-hidden': 'true' }),
                    el('div', {}, [el('b', { text: 'Enviar por WhatsApp' }),
                                   el('span', { text: 'Suministro ' + s + ' · ' + fotos.length + (fotos.length === 1 ? ' foto' : ' fotos') })])]),
                el('div', { class: 'rt-modal-wa-cuerpo' }, [p1, p2, p3]),
                el('div', { class: 'rt-modal-wa-pie' }, [
                    el('a', { class: 'rt-accion', href: 'https://web.whatsapp.com/', target: 'whatsapp', rel: 'noopener',
                              style: 'flex:0 0 auto;min-width:0;padding:0 14px', title: 'Solo si no lo tienes abierto' },
                       [el('i', { class: 'fab fa-whatsapp', 'aria-hidden': 'true' }), 'Abrir WhatsApp Web']),
                    el('button', { type: 'button', class: 'rt-accion rt-prim', style: 'flex:0 0 auto;min-width:0;padding:0 18px',
                                   onclick: cerrar }, ['Listo'])
                ])
            ])
        ]);
        document.addEventListener('keydown', teclas, true);
        document.body.appendChild(modal);
        btnCopiar.addEventListener('click', () => copiar(texto, btnCopiar));
        copiar(texto).then((ok) => {
            if (ok) p2.classList.add('rt-hecho');
            else det2.textContent = 'Cópialo con el botón y pégalo en WhatsApp como descripción.';
        });
        this._descargar(fotos, (n) => {
            det1.textContent = n < fotos.length
                ? 'Descargando ' + n + ' de ' + fotos.length + '…'
                : 'Listo: están en tu carpeta de Descargas y empiezan con ' + s + '_.' +
                  (fotos.length > 1 ? ' Si el navegador pregunta si permites descargar varios archivos, pulsa Permitir.' : '');
            if (n >= fotos.length) p1.classList.add('rt-hecho');
        });
    };

    A._irACarga = function (id, s) {
        // la ficha se esconde para ver la carga; el pin queda y al tocarlo vuelve a abrirse
        const f = document.getElementById('rt-ficha');
        if (f) f.classList.remove('rt-abierta');
        this.abrirDetalleMapa(id);
        const ruta = this.datosRutas.find((r) => r.id === id);
        if (!ruta) return;
        const idx = (ruta.registros || []).findIndex((r) => String(r.suministro).replace(/^0+/, '') === s.replace(/^0+/, ''));
        if (idx >= 0 && this.centrarMapaEnPunto) setTimeout(() => this.centrarMapaEnPunto(idx), 450);
    };

    // ------------------------------------------------------- historial
    A._seccionFotos = function (data) {
        const sec = el('div', { class: 'rt-sec', id: 'rt-sec-fotos' });
        sec.appendChild(el('div', { class: 'rt-sec-t', text: 'HISTORIAL DE FOTOS' }));
        const visitas = data.visitas || [];
        if (data.error_fotos) {
            sec.appendChild(el('div', { class: 'rt-alerta' }, [icono('fa-exclamation-triangle'), el('span', { text: data.error_fotos })]));
            return sec;
        }
        if (!visitas.length) {
            sec.appendChild(el('div', { class: 'rt-vacio' }, [icono('fa-camera'),
                el('div', { text: 'Este suministro todavía no tiene fotos registradas.' })]));
            return sec;
        }
        const totalFotos = visitas.reduce((n, v) => n + v.fotos.length, 0);
        const conFecha = visitas.filter((v) => v.fecha);
        const ultima = conFecha.length ? conFecha[0] : null;
        sec.appendChild(el('div', { class: 'rt-stats' }, [
            el('div', { class: 'rt-stat' }, [el('b', { text: String(totalFotos) }), el('span', { text: 'FOTOS' })]),
            el('div', { class: 'rt-stat' }, [el('b', { text: String(visitas.length) }), el('span', { text: 'VISITAS' })]),
            el('div', { class: 'rt-stat', title: ultima ? textoFecha(ultima) : '' }, [
                el('b', { text: ultima ? capitalizar(hace(ultima.fecha)) || '—' : '—', style: 'font-size:.88rem;padding-top:3px' }),
                el('span', { text: 'ÚLTIMA VISITA' })])
        ]));

        // filtros por familia (solo las que hay)
        const cuenta = {};
        visitas.forEach((v) => { cuenta[v.familia] = (cuenta[v.familia] || 0) + 1; });
        const filtros = el('div', { class: 'rt-filtros', role: 'toolbar', 'aria-label': 'Filtrar fotos' });
        const hacerFiltro = (clave, nombre, n, color) => {
            const b = el('button', { type: 'button', class: 'rt-filtro' + (this._consultaFiltro === clave ? ' rt-on' : ''),
                                     'data-f': clave, onclick: () => {
                                         this._consultaFiltro = clave;
                                         filtros.querySelectorAll('.rt-filtro').forEach((x) =>
                                             x.classList.toggle('rt-on', x.getAttribute('data-f') === clave));
                                         this._pintarLinea(lista, data);
                                     } }, [
                color ? icono('fa-circle', 'color:' + color) : null, nombre, el('span', { text: ' ' + n, style: 'opacity:.6' })]);
            filtros.appendChild(b);
        };
        hacerFiltro('todo', 'Todo', visitas.length, null);
        Object.keys(FAMILIAS).forEach((k) => {
            if (cuenta[k]) hacerFiltro(k, FAMILIAS[k].nombre, cuenta[k], FAMILIAS[k].color);
        });
        if (Object.keys(cuenta).length > 1) sec.appendChild(filtros);

        const lista = el('div', { id: 'rt-linea-fotos' });
        sec.appendChild(lista);
        this._pintarLinea(lista, data);
        sec.appendChild(el('div', { class: 'rt-nota', text: 'La fecha de cada foto es la de cuando se subió al servidor de fotos. ' +
            'Las lecturas sin esa fecha se muestran con el mes de la lectura.' }));
        return sec;
    };

    A._visitasFiltradas = function (data) {
        const f = this._consultaFiltro || 'todo';
        return (data.visitas || []).filter((v) => f === 'todo' || v.familia === f);
    };

    A._pintarLinea = function (cont, data) {
        cont.innerHTML = '';
        const visitas = this._visitasFiltradas(data);
        let anio = null, linea = null, idxFoto = 0;
        visitas.forEach((v, n) => {
            const f = aFecha(v.fecha);
            const a = f ? String(f.getFullYear()) : 'Sin fecha';
            if (a !== anio) {
                anio = a;
                const enAnio = visitas.filter((x) => (aFecha(x.fecha) ? String(aFecha(x.fecha).getFullYear()) : 'Sin fecha') === a).length;
                cont.appendChild(el('div', { class: 'rt-anio' }, [a, el('span', { text: enAnio + (enAnio === 1 ? ' visita' : ' visitas') })]));
                linea = el('div', { class: 'rt-linea' });
                cont.appendChild(linea);
            }
            const fam = FAMILIAS[v.familia] || FAMILIAS.otros;
            const meta = [];
            if (v.orden) meta.push('Orden ' + v.orden);
            meta.push(v.fotos.length + (v.fotos.length === 1 ? ' foto' : ' fotos'));
            const titulo = el('div', { class: 'rt-visita-t' }, [
                icono(fam.icono, 'color:' + fam.color + ';font-size:.78rem'), tituloVisita(v),
                v.supervision ? el('span', { class: 'rt-tag', style: 'background:#fef3c7;color:#92400e', text: 'SUPERVISIÓN' }) : null
            ]);
            const MAX = this._fotosPorFila();
            const fotos = el('div', { class: 'rt-fotos', style: 'grid-template-columns:repeat(' + MAX + ',1fr)' });
            v.fotos.slice(0, MAX).forEach((foto, i) => {
                const inicio = idxFoto + i;
                const b = el('button', { type: 'button', class: 'rt-foto' + (this._estaElegida(foto.url) ? ' rt-elegida' : ''),
                                         title: 'Ver foto', 'data-url': foto.url, onclick: () => this.abrirVisor(inicio) });
                const marca = el('span', { class: 'rt-foto-check', role: 'checkbox', tabindex: '0',
                                           title: 'Elegir para enviar o descargar',
                                           'aria-checked': this._estaElegida(foto.url) ? 'true' : 'false' },
                                 [icono('fa-check')]);
                const alternar = (ev) => { ev.preventDefault(); ev.stopPropagation(); this._alternarFoto(foto, v); };
                marca.addEventListener('click', alternar);
                marca.addEventListener('keydown', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') alternar(ev); });
                b.appendChild(marca);
                const img = el('img', { src: foto.url, alt: tituloVisita(v) + ' — foto ' + (i + 1),
                                        loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
                img.addEventListener('load', () => { img.classList.add('rt-lista'); b.classList.add('rt-cargada'); });
                img.addEventListener('error', () => {
                    b.classList.add('rt-rota'); b.title = 'No se pudo cargar la foto';
                    img.remove(); marca.remove();
                    b.insertAdjacentHTML('beforeend', '<i class="fas fa-image" aria-hidden="true"></i>');
                });
                b.appendChild(img);
                if (i === MAX - 1 && v.fotos.length > MAX) {
                    b.appendChild(el('div', { class: 'rt-foto-mas', text: '+' + (v.fotos.length - MAX + 1) }));
                }
                fotos.appendChild(b);
            });
            linea.appendChild(el('div', { class: 'rt-visita', style: 'animation-delay:' + Math.min(n, 12) * 35 + 'ms' }, [
                el('span', { class: 'rt-visita-dot', style: 'background:' + fam.color }),
                el('div', { class: 'rt-visita-card' }, [
                    el('div', { class: 'rt-visita-fecha' }, [icono('fa-calendar-alt'), textoFecha(v),
                        v.fecha && v.precision === 'dia' ? el('em', { text: '· ' + hace(v.fecha) }) : null]),
                    titulo,
                    el('div', { class: 'rt-visita-pie' }, [
                        el('div', { class: 'rt-visita-m', text: meta.join(' · ') }),
                        el('button', { type: 'button', class: 'rt-visita-sel', 'data-visita': String(v.id),
                                       text: this._textoElegirVisita(v), onclick: () => this._alternarVisita(v) })
                    ]),
                    fotos
                ])
            ]));
            idxFoto += v.fotos.length;
        });
        if (!visitas.length) cont.appendChild(el('div', { class: 'rt-vacio', text: 'No hay fotos de este tipo.' }));
    };

    // ------------------------------------------------------------- visor
    A._fotosVisor = function () {
        const salida = [];
        if (!this._consulta) return salida;
        this._visitasFiltradas(this._consulta).forEach((v) => {
            v.fotos.forEach((f, i) => salida.push({ url: f.url, archivo: f.archivo, fecha: f.fecha, visita: v, n: i + 1 }));
        });
        return salida;
    };

    A.abrirVisor = function (inicio) {
        const fotos = this._fotosVisor();
        if (!fotos.length) return;
        this.cerrarVisor();
        const st = { i: Math.max(0, Math.min(inicio || 0, fotos.length - 1)), zoom: 1, giro: 0, dx: 0, dy: 0 };
        this._visor = st;

        const titulo = el('b'), subt = el('span'), cont = el('div', { class: 'rt-visor-cont' });
        const img = el('img', { alt: '', draggable: 'false', referrerpolicy: 'no-referrer' });
        const original = el('a', { class: 'rt-visor-btn', target: '_blank', rel: 'noopener', title: 'Abrir la foto original' },
                            [icono('fa-external-link-alt')]);
        const btnElegir = el('button', { type: 'button', class: 'rt-visor-btn rt-visor-sel', title: 'Elegir esta foto (S)',
                                         'aria-label': 'Elegir esta foto', onclick: () => elegir() }, [icono('fa-check')]);
        const btnEnviar = el('button', { type: 'button', class: 'rt-visor-enviar', title: 'Enviar las fotos elegidas por WhatsApp',
                                         onclick: () => this.enviarPorWhatsapp() },
                             [el('i', { class: 'fab fa-whatsapp', 'aria-hidden': 'true' }), el('span')]);
        const btn = (ico, tit, fn) => el('button', { type: 'button', class: 'rt-visor-btn', title: tit, 'aria-label': tit, onclick: fn },
                                         [icono(ico)]);
        const tira = el('div', { class: 'rt-visor-tira' });
        const escena = el('div', { class: 'rt-visor-escena' }, [img,
            el('button', { type: 'button', class: 'rt-visor-flecha rt-izq', 'aria-label': 'Anterior', onclick: () => ir(-1) }, [icono('fa-chevron-left')]),
            el('button', { type: 'button', class: 'rt-visor-flecha rt-der', 'aria-label': 'Siguiente', onclick: () => ir(1) }, [icono('fa-chevron-right')])
        ]);
        const visor = el('div', { class: 'rt-visor', id: 'rt-visor', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Fotos del suministro' }, [
            el('div', { class: 'rt-visor-cab' }, [
                el('div', { class: 'rt-visor-t' }, [titulo, subt]), cont, btnEnviar, btnElegir,
                btn('fa-search-plus', 'Acercar (clic en la foto)', () => zoom(st.zoom === 1 ? 2.2 : 1)),
                btn('fa-redo', 'Girar (R)', () => { st.giro = (st.giro + 90) % 360; aplicar(); }),
                original,
                btn('fa-times', 'Cerrar (Esc)', () => this.cerrarVisor())
            ]),
            escena, tira
        ]);

        const aplicar = () => {
            img.style.transform = 'translate(' + st.dx + 'px,' + st.dy + 'px) scale(' + st.zoom + ') rotate(' + st.giro + 'deg)';
            img.classList.toggle('rt-zoom', st.zoom > 1);
        };
        const zoom = (z) => { st.zoom = z; if (z === 1) { st.dx = 0; st.dy = 0; } aplicar(); };
        const mostrar = () => {
            const f = fotos[st.i];
            st.zoom = 1; st.giro = 0; st.dx = 0; st.dy = 0;
            img.style.opacity = '0';
            img.onload = () => { img.style.opacity = '1'; };
            img.onerror = () => { img.style.opacity = '1'; img.alt = 'No se pudo cargar la foto'; };
            img.src = f.url;
            img.alt = tituloVisita(f.visita) + ' — foto ' + f.n;
            aplicar();
            titulo.textContent = tituloVisita(f.visita) + (f.visita.orden ? ' · Orden ' + f.visita.orden : '');
            subt.textContent = (f.fecha ? textoFecha({ fecha: f.fecha, precision: 'dia' }) : textoFecha(f.visita)) +
                               ' · foto ' + f.n + ' de ' + f.visita.fotos.length + ' de esta visita';
            cont.textContent = (st.i + 1) + ' / ' + fotos.length;
            original.href = f.url;
            tira.querySelectorAll('.rt-visor-mini').forEach((m, k) => m.classList.toggle('rt-on', k === st.i));
            const activa = tira.querySelectorAll('.rt-visor-mini')[st.i];
            if (activa) activa.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
            [1, -1].forEach((d) => { const p = fotos[st.i + d]; if (p) { const pre = new Image(); pre.src = p.url; } });
            st.refrescarSel();
        };
        const ir = (d) => { st.i = (st.i + d + fotos.length) % fotos.length; mostrar(); };
        const elegir = () => { const f = fotos[st.i]; this._alternarFoto(f, f.visita); };
        st.refrescarSel = () => {
            const f = fotos[st.i];
            const si = !!(f && this._estaElegida(f.url));
            btnElegir.classList.toggle('rt-on', si);
            btnElegir.title = si ? 'Quitar de las elegidas (S)' : 'Elegir esta foto (S)';
            const n = this._sel ? this._sel.size : 0;
            btnEnviar.classList.toggle('rt-visible', n > 0);
            btnEnviar.querySelector('span').textContent = 'Enviar ' + n;
            tira.querySelectorAll('.rt-visor-mini').forEach((m, k) =>
                m.classList.toggle('rt-elegida', !!(fotos[k] && this._estaElegida(fotos[k].url))));
        };

        let visitaPrevia = null;
        fotos.forEach((f, k) => {
            if (f.visita !== visitaPrevia) {
                visitaPrevia = f.visita;
                if (k > 0) tira.appendChild(el('div', { class: 'rt-visor-sep', text: textoFecha(f.visita).split(' · ')[0] }));
            }
            const m = el('button', { type: 'button', class: 'rt-visor-mini', title: tituloVisita(f.visita), onclick: () => { st.i = k; mostrar(); } },
                         [el('img', { src: f.url, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' })]);
            tira.appendChild(m);
        });

        // zoom con clic y arrastre para moverse dentro de la foto
        let arrastre = null;
        img.addEventListener('click', (ev) => { if (!arrastre || !arrastre.movio) zoom(st.zoom === 1 ? 2.2 : 1); ev.stopPropagation(); });
        img.addEventListener('mousedown', (ev) => {
            if (st.zoom === 1) return;
            ev.preventDefault();
            arrastre = { x: ev.clientX - st.dx, y: ev.clientY - st.dy, movio: false };
        });
        const mover = (ev) => {
            if (!arrastre) return;
            st.dx = ev.clientX - arrastre.x; st.dy = ev.clientY - arrastre.y; arrastre.movio = true;
            aplicar();
        };
        const soltar = () => { setTimeout(() => { arrastre = null; }, 0); };
        escena.addEventListener('wheel', (ev) => {
            ev.preventDefault();
            zoom(Math.max(1, Math.min(5, st.zoom * (ev.deltaY < 0 ? 1.15 : 0.87))));
        }, { passive: false });
        escena.addEventListener('click', (ev) => { if (ev.target === escena) this.cerrarVisor(); });
        const teclas = (ev) => {
            if (document.getElementById('rt-modal-wa')) return;
            const usada = () => { ev.preventDefault(); ev.stopPropagation(); };
            if (ev.key === 'Escape') { usada(); this.cerrarVisor(); }
            else if (ev.key === 'ArrowRight') { usada(); ir(1); }
            else if (ev.key === 'ArrowLeft') { usada(); ir(-1); }
            else if (ev.key === 'r' || ev.key === 'R') { usada(); st.giro = (st.giro + 90) % 360; aplicar(); }
            else if (ev.key === 's' || ev.key === 'S') { usada(); elegir(); }
        };
        document.addEventListener('keydown', teclas, true);
        document.addEventListener('mousemove', mover);
        document.addEventListener('mouseup', soltar);
        st.limpiar = () => {
            document.removeEventListener('keydown', teclas, true);
            document.removeEventListener('mousemove', mover);
            document.removeEventListener('mouseup', soltar);
        };
        st.foco = document.activeElement;
        document.body.appendChild(visor);
        document.body.style.overflow = 'hidden';
        mostrar();
        const cerrar = visor.querySelector('.rt-visor-cab .rt-visor-btn:last-child');
        if (cerrar) cerrar.focus();
    };

    A.cerrarVisor = function () {
        const v = document.getElementById('rt-visor');
        if (v) v.remove();
        document.body.style.overflow = '';
        if (this._visor) {
            if (this._visor.limpiar) this._visor.limpiar();
            if (this._visor.foco && this._visor.foco.focus) { try { this._visor.foco.focus(); } catch (e) { } }
        }
        this._visor = null;
    };

    // ------------------------------------------- integración con lo demás
    // Esc cierra la ficha (si el visor no está abierto)
    document.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Escape' || A._visor || document.getElementById('rt-modal-wa')) return;
        const f = document.getElementById('rt-ficha');
        if (f && f.classList.contains('rt-abierta')) A.cerrarConsulta();
    });

    // Al volver a la pantalla de inicio: tarjeta para buscar un suministro
    if (typeof A._panelInicio === 'function') {
        const panelOrig = A._panelInicio;
        A._panelInicio = function () {
            const caja = panelOrig.apply(this, arguments);
            ponerEstilos();
            const tarjeta = el('button', { type: 'button', class: 'rt-inicio-busca', onclick: () => {
                const i = document.getElementById('rt-busq-input');
                if (i) i.focus();
            } }, [icono('fa-search'), el('div', {}, [
                el('b', { text: '¿Buscas un predio en particular?' }),
                el('span', { text: 'Escribe su suministro arriba y verás dónde está y su historial de fotos. Atajo: tecla /' })
            ])]);
            const pasos = caja.querySelector('.rt-inicio-pasos');
            caja.insertBefore(tarjeta, pasos || null);
            return caja;
        };
    }

    // Si se cierra el detalle de una carga con la ficha abierta, la ficha se queda
    const cerrarDetalleOrig = A.cerrarDetalle;
    A.cerrarDetalle = function () {
        const out = cerrarDetalleOrig.apply(this, arguments);
        const f = document.getElementById('rt-ficha');
        if (this._modoConsulta && this._hayResultado && this._hayResultado()) this._ponerModoConsulta(false);
        if (f && f.classList.contains('rt-abierta') && this._consulta) {
            if (!this._modoConsulta) this._abrirPanel();
            const t = document.getElementById('rt-detalle-titulo');
            const sub = document.getElementById('rt-detalle-sub');
            if (t) t.textContent = 'Consulta de suministro';
            if (sub) sub.textContent = 'Ubicación e historial de fotos del predio';
            this._pintarConsultaMapa(this._consulta);
        }
        return out;
    };

    const arrancar = () => {
        try {
            A._montarBuscador();
            // la pantalla de inicio ya se dibujó antes: se vuelve a dibujar con la tarjeta
            if (A._enInicio && A.mostrarInicio) A.mostrarInicio();
        } catch (err) { console.warn('Rutas: no se pudo montar el buscador', err); }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
    else arrancar();
})();
