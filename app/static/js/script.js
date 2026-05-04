// --- VARIABLES GLOBALES ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const content = document.querySelector('.content');
const welcomeMessage = document.getElementById('welcome-message');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Validación de Login (Si existe el form)
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (event) => {
            const user = document.getElementById('user').value.trim();
            const password = document.getElementById('password').value.trim();
            if (!user || !password) {
                event.preventDefault();
                alert('Por favor, complete todos los campos.');
            }
        });
    }

    // 2. Inicialización de navegación
    adjustContentWidth();
});

// --- MENÚ LATERAL ---
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    adjustContentWidth();
});

function adjustContentWidth() {
    // Ajuste dinámico de ancho para evitar que el contenido se corte
    if (sidebar.classList.contains('active')) {
        content.style.width = '100%';
        content.style.marginLeft = '0';
    } else {
        // Solo aplicar margen si no estamos en móvil
        if (window.innerWidth > 768) {
            content.style.width = `calc(100% - 260px)`;
        } else {
            content.style.width = '100%';
        }
    }
}

// --- LÓGICA DE SECCIONES (CORE) ---
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');

    // 🔁 Ocultar TODO primero
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; 
    });

    // Mostrar la sección seleccionada
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // 🔁 Manejo específico de Asistencias y sus submódulos
    const subAsistencias = [
        'recaudacion', 'lecturas', 'distribucion', 'catastro',
        'inspecciones', 'medidores', 'persuasivas', 'norte', 'administrativo_1'
    ];

    // Si entramos a CUALQUIER sección que no sea asistencias, limpiamos los submódulos
    if (sectionId !== 'asistencias') {
        subAsistencias.forEach(id => {
            const div = document.getElementById(id);
            if (div) div.style.display = 'none';
        });
        const asistenciasDiv = document.getElementById('asistencias');
        if (asistenciasDiv) asistenciasDiv.style.display = 'none';
    } else {
        const asistenciasDiv = document.getElementById('asistencias');
        if (asistenciasDiv) asistenciasDiv.style.display = 'block';
    }

    // Ocultar mensaje de bienvenida
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }

    // Cerrar sidebar en móvil automáticamente al elegir sección
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }
}

// --- EVENTOS DE ENLACES SIDEBAR ---
const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const sectionId = link.dataset.section;

        if (sectionId) {
            e.preventDefault();
            
            // Estética: Marcar link activo
            sidebarLinks.forEach(l => l.classList.remove('active-link'));
            link.classList.add('active-link');

            showSection(sectionId);

            // Registro de módulo asistencias
            if (sectionId === 'asistencias') {
                registrarAcceso('asistencias');
            }
        }
    });
});

// --- SELECT DE ASISTENCIAS ---
const asistenciaSelect = document.getElementById('tipo-asistencia-select');
if (asistenciaSelect) {
    asistenciaSelect.addEventListener('change', (e) => {
        const secciones = ['recaudacion', 'lecturas', 'distribucion', 'catastro', 'inspecciones', 'medidores', 'persuasivas', 'norte', 'administrativo_1'];

        secciones.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const seleccion = e.target.value;
        const titulo = document.querySelector('#asistencias h2');
        
        if (titulo) {
            const texto = e.target.options[e.target.selectedIndex].text;
            titulo.textContent = seleccion ? `ASISTENCIA DE PERSONAL: ${texto.toUpperCase()}` : 'ASISTENCIA DE PERSONAL';
        }

        if (seleccion) {
            const mostrar = document.getElementById(seleccion);
            if (mostrar) mostrar.style.display = 'block';
            registrarAcceso(`asistencias_${seleccion}`);
        }
    });
}

// --- FUNCIÓN REGISTRO FETCH ---
function registrarAcceso(nombreModulo) {
    fetch('/registrar-modulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo: nombreModulo })
    }).catch(err => console.error('Error al registrar acceso:', err));
}

// --- LOGO / HOME ---
const logoLink = document.getElementById('logo-link');
if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        if (welcomeMessage) welcomeMessage.style.display = 'flex';
        
        const asistencias = document.getElementById('asistencias');
        if (asistencias) asistencias.style.display = 'none';
    });
}

// --- PASSWORD TOGGLE ---
function togglePassword() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

// --- CONTROL DE INACTIVIDAD ---
let inactivityTime = function () {
    let time;
    const maxIdleTime = 30 * 60 * 1000; 

    function logout() { window.location.href = '/logout'; }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, maxIdleTime);
    }

    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
};
inactivityTime();


document.querySelector('form').addEventListener('submit', function(e) {
        const container = document.querySelector('.login-container');

        container.classList.add('animate-out');

        const form = this;
        e.preventDefault(); 
        setTimeout(() => {
            form.submit(); 
        }, 300); 
    });

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');

    // 1. Al cargar: Si es móvil, colapsar. Si es PC, asegurar que NO esté colapsado.
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }

    // 2. Función para alternar (Funciona para ambos botones)
    function toggleMenu() {
        sidebar.classList.toggle('collapsed');
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (closeSidebar) closeSidebar.addEventListener('click', toggleMenu);

    // 3. Ajuste opcional: Si el usuario cambia el tamaño de la ventana (Resizing)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.add('collapsed');
        }
    });
});


// RECAUDACION
document.addEventListener('DOMContentLoaded', function () {
    });

async function cargarEmpleadosRecaudacion() { 
    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos; 

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#recaudacion .empleados-table tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');

            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-1">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            // ✅ Referencias a los campos
            const inputPasajes = row.querySelector('.pasajes-input');
            const selectPasajes = row.querySelector('.pasajes-select');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });


            // ✅ Evento para eliminar la fila y el registro en la base de datos
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-1');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    const response = await fetch('/eliminar-asistencia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    const result = await response.json();
                    if (result.success) {
                        row.remove(); // ✅ Elimina la fila de la tabla
                        actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                    } else {
                        alert(result.message || 'No se pudo eliminar el empleado.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            }); // Cierre correcto del `addEventListener`
        }); // Cierre correcto del `forEach`
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudieron cargar los empleados.');
    }
} // Cierre correcto de la función `cargarEmpleadosRecaudacion`

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}


// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha').addEventListener('change', () => {
    cargarEmpleadosRecaudacion();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_recaudacion',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleado = document.getElementById('nuevo-empleado-selector');
    const agregarBtn = document.getElementById('agregar-empleado-btn');
    const guardarAsistenciaBtn = document.querySelector('.btn'); // El botón "GUARDAR ASISTENCIA"
    const tbody = document.querySelector('.empleados-table tbody');
    const filaAgregarEmpleado = document.getElementById('fila-agregar-empleado');

    // Inicializar Choices.js
    const choices = new Choices(selectorEmpleado, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargados = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionados = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelector() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargados = empleados; // Guardar empleados cargados

            // Vaciar Choices antes de rellenarlo
            choices.clearChoices();

            // Añadir opciones a Choices.js
            choices.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla
    agregarBtn.addEventListener('click', function () {
        const selectedValue = choices.getValue(true);

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargados.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargados);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionados.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td>${tbody.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>

            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFila.querySelector('.pasajes-input');
        const selectPasajes = nuevaFila.querySelector('.pasajes-select');

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });



        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });


        if (tbody.contains(filaAgregarEmpleado)) {
            tbody.insertBefore(nuevaFila, filaAgregarEmpleado);
        } else {
            tbody.appendChild(nuevaFila);
        }

        empleadosSeleccionados.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFila.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionados.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionados.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFila.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
    });

    document.getElementById('fecha').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbody.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtn.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbody.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}

    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardar = [];
        tbody.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardar.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionados.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });

        // Preparar los datos para el backend
        const asistencias = empleadosParaGuardar.map(empleado => ({
            mes: document.getElementById('mes').value,
            fecha: document.getElementById('fecha').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log("Datos a enviar:", JSON.stringify({ asistencias: asistencias }, null, 2));
    
        try {
            const response = await fetch('/guardar-asistencia-detalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistencias }),
            });
    
            if (!response.ok) throw new Error('Error al guardar la asistencia');
    
            const result = await response.json();
            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: document.getElementById('fecha').value
                })
            });

        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al guardar la asistencia.');
        }
    
        empleadosSeleccionados = []; // Limpiar la lista de empleados seleccionados
    });
    
    
    await cargarEmpleadosEnSelector();
});


// TOMA DE ESTADO
document.addEventListener('DOMContentLoaded', function () {
    //Obtener la fecha actual
    //const fechaActual = new Date();
    //const mesActual = fechaActual.getMonth(); // Mes en formato 0-11 (enero = 0)
    //const añoActual = fechaActual.getFullYear();

    //Establecer el mes actual en el select
   //const meses = [
       //"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        //"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    //];
    //const mesSelect = document.getElementById('mes-lecturas');
    //mesSelect.value = meses[mesActual];

    // Establecer la fecha actual en el input de fecha
    //const fechaInput = document.getElementById('fecha-lecturas');
    //const fechaFormateada = `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-01`; // Primero del mes actual
    //fechaInput.setAttribute('min', fechaFormateada);  // Establece el primer día del mes actual
    //fechaInput.setAttribute('max', `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-${new Date(añoActual, mesActual + 1, 0).getDate()}`); // Último día del mes actual
});

async function cargarEmpleadosLecturas() { 
    console.log("Ejecutando cargarEmpleadosLecturas...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-lecturas').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-lectura?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#lecturas .empleados-table-lecturas tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');

            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>  
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-2">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });

            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });

            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-2');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-lecturas').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-lectura', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosLecturas:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
} 

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-lecturas').addEventListener('change', () => {
    cargarEmpleadosLecturas();
    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-lecturas').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_lecturas',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoLectura = document.getElementById('nuevo-empleado-selector-lecturas');
    const agregarBtnLectura = document.getElementById('agregar-empleado-btn-lectura');
    const guardarAsistenciaBtnLectura = document.querySelector('.btn-lecturas'); // El botón "GUARDAR ASISTENCIA"
    const tbodyLectura = document.querySelector('.empleados-table-lecturas tbody');
    const filaAgregarEmpleadoLectura = document.getElementById('fila-agregar-empleado-lectura');

    // Inicializar Choices.js
    const choicesLectura = new Choices(selectorEmpleadoLectura, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosLectura = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosLectura = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorLectura() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosLectura = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosLectura);

            // Vaciar Choices antes de rellenarlo
            choicesLectura.clearChoices();

            // Añadir opciones a Choices.js
            choicesLectura.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-lecturas').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnLectura.addEventListener('click', function () {
        const selectedValue = choicesLectura.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosLectura.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosLectura);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosLectura.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaLectura = document.createElement('tr');
        nuevaFilaLectura.innerHTML = `
            <td>${tbodyLectura.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaLectura.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaLectura.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaLectura.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });


        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });

        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaLectura.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaLectura.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });       


        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyLectura.contains(filaAgregarEmpleadoLectura)) {
            tbodyLectura.insertBefore(nuevaFilaLectura, filaAgregarEmpleadoLectura);
            console.log('Fila añadida antes de fila-agregar-empleado-lectura');
        } else {
            tbodyLectura.appendChild(nuevaFilaLectura);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosLectura.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaLectura.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosLectura.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosLectura.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaLectura.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        

        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaLectura.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaLectura.querySelector('input[name="pasajes"]'),
            nuevaFilaLectura.querySelector('input[name="viaticos"]'),
            nuevaFilaLectura.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        

        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-lecturas').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });
    

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyLectura.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnLectura.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyLectura.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        //const fechaSeleccionada = document.getElementById('fecha-lecturas').value;
        //if (!fechaSeleccionada) {
            //alert("Seleccione una fecha válida.");
            //return;
        //}

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarLectura = [];
        tbodyLectura.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarLectura.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosLectura.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarLectura);
    
        // Preparar los datos para el backend
        const asistenciasLectura = empleadosParaGuardarLectura.map(empleado => ({
            mes: document.getElementById('mes-lecturas').value,
            fecha: document.getElementById('fecha-lecturas').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasLectura);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-lectura', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasLectura }),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');
            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-lecturas').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosLectura = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosLectura);
    });
    await cargarEmpleadosEnSelectorLectura();
});



// DISTRIBUCION DE RECIBOS
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosDistribucion() { 
    console.log("Ejecutando cargarEmpleadosDistribucion...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-distribucion').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-distribucion?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#distribucion .empleados-table-distribucion tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-3">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });

            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-3');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-distribucion').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-distribucion', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosDistribucion:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
} 

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-distribucion').addEventListener('change', () => {
    cargarEmpleadosDistribucion();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-distribucion').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_distribucion',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoDistribucion = document.getElementById('nuevo-empleado-selector-distribucion');
    const agregarBtnDistribucion = document.getElementById('agregar-empleado-btn-distribucion');
    const guardarAsistenciaBtnDistribucion = document.querySelector('.btn-distribucion'); // El botón "GUARDAR ASISTENCIA"
    const tbodyDistribucion = document.querySelector('.empleados-table-distribucion tbody');
    const filaAgregarEmpleadoDistribucion = document.getElementById('fila-agregar-empleado-distribucion');

    // Inicializar Choices.js
    const choicesDistribucion = new Choices(selectorEmpleadoDistribucion, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosDistribucion = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosDistribucion = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorDistribucion() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosDistribucion = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosDistribucion);

            // Vaciar Choices antes de rellenarlo
            choicesDistribucion.clearChoices();

            // Añadir opciones a Choices.js
            choicesDistribucion.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-distribucion').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnDistribucion.addEventListener('click', function () {
        const selectedValue = choicesDistribucion.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosDistribucion.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosDistribucion);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosDistribucion.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaDistribucion = document.createElement('tr');
        nuevaFilaDistribucion.innerHTML = `
            <td>${tbodyDistribucion.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>
            
            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaDistribucion.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaDistribucion.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaDistribucion.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });



        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaDistribucion.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaDistribucion.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });


        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyDistribucion.contains(filaAgregarEmpleadoDistribucion)) {
            tbodyDistribucion.insertBefore(nuevaFilaDistribucion, filaAgregarEmpleadoDistribucion);
            console.log('Fila añadida antes de fila-agregar-empleado-distribucion');
        } else {
            tbodyDistribucion.appendChild(nuevaFilaDistribucion);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosDistribucion.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaDistribucion.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosDistribucion.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosDistribucion.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaDistribucion.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaDistribucion.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaDistribucion.querySelector('input[name="pasajes"]'),
            nuevaFilaDistribucion.querySelector('input[name="viaticos"]'),
            nuevaFilaDistribucion.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-distribucion').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyDistribucion.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnDistribucion.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyDistribucion.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-distribucion').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarDistribucion = [];
        tbodyDistribucion.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarDistribucion.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosDistribucion.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarDistribucion);
    
        // Preparar los datos para el backend
        const asistenciasDistribucion = empleadosParaGuardarDistribucion.map(empleado => ({
            mes: document.getElementById('mes-distribucion').value,
            fecha: document.getElementById('fecha-distribucion').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasDistribucion);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-distribucion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasDistribucion }),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-distribucion').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });

            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosDistribucion = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosDistribucion);
    });
    await cargarEmpleadosEnSelectorDistribucion();
});



// INSPECCIONES
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosInspecciones() { 
    console.log("Ejecutando cargarEmpleadosInspecciones...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-inspecciones').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();


        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-inspecciones?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#inspecciones .empleados-table-inspecciones tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-4">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            // Obtener los elementos de la fila
            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });

            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-4');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-inspecciones').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-inspecciones', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosInspecciones:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
}

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-inspecciones').addEventListener('change', () => {
    cargarEmpleadosInspecciones();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-inspecciones').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_inspecciones',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoInspecciones = document.getElementById('nuevo-empleado-selector-inspecciones');
    const agregarBtnInspecciones = document.getElementById('agregar-empleado-btn-inspecciones');
    const guardarAsistenciaBtnInspecciones = document.querySelector('.btn-inspecciones'); // El botón "GUARDAR ASISTENCIA"
    const tbodyInspecciones = document.querySelector('.empleados-table-inspecciones tbody');
    const filaAgregarEmpleadoInspecciones = document.getElementById('fila-agregar-empleado-inspecciones');

    // Inicializar Choices.js
    const choicesInspecciones = new Choices(selectorEmpleadoInspecciones, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosInspecciones = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosInspecciones = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorInspecciones() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosInspecciones = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosInspecciones);

            // Vaciar Choices antes de rellenarlo
            choicesInspecciones.clearChoices();

            // Añadir opciones a Choices.js
            choicesInspecciones.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-inspecciones').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnInspecciones.addEventListener('click', function () {
        const selectedValue = choicesInspecciones.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosInspecciones.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosInspecciones);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosInspecciones.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaInspecciones = document.createElement('tr');
        nuevaFilaInspecciones.innerHTML = `
            <td>${tbodyInspecciones.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaInspecciones.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaInspecciones.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaInspecciones.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });

        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaInspecciones.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaInspecciones.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });


        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyInspecciones.contains(filaAgregarEmpleadoInspecciones)) {
            tbodyInspecciones.insertBefore(nuevaFilaInspecciones, filaAgregarEmpleadoInspecciones);
            console.log('Fila añadida antes de fila-agregar-empleado-inspecciones');
        } else {
            tbodyInspecciones.appendChild(nuevaFilaInspecciones);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosInspecciones.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaInspecciones.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosInspecciones.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosInspecciones.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaInspecciones.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaInspecciones.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaInspecciones.querySelector('input[name="pasajes"]'),
            nuevaFilaInspecciones.querySelector('input[name="viaticos"]'),
            nuevaFilaInspecciones.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-inspecciones').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyInspecciones.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnInspecciones.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyInspecciones.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-inspecciones').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
           // inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarInspecciones = [];
        tbodyInspecciones.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarInspecciones.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosInspecciones.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarInspecciones);
    
        // Preparar los datos para el backend
        const asistenciasInspecciones = empleadosParaGuardarInspecciones.map(empleado => ({
            mes: document.getElementById('mes-inspecciones').value,
            fecha: document.getElementById('fecha-inspecciones').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasInspecciones);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-inspecciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasInspecciones}),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-inspecciones').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosInspecciones = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosInspecciones);
    });
    await cargarEmpleadosEnSelectorInspecciones();
});


// CATASTRO
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosCatastro() { 
    console.log("Ejecutando cargarEmpleadosCatastro...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-catastro').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-catastro?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#catastro .empleados-table-catastro tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>

                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-5">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });

            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-5');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-catastro').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-catastro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosCatastro:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
}

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-catastro').addEventListener('change', () => {
    cargarEmpleadosCatastro();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-catastro').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_catastro',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoCatastro = document.getElementById('nuevo-empleado-selector-catastro');
    const agregarBtnCatastro = document.getElementById('agregar-empleado-btn-catastro');
    const guardarAsistenciaBtnCatastro = document.querySelector('.btn-catastro'); // El botón "GUARDAR ASISTENCIA"
    const tbodyCatastro = document.querySelector('.empleados-table-catastro tbody');
    const filaAgregarEmpleadoCatastro = document.getElementById('fila-agregar-empleado-catastro');

    // Inicializar Choices.js
    const choicesCatastro = new Choices(selectorEmpleadoCatastro, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosCatastro = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosCatastro = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorCatastro() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosCatastro = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosCatastro);

            // Vaciar Choices antes de rellenarlo
            choicesCatastro.clearChoices();

            // Añadir opciones a Choices.js
            choicesCatastro.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-catastro').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnCatastro.addEventListener('click', function () {
        const selectedValue = choicesCatastro.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosCatastro.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosCatastro);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosCatastro.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaCatastro = document.createElement('tr');
        nuevaFilaCatastro.innerHTML = `
            <td>${tbodyCatastro.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaCatastro.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaCatastro.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaCatastro.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });


        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaCatastro.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaCatastro.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });

        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyCatastro.contains(filaAgregarEmpleadoCatastro)) {
            tbodyCatastro.insertBefore(nuevaFilaCatastro, filaAgregarEmpleadoCatastro);
            console.log('Fila añadida antes de fila-agregar-empleado-catastro');
        } else {
            tbodyCatastro.appendChild(nuevaFilaCatastro);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosCatastro.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaCatastro.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosCatastro.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosCatastro.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaCatastro.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaCatastro.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaCatastro.querySelector('input[name="pasajes"]'),
            nuevaFilaCatastro.querySelector('input[name="viaticos"]'),
            nuevaFilaCatastro.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-catastro').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyCatastro.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnCatastro.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyCatastro.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-catastro').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarCatastro = [];
        tbodyCatastro.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarCatastro.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosCatastro.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarCatastro);
    
        // Preparar los datos para el backend
        const asistenciasCatastro = empleadosParaGuardarCatastro.map(empleado => ({
            mes: document.getElementById('mes-catastro').value,
            fecha: document.getElementById('fecha-catastro').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasCatastro);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-catastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasCatastro}),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-catastro').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosCatastro = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosCatastro);
    });
    await cargarEmpleadosEnSelectorCatastro();
});


// MEDIDORES
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosMedidores() { 
    console.log("Ejecutando cargarEmpleadosMedidores...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-medidores').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-medidores?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#medidores .empleados-table-medidores tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            
            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>

                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>

                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-6">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });
            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-6');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-medidores').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-medidores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosMedidores:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
} 

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-medidores').addEventListener('change', () => {
    cargarEmpleadosMedidores();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-medidores').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_medidores',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoMedidores = document.getElementById('nuevo-empleado-selector-medidores');
    const agregarBtnMedidores = document.getElementById('agregar-empleado-btn-medidores');
    const guardarAsistenciaBtnMedidores = document.querySelector('.btn-medidores'); // El botón "GUARDAR ASISTENCIA"
    const tbodyMedidores = document.querySelector('.empleados-table-medidores tbody');
    const filaAgregarEmpleadoMedidores = document.getElementById('fila-agregar-empleado-medidores');

    // Inicializar Choices.js
    const choicesMedidores = new Choices(selectorEmpleadoMedidores, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosMedidores = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosMedidores = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorMedidores() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosMedidores = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosMedidores);

            // Vaciar Choices antes de rellenarlo
            choicesMedidores.clearChoices();

            // Añadir opciones a Choices.js
            choicesMedidores.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-medidores').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnMedidores.addEventListener('click', function () {
        const selectedValue = choicesMedidores.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosMedidores.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosMedidores);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosMedidores.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaMedidores = document.createElement('tr');
        nuevaFilaMedidores.innerHTML = `
            <td>${tbodyMedidores.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>
        
            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaMedidores.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaMedidores.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaMedidores.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });


        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaMedidores.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaMedidores.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });

        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyMedidores.contains(filaAgregarEmpleadoMedidores)) {
            tbodyMedidores.insertBefore(nuevaFilaMedidores, filaAgregarEmpleadoMedidores);
            console.log('Fila añadida antes de fila-agregar-empleado-medidores');
        } else {
            tbodyMedidores.appendChild(nuevaFilaMedidores);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosMedidores.push(empleadoSeleccionado);
        
        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaMedidores.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosMedidores.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosMedidores.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaMedidores.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaMedidores.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaMedidores.querySelector('input[name="pasajes"]'),
            nuevaFilaMedidores.querySelector('input[name="viaticos"]'),
            nuevaFilaMedidores.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-medidores').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyMedidores.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnMedidores.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyMedidores.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-medidores').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
       //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarMedidores = [];
        tbodyMedidores.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarMedidores.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosMedidores.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarMedidores);
    
        // Preparar los datos para el backend
        const asistenciasMedidores = empleadosParaGuardarMedidores.map(empleado => ({
            mes: document.getElementById('mes-medidores').value,
            fecha: document.getElementById('fecha-medidores').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasMedidores);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-medidores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasMedidores}),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-medidores').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosMedidores = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosMedidores);
    });
    await cargarEmpleadosEnSelectorMedidores();
});


// PERSUASIVAS
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosPersuasivas() { 
    console.log("Ejecutando cargarEmpleadosPersuasivas...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-persuasivas').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-persuasivas?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#persuasivas .empleados-table-persuasivas tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-7">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });
            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT", "DC"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-7');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-persuasivas').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-persuasivas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosMedidores:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
}

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-persuasivas').addEventListener('change', () => {
    cargarEmpleadosPersuasivas();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-persuasivas').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_persuasivas',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoPersuasivas = document.getElementById('nuevo-empleado-selector-persuasivas');
    const agregarBtnPersuasivas = document.getElementById('agregar-empleado-btn-persuasivas');
    const guardarAsistenciaBtnPersuasivas = document.querySelector('.btn-persuasivas'); // El botón "GUARDAR ASISTENCIA"
    const tbodyPersuasivas = document.querySelector('.empleados-table-persuasivas tbody');
    const filaAgregarEmpleadoPersuasivas = document.getElementById('fila-agregar-empleado-persuasivas');

    // Inicializar Choices.js
    const choicesPersuasivas = new Choices(selectorEmpleadoPersuasivas, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosPersuasivas = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosPersuasivas = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorPersuasivas() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosPersuasivas = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosPersuasivas);

            // Vaciar Choices antes de rellenarlo
            choicesPersuasivas.clearChoices();

            // Añadir opciones a Choices.js
            choicesPersuasivas.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-lecturas').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }
    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnPersuasivas.addEventListener('click', function () {
        const selectedValue = choicesPersuasivas.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosPersuasivas.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosPersuasivas);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosPersuasivas.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaPersuasivas = document.createElement('tr');
        nuevaFilaPersuasivas.innerHTML = `
            <td>${tbodyPersuasivas.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>

            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaPersuasivas.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaPersuasivas.querySelector('.pasajes-select');

        const selectEstadoNueva = nuevaFilaPersuasivas.querySelector('select[name="estado"]');
        let valorAnteriorEstado = selectEstadoNueva.value;

        selectEstadoNueva.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });

        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaPersuasivas.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaPersuasivas.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });

        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyPersuasivas.contains(filaAgregarEmpleadoPersuasivas)) {
            tbodyPersuasivas.insertBefore(nuevaFilaPersuasivas, filaAgregarEmpleadoPersuasivas);
            console.log('Fila añadida antes de fila-agregar-empleado-persuasivas');
        } else {
            tbodyPersuasivas.appendChild(nuevaFilaPersuasivas);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosPersuasivas.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaPersuasivas.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosPersuasivas.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosPersuasivas.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaPersuasivas.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaPersuasivas.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaPersuasivas.querySelector('input[name="pasajes"]'),
            nuevaFilaPersuasivas.querySelector('input[name="viaticos"]'),
            nuevaFilaPersuasivas.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT", "DC"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-persuasivas').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyPersuasivas.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnPersuasivas.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyPersuasivas.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }
        
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-persuasivas').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
       //}

        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarPersuasivas = [];
        tbodyPersuasivas.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarPersuasivas.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosPersuasivas.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarPersuasivas);
    
        // Preparar los datos para el backend
        const asistenciasPersuasivas = empleadosParaGuardarPersuasivas.map(empleado => ({
            mes: document.getElementById('mes-persuasivas').value,
            fecha: document.getElementById('fecha-persuasivas').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasPersuasivas);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-persuasivas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasPersuasivas}),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-persuasivas').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosPersuasivas = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosPersuasivas);
    });
    await cargarEmpleadosEnSelectorPersuasivas();
});




// NORTE
document.addEventListener('DOMContentLoaded', function () {
    //Obtener la fecha actual
    //const fechaActual = new Date();
    //const mesActual = fechaActual.getMonth(); // Mes en formato 0-11 (enero = 0)
    //const añoActual = fechaActual.getFullYear();

    //Establecer el mes actual en el select
   //const meses = [
       //"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
        //"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    //];
    //const mesSelect = document.getElementById('mes-lecturas');
    //mesSelect.value = meses[mesActual];

    // Establecer la fecha actual en el input de fecha
    //const fechaInput = document.getElementById('fecha-lecturas');
    //const fechaFormateada = `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-01`; // Primero del mes actual
    //fechaInput.setAttribute('min', fechaFormateada);  // Establece el primer día del mes actual
    //fechaInput.setAttribute('max', `${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-${new Date(añoActual, mesActual + 1, 0).getDate()}`); // Último día del mes actual
});

async function cargarEmpleadosNorte() { 
    console.log("Ejecutando cargarEmpleadosNorte...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-norte').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // 📌 Convertir la fecha a un objeto Date para obtener el día de la semana
        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
        const diaSemana = fechaObj.getDay();

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-norte?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#norte .empleados-table-norte tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');

            // 📌 Generamos las opciones del select según si es domingo
            const estadoOptions = diaSemana === 0  
                ? `<option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option> 
                `
                : `
                    <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                    <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                    <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                    <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                    <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                    <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                    <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                    <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                    <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                    <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                    <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                    <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                    <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                    <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                    <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                    <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                    <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                    <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                `;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">${estadoOptions}</select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>

                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                            value="${empleado.pasajes !== 'PR' ? empleado.pasajes || '' : ''}" ${empleado.pasajes === 'PR' ? 'disabled' : ''}>
                        <select name="pasajes" class="pasajes-select">
                            <option value="">Seleccione</option>
                            <option value="PR" ${empleado.pasajes === "PR" ? "selected" : ""}>PR</option>
                        </select>
                    </div>
                </td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-10">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const selectPasajes = row.querySelector('select[name="pasajes"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            let valorAnteriorSelect = selectPasajes.value;
            selectPasajes.addEventListener('change', () => {
                const nuevoValor = selectPasajes.value;

                if (nuevoValor !== valorAnteriorSelect) {
                    valorAnteriorSelect = nuevoValor; // Actualizar referencia

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            nuevo_valor: nuevoValor,
                            tipo: 'select'
                        })
                    });
                }

                if (nuevoValor === "PR") {
                    inputPasajes.value = "";
                    inputPasajes.disabled = true;
                } else {
                    inputPasajes.disabled = false;
                }
            });

            // 🔹 Auditar cambios en VIÁTICOS
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            let valorAnteriorViaticos = inputViaticos.value;

            inputViaticos.addEventListener('change', () => {
                const nuevoValor = inputViaticos.value;
                if (nuevoValor !== valorAnteriorViaticos) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'viaticos',
                            valor_anterior: valorAnteriorViaticos,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorViaticos = nuevoValor;
                }
            });

            // 🔹 Auditar cambios en RUTA
            const inputRuta = row.querySelector('input[name="ruta"]');
            let valorAnteriorRuta = inputRuta.value;

            inputRuta.addEventListener('change', () => {
                const nuevoValor = inputRuta.value.trim();
                if (nuevoValor !== valorAnteriorRuta) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'ruta',
                            valor_anterior: valorAnteriorRuta,
                            nuevo_valor: nuevoValor
                        })
                    });
                    valorAnteriorRuta = nuevoValor;
                }
            });

            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-10');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-norte').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-norte', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                    alert('Empleado eliminado correctamente.');
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosNorte:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
} 

// ✅ Función para verificar si la fecha seleccionada es domingo
function esDomingo(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.getDay() === 0; // Domingo es 0 en getDay()
}

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-norte').addEventListener('change', () => {
    cargarEmpleadosNorte();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-norte').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_norte',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoNorte = document.getElementById('nuevo-empleado-selector-norte');
    const agregarBtnNorte = document.getElementById('agregar-empleado-btn-norte');
    const guardarAsistenciaBtnNorte = document.querySelector('.btn-norte'); // El botón "GUARDAR ASISTENCIA"
    const tbodyNorte = document.querySelector('.empleados-table-norte tbody');
    const filaAgregarEmpleadoNorte = document.getElementById('fila-agregar-empleado-norte');

    // Inicializar Choices.js
    const choicesNorte = new Choices(selectorEmpleadoNorte, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosNorte = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosNorte = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectorNorte() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosNorte = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosNorte);

            // Vaciar Choices antes de rellenarlo
            choicesNorte.clearChoices();

            // Añadir opciones a Choices.js
            choicesNorte.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // 🟢 Obtener la fecha seleccionada y determinar el día de la semana
    function obtenerDiaSeleccionado() {
        const fechaSeleccionada = document.getElementById('fecha-lecturas').value;
        if (!fechaSeleccionada) return null;

        const fechaObj = new Date(fechaSeleccionada + 'T00:00:00'); // Asegurar la zona horaria
        return fechaObj.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    }

    // 🟢 Modificar opciones del select según el día de la semana
    function obtenerOpcionesEstado(diaSemana) {
        return diaSemana === 0 // Si es domingo
            ? `<option value=" "> </option>
            <option value="DT">DT</option>
            <option value="DC">DC</option>`
            : `<option value=" "> </option>
            <option value="A">A</option>
            <option value="DT">DT</option>
            <option value="FT">FT</option>
            <option value="LG">LG</option>
            <option value="DM">DM</option>
            <option value="V">V</option>
            <option value="LSG">LSG</option>
            <option value="F">F</option>
            <option value="SU">SU</option>
            <option value="CE">CE</option>
            <option value="FG">FG</option>
            <option value="LD">LD</option>
            <option value="DC">DC</option>
            <option value="AP">AP</option>
            <option value="LP">LP</option>
            <option value="TC">TC</option>`;
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnNorte.addEventListener('click', function () {
        const selectedValue = choicesNorte.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosNorte.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosNorte);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosNorte.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const diaSemana = obtenerDiaSeleccionado(); // 📌 Determinar si es domingo
        const opcionesEstado = obtenerOpcionesEstado(diaSemana);

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaNorte = document.createElement('tr');
        nuevaFilaNorte.innerHTML = `
            <td>${tbodyNorte.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            
            <td>
            <select name="estado">${opcionesEstado}</select>
            <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>

            <td>
                <div style="display: flex; gap: 5px;">
                    <input type="number" name="pasajes" class="pasajes-input" step="0.01" min="0" placeholder="Ingrese monto" 
                        value="${empleadoSeleccionado.pasajes !== 'PR' ? empleadoSeleccionado.pasajes || '' : ''}" 
                        ${empleadoSeleccionado.pasajes === 'PR' ? 'disabled' : ''}>
                    <select name="pasajes" class="pasajes-select">
                        <option value="">Seleccione</option>
                        <option value="PR" ${empleadoSeleccionado.pasajes === "PR" ? "selected" : ""}>PR</option>
                    </select>
                </div>
            </td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleadoSeleccionado.viaticos || ''}"></td>
            <td><input type="text" name="ruta" placeholder="Ruta" value="${empleadoSeleccionado.ruta || ''}"></td>
            <td>
                <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        const inputPasajes = nuevaFilaNorte.querySelector('.pasajes-input');
        const selectPasajes = nuevaFilaNorte.querySelector('.pasajes-select');

        let valorAnteriorEstado = selectEstado.value;

        selectEstado.addEventListener('change', () => {
            const nuevoValor = selectEstado.value;

            if (nuevoValor !== valorAnteriorEstado) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'estado',
                        valor_anterior: valorAnteriorEstado,
                        nuevo_valor: nuevoValor
                    })
                });

                valorAnteriorEstado = nuevoValor;
            }
        });

        let valorAnteriorPasaje = inputPasajes.value;
        inputPasajes.addEventListener('change', () => {
            const nuevoValor = inputPasajes.value.trim();

            if (nuevoValor !== valorAnteriorPasaje) {
                const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                valorAnteriorPasaje = nuevoValor;

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        tipo: 'monto',
                        valor_anterior: anterior,
                        nuevo_valor: nuevoValor
                    })
                });
            }
        });


        let valorAnteriorSelect = selectPasajes.value;
        selectPasajes.addEventListener('change', () => {
            const nuevoValor = selectPasajes.value;

            if (nuevoValor !== valorAnteriorSelect) {
                valorAnteriorSelect = nuevoValor; // Actualizar referencia

                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleado.id_empleado,
                        nuevo_valor: nuevoValor,
                        tipo: 'select'
                    })
                });
            }

            if (nuevoValor === "PR") {
                inputPasajes.value = "";
                inputPasajes.disabled = true;
            } else {
                inputPasajes.disabled = false;
            }
        });

        // 🔹 Auditar cambios en VIÁTICOS
        const inputViaticos = nuevaFilaNorte.querySelector('input[name="viaticos"]');
        let valorAnteriorViaticos = inputViaticos.value;

        inputViaticos.addEventListener('change', () => {
            const nuevoValor = inputViaticos.value;
            if (nuevoValor !== valorAnteriorViaticos) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'viaticos',
                        valor_anterior: valorAnteriorViaticos,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorViaticos = nuevoValor;
            }
        });

        // 🔹 Auditar cambios en RUTA
        const inputRuta = nuevaFilaNorte.querySelector('input[name="ruta"]');
        let valorAnteriorRuta = inputRuta.value;

        inputRuta.addEventListener('change', () => {
            const nuevoValor = inputRuta.value.trim();
            if (nuevoValor !== valorAnteriorRuta) {
                fetch('/auditar-cambio-pasajes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    id_empleado: empleadoSeleccionado.id_empleado,
                        tipo: 'ruta',
                        valor_anterior: valorAnteriorRuta,
                        nuevo_valor: nuevoValor
                    })
                });
                valorAnteriorRuta = nuevoValor;
            }
        });

        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyNorte.contains(filaAgregarEmpleadoNorte)) {
            tbodyNorte.insertBefore(nuevaFilaNorte, filaAgregarEmpleadoNorte);
            console.log('Fila añadida antes de fila-agregar-empleado-norte');
        } else {
            tbodyNorte.appendChild(nuevaFilaNorte);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosNorte.push(empleadoSeleccionado);
        
        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaNorte.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosNorte.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosNorte.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaNorte.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaNorte.querySelector('select[name="estado"]');
        const camposRestringidos = [
            nuevaFilaNorte.querySelector('input[name="pasajes"]'),
            nuevaFilaNorte.querySelector('input[name="viaticos"]'),
            nuevaFilaNorte.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });


        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    document.getElementById('fecha-norte').addEventListener('change', () => {
        // 🔄 Actualizar las filas ya añadidas
        const diaSemana = obtenerDiaSeleccionado();
        document.querySelectorAll('tbody tr select[name="estado"]').forEach(select => {
            select.innerHTML = obtenerOpcionesEstado(diaSemana);
        });
    });
    

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyNorte.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnNorte.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyNorte.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-norte').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        const hoy = new Date();
        const mesActual = hoy.getMonth() + 1;
        const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        let inicioRango, finRango;
        if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        } else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            const mesAnterior = mesActual - 1 || 12;
            const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
        }

        // Validar si la fecha seleccionada está dentro del rango permitido
        if (fecha < inicioRango || fecha > finRango) {
            alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            return;
        }
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardarNorte = [];
        tbodyNorte.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';

            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const pasajesSelect = fila.querySelector('select[name="pasajes"]');
            let pasajes = 0;  // Valor por defecto
            if (pasajesSelect && pasajesSelect.value === "PR") {
                pasajes = "PR";  // Guardar "PR" si fue seleccionado en el <select>
            } else if (pasajesInput && pasajesInput.value.trim() !== "") {
                pasajes = parseFloat(pasajesInput.value) || 0;  // Convertir a número si no es vacío
            }

            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardarNorte.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajes,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosNorte.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardarNorte);
    
        // Preparar los datos para el backend
        const asistenciasNorte = empleadosParaGuardarNorte.map(empleado => ({
            mes: document.getElementById('mes-norte').value,
            fecha: document.getElementById('fecha-norte').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasNorte);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-norte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasNorte }),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-norte').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosNorte = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosNorte);
    });
    await cargarEmpleadosEnSelectorNorte();
});



// ASISTENCIA ADMINISTRATIVO
document.addEventListener('DOMContentLoaded', function () {
});

async function cargarEmpleadosadministrativo_1() { 
    console.log("Ejecutando cargarEmpleadosAdministrativos...");

    try {
        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-administrativo_1').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        console.log("Fecha seleccionada:", fechaSeleccionada);

        // Llamar a /cargar-asistencia con la fecha
        const response = await fetch(`/cargar-asistencia-administrativo_1?fecha=${fechaSeleccionada}`);
        if (!response.ok) throw new Error('Error al obtener los empleados sin asistencia');

        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);

        // Extraer el array de empleados
        const empleados = responseData.datos;

        // Verificar si es un array antes de usar forEach
        if (!Array.isArray(empleados)) {
            console.error('La respuesta del servidor no contiene un array en "datos":', empleados);
            return;
        }

        console.log('Respuesta del servidor:', empleados);

        // Seleccionamos el cuerpo de la tabla
        const tbody = document.querySelector('#administrativo_1 .empleados-table-administrativo_1 tbody');
        tbody.innerHTML = ''; // Limpiamos la tabla

        if (empleados.length === 0) {
            alert("No hay empleados sin asistencia para esta fecha.");
            return;
        }

        // Iteramos sobre los empleados y los agregamos a la tabla
        empleados.forEach((empleado, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${empleado.dni}</td>
                <td>${empleado.nombres}</td>
                <td>${empleado.cargo}</td>
                <td>
                    <select name="estado">
                        <option value=" " ${empleado.estado === " " ? "selected" : ""}> </option>
                        <option value="A" ${empleado.estado === "A" ? "selected" : ""}>A</option>
                        <option value="DT" ${empleado.estado === "DT" ? "selected" : ""}>DT</option>
                        <option value="FT" ${empleado.estado === "FT" ? "selected" : ""}>FT</option>
                        <option value="LG" ${empleado.estado === "LG" ? "selected" : ""}>LG</option>
                        <option value="DM" ${empleado.estado === "DM" ? "selected" : ""}>DM</option>
                        <option value="V" ${empleado.estado === "V" ? "selected" : ""}>V</option>
                        <option value="LSG" ${empleado.estado === "LSG" ? "selected" : ""}>LSG</option>
                        <option value="F" ${empleado.estado === "F" ? "selected" : ""}>F</option>
                        <option value="R" ${empleado.estado === "R" ? "selected" : ""}>R</option>
                        <option value="SU" ${empleado.estado === "SU" ? "selected" : ""}>SU</option>
                        <option value="CE" ${empleado.estado === "CE" ? "selected" : ""}>CE</option>
                        <option value="FG" ${empleado.estado === "FG" ? "selected" : ""}>FG</option>
                        <option value="LD" ${empleado.estado === "LD" ? "selected" : ""}>LD</option>
                        <option value="DC" ${empleado.estado === "DC" ? "selected" : ""}>DC</option>
                        <option value="AP" ${empleado.estado === "AP" ? "selected" : ""}>AP</option>
                        <option value="LP" ${empleado.estado === "LP" ? "selected" : ""}>LP</option>
                        <option value="TC" ${empleado.estado === "TC" ? "selected" : ""}>TC</option>
                    </select>
                    <input type="hidden" name="id_empleado" value="${empleado.id_empleado}">
                </td>
                <td><input type="number" name="pasajes" step="0.01" min="0" placeholder="Pasajes" value="${empleado.pasajes || ''}"></td>
                <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos" value="${empleado.viaticos || ''}"></td>
                <td><input type="text" name="ruta" placeholder="Ruta" value="${empleado.ruta || ''}"></td>
                <td>
                    <button type="button" class="eliminar-fila-btn-8">X</button>
                </td>
            `;
            tbody.appendChild(row);

            // 🔹 Auditar cambios en ESTADO
            const selectEstado = row.querySelector('select[name="estado"]');
            let valorAnteriorEstado = selectEstado.value;

            selectEstado.addEventListener('change', () => {
                const nuevoValor = selectEstado.value;

                if (nuevoValor !== valorAnteriorEstado) {
                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'estado',
                            valor_anterior: valorAnteriorEstado,
                            nuevo_valor: nuevoValor
                        })
                    });

                    valorAnteriorEstado = nuevoValor;
                }
            });

            const inputPasajes = row.querySelector('input[name="pasajes"]');
            const inputViaticos = row.querySelector('input[name="viaticos"]');
            const inputRuta = row.querySelector('input[name="ruta"]');

            let valorAnteriorPasaje = inputPasajes.value;
            inputPasajes.addEventListener('change', () => {
                const nuevoValor = inputPasajes.value.trim();

                if (nuevoValor !== valorAnteriorPasaje) {
                    const anterior = valorAnteriorPasaje; // guardar antes de actualizar

                    valorAnteriorPasaje = nuevoValor;

                    fetch('/auditar-cambio-pasajes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_empleado: empleado.id_empleado,
                            tipo: 'monto',
                            valor_anterior: anterior,
                            nuevo_valor: nuevoValor
                        })
                    });
                }
            });


            
            // Función para habilitar o deshabilitar los campos
            function actualizarCampos() {
                const estadoSeleccionado = selectEstado.value;
                const habilitado = ["A", "DT", "FT"].includes(estadoSeleccionado);

                inputPasajes.disabled = !habilitado;
                inputViaticos.disabled = !habilitado;
                inputRuta.disabled = !habilitado;

                // Si se deshabilitan los campos, limpiar los valores
                if (!habilitado) {
                    inputPasajes.value = "";
                    inputViaticos.value = "";
                    inputRuta.value = "";
                }
            }

            // Llamar a la función inicialmente para aplicar la regla al cargar
            actualizarCampos();

            // Agregar evento para cambiar el estado
            selectEstado.addEventListener("change", actualizarCampos);

            // ✅ Evento para eliminar la fila y el registro en la base de datos 
            const eliminarBtn = row.querySelector('.eliminar-fila-btn-8');
            eliminarBtn.addEventListener('click', async () => {
                const idEmpleado = empleado.id_empleado;
                const fechaSeleccionada = document.getElementById('fecha-administrativo_1').value;

                if (!confirm(`¿Estás seguro de eliminar a ${empleado.nombres} de la asistencia del ${fechaSeleccionada}?`)) {
                    return;
                }

                try {
                    await fetch('/eliminar-asistencia-administrativo_1', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_empleado: idEmpleado, fecha: fechaSeleccionada }),
                    });

                    row.remove(); // ✅ Elimina la fila de la tabla sin depender de la respuesta del servidor
                    actualizarNumeracion(tbody); // ✅ Actualiza la numeración
                } catch (error) {
                    console.error('Error:', error);
                    alert('No se pudieron cargar los empleados.');
                }
            });
        });

    } catch (error) {
        console.error('Error en cargarEmpleadosMedidores:', error);
        alert('Ocurrió un error al cargar los empleados.');
    }
} 

// Función para actualizar la numeración de las filas en la tabla
function actualizarNumeracion(tbody) {
    Array.from(tbody.children).forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td:first-child');
        if (celdaNumero) celdaNumero.textContent = index + 1;
    });
}

document.getElementById('fecha-administrativo_1').addEventListener('change', () => {
    cargarEmpleadosadministrativo_1();

    // 👇 Registrar evento de selección de fecha
    const fecha = document.getElementById('fecha-administrativo_1').value;
    if (fecha) {
        fetch('/registrar-modulo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modulo: 'asistencias_administrativo',
                detalle: `Fecha seleccionada: ${fecha}`
            })
        }).catch(err => console.error('Error al registrar evento de fecha:', err));
    }
});


document.addEventListener('DOMContentLoaded', async function () {
    const selectorEmpleadoadministrativo_1 = document.getElementById('nuevo-empleado-selector-administrativo_1');
    const agregarBtnadministrativo_1 = document.getElementById('agregar-empleado-btn-administrativo_1');
    const guardarAsistenciaBtnadministrativo_1 = document.querySelector('.btn-administrativo_1'); // El botón "GUARDAR ASISTENCIA"
    const tbodyadministrativo_1 = document.querySelector('.empleados-table-administrativo_1 tbody');
    const filaAgregarEmpleadoadministrativo_1 = document.getElementById('fila-agregar-empleado-administrativo_1');

    // Inicializar Choices.js
    const choicesadministrativo_1 = new Choices(selectorEmpleadoadministrativo_1, {
        searchEnabled: true,
        removeItemButton: true,
        placeholder: true,
        noResultsText: 'No se encontraron empleados',
    });

    let empleadosCargadosadministrativo_1 = []; // Variable para almacenar los empleados cargados
    let empleadosSeleccionadosadministrativo_1 = []; // Almacenar los empleados añadidos solo en la tabla

    // Cargar empleados en el selector
    async function cargarEmpleadosEnSelectoradministrativo_1() {
        try {
            const response = await fetch('/añadir-empleados');
            if (!response.ok) throw new Error('Error al obtener los empleados');

            const empleados = await response.json();
            empleadosCargadosadministrativo_1 = empleados; // Guardar empleados cargados

            console.log('Empleados cargados:', empleadosCargadosadministrativo_1);

            // Vaciar Choices antes de rellenarlo
            choicesadministrativo_1.clearChoices();

            // Añadir opciones a Choices.js
            choicesadministrativo_1.setChoices(
                empleados.map(empleado => ({
                    value: empleado.id_empleado,
                    label: empleado.nombres,
                    customProperties: {
                        dni: empleado.dni,
                        cargo: empleado.cargo,
                    },
                })),
                'value',
                'label',
                false
            );
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudieron cargar los empleados en el selector.');
        }
    }

    // Añadir empleado seleccionado a la tabla para la sección Lecturas
    agregarBtnadministrativo_1.addEventListener('click', function () {
        const selectedValue = choicesadministrativo_1.getValue(true);
        console.log('Empleado seleccionado:', selectedValue); // Log para ver el valor seleccionado

        if (!selectedValue) {
            alert('Seleccione un empleado válido.');
            return;
        }
    
        const empleadoSeleccionado = empleadosCargadosadministrativo_1.find(empleado => empleado.id_empleado == selectedValue);
    
        if (!empleadoSeleccionado) {
            console.error('Empleado no válido. Opciones cargadas:', empleadosCargadosadministrativo_1);
            alert('Empleado no válido.');
            return;
        }
    
        // Verificar si el empleado ya está en la tabla
        if (empleadosSeleccionadosadministrativo_1.some(e => e.id_empleado == empleadoSeleccionado.id_empleado)) {
            alert('El empleado ya ha sido añadido a la tabla.');
            return;
        }

        const nombresApellidos = empleadoSeleccionado.nombres;
        const dni = empleadoSeleccionado.dni;
        const cargo = empleadoSeleccionado.cargo;

        const nuevaFilaadministrativo_1 = document.createElement('tr');
        nuevaFilaadministrativo_1.innerHTML = `
            <td>${tbodyadministrativo_1.children.length + 1}</td>
            <td>${dni}</td>
            <td>${nombresApellidos}</td>
            <td>${cargo}</td>
            <td>
                <select name="estado" class="estado-select">
                    <option value=" "> </option>
                    <option value="A">A</option>
                    <option value="DT">DT</option>
                    <option value="FT">FT</option>
                    <option value="LG">LG</option>
                    <option value="DM">DM</option>
                    <option value="V">V</option>
                    <option value="LSG">LSG</option>
                    <option value="F">F</option>
                    <option value="SU">SU</option>
                    <option value="CE">CE</option>
                    <option value="FG">FG</option>
                    <option value="LD">LD</option>
                    <option value="DC">DC</option>
                    <option value="AP">AP</option>
                    <option value="LP">LP</option>
                    <option value="TC">TC</option>
                </select>
                <input type="hidden" name="id_empleado" value="${empleadoSeleccionado.id_empleado}">
            </td>
            <td><input type="number" name="pasajes" step="0.01" min="0" placeholder="Pasajes"></td>
            <td><input type="number" name="viaticos" step="0.01" min="0" placeholder="Viáticos"></td>
            <td><input type="text" name="ruta" placeholder="Ruta"></td>
            <td>
            <button type="button" class="eliminar-fila-btn">X</button>
            </td>
        `;

        // Insertar la nueva fila antes de la fila de agregar empleado
        if (tbodyadministrativo_1.contains(filaAgregarEmpleadoadministrativo_1)) {
            tbodyadministrativo_1.insertBefore(nuevaFilaadministrativo_1, filaAgregarEmpleadoadministrativo_1);
            console.log('Fila añadida antes de fila-agregar-empleado-administrativo_1');
        } else {
            tbodyadministrativo_1.appendChild(nuevaFilaadministrativo_1);
            console.log('Fila añadida al final de la tabla');
        }

        empleadosSeleccionadosadministrativo_1.push(empleadoSeleccionado);

        fetch('/auditar-agregar-empleado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_empleado: empleadoSeleccionado.id_empleado })
        });

        // Añadir evento al botón de eliminación
        const eliminarBtn = nuevaFilaadministrativo_1.querySelector('.eliminar-fila-btn');
        eliminarBtn.addEventListener('click', function () {
            const index = empleadosSeleccionadosadministrativo_1.findIndex(e => e.id_empleado == empleadoSeleccionado.id_empleado);
            if (index !== -1) empleadosSeleccionadosadministrativo_1.splice(index, 1); // Eliminar del array de seleccionados
            nuevaFilaadministrativo_1.remove(); // Eliminar la fila de la tabla
            actualizarNumeracion(); // Actualizar la numeración de las filas
        });
        
        // Evento para controlar la restricción de campos
        const selectEstado = nuevaFilaadministrativo_1.querySelector('.estado-select');
        const camposRestringidos = [
            nuevaFilaadministrativo_1.querySelector('input[name="pasajes"]'),
            nuevaFilaadministrativo_1.querySelector('input[name="viaticos"]'),
            nuevaFilaadministrativo_1.querySelector('input[name="ruta"]')
        ].filter(campo => campo); // Filtra elementos nulos para evitar errores
        
        selectEstado.addEventListener('change', function () {
            if (["A", "DT", "FT"].includes(selectEstado.value)) {
                camposRestringidos.forEach(campo => {
                    campo.disabled = false;
                });
            } else {
                camposRestringidos.forEach(campo => {
                    campo.disabled = true;
                    campo.value = ""; // Limpiar los campos al deshabilitarlos
                });
            }
        });
        
        // Aplicar la restricción inicialmente si el estado no es "A", "DT" o "FT"
        selectEstado.dispatchEvent(new Event('change'));
    });

    // Función para actualizar la numeración de las filas en la tabla
    function actualizarNumeracion() {
        Array.from(tbodyadministrativo_1.children).forEach((fila, index) => {
            const celdaNumero = fila.querySelector('td:first-child');
            if (celdaNumero) celdaNumero.textContent = index + 1;
        });
    }

    guardarAsistenciaBtnadministrativo_1.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    
        if (tbodyadministrativo_1.children.length === 0) {
            alert('No hay empleados añadidos.');
            return;
        }

        // Obtener la fecha seleccionada
        const fechaSeleccionada = document.getElementById('fecha-administrativo_1').value;
        if (!fechaSeleccionada) {
            alert("Seleccione una fecha válida.");
            return;
        }

        // Convertir la fecha seleccionada a un objeto Date
        //const fecha = new Date(fechaSeleccionada);

        // Obtener la fecha actual y construir los límites del rango
        //const hoy = new Date();
        //const mesActual = hoy.getMonth() + 1;
        //const añoActual = hoy.getFullYear();

        // Definir el rango permitido
        //let inicioRango, finRango;
        //if (hoy.getDate() >= 26) {
            // Estamos entre el 26 y el final del mes actual
            //inicioRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${(mesActual + 1).toString().padStart(2, '0')}-25`);
        //} else {
            // Estamos antes del 26, entonces el rango es del mes anterior al actual
            //const mesAnterior = mesActual - 1 || 12;
            //const añoAnterior = mesAnterior === 12 ? añoActual - 1 : añoActual;

            //inicioRango = new Date(`${añoAnterior}-${mesAnterior.toString().padStart(2, '0')}-26`);
            //finRango = new Date(`${añoActual}-${mesActual.toString().padStart(2, '0')}-25`);
       //}

        // Validar si la fecha seleccionada está dentro del rango permitido
        //if (fecha < inicioRango || fecha > finRango) {
            //alert(`La fecha seleccionada está fuera del rango permitido.\nSolo se puede registrar asistencia desde el ${inicioRango.toISOString().split('T')[0]} hasta el ${finRango.toISOString().split('T')[0]}.`);
            //return;
        //}
    
        // Recoger los datos de los empleados y sus estados
        const empleadosParaGuardaradministrativo_1 = [];
        tbodyadministrativo_1.querySelectorAll('tr').forEach(fila => {
            const idEmpleado = fila.querySelector('input[name="id_empleado"]').value;
            const estadoSelect = fila.querySelector('select[name="estado"]');
            const estado = estadoSelect ? estadoSelect.value : 'A';
            const pasajesInput = fila.querySelector('input[name="pasajes"]');
            const rutaInput = fila.querySelector('input[name="ruta"]');
            const viaticosInput = fila.querySelector('input[name="viaticos"]');
    
            empleadosParaGuardaradministrativo_1.push({
                id_empleado: idEmpleado,
                estado: estado,
                pasajes: pasajesInput ? parseFloat(pasajesInput.value) || 0 : 0,
                ruta: rutaInput ? rutaInput.value.trim() : '',
                viaticos: viaticosInput ? parseFloat(viaticosInput.value) || 0 : 0,
                es_extra: empleadosSeleccionadosadministrativo_1.some(e => e.id_empleado == idEmpleado) // Verificar si es extra
            });
        });
        
        console.log('Empleados para guardar:', empleadosParaGuardaradministrativo_1);
    
        // Preparar los datos para el backend
        const asistenciasadministrativo_1 = empleadosParaGuardaradministrativo_1.map(empleado => ({
            mes: document.getElementById('mes-administrativo_1').value,
            fecha: document.getElementById('fecha-administrativo_1').value,
            estado: empleado.estado,
            pasajes: empleado.pasajes,
            ruta: empleado.ruta,
            viaticos: empleado.viaticos,
            id_empleado: empleado.id_empleado,
            es_extra: empleado.es_extra
        }));

        console.log('Asistencias preparadas para guardar:', asistenciasadministrativo_1);
    
        try {
            const response = await fetch('/guardar-asistencia-detalle-administrativo_1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ asistencias: asistenciasadministrativo_1}),
            });
    
            const result = await response.json(); // Obtener respuesta del backend

            if (!response.ok) {
                throw new Error(result.message || 'Error al guardar la asistencia');
            }

            alert(result.message || 'Asistencia guardada correctamente.');

            // Auditar que se guardó la asistencia
            const fechaAuditoria = document.getElementById('fecha-administrativo_1').value;
            console.log('Fecha usada para auditoría:', fechaAuditoria);  // ✅ <-- ESTA ES LA LÍNEA QUE QUERÍAS

            fetch('/auditar-guardar-asistencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fecha: fechaAuditoria
                })
            });
            
        } catch (error) {
            // Si el error viene del backend, lo mostramos en pantalla
            if (error.message.includes('ya cuenta con asistencia')) {
                alert(error.message);
            } else {
                alert('Hubo un problema al guardar la asistencia.');
            }
        }
    
        empleadosSeleccionadosadministrativo_1 = []; // Limpiar la lista de empleados seleccionados
        console.log('Empleados seleccionados después de guardar:', empleadosSeleccionadosadministrativo_1);
    });
    await cargarEmpleadosEnSelectoradministrativo_1();
});


//ADMINISTRATIVO
let empleadosData = []; // Variable global para almacenar los datos
let daysInMonth = 0; // Número de días en el mes actual
let year = new Date().getFullYear(); // Año actual

document.querySelector('.btn-buscar').addEventListener('click', async () => {
    const areaSeleccionada = document.getElementById('areas-administrativo').value;
    let fechaInicio = document.getElementById('fechainicio').value;
    let fechaFin = document.getElementById('fechafin').value;

    console.log('Fecha usada para auditoría:', fechaInicio, fechaFin);

    // 📌 1. Registrar auditoría en el backend
    fetch('/auditar-busqueda-fecha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            area: areaSeleccionada
        })
    });

    if (!areaSeleccionada || !fechaInicio || !fechaFin) {
        alert("Por favor, selecciona un área y un intervalo de fechas.");
        return;
    }

    // Convertir fechas a objetos Date con "T00:00:00" para evitar problemas de zona horaria
    let startDate = new Date(fechaInicio + "T00:00:00");
    let endDate = new Date(fechaFin + "T00:00:00");

    if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
    }

    const tabla = document.getElementById('tabla-asistencia-administrativo');
    const tbody = tabla.querySelector('tbody');
    const thead = tabla.querySelector('thead tr');

    // Limpiar la tabla
    tbody.innerHTML = '';
    thead.innerHTML = `
        <th>N°</th>
        <th>DNI</th>
        <th>Nombres y Apellidos</th>
        <th>Puesto de Trabajo</th>
    `;

    // Generar cabecera con las fechas exactas seleccionadas
    let tempDate = new Date(startDate);
    while (tempDate <= endDate) {
        const th = document.createElement('th');
        th.textContent = tempDate.getDate().toString().padStart(2, '0');
        if (tempDate.getDay() === 0) th.classList.add('sunday', 'sunday-column'); // Marcar domingos
        thead.appendChild(th);
        tempDate.setDate(tempDate.getDate() + 1);
    }

    try {
        const response = await fetch('/api/getAsistencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                area: areaSeleccionada,
                fechaInicio: startDate.toISOString().split('T')[0], 
                fechaFin: endDate.toISOString().split('T')[0]
            }),
        });

        if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
        empleadosData = await response.json();

        if (!Array.isArray(empleadosData) || empleadosData.length === 0) {
            alert("No se encontraron registros para el intervalo de fechas seleccionado.");
            return;
        }

        actualizarTabla('asistencias');

    } catch (error) {
        console.error('Error obteniendo datos:', error);
        alert("Hubo un error obteniendo los datos. Revisa la consola para más información.");
    }
});

async function cargarConsolidado(tipo) {
    const fechaInicio = document.getElementById('fechainicio').value;
    const fechaFin = document.getElementById('fechafin').value;

    try {
        const response = await fetch('/api/getConsolidado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fechaInicio,
                fechaFin,
                tipo // "asistencias" o "pasajes"
            }),
        });

        if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);
        empleadosData = await response.json();

        actualizarTabla(tipo === 'asistencias' ? 'consolidado' : 'consolidado_pasajes');
        
    } catch (error) {
        console.error('Error obteniendo consolidado:', error);
        alert("Hubo un error obteniendo el consolidado.");
    }
}


const coloresAreas = {
    "TOMA DE ESTADO": "#DFFFD6",
    "CATASTRO": "#FFF4C2",
    "PERSUASIVAS": "#d6e1ffff",
    "INSPECCIONES": "#D6F0FF",
    "DISTRIBUCION": "#F0D6FF",
    "MEDICION": "#d3d2cfff",
    "NORTE": "#D6FFF6"
};


function actualizarTabla(modo) {
    const tabla = document.getElementById('tabla-asistencia-administrativo');
    const thead = tabla.querySelector('thead');
    const tbody = tabla.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const fechaInicio = new Date(document.getElementById('fechainicio').value + "T00:00:00");
    const fechaFin = new Date(document.getElementById('fechafin').value + "T00:00:00");

    let fechas = [];
    for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
        fechas.push(new Date(d).toISOString().split('T')[0]); // YYYY-MM-DD
    }

    const trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th>#</th>
        <th>DNI</th>
        <th>Nombres</th>
        <th>Cargo</th>
        ${(modo === 'consolidado' || modo === 'consolidado_pasajes') ? '<th>Área Global</th><th>Área</th>' : ''}
    `;

    fechas.forEach(fecha => {
        const fechaObj = new Date(fecha + "T00:00:00");
        const dia = fechaObj.getDate();
        const mes = fechaObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase();

        const th = document.createElement('th');
        th.innerHTML = `${dia}<br>${mes}`;
        if (fechaObj.getDay() === 0) th.classList.add('sunday-column');
        trHead.appendChild(th);
    });

    if (modo === 'pasajes' || modo === 'viaticos' || modo === 'consolidado_pasajes') {
        const thTotal = document.createElement('th');
        thTotal.innerHTML = 'TOTAL';
        trHead.appendChild(thTotal);
    }

    thead.appendChild(trHead);

    empleadosData.forEach((empleado, index) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${empleado.dni}</td>
            <td>${empleado.nombres}</td>
            <td>${empleado.cargo}</td>
            ${(modo === 'consolidado' || modo === 'consolidado_pasajes') ? `<td>${empleado.area_global || ''}</td><td>${empleado.area || ''}</td>` : ''}
        `;

        let totalPasajes = 0;
        let totalViaticos = 0;

        fechas.forEach(fecha => {
            const td = document.createElement('td');
            let valor = '';

            if (modo === 'asistencias') {
                valor = empleado.asistencia?.[fecha] || '';
            } else if (modo === 'viaticos') {
                const viatico = empleado.viaticos?.[fecha] || 0;
                const ruta = empleado.rutas?.[fecha] || '';
                valor = `<b>V:</b> s/${viatico}<br><b>R:</b> ${ruta}`;
                totalViaticos += parseFloat(viatico) || 0;
            } else if (modo === 'pasajes') {
                const pasaje = empleado.pasajes?.[fecha] || 0;
                valor = pasaje;
                totalPasajes += parseFloat(pasaje) || 0;
            } else if (modo === 'consolidado') {
                const datoDia = empleado[fecha]; // {estado, area_dia}
                if (datoDia && datoDia.estado) {
                    valor = datoDia.estado;
                    td.style.backgroundColor = coloresAreas[datoDia.area_dia?.toUpperCase()] || "#FFFFFF";
                } else {
                    td.style.backgroundColor = "#FFFFFF";
                }
            } else if (modo === 'consolidado_pasajes') {
                const datoDia = empleado[fecha]; // {pasajes, area_dia}
                if (datoDia && datoDia.pasajes) {
                    valor = datoDia.pasajes;
                    totalPasajes += parseFloat(datoDia.pasajes) || 0;
                    td.style.backgroundColor = coloresAreas[datoDia.area_dia?.toUpperCase()] || "#FFFFFF";
                } else {
                    td.style.backgroundColor = "#FFFFFF";
                }
            }

            td.innerHTML = valor;

            // 🔹 Si es domingo, color rojo siempre prevalece
            if (new Date(fecha + "T00:00:00").getUTCDay() === 0) {
                td.style.backgroundColor = "#FFD6D6";
                td.classList.add('sunday-column');
            }

            tr.appendChild(td);
        });

        if (modo === 'pasajes' || modo === 'consolidado_pasajes') {
            const tdTotalPasajes = document.createElement('td');
            tdTotalPasajes.textContent = totalPasajes.toFixed(2);
            tr.appendChild(tdTotalPasajes);
        }

        if (modo === 'viaticos') {
            const tdTotalViaticos = document.createElement('td');
            tdTotalViaticos.textContent = totalViaticos.toFixed(2);
            tr.appendChild(tdTotalViaticos);
        }
        tbody.appendChild(tr);
    });
}


document.getElementById('btn-asistencias').addEventListener('click', () => actualizarTabla('asistencias'));
document.getElementById('btn-pasajes').addEventListener('click', () => actualizarTabla('pasajes'));
document.getElementById('btn-viaticos').addEventListener('click', () => actualizarTabla('viaticos'));

document.getElementById('btn-consolidado').addEventListener('click', () => {
    cargarConsolidado('asistencias');
    mostrarLeyenda();
});

document.getElementById('btn-consolidado-pasajes').addEventListener('click', () => {
    cargarConsolidado('pasajes');
    mostrarLeyenda();
});


function mostrarLeyenda() {
    const ventana = document.getElementById("ventanaConsolidado");
    const contenido = document.getElementById("contenidoLeyenda");
    contenido.innerHTML = "";

    Object.entries(coloresAreas).forEach(([nombre, color]) => {
        const divItem = document.createElement("div");
        divItem.className = "leyenda-item";

        const colorBox = document.createElement("div");
        colorBox.className = "color-cuadro";
        colorBox.style.background = color;

        const texto = document.createElement("span");
        texto.textContent = nombre;

        divItem.appendChild(colorBox);
        divItem.appendChild(texto);
        contenido.appendChild(divItem);
    });

    ventana.style.display = "block";
}

// Cerrar ventana
document.getElementById("cerrarVentana").addEventListener("click", () => {
    document.getElementById("ventanaConsolidado").style.display = "none";
});

// Hacer que se pueda arrastrar
dragElement(document.getElementById("ventanaConsolidado"), document.getElementById("barraTitulo"));

function dragElement(elmnt, barra) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    barra.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}



//DESCARGAR EXCEL
document.querySelector('.btn-admin').addEventListener('click', () => {

    fetch('/auditar-busqueda-fecha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fecha_inicio: document.getElementById('fechainicio').value,
            fecha_fin: document.getElementById('fechafin').value,
            area: document.getElementById('areas-administrativo').value,
            accion: 'descargar_actual'
        })
    });

    if (empleadosData.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Obtener valores seleccionados
    const areaSeleccionada = document.getElementById('areas-administrativo').value || "GENERAL";
    let fechaInicio = document.getElementById('fechainicio').value;
    let fechaFin = document.getElementById('fechafin').value;

    if (!fechaInicio || !fechaFin) {
        alert("Por favor, selecciona un intervalo de fechas.");
        return;
    }

    // Formatear fechas
    let startDate = fechaInicio.split("-").reverse().join("-");
    let endDate = fechaFin.split("-").reverse().join("-");

    // Formatear nombre del archivo
    let nombreArchivo = `PLANILLA - ${areaSeleccionada.toUpperCase()} _ ${startDate} - ${endDate}.xlsx`;

    // Crear un nuevo libro de Excel
    let wb = XLSX.utils.book_new();

    function crearHoja(modo) {
        let encabezados = ["#", "DNI", "Nombres", "Cargo"];
        let fechas = [];

        let fechaInicioObj = new Date(fechaInicio + "T00:00:00");
        let fechaFinObj = new Date(fechaFin + "T00:00:00");

        for (let d = new Date(fechaInicioObj); d <= fechaFinObj; d.setDate(d.getDate() + 1)) {
            fechas.push(d.toISOString().split('T')[0]);
            encabezados.push(d.getDate().toString().padStart(2, '0'));
        }

        if (modo !== "asistencias") encabezados.push("TOTAL");

        let datos = [encabezados];

        empleadosData.forEach((empleado, index) => {
            let fila = [
                index + 1,
                empleado.dni,
                empleado.nombres,
                empleado.cargo
            ];

            let total = 0;

            fechas.forEach(fecha => {
                let valor = "";
                if (modo === "pasajes") {
                    valor = empleado.pasajes?.[fecha] || 0;
                    total += parseFloat(valor) || 0;
                } else if (modo === "viaticos") {
                    let viatico = empleado.viaticos?.[fecha] || 0;
                    let ruta = empleado.rutas?.[fecha] || "";
                    valor = `V: S/${viatico} - R: ${ruta}`;
                    total += parseFloat(viatico) || 0;
                } else if (modo === "asistencias") {
                    valor = empleado.asistencia?.[fecha] || "";
                }
                fila.push(valor);
            });

            if (modo !== "asistencias") fila.push(total.toFixed(2));

            datos.push(fila);
        });

        return XLSX.utils.aoa_to_sheet(datos);
    }

    wb.SheetNames.push("Asistencias");
    wb.Sheets["Asistencias"] = crearHoja("asistencias");

    wb.SheetNames.push("Pasajes");
    wb.Sheets["Pasajes"] = crearHoja("pasajes");

    wb.SheetNames.push("Viáticos y Rutas");
    wb.Sheets["Viáticos y Rutas"] = crearHoja("viaticos");

    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo);
});


//EXCEL COMPLETO
document.querySelector('.btn-completo').addEventListener('click', async () => {

    fetch('/auditar-busqueda-fecha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fecha_inicio: document.getElementById('fechainicio').value,
            fecha_fin: document.getElementById('fechafin').value,
            area: document.getElementById('areas-administrativo').value,
            accion: 'descargar_completo'
        })
    });

    let fechaInicio = document.getElementById('fechainicio').value;
    let fechaFin = document.getElementById('fechafin').value;
    let spinner = document.getElementById('spinner');

    if (!fechaInicio || !fechaFin) {
        alert("Por favor, selecciona un intervalo de fechas.");
        return;
    }

    console.log("Fecha de inicio:", fechaInicio);
    console.log("Fecha de fin:", fechaFin);

    spinner.style.display = "block"; // Muestra el spinner

    try {
        const response = await fetch('/api/getAsistenciaCompleta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fechaInicio, fechaFin }),
        });

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        // Recibe el archivo Excel como blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Crea un enlace temporal para descargar el archivo
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Completo_Asistencia_${fechaInicio.replace(/-/g, '')}_${fechaFin.replace(/-/g, '')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log("📁 Archivo Excel descargado correctamente.");
    } catch (error) {
        console.error('❌ Error obteniendo el reporte:', error);
        alert("Hubo un error generando el reporte. Revisa la consola para más información.");
    } finally {
        spinner.style.display = "none"; // Oculta el spinner al terminar
    }
});


//GENERAR BOLETAS
document.getElementById('boleta-btn').addEventListener('click', async (e) => {
    e.preventDefault();

    const mes = document.getElementById('boleta-mes').value;
    const fecha = document.getElementById('boleta-fecha').value;
    const fileInput = document.getElementById('boleta-file');
    const file = fileInput.files[0];
    const spinner = document.getElementById('spinner-boleta');

    if (!mes || !fecha || !file) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const formData = new FormData();
    formData.append('mes', mes);
    formData.append('fecha', fecha);
    formData.append('file', file);

    console.log("Mostrando spinner...");
    spinner.style.display = "block";

    try {
        const response = await fetch('/generar_boletas', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);

            // Mostrar la previsualización del PDF en el contenedor
            const previewContainer = document.getElementById('boleta-preview');
            previewContainer.innerHTML = `<iframe src="${pdfUrl}" type="application/pdf" style="width: 100%; height: 800px; border: none;"></iframe>`;

            // Mostrar botón de descarga
            const downloadBtn = document.getElementById('download-btn');
            downloadBtn.style.display = 'block';
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = 'boletas_pago.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

        } else {
            alert('Error al generar las boletas. Inténtalo de nuevo.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar las boletas.');
    } finally {
        console.log("Ocultando spinner...");
        spinner.style.display = "none"
    }
});


//REPORTES LECTURAS
document.addEventListener('DOMContentLoaded', () => {
  const generarBtn = document.querySelector('.btn-generar');
  if (!generarBtn) {
    console.error('No se encontró el botón .btn-generar');
    return;
  }

  generarBtn.addEventListener('click', () => {
    const archivoInput = document.getElementById('subir_archivo');
    const areaSelect = document.getElementById('areas-administrativo');
    const spinner = document.getElementById('spinner-boleta');
    const downloadBtn = document.getElementById('download-btn-1');
    const preview = document.getElementById('reporte-preview');

    const area = areaSelect.value;
    const files = archivoInput.files;

    if (!area) {
      alert('Por favor selecciona un área.');
      return;
    }

    if (!files.length) {
      alert('Por favor selecciona al menos un archivo Excel.');
      return;
    }

    const formData = new FormData();
    formData.append('areas', area);

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    spinner.style.display = 'block';
    preview.innerHTML = '';
    downloadBtn.style.display = 'none';

    fetch('/upload', {
  method: 'POST',
  body: formData
})
  .then(response => {
    spinner.style.display = 'none';

    if (!response.ok) {
      return response.text().then(text => { throw new Error(text); });
    }

    return response.json(); // Esperamos una respuesta JSON del backend
  })
  .then(data => {
    if (data.error) {
      alert(`⚠️ ${data.error}`);
      preview.innerHTML = `<p style="color: orange;">⚠️ ${data.error}</p>`;
      return;
    }

    preview.innerHTML = '<p>✅ Análisis generado correctamente.</p>';
    downloadBtn.style.display = 'block';

    downloadBtn.onclick = () => {
      window.location.href = data.download_url;
    };
  })
  .catch(error => {
    spinner.style.display = 'none';
    preview.innerHTML = `<p style="color: red;">❌ Error: ${error.message}</p>`;
  });
  });
});


//FOTOCONSULTA
document.addEventListener("DOMContentLoaded", () => {
  const inputCodigo = document.getElementById("fc-codigo-input");
  const btnBuscar = document.getElementById("fc-buscar-btn");
  const opcionesScroll = document.querySelector(".fc-opciones-scroll");
  const opcionesDiv = document.querySelector(".fc-opciones");
  const seccionDerecha = document.getElementById("fc-seccion-derecha");

  // Variables para control de carrusel de imágenes
  let imagenesActuales = [];
  let indiceImagenActual = 0;
  let rotacionActual = 0;

  btnBuscar.addEventListener("click", async () => {
    const codigo = inputCodigo.value.trim();
    if (!codigo) {
      alert("Por favor ingresa un código");
      return;
    }

    console.log("Buscando imágenes para el código:", codigo);

    // Mostrar "Buscando..."
    opcionesScroll.innerHTML = `<div class="fc-opcion">Buscando...</div>`;
    opcionesDiv.innerHTML = "";
    seccionDerecha.innerHTML = "";

    try {
      const response = await fetch("/buscar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo }),
      });

      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta recibida:", data);

      if (data.error) {
        opcionesScroll.innerHTML = `<div class="fc-opcion">Error: ${data.error}</div>`;
        return;
      }

      opcionesScroll.innerHTML = "";
      opcionesDiv.innerHTML = "";
      seccionDerecha.innerHTML = "";

      // Para que al hacer click en la cabecera se carguen las imágenes en la derecha
      data.resultados.forEach(carpetaData => {
        const leyenda = carpetaData.leyenda;

        const cabeceraDiv = document.createElement("div");
        cabeceraDiv.className = "fc-opcion";
        cabeceraDiv.textContent = leyenda;
        opcionesScroll.appendChild(cabeceraDiv);

        opcionesDiv.style.maxHeight = "620px";
        opcionesDiv.style.overflowY = "auto";

        cabeceraDiv.addEventListener("click", () => {
            opcionesDiv.innerHTML = "";

            if (leyenda !== "LECTURAS") {
                // Caso normal: muestra imágenes directo
                if (carpetaData.imagenes) {
                if (carpetaData.imagenes.length === 0) {
                    const mensaje = document.createElement("div");
                    mensaje.className = "fc-opcion";
                    mensaje.textContent = "No hay imágenes en esta categoría.";
                    opcionesDiv.appendChild(mensaje);
                    return;
                }

                carpetaData.imagenes.forEach((imgNombre, index) => {
                    crearOpcionImagen(opcionesDiv, imgNombre, index, carpetaData.carpeta, carpetaData);
                });

                imagenesActuales = carpetaData.imagenes.map(nombre => ({ nombre, carpeta: carpetaData.carpeta, categoria: "ordenes" }));
                indiceImagenActual = 0;
                rotacionActual = 0;
                mostrarImagen();
                

                } else {
                // Si no hay imágenes ni subgrupos
                const mensaje = document.createElement("div");
                mensaje.className = "fc-opcion";
                mensaje.textContent = "No hay imágenes en esta categoría.";
                opcionesDiv.appendChild(mensaje);
                }

            } else {
                // Ordenar subgrupos por carpeta AAAAMM ascendente
                const subgruposOrdenados = carpetaData.subgrupos.slice().sort((a, b) => {
                    const extraerAAAAMM = carpeta => carpeta.split('/')[0];
                    return extraerAAAAMM(b.carpeta).localeCompare(extraerAAAAMM(a.carpeta));
                });

                subgruposOrdenados.forEach((subgrupo, index)=> {
                    const fechaDiv = document.createElement("div");
                    fechaDiv.textContent = subgrupo.leyenda;
                    fechaDiv.style.fontWeight = "bold";
                    fechaDiv.style.border = "none";
                    fechaDiv.style.background = "none";
                    fechaDiv.style.borderRadius = "0";
                    fechaDiv.style.marginTop = index === 0 ? "1px" : "15px";
                    fechaDiv.style.marginBottom = "5px";
                    opcionesDiv.appendChild(fechaDiv);
                    

                    if (subgrupo.imagenes && subgrupo.imagenes.length > 0) {
                        subgrupo.imagenes.forEach((imgNombre, index) => {
                            const opcionImg = document.createElement("div");
                            opcionImg.className = "fc-opcion fc-imagen";
                            opcionImg.style.marginLeft = "0";
                            opcionImg.style.cursor = "pointer";
                            opcionImg.textContent = imgNombre;

                            opcionImg.addEventListener("click", () => {
                                imagenesActuales = subgrupo.imagenes.map(nombre => ({ nombre, carpeta: subgrupo.carpeta, categoria: "lecturas" }));
                                indiceImagenActual = index;
                                rotacionActual = 0;
                                mostrarImagen();

                            });

                            opcionesDiv.appendChild(opcionImg);
                        });
                    } else {
                        const mensaje = document.createElement("div");
                        mensaje.className = "fc-opcion";
                        mensaje.style.marginLeft = "0";
                        mensaje.textContent = "No hay imágenes para esta fecha.";
                        opcionesDiv.appendChild(mensaje);
                    }
                });
            }

            
            });

        });

        // Función auxiliar para crear la opción de imagen y manejar evento click
        function crearOpcionImagen(contenedor, imgNombre, index, carpeta, carpetaData) {
        const opcionImg = document.createElement("div");
        const carpetaUrl = carpeta.replace(/\\/g, "/");
        opcionImg.className = "fc-opcion";
        opcionImg.style.display = "flex";
        opcionImg.style.alignItems = "center";
        opcionImg.style.gap = "10px";
        opcionImg.style.padding = "5px 10px";
        opcionImg.style.marginBottom = "8px";

        const miniatura = document.createElement("img");
        miniatura.src = `http://200.233.44.171/app_oraclesedalib/public/storage/images/ordenes/${carpetaUrl}/${imgNombre}`;
        miniatura.style.width = "60px";
        miniatura.style.height = "60px";
        miniatura.style.objectFit = "cover";
        miniatura.style.borderRadius = "5px";
        miniatura.style.border = "1px solid #ccc";

        const nombreArchivo = document.createElement("span");
        nombreArchivo.textContent = imgNombre;
        nombreArchivo.style.whiteSpace = "nowrap";
        nombreArchivo.style.overflow = "hidden";
        nombreArchivo.style.textOverflow = "ellipsis";

        opcionImg.appendChild(miniatura);
        opcionImg.appendChild(nombreArchivo);

        opcionImg.addEventListener("click", () => {
            imagenesActuales = carpetaData.imagenes
            ? carpetaData.imagenes.map(nombre => ({ nombre, carpeta, categoria: carpetaData.categoria }))
            : carpetaData.subgrupos && carpetaData.subgrupos.length > 0
            ? carpetaData.subgrupos.flatMap(sub =>
                sub.imagenes.map(nombre => ({ nombre, carpeta: sub.carpeta, categoria: sub.categoria }))
                )
            : [];

            indiceImagenActual = index;
            rotacionActual = 0;
            mostrarImagen();
        });

        contenedor.appendChild(opcionImg);
        }


      // Si no hay resultados
      if (data.resultados.length === 0) {
        opcionesScroll.innerHTML = `<div class="fc-opcion">No se encontraron imágenes para el código ${codigo}</div>`;
      }
    } catch (error) {
      console.error("Error buscando imágenes:", error);
      opcionesScroll.innerHTML = `<div class="fc-opcion">Error buscando imágenes: ${error.message}</div>`;
      opcionesDiv.innerHTML = "";
      seccionDerecha.innerHTML = "";
    }
  });

let zoomActual = 1;

function mostrarImagen(leyendaAux) {
  if (imagenesActuales.length === 0) {
    seccionDerecha.innerHTML = "<p>No hay imágenes para mostrar.</p>";
    return;
  }

  let { nombre, carpeta, categoria } = imagenesActuales[indiceImagenActual];

  if (categoria == undefined){
    categoria = "ordenes"
  }


  const carpetaUrl = carpeta.replace(/\\/g, "/");

    // Codificar cada segmento para URL segura
  const segmentos = carpetaUrl.split("/").map(encodeURIComponent);
  const nombreUrl = encodeURIComponent(nombre);

  console.log()
  const urlImagen = `http://200.233.44.171/app_oraclesedalib/public/storage/images/${categoria}/${segmentos.join("/")}/${nombreUrl}`;
  
  console.log("URL imagen formada:", urlImagen);

  seccionDerecha.innerHTML = "";

  // Crear contenedor para imagen y controles
  const contenedorImagen = document.createElement("div");
  contenedorImagen.style.display = "flex";
  contenedorImagen.style.flexDirection = "column";
  contenedorImagen.style.alignItems = "center";
  contenedorImagen.style.justifyContent = "center";

  // Crear contenedor fijo para imagen con tamaño definido
  const marcoImagen = document.createElement("div");
  marcoImagen.style.width = "1000px"; // Ajusta a lo que necesites
  marcoImagen.style.height = "780px"; // Ajusta a lo que necesites
  marcoImagen.style.overflow = "hidden";
  marcoImagen.style.display = "flex";
  marcoImagen.style.alignItems = "center";
  marcoImagen.style.justifyContent = "center";
  marcoImagen.style.border = "1px solid #ccc";
  marcoImagen.style.background = "#fff";
  marcoImagen.style.borderRadius = "15px";

  const img = document.createElement("img");
  console.log("Cargando imagen:", `/imagen/${carpeta}/${nombre}`);
  console.log("carpeta original:", carpeta);
  console.log("carpeta URL limpia:", carpetaUrl);
  console.log("Imagen:", nombre);
  console.log("Ruta completa para la imagen:", `/imagen/${carpetaUrl}/${nombre}`);
  img.src = `http://200.233.44.171/app_oraclesedalib/public/storage/images/${categoria}/${carpetaUrl}/${nombre}`; // ✅ Ruta correcta
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";
  img.style.transform = `rotate(${rotacionActual}deg) scale(${zoomActual})`;  // agrego zoom aquí
  img.style.transition = "transform 0.3s ease";

  // Agrego el listener para zoom con scroll del mouse
  img.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomActual = Math.min(zoomActual + 0.1, 3); // máximo 3x
    } else {
      zoomActual = Math.max(zoomActual - 0.1, 0.5); // mínimo 0.5x
    }
    img.style.transform = `rotate(${rotacionActual}deg) scale(${zoomActual})`;
  });

  marcoImagen.appendChild(img);
  contenedorImagen.appendChild(marcoImagen);

  // Crear contenedor de botones
  const controlesDiv = document.createElement("div");
  controlesDiv.style.textAlign = "center";
  controlesDiv.style.marginTop = "10px";

  // Botón Anterior
  const btnAnterior = document.createElement("button");
  btnAnterior.textContent = "Anterior";
  btnAnterior.style.margin = "0 5px";
  btnAnterior.style.backgroundColor = "#184875"; // azul bootstrap
  btnAnterior.style.color = "white";
  btnAnterior.style.border = "none";
  btnAnterior.style.padding = "8px 16px";
  btnAnterior.style.borderRadius = "5px";
  btnAnterior.style.cursor = "pointer";
  btnAnterior.disabled = indiceImagenActual === 0;
  btnAnterior.style.opacity = btnAnterior.disabled ? "0.5" : "1";

  btnAnterior.addEventListener("click", () => {
    if (indiceImagenActual > 0) {
      indiceImagenActual--;
      rotacionActual = 0;
      zoomActual = 1;  // reinicio zoom al cambiar imagen
      mostrarImagen();
    }
  });

  // Botón Siguiente
  const btnSiguiente = document.createElement("button");
  btnSiguiente.textContent = "Siguiente";
  btnSiguiente.style.margin = "0 5px";
  btnSiguiente.style.backgroundColor = "#184875"; // verde bootstrap
  btnSiguiente.style.color = "white";
  btnSiguiente.style.border = "none";
  btnSiguiente.style.padding = "8px 16px";
  btnSiguiente.style.borderRadius = "5px";
  btnSiguiente.style.cursor = "pointer";
  btnSiguiente.disabled = indiceImagenActual === imagenesActuales.length - 1;
  btnSiguiente.style.opacity = btnSiguiente.disabled ? "0.5" : "1";

  btnSiguiente.addEventListener("click", () => {
    if (indiceImagenActual < imagenesActuales.length - 1) {
      indiceImagenActual++;
      rotacionActual = 0;
      zoomActual = 1;  // reinicio zoom al cambiar imagen
      mostrarImagen();
    }
  });

  // Botón Rotar
  const btnRotar = document.createElement("button");
  btnRotar.textContent = "Rotar";
  btnRotar.style.margin = "0 5px";
  btnRotar.style.backgroundColor = "#184875"; // amarillo bootstrap
  btnRotar.style.color = "#ffffff";
  btnRotar.style.border = "none";
  btnRotar.style.padding = "8px 16px";
  btnRotar.style.borderRadius = "5px";
  btnRotar.style.cursor = "pointer";

  btnRotar.addEventListener("click", () => {
    rotacionActual = (rotacionActual + 90) % 360;
    img.style.transform = `rotate(${rotacionActual}deg) scale(${zoomActual})`;
  });

  controlesDiv.appendChild(btnAnterior);
  controlesDiv.appendChild(btnRotar);
  controlesDiv.appendChild(btnSiguiente);

  contenedorImagen.appendChild(controlesDiv);
  seccionDerecha.appendChild(contenedorImagen);
}

document.addEventListener("keydown", (event) => {
  if (imagenesActuales.length === 0) return;

  switch(event.key) {
    case "ArrowRight":
    case "ArrowDown":
      if (indiceImagenActual < imagenesActuales.length - 1) {
        indiceImagenActual++;
        rotacionActual = 0;
        zoomActual = 1;
        mostrarImagen();
      }
      event.preventDefault();
      break;

    case "ArrowLeft":
    case "ArrowUp":
      if (indiceImagenActual > 0) {
        indiceImagenActual--;
        rotacionActual = 0;
        zoomActual = 1;
        mostrarImagen();
      }
      break;
    case "Tab":
      event.preventDefault();  // evita que el navegador cambie el foco
      rotacionActual = (rotacionActual + 90) % 360;
      mostrarImagen();
      break;
  }
});

});


// GENERADOR DE FICHAS
document.addEventListener("DOMContentLoaded", function () {
    const selector = document.getElementById("selector-actividad");
    const contenedor = document.querySelector(".contenedor-opciones-actividad");
    const inputExcel = document.getElementById("cargador-reporte");
    const botonSubir = document.getElementById("boton-subir-reporte");

    selector.addEventListener("change", function () {
        const actividad = selector.value;
        contenedor.innerHTML = "";
        if (!actividad) return;

        const pdfUrl = `/static/plantillas/${actividad}.pdf`;
        const visor = document.createElement("iframe");
        visor.id = "visor-pdf";
        visor.src = pdfUrl;
        visor.width = "100%";
        visor.height = "800";
        visor.style.border = "1px solid #ccc";

        // Mostrar el visor en el nuevo div
        const contenedorDerecha = document.getElementById("modulo-actividad-derecha");
        contenedorDerecha.innerHTML = "";
        contenedorDerecha.appendChild(visor);

        // Solo el formulario en el contenedor original
        contenedor.innerHTML = `<div id="formulario-mapeo"></div>`;

    });

    botonSubir.addEventListener("click", async function (e) {
        e.preventDefault();

        const actividad = selector.value;
        const archivo = inputExcel.files[0];

        if (!archivo) return alert("Primero sube un archivo Excel.");
        if (!actividad) return alert("Selecciona una actividad primero.");

        if (actividad === "COORDENADAS_CATASTRO") {
            const formData = new FormData();
            formData.append("reporte", archivo);

            try {
                const response = await fetch('/procesar-coordenadas', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                const data = await response.json(); // { pdfs: [...] }

                const contenedor = document.getElementById('modulo-actividad-derecha');
                contenedor.innerHTML = `
                    <h3>Vista previa de PDFs generados:</h3>
                    <div id="pdf-visor-container" style="
                        border: 1px solid #ccc;
                        padding: 10px;
                        background: #f9f9f9;
                    ">
                        <iframe id="pdf-visor" src="" width="100%" height="600px" style="border: 1px solid #999;"></iframe>
                    </div>

                    <div style="margin-top: 10px; text-align: center;">
                        <button id="btn-anterior" class="boton-azul">Anterior</button>
                        <span id="contador-pagina" style="margin: 0 10px;"></span>
                        <button id="btn-siguiente" class="boton-azul">Siguiente</button>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <button id="btn-descargar-zip" class="boton-verde">Descargar ZIP con todos los PDFs</button>
                    </div>
                `;

                let indiceActual = 0;
                const totalPDFs = data.pdfs.length;
                const visor = document.getElementById('pdf-visor');
                const contador = document.getElementById('contador-pagina');

                function mostrarPDF(index) {
                    const nombre = data.pdfs[index];
                    visor.src = `/ver-pdf-generado/${encodeURIComponent(nombre)}`;
                    contador.textContent = `PDF ${index + 1} de ${totalPDFs}`;
                }

                document.getElementById('btn-anterior').addEventListener('click', () => {
                    if (indiceActual > 0) {
                        indiceActual--;
                        mostrarPDF(indiceActual);
                    }
                });

                document.getElementById('btn-siguiente').addEventListener('click', () => {
                    if (indiceActual < totalPDFs - 1) {
                        indiceActual++;
                        mostrarPDF(indiceActual);
                    }
                });

                document.getElementById('btn-descargar-zip').addEventListener('click', () => {
                    window.location.href = '/descargar-coordenadas-zip';
                });

                mostrarPDF(indiceActual); // mostrar el primero

            } catch (err) {
                alert("Error: " + err.message);
            }
        }
        else if (actividad === "RENOMBRARLEVANTAMIENTO") {
            const formData = new FormData();
            formData.append("reporte", archivo);

            try {
                const response = await fetch('/procesar-levantamiento', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error("Error procesando Excel");

                const registros = await response.json();
                window.datosExcelLevantamiento = registros;

                document.getElementById("modal-renombrar").style.display = "flex";

            } catch (err) {
                alert("Error: " + err.message);
            }
         } 
         else {
            // Flujo para plantillas normales
            const formData = new FormData();
            formData.append("reporte", archivo);
            formData.append("actividad", actividad);

            fetch("/subir-excel", {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error("Error al subir el archivo");
                return response.json();
            })
            .then(data => {
                if (data.columnas && Array.isArray(data.columnas)) {
                    esperarElemento("formulario-mapeo", () => {
                        mostrarFormularioMapeo(data.columnas);
                    });
                } else {
                    alert("No se pudieron obtener las columnas del Excel.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Hubo un problema al subir el archivo.");
            });
        }
    });

    // Botón cerrar modal
    document.getElementById("btn-cerrar-modal").addEventListener("click", () => {
        document.getElementById("modal-renombrar").style.display = "none";
    });

    // Botón renombrar y descargar
    document.getElementById("btn-renombrar").addEventListener("click", async () => {
        const input = document.getElementById("input-jpgs");
        const archivos = input.files;
        if (!archivos.length) return alert("Primero selecciona imágenes JPG.");

        const registros = window.datosExcelLevantamiento || [];
        if (!registros.length) return alert("No hay datos del Excel cargado.");

        const zip = new JSZip();

        for (let archivo of archivos) {

            let nombreConExtension = archivo.name.replace(/\.[^/.]+$/, "");
            let nombreBase = nombreConExtension.split('_')[0]; 

            let coincidencia = registros.find(r => r.NEX_CLI === nombreBase);

            if (!coincidencia) {
                console.warn(`No se encontró NEX CLI ${nombreBase} en el Excel. Nombre original: ${archivo.name}`);
                continue;
            }

            const nuevoNombre = `${coincidencia.NEX_CLI}_${coincidencia.CODIGO_INSP}.jpg`;
            const contenido = await archivo.arrayBuffer();
            zip.file(nuevoNombre, contenido);
        }

        const contenidoZip = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(contenidoZip);
        const a = document.createElement("a");
        a.href = url;
        a.download = "imagenes_renombradas.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        document.getElementById("modal-renombrar").style.display = "none";
    });



    function esperarElemento(id, callback, intentos = 10) {
        const intento = () => {
            const el = document.getElementById(id);
            if (el) {
                callback(el);
            } else if (intentos > 0) {
                setTimeout(() => intento(), 100);
                intentos--;
            } else {
                alert("No se pudo cargar el formulario de mapeo. Asegúrate de seleccionar una actividad.");
            }
        };
        intento();
    }

    // Evento para botón Descargar fichas
    document.body.addEventListener("click", function (e) {
        if (e.target && e.target.id === "boton-descargar-fichas") {
            const actividad = selector.value;
            if (!actividad) return alert("Selecciona una actividad.");

            const spinnerDescarga = document.getElementById("spinner-descarga");
            if (spinnerDescarga) spinnerDescarga.style.display = "block";

            fetch('/descargar-zip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ actividad })
            })
            .then(response => {
                if (!response.ok) throw new Error("Error al descargar el ZIP.");
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "fichas_imagenes.zip";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Error al descargar ZIP:", error);
                alert("Hubo un problema al descargar el ZIP.");
            })
            .finally(() => {
                if (spinnerDescarga) spinnerDescarga.style.display = "none";
            });
        }
    });

    function mostrarFormularioMapeo(columnas) {

        // REEMPLAZA el objeto original con este:
        const mapeoAutomatico = {
            "SUMINISTRO": ["NEX CLI", "SUMINISTRO"],
            "NRCX_NRO": ["NEX NRO", "NRCX_NRO"],
            "NEX_NRO": ["NEX NRO", "NRCX_NRO"],
            "DIRECCIÓN": ["NEX DIR", "DIRECCIÓN", "DOMICILIO", "DIRECCION"], // Añadido "DIRECCION" sin tilde
            "MEDIDOR": ["NEX MED", "MEDIDOR"], // Añadido "MEDIDOR"
            "CICLO": ["NEX CIC", "CICLO"], // Añadido "CICLO"
            "USUARIO": ["NEX NOM", "USUARIO"], // Añadido "USUARIO"
            "FECHA": ["NEX FEC", "FECHA EJECUCIÓN", "FECHA"], // Añadido "FECHA"
            "HORA": ["NEX HRA", "HORA"], // Añadido "HORA"
            "CODIGO": ["NRCX OPECX", "CODIGO", "CODIGO INSP"], // Añadido "CODIGO INSP"
            "CARGARD": ["CARGA", "CARGARD", "N CARGA"], // Añadido "N CARGA"
            "ORDENRD": ["ORDEN", "N° ORDEN", "ORDENRD", "N ORDEN"], // Añadido "N ORDEN"
            "TECNICO": ["NOMBRE OPERADOR", "OPERARIO"], // Añadido "OPERARIO"
            "DNI": ["DNI OPERADOR"],
            "MATERIALES": ["MATERIAL", "MATERIALES"],
            "DEUDA": ["NEX DEU", "DEUDA"],
            "MES DEUDA": ["NEX MES", "MES DEUDA"]
        };


        const formulario = document.getElementById("formulario-mapeo");
        if (!formulario) return;

        const actividadSeleccionada = selector.value;

        let camposPlantilla = [];

        // Plantillas de reapertura
        const reaperturas = [
            "REAPERTURASIMPLE",
            "REAPERTURAALCANTARILLADO",
            "REAPERTURADRASTICA_CONPAVIMENTO",
            "REAPERTURADRASTICA_SINPAVIMENTO"
        ];

        // Plantillas de cierre drástico con/sin pavimento
        const cierresDrasticos = [
            "CIERREDRASTICOCONPAVIMENTO",
            "CIERREDRASTICOSINPAVIMENTO"
        ];

        // Plantillas de VERIFICACION DE ACCION COARCITIVA
        const accionCoarcitiva = [
            "VERIFICACIONACCIONCOARCITIVA"
        ];

        // Plantillas de LEVANTAMIENTO
        const levantamiento_1 = [
            "LEVANTAMIENTO"
        ];

        // Plantillas de SELLADO DE ALCANTARILLADO
        const sellado = [
            "SELLADOALCANTARILLADO"
        ];


        if (reaperturas.includes(actividadSeleccionada)) {
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "MEDIDOR", "CICLO", "FECHA", "HORA",
                "MATERIALES", "SUMINISTRO", "NRCX_NRO", "CARGARD", "ORDENRD",
                "CODIGO", "DNI", "TECNICO"
            ];
        } else if (cierresDrasticos.includes(actividadSeleccionada)) {
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "FECHA", "HORA", "SUMINISTRO",
                "MEDIDOR", "NEX_NRO", "CARGARD", "ORDENRD", "CICLO", "DEUDA",
                "MES DEUDA", "MATERIALES", "CODIGO", "TECNICO", "DNI"
            ];

        } else if (accionCoarcitiva.includes(actividadSeleccionada)) {
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "SUMINISTRO",
                "MEDIDOR", "NEX_NRO", "CARGARD", "ORDENRD", "CICLO"
            ];

        } else if (levantamiento_1.includes(actividadSeleccionada)) {
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "FECHA", "HORA", "SUMINISTRO",
                "MEDIDOR", "NEX_NRO", "CARGARD", "ORDENRD", "CICLO", "DEUDA",
                "MES DEUDA", "MATERIALES", "CODIGO", "TECNICO", "DNI"
            ];

        } else if (sellado.includes(actividadSeleccionada)) {
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "FECHA", "HORA", "SUMINISTRO",
                "MEDIDOR", "NEX_NRO", "CARGARD", "ORDENRD", "CICLO", "DEUDA",
                "MES DEUDA", "MATERIALES", "CODIGO", "TECNICO", "DNI"
            ];

        } else {
            // Plantillas por defecto (CIERRESIMPLE, etc.)
            camposPlantilla = [
                "USUARIO", "DIRECCIÓN", "FECHA", "MEDIDOR", "HORA",
                "SUMINISTRO", "NEX_NRO", "CARGARD", "ORDENRD", "CICLO",
                "CODIGO", "DNI", "TECNICO"
            ];
        }

        let html = `
            <h4>MAPEO DE COLUMNAS:</h4>
            <form id="form-mapeo" class="form-mapeo">
                <div class="grid-mapeo">
        `;

        camposPlantilla.forEach(campo => {
            html += `
                <div class="campo-mapeo">
                    <label class="label-mapeo">${campo}:</label>
                    <select name="${campo}" class="select-mapeo">
                        <option value="">-- Seleccione columna --</option>
                        ${columnas.map(col => {
                            const posibles = mapeoAutomatico[campo] || [];
                            const selected = posibles.includes(col) ? "selected" : "";
                            return `<option value="${col}" ${selected}>${col}</option>`;
                        }).join('')}
                    </select>
                </div>
            `;
        });

        html += `
                </div>
                <button type="submit" class="btn-generar">Generar fichas</button>
                <div id="spinner-carga" style="display: none; margin-top: 20px; text-align: center;">
                <div class="loader"></div>
                <p style="margin-top: 10px; font-size: 14px; color: #444;">Generando fichas, por favor espere...</p>
                </div>
                <div id="spinner-descarga" style="display: none; margin-top: 20px; text-align: center;">
                    <div class="loader"></div>
                    <p style="margin-top: 10px; font-size: 14px; color: #444;">Descargando ZIP, por favor espere...</p>
                </div>
            </form>
        `;


        formulario.innerHTML = html;

        // Conectar evento submit luego de insertar el HTML
        const formGenerar = document.getElementById("form-mapeo");
        const spinner = document.getElementById("spinner-carga");

        if (formGenerar && spinner) {
            formGenerar.addEventListener("submit", function () {
                spinner.style.display = "block";
            });
        }


        formulario.querySelector("#form-mapeo").addEventListener("submit", function (e) {
            e.preventDefault();

            const selects = e.target.querySelectorAll("select");
            const mapeo = {};

            selects.forEach(select => {
                const nombreCampo = select.name;
                const valorColumna = select.value;
                if (valorColumna) {
                    mapeo[nombreCampo] = valorColumna;
                }
            });

            // Enviar datos para generar fichas
            const archivo = inputExcel.files[0];
            if (!archivo) return alert("Archivo Excel no disponible.");

            const formData = new FormData();
            formData.append("archivo_excel", archivo);
            formData.append("actividad", selector.value);
            formData.append("mapeo", JSON.stringify(mapeo));

            fetch("/generar-fichas", {
                method: "POST",
                body: formData
            })
            .then(res => {
                if (!res.ok) throw new Error("Error generando fichas");
                return res.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);

                // Reemplazar el visor PDF existente
                const visor = document.getElementById("visor-pdf");
                if (visor) {
                    visor.src = url;
                    visor.height = "800px";
                } else {
                    const contenedorDerecha = document.getElementById("modulo-actividad-derecha");
                    const iframe = document.createElement("iframe");
                    iframe.id = "visor-pdf";
                    iframe.src = url;
                    iframe.width = "100%";
                    iframe.height = "800";
                    iframe.style.border = "1px solid #ccc";
                    contenedorDerecha.innerHTML = "";
                    contenedorDerecha.appendChild(iframe);
                }


                // Añadir botón para descargar ZIP, si aún no existe
                const formMapeo = document.getElementById("form-mapeo");
                if (formMapeo && !document.getElementById("boton-descargar-fichas")) {
                    const btnDescargar = document.createElement("button");
                    btnDescargar.id = "boton-descargar-fichas";
                    btnDescargar.textContent = "Descargar imágenes en ZIP";
                    btnDescargar.type = "button"; // importante: que no dispare submit
                    btnDescargar.className = "btn-descargar";
                    btnDescargar.style.marginLeft = "10px";

                    // Agregar junto al botón de generar fichas
                    const btnGenerar = formMapeo.querySelector(".btn-generar");
                    if (btnGenerar) {
                        btnGenerar.parentNode.insertBefore(btnDescargar, btnGenerar.nextSibling);
                    }
                }

            })
            .catch(err => {
                console.error(err);
                alert("Error al generar las fichas.");
                spinner.style.display = "none"; 
            });
        });
    }
});




let jsonDataOriginal = [];
//reporte de analisis de lecturas
document.getElementById("boton-subir-reporte-2").addEventListener("click", function () {

    if (!document.getElementById("estilo-resaltado-rojo")) {
        const estilo = document.createElement("style");
        estilo.id = "estilo-resaltado-rojo";
        estilo.innerHTML = `
            tr.resaltado td.negrita-roja {
                color: red !important;
                font-weight: bold !important;
            }
            tr.fila-marcada {
                background-color: #fef9c3 !important;  /* Amarillo claro */
            }
        `;
        document.head.appendChild(estilo);
    }

    const input = document.getElementById("cargador-reporte-2");
    const file = input.files[0];
    if (!file) {
        alert("Selecciona un archivo Excel.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {

        window.marcarFila = function (fila) {
            const clave = JSON.stringify(fila);
            const index = filasMarcadas.findIndex(f => JSON.stringify(f) === clave);
            if (index !== -1) {
                filasMarcadas.splice(index, 1);
            } else {
                filasMarcadas.push(fila);
            }
            renderTabla(paginaActual);
        };

        window.descargarRevisadas = function () {
            if (filasMarcadas.length === 0) {
                alert("No hay filas marcadas.");
                return;
            }
            const ws = XLSX.utils.json_to_sheet(filasMarcadas);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Revisadas");
            XLSX.writeFile(wb, "filas_revisadas.xlsx");
        };


        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        jsonDataOriginal = XLSX.utils.sheet_to_json(sheet);

        console.log("Nombres de columnas detectados en el archivo:", Object.keys(jsonDataOriginal[0]));
        console.log("Primer objeto de datos (primera fila):", jsonDataOriginal[0]);

        if (jsonDataOriginal.length === 0) {
            alert("El archivo no contiene datos.");
            return;
        }

        const mesesMapa = {
            "ENERO": ["ENERO", "ENE"],
            "FEBRERO": ["FEBRERO", "FEB"],
            "MARZO": ["MARZO", "MAR"],
            "ABRIL": ["ABRIL", "ABR"],
            "MAYO": ["MAYO", "MAY"],
            "JUNIO": ["JUNIO", "JUN"],
            "JULIO": ["JULIO", "JUL"],
            "AGOSTO": ["AGOSTO", "AGO"],
            "SEPTIEMBRE": ["SEPTIEMBRE", "SETIEMBRE", "SEP", "SET"],
            "OCTUBRE": ["OCTUBRE", "OCT"],
            "NOVIEMBRE": ["NOVIEMBRE", "NOV"],
            "DICIEMBRE": ["DICIEMBRE", "DIC"]
        };

        const mesActual = new Date().getMonth();
        const ultimosMeses = [];
        for (let i = 3; i >= 0; i--) {
            const index = (mesActual - i + 12) % 12;
            ultimosMeses.push(Object.keys(mesesMapa)[index]);
        }

        const columnas = Object.keys(jsonDataOriginal[0]).filter(col => {
            const upper = col.toUpperCase().trim();

            if (upper === "CLICODFAC" || upper === "VARI%" || upper === "MEDCODYGO") {
                return true;
            }

            const contieneMesValido = ultimosMeses.some(nombreMes => {
                const variaciones = mesesMapa[nombreMes];
                return variaciones.some(variacion => upper.includes(variacion));
            });

            const esLectura = upper.includes("LECTURA") && !upper.includes("TIPOLECTURA");
            const esObs1 = upper.includes("OBS1");

            return (esLectura || esObs1) && contieneMesValido;
        });
        
        const idxVariporc = columnas.findIndex(col => col.toUpperCase().trim() === "VARI%");
        const idxMedcodygo = columnas.findIndex(col => col.toUpperCase().trim() === "MEDCODYGO");

        if (idxVariporc !== -1 && idxMedcodygo !== -1 && idxMedcodygo < idxVariporc - 1) {
            const [medCol] = columnas.splice(idxMedcodygo, 1); // quitar de su posición
            columnas.splice(idxVariporc - 1, 0, medCol);       // insertar antes de VARI%
        }

        // Ordenar por VARI% de mayor a menor como porcentaje real
        const jsonData = [...jsonDataOriginal].sort((a, b) => {
            function aValorNumerico(valor) {
                if (!valor) return NaN;
                // El valor viene como string con %, como "-2499975%"
                const limpio = parseFloat(valor.toString().replace("%", "").replace(",", "."));
                // ⚠️ Dividir entre 100 para convertir a valor real
                return limpio / 100;
            }

            const valorA = aValorNumerico(a["VARI%"]);
            const valorB = aValorNumerico(b["VARI%"]);
            if (isNaN(valorA) && isNaN(valorB)) return 0;        // ambos vacíos
            if (isNaN(valorA)) return 1;                         // A está vacío → va después
            if (isNaN(valorB)) return -1;                        // B está vacío → va después
            return valorA - valorB;                              // orden normal
        });


        const filtrosActivos = {};
        const filasPorPagina = 300;
        let paginaActual = 1;

        function aplicarFiltros(data) {
            return data.filter(fila => {
                return Object.entries(filtrosActivos).every(([col, val]) => {
                    if (col === "CLICODFAC") {
                        return fila[col]?.toString().toLowerCase().includes(val.toLowerCase());
                    }

                    if (col === "VARI%") {
                        const raw = fila[col];
                        const num = parseFloat((raw ?? "").toString().replace("%", "").replace(",", "."));
                        if (isNaN(num)) return false;

                        if (val === "menos100") return num < -100;
                        if (val === "0a100") return num >= 0 && num <= 100;
                        if (val === "mas100") return num > 100;

                        return true;
                    }

                    return fila[col] === val;
                });
            });
        }



        function obtenerValoresUnicos(col) {
            const conjunto = new Set();
            jsonData.forEach(f => conjunto.add(f[col] ?? ""));
            return Array.from(conjunto).sort();
        }

        let filasMarcadas = [];

        function renderTabla(pagina) {
            const filtrado = aplicarFiltros(jsonData);

            let inputClicodfac = document.getElementById("filtro-clicodfac");
            let valorPrevio = inputClicodfac?.value || "";
            let cursorPos = inputClicodfac?.selectionStart || 0;
            let tieneFoco = document.activeElement === inputClicodfac;


            const totalPaginas = Math.ceil(filtrado.length / filasPorPagina);
            const inicio = (pagina - 1) * filasPorPagina;
            const fin = inicio + filasPorPagina;
            const datosPagina = filtrado.slice(inicio, fin);

            let thead = "<thead style='position: sticky; top: 0; background: #f0f0f0; z-index: 1;'><tr>";
            thead += `<th style='
                        font-size: 12px;
                        border: 1px solid #999;
                        text-align: center;
                        padding: 4px;
                        width: 40px;       /* ancho más pequeño */
                        min-width: 40px;
                        max-width: 40px;
                    '>N°</th>`;


            columnas.forEach(col => {
                const upperCol = col.toUpperCase();
                thead += `<th style='
                                font-size: 12px;
                                border: 1px solid #999;
                                text-align: center;
                                padding: 4px;
                            '>
                            ${col}<br>`;
                if (upperCol === "CLICODFAC") {
                    const valorActual = filtrosActivos[col] || "";
                    thead += `<input id="filtro-clicodfac" type="text" placeholder="Buscar..." 
                                    oninput="filtrarTexto('${col}', this.value)" 
                                    style='font-size: 11px; width: 90%; padding: 2px;' />
                                `;
                } else {
                    let opciones = `<option value="">-- Todos --</option>`;
                    if (upperCol === "VARI%") {
                        const opcionesVari = [
                            { label: "❌ Menor a -100%", value: "menos100" },
                            { label: "🔵 Entre 0% y 100%", value: "0a100" },
                            { label: "🟢 Mayor a 100%", value: "mas100" }
                        ];
                        opcionesVari.forEach(opt => {
                            const selected = filtrosActivos[col] === opt.value ? "selected" : "";
                            opciones += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                        });
                    } else {
                        const valores = obtenerValoresUnicos(col);
                        valores.forEach(val => {
                            const selected = filtrosActivos[col] === val ? "selected" : "";
                            opciones += `<option value="${val}" ${selected}>${val}</option>`;
                        });
                    }

                    thead += `<select onchange="filtrarColumna('${col}', this.value)" style='font-size: 11px; width: 90%;'>
                                    ${opciones}
                                </select>`;
                }
                thead += `</th>`;
            });
            thead += `<th style='
                font-size: 12px;
                border: 1px solid #999;
                text-align: center;
                padding: 2px;
                width: 30px;
                min-width: 30px;
                max-width: 30px;
            '>✔</th>`;



            let tbody = "<tbody>";
            datosPagina.forEach(fila => {
                // 🔹 Primero determina si la fila está marcada
                const claveFila = JSON.stringify(fila);
                const marcada = filasMarcadas.some(f => JSON.stringify(f) === claveFila);

                // 🔸 Luego abre la fila aplicando la clase si está marcada
                tbody += `<tr class="${marcada ? 'fila-marcada' : ''}">`;

                // Columna de número de fila
                tbody += `<td style='
                    font-size: 12px;
                    border: 1px solid #ccc;
                    text-align: center;
                    padding: 4px;
                    width: 40px;
                    min-width: 40px;
                    max-width: 40px;
                '>${jsonData.indexOf(fila) + 1}</td>`;


                // Detectar columnas para estilos especiales
                // 🔹 CORRECCIÓN: Detectar el mes actual real
                const fechaHoy = new Date();
                const mesesNombres = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
                const nombreMesActual = mesesNombres[fechaHoy.getMonth()]; // Ej: "ENERO"

                // Detectar columnas para estilos especiales
                const columnasLectura = columnas.filter(c => c.toUpperCase().includes("LECTURA") && !c.toUpperCase().includes("TIPOLECTURA"));
                
                // Buscamos la columna que contenga el NOMBRE DEL MES ACTUAL. Si no la encuentra, usa la última por defecto.
                const columnaUltimaLectura = columnasLectura.find(c => c.toUpperCase().includes(nombreMesActual)) || columnasLectura[columnasLectura.length - 1];

                const columnasObs1 = columnas.filter(c => c.toUpperCase().includes("OBS1"));
                
                // Lo mismo para OBS1
                const columnaUltimaObs1 = columnasObs1.find(c => c.toUpperCase().includes(nombreMesActual)) || columnasObs1[columnasObs1.length - 1];

                // Celdas normales
                columnas.forEach(col => {
                    const upper = col.toUpperCase();
                    const esCLICODFAC = upper === 'CLICODFAC';
                    const esMEDCODYGO = upper === 'MEDCODYGO';
                    const esUltimaLectura = col === columnaUltimaLectura;
                    const esUltimaObs1 = col === columnaUltimaObs1;

                    const claseNegritaRoja = (esMEDCODYGO || esUltimaLectura || esUltimaObs1) ? "negrita-roja" : "";

                    tbody += `<td style='
                                    font-size: 12px;
                                    border: 1px solid #ccc;
                                    text-align: ${esCLICODFAC ? 'left' : 'center'};
                                    padding: 4px;
                                    cursor: ${esCLICODFAC ? 'pointer' : 'default'};
                                ' class="${esCLICODFAC ? 'clicodfac' : ''} ${claseNegritaRoja}">
                                ${fila[col] ?? ""}
                            </td>`;
                });

                tbody += `<td style='text-align: center; border: 1px solid #ccc; width: 30px; min-width: 30px; max-width: 30px;'>
                    <button onclick='marcarFila(${JSON.stringify(fila)})' 
                        style='
                            width: 16px;
                            height: 16px;
                            background-color: ${marcada ? "#6dd96d" : "#ccc"};
                            border: none;
                            border-radius: 3px;
                            cursor: pointer;
                            display: block;
                            padding: 0;
                            margin: 0 auto;
                        '>
                    </button>
                </td>`;
                tbody += "</tr>";
            });
            tbody += "</tbody>";


            const tablaHtml = `
                <div style='max-height: 700px; overflow-y: auto; border: 1px solid #ccc; position: relative;'>
                    <table style='border-collapse: collapse; width: 100%; table-layout: fixed;'>
                        ${thead}
                        ${tbody}
                    </table>
                </div>
                
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 10px;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    position: relative;
                ">
                    <div>
                        <button onclick="cambiarPagina(1)" style="margin: 0 4px; padding: 6px 10px; font-size: 14px; border: none; background-color: #184875; color: white; border-radius: 4px; cursor: pointer;">⏮</button>
                        <button onclick="cambiarPagina(${pagina - 1})" ${pagina === 1 ? "disabled" : ""} 
                            style="margin: 0 4px; padding: 6px 10px; font-size: 14px; border: none; background-color: ${pagina === 1 ? '#ccc' : '#a1c0dd'}; color: white; border-radius: 4px; cursor: ${pagina === 1 ? 'not-allowed' : 'pointer'};">
                            ◀
                        </button>
                        <span style="margin: 0 10px; font-weight: bold;">Página ${pagina} de ${totalPaginas}</span>
                        <button onclick="cambiarPagina(${pagina + 1})" ${pagina === totalPaginas ? "disabled" : ""} 
                            style="margin: 0 4px; padding: 6px 10px; font-size: 14px; border: none; background-color: ${pagina === totalPaginas ? '#ccc' : '#a1c0dd'}; color: white; border-radius: 4px; cursor: ${pagina === totalPaginas ? 'not-allowed' : 'pointer'};">
                            ▶
                        </button>
                        <button onclick="cambiarPagina(${totalPaginas})" style="margin: 0 4px; padding: 6px 10px; font-size: 14px; border: none; background-color: #184875; color: white; border-radius: 4px; cursor: pointer;">⏭</button>
                    </div>

                    <div style="
                        position: absolute;
                        right: 0;
                    ">
                        <button onclick="descargarRevisadas()" style="
                            padding: 8px 12px;
                            background-color: #2d974d;
                            color: white;
                            font-weight: bold;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-left: auto;
                        ">
                            Descargar revisadas
                        </button>
                    </div>
                </div>
            `;
            document.getElementById("contenedor-tabla-reporte-2").innerHTML = tablaHtml;

            // Restaurar valor, foco y posición del cursor
            setTimeout(() => {
                let nuevoInput = document.getElementById("filtro-clicodfac");
                if (nuevoInput) {
                    nuevoInput.value = valorPrevio; // restaurar texto
                    if (tieneFoco) {
                        nuevoInput.focus();
                        nuevoInput.setSelectionRange(cursorPos, cursorPos);
                    }
                }
            }, 0);

        }


        window.filtrarColumna = function (columna, valor) {
            if (valor) {
                filtrosActivos[columna] = valor;
            } else {
                delete filtrosActivos[columna];
            }
            paginaActual = 1;
            renderTabla(paginaActual);
        };

        let debounceTimer;
        window.filtrarTexto = function(columna, valor) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (valor.trim()) {
                    filtrosActivos[columna] = valor;
                } else {
                    delete filtrosActivos[columna];
                }
                paginaActual = 1;
                renderTabla(paginaActual);
            }, 300); // espera 300ms después de dejar de escribir
        };



        window.cambiarPagina = function (nuevaPagina) {
            paginaActual = nuevaPagina;
            renderTabla(paginaActual);

            // Esperar al siguiente "tick" del DOM
            setTimeout(() => {
                clicodfacCeldas = Array.from(document.querySelectorAll(".clicodfac"));
                indiceActualClicodfac = -1;
            }, 0); // puede usar 100ms si lo ves más estable: setTimeout(..., 100)
        };

        renderTabla(paginaActual);
    };

    reader.readAsArrayBuffer(file);
});



document.addEventListener("DOMContentLoaded", () => {
    const derecha = document.getElementById("fc-seccion-derecha-2");

    document.body.addEventListener("click", async (e) => {
        const celda = e.target.closest(".clicodfac");
        if (celda) {
            const codigo = celda.textContent.trim();
            // Quitar resaltado previo
            document.querySelectorAll("tr.resaltado").forEach(tr => tr.classList.remove("resaltado"));

            // Resaltar la fila actual
            const fila = celda.closest("tr");
            if (fila) fila.classList.add("resaltado");

            // 🔄 Actualiza el índice actual para la navegación con Espacio
            clicodfacCeldas = Array.from(document.querySelectorAll(".clicodfac"));
            indiceActualClicodfac = clicodfacCeldas.indexOf(celda);

            derecha.innerHTML = "<p>Cargando imágenes...</p>";

            try {
                const resp = await fetch("/buscar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ codigo })
                });
                const data = await resp.json();

                if (data.resultados) {
                    renderizarResultados(data.resultados, codigo);
                    setTimeout(() => {
                        const primeraSubopcion = document.querySelector(".fc-subopcion");
                        if (primeraSubopcion) primeraSubopcion.click();
                    }, 100);
                } else {
                    derecha.innerHTML = "<p>No se encontraron imágenes.</p>";
                }
            } catch (error) {
                derecha.innerHTML = "<p>Error al buscar imágenes.</p>";
                console.error(error);
            }
        }

    });

    let clicodfacCeldas = [];
    let indiceActualClicodfac = -1;

    document.addEventListener("keydown", async (event) => {
    if (["ArrowDown", "ArrowUp"].includes(event.code)) {
        event.preventDefault();

        clicodfacCeldas = Array.from(document.querySelectorAll(".clicodfac"));
        if (clicodfacCeldas.length === 0) return;

        // Ajustar índice según dirección
        if (event.code === "ArrowDown") {
            indiceActualClicodfac++;
        } else if (event.code === "ArrowUp") {
            indiceActualClicodfac--;
        }

        // Verificar si debemos cambiar de página
        if (indiceActualClicodfac >= clicodfacCeldas.length) {
            if (typeof cambiarPagina === "function" && paginaActual < totalPaginas) {
                paginaActual++;
                indiceActualClicodfac = -1;
                await new Promise(resolve => setTimeout(resolve, 300));
                cambiarPagina(paginaActual);

                setTimeout(() => {
                    clicodfacCeldas = Array.from(document.querySelectorAll(".clicodfac"));
                    if (clicodfacCeldas.length > 0) {
                        indiceActualClicodfac = 0;
                        const celda = clicodfacCeldas[indiceActualClicodfac];
                        celda.scrollIntoView({ behavior: "smooth", block: "center" });
                        celda.click();
                    }
                }, 500);
            } else {
                indiceActualClicodfac = clicodfacCeldas.length - 1;
            }
        } else if (indiceActualClicodfac < 0) {
            if (typeof cambiarPagina === "function" && paginaActual > 1) {
                paginaActual--;
                indiceActualClicodfac = clicodfacCeldas.length; // provisional
                await new Promise(resolve => setTimeout(resolve, 300));
                cambiarPagina(paginaActual);

                setTimeout(() => {
                    clicodfacCeldas = Array.from(document.querySelectorAll(".clicodfac"));
                    if (clicodfacCeldas.length > 0) {
                        indiceActualClicodfac = clicodfacCeldas.length - 1;
                        const celda = clicodfacCeldas[indiceActualClicodfac];
                        celda.scrollIntoView({ behavior: "smooth", block: "center" });
                        celda.click();
                    }
                }, 500);
            } else {
                indiceActualClicodfac = 0;
            }
        } else {
            const celda = clicodfacCeldas[indiceActualClicodfac];
            if (celda) {
                celda.scrollIntoView({ behavior: "smooth", block: "center" });
                celda.click();
            }
        }
    }
});



    function renderizarResultados(grupos, codigo) {
        const derecha = document.getElementById("fc-seccion-derecha-2");
        derecha.innerHTML = "";

        let imagenesActuales = [];
        let indiceImagenActual = 0;
        let rotacionActual = 0;
        let zoomActual = 1;
        let grupoActual = null;
        let categoria = "lecturas";

        const contenedorPrincipal = document.createElement("div");

        const tabs = document.createElement("div");
        tabs.style.border = "2px solid #ccc";
        tabs.style.borderRadius = "10px";
        tabs.style.padding = "10px";
        tabs.style.marginBottom = "10px";
        tabs.style.display = "flex";
        tabs.style.justifyContent = "space-between";
        tabs.style.alignItems = "center";

        // Texto del CLICODFAC
        const filaSeleccionada = jsonDataOriginal.find(f => f["CLICODFAC"]?.toString().trim() === codigo);
        const medcodygo = filaSeleccionada?.MEDCODYGO?.toString().trim() ?? "No disponible";

        // --- INICIO CORRECCIÓN ---

        // 1. Definimos la lista maestra de meses y obtenemos la fecha real de hoy
        const listaMeses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        // Alias extra por si en el Excel dice "SETIEMBRE" en vez de "SEPTIEMBRE"
        const aliasMeses = { "SETIEMBRE": "SEPTIEMBRE", "SEPTEMBER": "SEPTIEMBRE" };
        
        const fechaHoy = new Date();
        const mesActualIdx = fechaHoy.getMonth(); // 0 = Enero, 1 = Febrero...

        // Variables para guardar el resultado
        let ultimaLectura = "No disponible";
        let ultimaObs1 = "No disponible";

        if (filaSeleccionada) {
            // Obtenemos todas las claves (columnas) de la fila
            const llavesFila = Object.keys(filaSeleccionada);

            // --- BUSCAR LECTURA ---
            // Recorremos desde el mes actual hacia atrás (hasta 12 meses)
            for (let i = 0; i < 12; i++) {
                // Fórmula circular: Hoy es 0 (Enero). i=0 -> Enero. i=1 -> Diciembre.
                const indiceBusqueda = (mesActualIdx - i + 12) % 12;
                const nombreMesBusqueda = listaMeses[indiceBusqueda];

                // Buscamos si existe una columna que sea LECTURA + EL MES CALCULADO
                const columnaEncontrada = llavesFila.find(k => {
                    const upper = k.toUpperCase();
                    // Normalizamos SETIEMBRE a SEPTIEMBRE si fuera necesario
                    let upperNormalizado = upper;
                    for (const [alias, original] of Object.entries(aliasMeses)) {
                        upperNormalizado = upperNormalizado.replace(alias, original);
                    }

                    return upperNormalizado.includes("LECTURA") && 
                           upperNormalizado.includes(nombreMesBusqueda) && 
                           !upperNormalizado.includes("TIPOLECTURA");
                });

                // Si encontramos la columna y tiene valor, guardamos y ROMPEMOS el ciclo
                if (columnaEncontrada && filaSeleccionada[columnaEncontrada] != null) {
                    ultimaLectura = filaSeleccionada[columnaEncontrada];
                    break; // ¡Ya encontramos la más reciente! Dejamos de buscar.
                }
            }

            // --- BUSCAR OBS1 (Misma lógica) ---
            for (let i = 0; i < 12; i++) {
                const indiceBusqueda = (mesActualIdx - i + 12) % 12;
                const nombreMesBusqueda = listaMeses[indiceBusqueda];

                const columnaEncontrada = llavesFila.find(k => {
                    const upper = k.toUpperCase();
                    let upperNormalizado = upper;
                    for (const [alias, original] of Object.entries(aliasMeses)) {
                        upperNormalizado = upperNormalizado.replace(alias, original);
                    }

                    return upperNormalizado.includes("OBS1") && 
                           upperNormalizado.includes(nombreMesBusqueda);
                });

                if (columnaEncontrada && filaSeleccionada[columnaEncontrada] != null) {
                    ultimaObs1 = filaSeleccionada[columnaEncontrada];
                    break; 
                }
            }
        }

        const textoCodigo = document.createElement("div");
        textoCodigo.innerHTML = `
            <span style="font-weight: bold;">SUMINISTRO:</span> ${codigo} &nbsp;&nbsp;
            <span style="font-weight: bold;">MEDIDOR:</span> ${medcodygo} &nbsp;&nbsp;
            <span style="font-weight: bold;">LECTURA:</span>
            <span style="color: red; font-weight: bold;">${ultimaLectura}</span>
            <span style="font-weight: bold;">&nbsp;&nbsp;OBS1:</span>
            <span style="color: red; font-weight: bold;">${ultimaObs1}</span>
        `;
        textoCodigo.style.fontSize = "15px";
        textoCodigo.style.fontFamily = "Arial, sans-serif";



        // Botones LECTURAS y ORDENES
        const grupoBotones = document.createElement("div");
        grupoBotones.style.display = "flex";
        grupoBotones.style.gap = "10px";

        const btnLecturas = document.createElement("button");
        btnLecturas.textContent = "LECTURAS";
        estiloBoton(btnLecturas);

        const btnOrdenes = document.createElement("button");
        btnOrdenes.textContent = "ORDENES";
        estiloBoton(btnOrdenes);

        grupoBotones.appendChild(btnLecturas);
        grupoBotones.appendChild(btnOrdenes);

        // Añadir ambos al contenedor
        tabs.appendChild(textoCodigo);
        tabs.appendChild(grupoBotones);
        contenedorPrincipal.appendChild(tabs);


        const contenedorOpciones = document.createElement("div");
        contenedorOpciones.style.border = "2px solid #ccc";
        contenedorOpciones.style.borderRadius = "10px";
        contenedorOpciones.style.padding = "10px";
        contenedorOpciones.style.marginBottom = "10px";
        contenedorOpciones.style.display = "flex";
        contenedorOpciones.style.flexWrap = "nowrap";
        contenedorOpciones.style.gap = "10px";
        contenedorOpciones.style.overflowX = "auto";
        contenedorOpciones.style.overflowY = "hidden";
        contenedorOpciones.style.whiteSpace = "nowrap";
        contenedorOpciones.style.maxWidth = "100%";
        contenedorOpciones.style.boxSizing = "border-box";
        contenedorOpciones.style.width = "900px";

        contenedorPrincipal.appendChild(contenedorOpciones);

        const contenedorImagen = document.createElement("div");
        contenedorImagen.style.marginTop = "20px";
        contenedorPrincipal.appendChild(contenedorImagen);

        derecha.appendChild(contenedorPrincipal);

        const grupoLecturas = grupos.find(g => g.leyenda === "LECTURAS");
        const grupoOrdenes = grupos.filter(g => g.leyenda !== "LECTURAS");

        function ordenarSubgruposPorFecha(subgrupos) {
            const meses = {
                "ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
                "JULIO": 7, "AGOSTO": 8, "SETIEMBRE": 9, "SEPTIEMBRE": 9,
                "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12,
                "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
                "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
            };
            const parseFecha = (leyenda) => {
                const partes = leyenda.toUpperCase().split(/[\s\-]+/);
                const mes = meses[partes[0]] || 0;
                const anio = parseInt(partes[1]) || 0;
                return anio * 100 + mes;
            };
            return [...subgrupos].sort((a, b) => parseFecha(b.leyenda) - parseFecha(a.leyenda));
        }

        function mostrarOpciones(lista, carpetaPadre = null) {
            contenedorOpciones.innerHTML = "";
            contenedorImagen.innerHTML = "";

            // 🗓 Obtener los últimos 4 meses en formato "Month - YYYY"
            const formatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
            const ultimos4Meses = [];

            for (let i = 3; i >= 0; i--) {
                const fecha = new Date();
                fecha.setMonth(fecha.getMonth() - i);
                ultimos4Meses.push(formatter.format(fecha)); // Ej: "July 2025"
            }

            // Reemplazar espacio con " - " para que coincida con el formato de leyenda
            const ultimos4MesesFormateados = ultimos4Meses.map(m => m.replace(" ", " - "));

            // Colores asociados (último → rojo, penúltimo → naranja, etc.)
            const coloresPorMes = {
                [ultimos4MesesFormateados[3]]: "#ff7575",  // rojo suave
                [ultimos4MesesFormateados[2]]: "#ffa550",  // naranja
                [ultimos4MesesFormateados[1]]: "#b5d87f",  // verde claro
                [ultimos4MesesFormateados[0]]: "#efe69d"   // amarillo suave
            };


            ordenarSubgruposPorFecha(lista).forEach((grupo) => {
                const btn = document.createElement("button");
                btn.textContent = grupo.leyenda;
                btn.classList.add("fc-subopcion");
                estiloBoton(btn);

                const leyenda = grupo.leyenda.trim();
                const color = coloresPorMes[leyenda];
                if (color) {
                    btn.style.backgroundColor = color;
                    btn.style.color = "black";
                    btn.style.fontWeight = "bold";
                }

                btn.onclick = () => {
                    grupoActual = carpetaPadre
                        ? { ...grupo, carpeta: carpetaPadre }
                        : grupo;
                    mostrarImagen(grupoActual);
                };

                contenedorOpciones.appendChild(btn);
            });

        }

        function mostrarImagen(grupo) {
            imagenesActuales = grupo.imagenes;
            indiceImagenActual = 0;
            rotacionActual = 0;
            zoomActual = 1;
            contenedorImagen.innerHTML = "";

            // Contenedor general centrado
            contenedorImagen.style.display = "flex";
            contenedorImagen.style.flexDirection = "column";
            contenedorImagen.style.alignItems = "center";
            contenedorImagen.style.justifyContent = "center";

            // Marco fijo
            const marcoImagen = document.createElement("div");
            marcoImagen.style.width = "800px";
            marcoImagen.style.height = "630px";
            marcoImagen.style.overflow = "hidden";
            marcoImagen.style.display = "flex";
            marcoImagen.style.alignItems = "center";
            marcoImagen.style.justifyContent = "center";
            marcoImagen.style.border = "1px solid #ccc";
            marcoImagen.style.background = "#fff";
            marcoImagen.style.borderRadius = "15px";

            // Imagen fija dentro del marco
            const img = document.createElement("img");
            img.style.width = "100%";   // Ajusta a tu gusto (o usa fixed como 900px)
            img.style.height = "100%";  // O usa 'auto' si quieres que respete proporción
            img.style.objectFit = "contain";
            img.style.transformOrigin = "center";

            let isDragging = false;
            let startX = 0, startY = 0;
            let offsetX = 0, offsetY = 0;

            // Estilo inicial del cursor
            img.style.cursor = "default";

            // Mostrar cursor tipo 'mano' si se puede arrastrar
            img.addEventListener("mousemove", () => {
                img.style.cursor = zoomActual > 1 ? (isDragging ? "grabbing" : "grab") : "default";
            });

            // Iniciar arrastre
            img.addEventListener("mousedown", (e) => {
                if (zoomActual <= 1) return;
                isDragging = true;
                startX = e.clientX - offsetX;
                startY = e.clientY - offsetY;
                img.style.cursor = "grabbing";
            });

            // Mover imagen mientras se arrastra
            window.addEventListener("mousemove", (e) => {
                if (!isDragging) return;
                offsetX = e.clientX - startX;
                offsetY = e.clientY - startY;
                img.style.transform = `rotate(${rotacionActual}deg) scale(${zoomActual}) translate(${offsetX}px, ${offsetY}px)`;
            });

            // Soltar imagen
            window.addEventListener("mouseup", () => {
                if (isDragging) {
                    isDragging = false;
                    img.style.cursor = zoomActual > 1 ? "grab" : "default";
                }
            });



            img.addEventListener("wheel", (event) => {
                event.preventDefault();
                const zoomDelta = event.deltaY < 0 ? 0.1 : -0.1;
                zoomActual = Math.max(0.1, Math.min(3, zoomActual + zoomDelta)); // límites de zoom
                mostrar();
            });


            marcoImagen.appendChild(img);
            contenedorImagen.appendChild(marcoImagen);


            const mostrar = () => {
                const ruta = `http://200.233.44.171/app_oraclesedalib/public/storage/images/${categoria}/${grupo.carpeta}/${imagenesActuales[indiceImagenActual]}`;
                img.src = ruta;
                offsetX = 0;
                offsetY = 0;
                img.style.cursor = zoomActual > 1 ? "grab" : "default";
                img.style.transform = `rotate(${rotacionActual}deg) scale(${zoomActual}) translate(0px, 0px)`;
            };


            const controlesDiv = document.createElement("div");
            controlesDiv.style.textAlign = "center";
            controlesDiv.style.marginTop = "10px";

            const btnAnterior = document.createElement("button");
            btnAnterior.textContent = "Anterior";
            estiloBoton(btnAnterior);
            btnAnterior.onclick = () => {
                if (indiceImagenActual > 0) {
                    indiceImagenActual--;
                    rotacionActual = 0;
                    zoomActual = 1;
                    mostrar();
                }
            };

            const btnRotar = document.createElement("button");
            btnRotar.textContent = "Rotar";
            estiloBoton(btnRotar);
            btnRotar.onclick = () => {
                rotacionActual = (rotacionActual + 90) % 360;
                mostrar();
            };

            const btnSiguiente = document.createElement("button");
            btnSiguiente.textContent = "Siguiente";
            estiloBoton(btnSiguiente);
            btnSiguiente.onclick = () => {
                if (indiceImagenActual < imagenesActuales.length - 1) {
                    indiceImagenActual++;
                    rotacionActual = 0;
                    zoomActual = 1;
                    mostrar();
                }
            };

            controlesDiv.appendChild(btnAnterior);
            controlesDiv.appendChild(btnRotar);
            controlesDiv.appendChild(btnSiguiente);
            contenedorImagen.appendChild(controlesDiv);

            mostrar();
        }

        function estiloBoton(btn) {
            btn.style.padding = "8px 16px";
            btn.style.backgroundColor = "#f1f1f1";
            btn.style.color = "#000052";
            btn.style.border = "2px solid #cccccc";
            btn.style.borderRadius = "6px";
            btn.style.cursor = "pointer";
        }

        document.addEventListener("keydown", (event) => {
            if (!imagenesActuales.length) return;

            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    if (indiceImagenActual < imagenesActuales.length - 1) {
                        indiceImagenActual++;
                        rotacionActual = 0;
                        zoomActual = 1;
                        mostrar(); // solo actualiza imagen, no reconstruye todo
                    }
                    event.preventDefault();
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    if (indiceImagenActual > 0) {
                        indiceImagenActual--;
                        rotacionActual = 0;
                        zoomActual = 1;
                        mostrar();
                    }
                    event.preventDefault();
                    break;
                case "Tab":
                    rotacionActual = (rotacionActual + 90) % 360;
                    mostrar();
                    event.preventDefault();
                    break;
            }
        });


        btnLecturas.onclick = () => {
            if (grupoLecturas?.subgrupos?.length) {
                const subgruposOrdenados = ordenarSubgruposPorFecha(grupoLecturas.subgrupos);
                mostrarOpciones(subgruposOrdenados, grupoLecturas.carpeta);
                grupoActual = { ...subgruposOrdenados[0], carpeta: grupoLecturas.carpeta };
                imagenesActuales = grupoActual.imagenes;
                indiceImagenActual = 0;
                rotacionActual = 0;
                zoomActual = 1;
                categoria = "lecturas"

                mostrarImagen(grupoActual);
            }
        };

        btnOrdenes.onclick = () => {
            if (grupoOrdenes.length) {
                categoria = "ordenes"

                mostrarOpciones(grupoOrdenes);
            }
        };

        if (grupoLecturas?.subgrupos?.length) {
            const subgruposOrdenados = ordenarSubgruposPorFecha(grupoLecturas.subgrupos);
            mostrarOpciones(subgruposOrdenados, grupoLecturas.carpeta);
            grupoActual = { ...subgruposOrdenados[0], carpeta: grupoLecturas.carpeta };
            imagenesActuales = grupoActual.imagenes;
            indiceImagenActual = 0;
            rotacionActual = 0;
            zoomActual = 1;
            categoria = "lecturas";
            mostrarImagen(grupoActual);
        } else if (grupoOrdenes.length) {
            categoria = "ordenes";
            mostrarOpciones(grupoOrdenes);
        }
        

    }
});

//MAPAS
let INDEX_IMAGENES = [];
let datosFiltrados = [];

function iniciarMonitoreoOperario() {
    const archivo = document.getElementById('cargador-mapa-2').files[0];
    const esteStr = document.getElementById('fc-este-input-2').value.trim();   // → LATITUD
    const norteStr = document.getElementById('fc-norte-input-2').value.trim(); // → LONGITUD

    const lat = parseFloat(esteStr.replace(",", ".")); // ← Asegura punto decimal
    const lon = parseFloat(norteStr.replace(",", ".")); // ← Asegura punto decimal

    // ✅ CASO: Coordenadas manuales (lat/lon directo)
    if (!archivo && !isNaN(lat) && !isNaN(lon)) {
        // Crear o limpiar el contenedor del mapa
        const contenedor = document.getElementById("fc-seccion-mapa-2");
        contenedor.innerHTML = `
            <div style="background-color: white; border: 2px solid #ccc; border-radius: 10px; padding: 10px 15px; margin-bottom: 10px;">
                <div style="font-weight: bold; text-transform: uppercase; font-size: 16px;">COORDENADA INGRESADA</div>
                <div><strong>Latitud (Este):</strong> ${lat}, <strong>Longitud (Norte):</strong> ${lon}</div>
            </div>
            <div id="mapa-operario" style="width: 100%; height: 570px; border-radius: 10px;"></div>
        `;

        setTimeout(() => {
            const mapa = L.map('mapa-operario');

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(mapa);

            L.circleMarker([lat, lon], {
                radius: 10,
                color: '#0077ff',
                weight: 3,
                fillColor: '#00ccff',
                fillOpacity: 0.8
            }).addTo(mapa)
            .bindPopup(`<b>Coordenada ingresada</b><br>Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}`)
            .openPopup();

            mapa.setView([lat, lon], 17);
        }, 0);

        return; // 👈 Salimos porque es coordenada manual
    }



    const lector = new FileReader();
    lector.onload = function (evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];

        // Convertimos a arreglo de arreglos (raw)
        let json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

        // Eliminar columnas A y B (índices 0 y 1)
        json = json.map(fila => fila.slice(2));

        // Eliminar primeras 5 filas
        json = json.slice(5);

        // Obtener encabezados
        const headers = json[0];
        const registros = json.slice(1).map(fila => {
            const obj = {};
            headers.forEach((col, i) => {
                obj[col] = fila[i];
            });
            return obj;
        });

        datosFiltrados = registros;

        // Mostrar selector de fecha dinámicamente
        const contenedor = document.querySelector(".fc-opciones-operario");
        contenedor.innerHTML = `
            <label for="fecha-trabajada">Fecha trabajada:</label>
            <input type="date" id="fecha-trabajada">
            <div id="lista-operarios" style="margin-top: 10px;"></div>
        `;

        document.getElementById('fecha-trabajada').addEventListener('change', function () {
            const fechaSeleccionada = this.value; // formato: yyyy-mm-dd
            if (!fechaSeleccionada || datosFiltrados.length === 0) return;

            const empleados = datosFiltrados.filter(fila => {
                let valorFecha = fila["FECHA INI EJECUCION"];
                if (!valorFecha) return false;

                let fechaFormateada = "";

                // Si es número (número serial Excel)
                if (typeof valorFecha === "number") {
                    const fechaExcel = XLSX.SSF.parse_date_code(valorFecha);
                    const yyyy = fechaExcel.y;
                    const mm = String(fechaExcel.m).padStart(2, '0');
                    const dd = String(fechaExcel.d).padStart(2, '0');
                    fechaFormateada = `${yyyy}-${mm}-${dd}`;
                }
                // Si es texto (ej: "01/07/2025" o "1-7-2025")
                else if (typeof valorFecha === "string") {
                    const partes = valorFecha.split(/[\/\-]/);
                    if (partes.length === 3) {
                        const dd = partes[0].padStart(2, '0');
                        const mm = partes[1].padStart(2, '0');
                        const yyyy = partes[2];
                        fechaFormateada = `${yyyy}-${mm}-${dd}`;
                    }
                }

                return fechaFormateada === fechaSeleccionada;
            });

            const listaContenedor = document.getElementById('lista-operarios');
            listaContenedor.innerHTML = "";

            if (empleados.length === 0) {
                listaContenedor.textContent = "No se encontraron operarios para esa fecha.";
                return;
            }

            // Contar cantidad por operario
            const contador = {};
            empleados.forEach(fila => {
                const nombre = fila["OPERARIO"];
                if (!nombre) return;
                if (!contador[nombre]) {
                    contador[nombre] = 1;
                } else {
                    contador[nombre]++;
                }
            });

            const ul = document.createElement("ul");

            Object.keys(contador).forEach(op => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.gap = "10px";

            // Texto clickeable (nombre del operario)
            const nombreSpan = document.createElement("span");
            nombreSpan.textContent = op;
            nombreSpan.style.flex = "1";
            nombreSpan.style.cursor = "pointer";
            
            nombreSpan.title = "Ver trabajos en el mapa";

            nombreSpan.addEventListener("click", () => {
                // Remover clase de todos los <li>
                document.querySelectorAll("#lista-operarios li").forEach(el => {
                    el.classList.remove("operario-seleccionado");
                });

                // Agregar clase al padre del span (el <li>)
                nombreSpan.parentElement.classList.add("operario-seleccionado");

                const trabajos = empleados.filter(f => f["OPERARIO"] === op);
                const pares = trabajos.map(f => ({
                    suministro: String(f["SUMINISTRO"] || "").trim(),
                    inspeccion: String(f["CODIGO INSPECCION PERDIDAS"] || "").trim()
                }));


                const mapaContenedor = document.getElementById("fc-seccion-mapa-2");

                let horaInicioGlobal = null;
                let horaFinGlobal = null;

                trabajos.forEach(f => {
                    const horaIni = f["HORA INI"];
                    const horaFin = f["HORA"];

                    if (typeof horaIni === "string" && typeof horaFin === "string") {
                        const [h1, m1] = horaIni.trim().split(":").map(Number);
                        const [h2, m2] = horaFin.trim().split(":").map(Number);

                        const inicio = new Date(0, 0, 0, h1, m1);
                        const fin = new Date(0, 0, 0, h2, m2);

                        if (!horaInicioGlobal || inicio < horaInicioGlobal) horaInicioGlobal = inicio;
                        if (!horaFinGlobal || fin > horaFinGlobal) horaFinGlobal = fin;
                    }
                });

                let horasTrabajadasTexto = "0 horas";

                if (horaInicioGlobal && horaFinGlobal) {
                    const diffMs = horaFinGlobal - horaInicioGlobal;
                    const totalMinutos = Math.floor(diffMs / 1000 / 60);

                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = totalMinutos % 60;

                    horasTrabajadasTexto = `${horas} ${horas === 1 ? "hora" : "horas"} y ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
                }
                
                // Calcular promedio por ejecución (solo duración > 0)
                let totalMinutosEjecucion = 0;
                let ejecucionesValidas = 0;

                trabajos.forEach(f => {
                    const horaIniStr = String(f["HORA INI"] || "").trim();
                    const horaFinStr = String(f["HORA"] || "").trim();

                    if (horaIniStr && horaFinStr) {
                        const [h1, m1] = horaIniStr.split(":").map(Number);
                        const [h2, m2] = horaFinStr.split(":").map(Number);

                        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
                            const ini = h1 * 60 + m1;
                            const fin = h2 * 60 + m2;

                            const duracion = fin - ini;
                            if (duracion > 0) {
                                totalMinutosEjecucion += duracion;
                                ejecucionesValidas++;
                            }
                        }
                    }
                });

                let promedioMinutos = ejecucionesValidas > 0
                    ? Math.round(totalMinutosEjecucion / ejecucionesValidas)
                    : 0;

                const promHoras = Math.floor(promedioMinutos / 60);
                const promMin = promedioMinutos % 60;

                const promTexto = promHoras > 0
                    ? `${promHoras} h ${promMin} min`
                    : `${promMin} min`;


                mapaContenedor.innerHTML = `
                    <div style="background-color: white; border: 2px solid #ccc; border-radius: 10px; padding: 10px 15px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: bold; text-transform: uppercase; font-size: 16px;">${op}</div>
                                <div><strong>ACTIVIDAD:</strong> ${trabajos[0]?.ACTIVIDAD || "Sin dato"}</div>
                            </div>
                            <div style="text-align: right;">
                                <div><strong>Horas trabajadas:</strong> ${horasTrabajadasTexto}</div>
                                <div><strong>Prom. por ejecución:</strong> ${promTexto}</div>
                            </div>
                        </div>
                    </div>
                    <div id="mapa-operario" style="width: 100%; height: 570px; border-radius: 10px;"></div>
                `;


                setTimeout(() => {
                    const mapa = L.map('mapa-operario');

                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(mapa);

                    const projUTM = "+proj=utm +zone=17 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
                    const projLatLon = "+proj=longlat +datum=WGS84 +no_defs";

                    const puntos = [];

                    const iconoVerde = L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', // Verde
                        iconSize: [30, 30],
                        iconAnchor: [30, 30]
                    });

                    const iconoCeleste = L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Celeste
                        iconSize: [30, 30],
                        iconAnchor: [30, 30]
                    });

                    trabajos.forEach((f, i) => {
                        let lat = f["LATITUD"];
                        let lon = f["LONGITUD"];

                        // Normalizar si vienen como string
                        if (typeof lat === "string") lat = lat.replace(",", ".").trim();
                        if (typeof lon === "string") lon = lon.replace(",", ".").trim();

                        lat = parseFloat(lat);
                        lon = parseFloat(lon);

                        // Si lat/lon no son válidos, usar coordenadas UTM
                        if (isNaN(lat) || isNaN(lon)) {
                            let este = f["ESTE"];
                            let norte = f["NORTE"];

                            if (typeof este === "string") este = este.replace(",", ".").trim();
                            if (typeof norte === "string") norte = norte.replace(",", ".").trim();

                            este = parseFloat(este);
                            norte = parseFloat(norte);

                            if (!isNaN(este) && !isNaN(norte)) {
                                const [convertedLon, convertedLat] = proj4(projUTM, projLatLon, [este, norte]);
                                lat = convertedLat;
                                lon = convertedLon;
                            }
                        }


                        if (!isNaN(lat) && !isNaN(lon)) {
                            puntos.push([lat, lon]);

                            const esInicio = i === 0;
                            const esFin = i === trabajos.length - 1;

                            const fillColor = (esInicio || esFin) ? '#7ad9ff' : '#49ff00';
                            const borderColor = (esInicio || esFin) ? '#49a1c3' : '#6eae6e';
                            const label = esInicio ? "Inicio" : (esFin ? "Fin" : "");

                            const marcador = L.circleMarker([lat, lon], {
                                radius: 6,
                                color: borderColor,
                                weight: 2,
                                fillColor: fillColor,
                                fillOpacity: 1
                            }).addTo(mapa)
                            .bindPopup(`<strong>${label}</strong><br>${f["NOMBRE"] || ""}<br>${f["CALLE2"] || ""}`);

                            // ✅ Evento al hacer clic en el marcador
                            marcador.on("click", () => {
                                // Remover resaltado de todas las tarjetas
                                document.querySelectorAll(".tarjeta-detalle").forEach(t => t.classList.remove("resaltada"));

                                // Aplicar resaltado a la tarjeta correspondiente
                                const idTarjeta = `tarjeta-${lat.toFixed(6)}-${lon.toFixed(6)}`;
                                const tarjeta = document.getElementById(idTarjeta);
                                if (tarjeta) {
                                    tarjeta.classList.add("resaltada");
                                    tarjeta.scrollIntoView({ behavior: "smooth", block: "center" }); // ← Opcional: desplazar a la tarjeta
                                }
                            });

                        }

                    });


                    if (puntos.length > 1) {
                        for (let i = 0; i < puntos.length - 1; i++) {
                            const p1 = puntos[i];
                            const p2 = puntos[i + 1];

                            let horaFin = trabajos[i]?.["HORA"]?.trim();
                            let horaIniSiguiente = trabajos[i + 1]?.["HORA INI"]?.trim();

                            let minutosDiferencia = 0;

                            if (horaFin && horaIniSiguiente && horaFin.includes(":") && horaIniSiguiente.includes(":")) {
                                const [h1, m1] = horaFin.split(":").map(Number);
                                const [h2, m2] = horaIniSiguiente.split(":").map(Number);

                                if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
                                    const t1 = h1 * 60 + m1;
                                    const t2 = h2 * 60 + m2;
                                    minutosDiferencia = t2 - t1;
                                }
                            }

                            const esLineaRoja = minutosDiferencia > 60;
                            const colorLinea = esLineaRoja ? '#e74c3c' : '#4678a6';

                            const linea = L.polyline([p1, p2], {
                                color: colorLinea,
                                weight: esLineaRoja ? 4 : 1 // ← más gruesa si es roja
                            }).addTo(mapa);


                        }


                        const polylinePrincipal = L.polyline(puntos, {
                            color: "#00000000" // Invisible (usamos solo para el fitBounds)
                        }).addTo(mapa);

                        // Añadir flechas decorativas a la ruta general
                        L.polylineDecorator(polylinePrincipal, {
                            patterns: [
                                {
                                    offset: '2%',
                                    repeat: '4%',
                                    symbol: L.Symbol.arrowHead({
                                        pixelSize: 8,
                                        polygon: false,
                                        pathOptions: { stroke: true, color: '#c0392b', weight: 2 }
                                    })
                                }
                            ]
                        }).addTo(mapa);

                        mapa.fitBounds(polylinePrincipal.getBounds());

                    } else if (puntos.length === 1) {
                        mapa.setView(puntos[0], 17);
                    } else {
                        alert("Este operario no tiene coordenadas válidas.");
                    }
                }, 0); // Espera DOM render del contenedor

                // Crear contenedor inferior con scroll horizontal
                const detalleDiv = document.createElement("div");
                detalleDiv.id = "fc-mapa-detalle-operario";

                const fila = document.createElement("div");
                fila.className = "fila-detalle";

                // Crear tarjeta para cada punto
                trabajos.forEach((f, i) => {
                    let lat = f["LATITUD"];
                    let lon = f["LONGITUD"];

                    if (typeof lat === "string") lat = lat.replace(",", ".").trim();
                    if (typeof lon === "string") lon = lon.replace(",", ".").trim();

                    lat = parseFloat(lat);
                    lon = parseFloat(lon);

                    if (isNaN(lat) || isNaN(lon)) {
                        let este = f["ESTE"];
                        let norte = f["NORTE"];

                        if (typeof este === "string") este = este.replace(",", ".").trim();
                        if (typeof norte === "string") norte = norte.replace(",", ".").trim();

                        este = parseFloat(este);
                        norte = parseFloat(norte);

                        if (!isNaN(este) && !isNaN(norte)) {
                            const [convertedLon, convertedLat] = proj4(projUTM, projLatLon, [este, norte]);
                            lat = convertedLat;
                            lon = convertedLon;
                        }
                    }

                    if (!isNaN(lat) && !isNaN(lon)) {
                        const tarjeta = document.createElement("div");
                        tarjeta.className = "tarjeta-detalle";
                        tarjeta.id = `tarjeta-${lat.toFixed(6)}-${lon.toFixed(6)}`; // ← ID único usando coordenadas

                        const iconoGeo = document.createElement("div");
                        iconoGeo.className = "icono-circulo";
                        iconoGeo.innerHTML = `<i class="fas fa-map-marker-alt"></i>`;
                        iconoGeo.addEventListener("click", () => {
                            const suministro = f["SUMINISTRO"]?.toString().trim();
                            const codigoInspeccion = f["CODIGO INSPECCION PERDIDAS"]?.toString().trim();

                            // Crear ventana flotante
                            const ventana = document.createElement("div");
                            ventana.style.position = "fixed";
                            ventana.style.top = "50%";
                            ventana.style.left = "50%";
                            ventana.style.transform = "translate(-50%, -50%)";
                            ventana.style.zIndex = "9999";
                            ventana.style.background = "white";
                            ventana.style.border = "2px solid #ccc";
                            ventana.style.borderRadius = "10px";
                            ventana.style.padding = "20px";
                            ventana.style.width = "1000px";
                            ventana.style.height = "970px";
                            ventana.style.maxWidth = "1000px";
                            ventana.style.maxHeight = "970px";
                            ventana.style.overflowY = "auto";
                            ventana.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";

                            // Botón cerrar
                            const cerrarBtn = document.createElement("button");
                            cerrarBtn.textContent = "x";
                            cerrarBtn.style.position = "absolute";
                            cerrarBtn.style.top = "8px";
                            cerrarBtn.style.right = "8px";
                            cerrarBtn.style.fontSize = "22px";
                            cerrarBtn.style.fontWeight = "bold";
                            cerrarBtn.style.color = "black";     // ← X negra
                            cerrarBtn.style.background = "transparent"; // ← sin fondo
                            cerrarBtn.style.border = "none";     // ← sin borde
                            cerrarBtn.style.cursor = "pointer";  // ← cursor en forma de mano

                            cerrarBtn.addEventListener("click", () => {
                                ventana.remove();
                                overlay.remove();
                            });


                            // Texto
                            const direccion = `${f["URBA"] || ""} ${f["CALLE2"] || ""} ${f["NROMUNI"] || ""}`.trim();
                            const infoHTML = `
                                <div><strong>Suministro:</strong> ${suministro}</div>
                                <div style="margin-top: 5px;"><strong>Dirección:</strong> ${direccion}</div>
                                <div style="margin-top: 5px;">
                                    <strong>Hora Inicio:</strong> ${f["HORA INI"] || "-"} &nbsp;&nbsp;
                                    <strong>Hora Fin:</strong> ${f["HORA"] || "-"}
                                </div>
                                <div id="contenedor-carrusel" style="margin-top: 15px;"></div>
                            `;

                            ventana.innerHTML += infoHTML;
                            ventana.appendChild(cerrarBtn);
                            // Fondo oscuro
                            const overlay = document.createElement("div");
                            overlay.style.position = "fixed";
                            overlay.style.top = "0";
                            overlay.style.left = "0";
                            overlay.style.width = "100vw";
                            overlay.style.height = "100vh";
                            overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                            overlay.style.zIndex = "9998";
                            overlay.id = "overlay-imagenes";

                            document.body.appendChild(overlay);

                            document.body.appendChild(ventana);

                            const contenedorCarrusel = ventana.querySelector("#contenedor-carrusel");
                            // Spinner HTML
                            contenedorCarrusel.innerHTML = `
                                <div id="spinner-carga" style="text-align: center; margin-top: 100px;">
                                    <div class="loader2"></div>
                                    <p>Cargando imágenes...</p>
                                </div>
                            `;

                            // Buscar imágenes por código
                            fetch("/buscar-multiples-coincidencias", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pares })
                            })


                            .then(res => res.json())
                            .then(data => {
                                let imagenes = [];

                                if (Array.isArray(data.resultados)) {
                                    data.resultados.forEach(grupo => {
                                        if (grupo.subgrupos) {
                                            grupo.subgrupos.forEach(sg => {
                                                imagenes.push(...sg.imagenes.map(img => ({ carpeta: sg.carpeta, archivo: img })));
                                            });
                                        } else if (grupo.imagenes) {
                                            imagenes.push(...grupo.imagenes.map(img => ({ carpeta: grupo.carpeta, archivo: img })));
                                        }
                                    });
                                }

                                // Filtrar imágenes que contengan suministro o código de inspección
                                const coincidentes = imagenes.filter(img =>
                                    img.archivo.includes(suministro) || img.archivo.includes(codigoInspeccion)
                                );

                                const contenedorCarrusel = ventana.querySelector("#contenedor-carrusel");

                                if (coincidentes.length === 0) {
                                    contenedorCarrusel.innerHTML = "<p>No se encontraron imágenes.</p>";
                                    return;
                                }

                                let index = 0;

                                const carruselContenedor = document.createElement("div");
                                carruselContenedor.style.position = "relative";
                                carruselContenedor.style.width = "100%";
                                carruselContenedor.style.height = "100%";
                                carruselContenedor.style.display = "flex";
                                carruselContenedor.style.justifyContent = "center";
                                carruselContenedor.style.alignItems = "center";

                                // Imagen con tamaño fijo
                                const img = document.createElement("img");
                                img.src = `http://200.233.44.171/app_oraclesedalib/public/storage/images/ordenes/${coincidentes[0].carpeta}/${coincidentes[0].archivo}`;
                                img.style.width = "1000px";      // Tamaño fijo
                                img.style.height = "850px";     // Tamaño fijo
                                img.style.objectFit = "contain";
                                img.style.border = "1px solid #aaa";
                                img.style.borderRadius = "8px";
                                img.style.zIndex = "0";

                                // Flechas con posición fija
                                const btnIzq = document.createElement("button");
                                btnIzq.textContent = "❮";
                                btnIzq.style.position = "absolute";
                                btnIzq.style.left = "20px";
                                btnIzq.style.top = "50%";
                                btnIzq.style.transform = "translateY(-50%)";
                                btnIzq.style.fontSize = "32px";
                                btnIzq.style.padding = "10px 15px";
                                btnIzq.style.borderRadius = "50%";
                                btnIzq.style.border = "none";
                                btnIzq.style.background = "rgba(0, 0, 0, 0.5)";
                                btnIzq.style.color = "white";
                                btnIzq.style.cursor = "pointer";
                                btnIzq.style.zIndex = "2";
                                btnIzq.style.width = "80px";     // Ancho del botón
                                btnIzq.style.height = "80px";    // Alto del botón

                                btnIzq.onclick = () => {
                                    index = (index - 1 + coincidentes.length) % coincidentes.length;
                                    img.src = `http://200.233.44.171/app_oraclesedalib/public/storage/images/ordenes/${coincidentes[index].carpeta}/${coincidentes[index].archivo}`;
                                };

                                const btnDer = document.createElement("button");
                                btnDer.textContent = "❯";
                                btnDer.style.position = "absolute";
                                btnDer.style.right = "20px";
                                btnDer.style.top = "50%";
                                btnDer.style.transform = "translateY(-50%)";
                                btnDer.style.fontSize = "32px";
                                btnDer.style.padding = "10px 15px";
                                btnDer.style.borderRadius = "50%";
                                btnDer.style.border = "none";
                                btnDer.style.background = "rgba(0, 0, 0, 0.5)";
                                btnDer.style.color = "white";
                                btnDer.style.cursor = "pointer";
                                btnDer.style.zIndex = "2";
                                btnDer.style.width = "80px";     // Ancho del botón
                                btnDer.style.height = "80px";    // Alto del botón


                                btnDer.onclick = () => {
                                    index = (index + 1) % coincidentes.length;
                                    img.src = `http://200.233.44.171/app_oraclesedalib/public/storage/images/ordenes/${coincidentes[index].carpeta}/${coincidentes[index].archivo}`;
                                };

                                // Ensamblar carrusel
                                carruselContenedor.appendChild(btnIzq);
                                carruselContenedor.appendChild(img);
                                carruselContenedor.appendChild(btnDer);

                                contenedorCarrusel.innerHTML = "";
                                contenedorCarrusel.appendChild(carruselContenedor);

                            })
                            .catch(err => {
                                console.error("Error al buscar imágenes:", err);
                                const contenedorCarrusel = ventana.querySelector("#contenedor-carrusel");
                                contenedorCarrusel.innerHTML = "<p>Error al cargar imágenes.</p>";
                            });
                        });

                        const suministro = document.createElement("div");
                        suministro.textContent = f["SUMINISTRO"] || "-";
                        suministro.style.fontWeight = "bold";

                        const fecha = document.createElement("div");
                        fecha.textContent = f["FECHA INI EJECUCION"] || "-";

                        const horaIni = document.createElement("div");
                        horaIni.innerHTML = `Inicio: <strong>${f["HORA INI"] || "-"}</strong>`;

                        const horaFin = document.createElement("div");
                        horaFin.innerHTML = `Fin: <strong>${f["HORA"] || "-"}</strong>`;

                        tarjeta.appendChild(iconoGeo);
                        tarjeta.appendChild(suministro);
                        tarjeta.appendChild(fecha);
                        tarjeta.appendChild(horaIni);
                        tarjeta.appendChild(horaFin);

                        fila.appendChild(tarjeta);

                        if (i < trabajos.length - 1) {
                            const flecha = document.createElement("div");
                            flecha.className = "flecha-detalle";
                            flecha.innerHTML = `<i class="fas fa-arrow-right"></i>`;
                            fila.appendChild(flecha);
                        }
                    }
                });

                // Agregar fila al contenedor
                detalleDiv.appendChild(fila);

                // Agregar todo debajo del mapa
                document.getElementById("fc-seccion-mapa-2").appendChild(detalleDiv);

            });

            // Icono Excel (ventana flotante de detalle)
            const icono = document.createElement("span");
            icono.innerHTML = "📄";
            icono.style.cursor = "pointer";
            icono.title = "Ver detalle en tabla";

            icono.addEventListener("click", () => {
                const trabajos = empleados.filter(f => f["OPERARIO"] === op);

                const columnas = ["NOMBRE", "LOCALIDAD", "URBA", "CALLE2", "NROMUNI", "ACTIVIDAD"];
                const tabla = document.createElement("table");

                const thead = document.createElement("thead");
                const filaCabecera = document.createElement("tr");
                columnas.forEach(col => {
                    const th = document.createElement("th");
                    th.textContent = col;
                    filaCabecera.appendChild(th);
                });
                thead.appendChild(filaCabecera);
                tabla.appendChild(thead);

                const tbody = document.createElement("tbody");
                trabajos.forEach(f => {
                    const fila = document.createElement("tr");
                    columnas.forEach(col => {
                        const td = document.createElement("td");
                        td.textContent = f[col] || "";
                        fila.appendChild(td);
                    });
                    tbody.appendChild(fila);
                });
                tabla.appendChild(tbody);

                const contenedorTabla = document.getElementById("tabla-detalle-container");
                contenedorTabla.innerHTML = "";
                contenedorTabla.appendChild(tabla);
                document.getElementById("ventana-detalle").style.display = "flex";
            });

            // Cantidad
            const cantidad = document.createElement("span");
            cantidad.textContent = `${contador[op]} trabajos`;
            cantidad.style.fontWeight = "bold";

            // Ensamblar
            li.appendChild(nombreSpan);
            li.appendChild(cantidad);
            li.appendChild(icono);
            ul.appendChild(li);
        });



            listaContenedor.appendChild(ul);
        });
    };

    lector.readAsArrayBuffer(archivo);
}

let datosFiltradosPorCarga = {}; // Guardará los datos agrupados por CARGA
let mapaCarga;
let capaMarcadores;

function generarRutas() {
    const archivo = document.getElementById('cargador-mapa-2').files[0];
    if (!archivo) {
        alert("Por favor, sube un archivo Excel primero.");
        return;
    }

    const lector = new FileReader();
    lector.onload = function (evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];

        const registros = XLSX.utils.sheet_to_json(hoja, { defval: "" });

        if (registros.length === 0) {
            alert("El archivo no tiene datos.");
            return;
        }

        const normalizar = (texto) => texto ? texto.toString().trim().toUpperCase() : "";

        // Filtrar solo filas válidas
        const datosCarga = registros
            .filter(fila =>
                normalizar(fila["CARGA"]) !== "" &&
                fila["ORDEN"] !== "" &&
                fila["LATITUD"] !== "" &&
                fila["LONGITUD"] !== ""
            )
            .map(fila => ({
                carga: normalizar(fila["CARGA"]),
                orden: fila["ORDEN"],
                lat: parseFloat(String(fila["LATITUD"]).replace(",", ".")),
                lng: parseFloat(String(fila["LONGITUD"]).replace(",", ".")),
                NEX_CLI: fila["NEX_CLI"] || "",
                NEX_DIR: fila["NEX_DIR"] || "",
                NEX_MED: fila["NEX_MED"] || "",
                NEX_CIC: fila["NEX_CIC"] || "",
                NEX_NOM: fila["NEX_NOM"] || ""
            }));


        if (datosCarga.length === 0) {
            alert("No se encontraron datos con CARGA, ORDEN, LATITUD y LONGITUD.");
            return;
        }

        // Agrupar datos por carga
        datosFiltradosPorCarga = datosCarga.reduce((acc, fila) => {
            if (!acc[fila.carga]) acc[fila.carga] = [];
            acc[fila.carga].push(fila);
            return acc;
        }, {});

        const cargasUnicas = Object.keys(datosFiltradosPorCarga);

        // Mostrar lista de cargas en el panel
        const contenedor = document.querySelector(".fc-opciones-operario");
        contenedor.innerHTML = "<h4>CARGAS DISPONIBLES</h4>";

        const lista = document.createElement("ul");
        lista.style.listStyle = "none";
        lista.style.padding = "0";

        cargasUnicas.forEach(carga => {
            const li = document.createElement("li");
            li.textContent = carga;
            li.style.cursor = "pointer";
            li.style.padding = "8px 10px";
            li.style.marginBottom = "5px";
            li.style.background = "#f8f8f8";
            li.style.border = "1px solid #ccc";
            li.style.borderRadius = "6px";

            li.addEventListener("click", () => {
                mostrarMapaPorCarga(carga);
            });

            lista.appendChild(li);
        });

        contenedor.appendChild(lista);
    };

    lector.readAsArrayBuffer(archivo);
}

function mostrarMapaPorCarga(cargaSeleccionada) {
    const contenedorMapa = document.getElementById("fc-seccion-mapa-2");

    // Obtener puntos antes de renderizar el HTML
    const puntos = datosFiltradosPorCarga[cargaSeleccionada];
    if (!puntos || puntos.length === 0) {
        alert("No hay puntos para esta carga.");
        return;
    }

    // Si el mapa no existe, inicializarlo UNA SOLA VEZ
    if (!mapaCarga) {
        contenedorMapa.innerHTML = `
            <div style="background-color: white; border: 2px solid #ccc; border-radius: 10px; padding: 10px 15px; margin-bottom: 10px;">
                <div id="titulo-carga" style="font-size: 16px; text-transform: uppercase;">
                    <strong>CARGA SELECCIONADA:</strong> ${cargaSeleccionada}
                </div>
                <div id="cantidad-registros" style="font-size: 14px; color: #333; margin-top: 5px;">
                    <strong>CANTIDAD DE REGISTROS:</strong> ${puntos.length}
                </div>
            </div>
            <div id="mapa-carga" style="width: 100%; height: 680px; border-radius: 10px;"></div>
        
            <div style="text-align:center; margin-top:10px;">
                <button id="btn-generar-ruta" style="padding:10px 20px; background:#184875; color:white; border:none; border-radius:10px; font-size:14px; cursor:pointer;">
                    GENERAR RUTA
                </button>
            </div>

        `;

        mapaCarga = L.map('mapa-carga').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(mapaCarga);
    } else {
        // Actualizar textos sin destruir el mapa
        document.getElementById("titulo-carga").innerHTML = `<strong>CARGA SELECCIONADA:</strong> ${cargaSeleccionada}`;
        document.getElementById("cantidad-registros").innerHTML = `<strong>CANTIDAD DE REGISTROS:</strong> ${puntos.length}`;
    }

    // Limpiar marcadores anteriores
    if (capaMarcadores) capaMarcadores.clearLayers();
    capaMarcadores = L.layerGroup().addTo(mapaCarga);

    const bounds = [];

    puntos.forEach(p => {
        // Crear marcador con círculo y texto centrado
        const iconHtml = `
            <div style="
                width: 30px;
                height: 30px;
                background-color: #007bff;
                border: 2px solid #004080;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;">
                ${p.orden}
            </div>
        `;
        const icon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [30, 30]
        });

        L.marker([p.lat, p.lng], { icon }).addTo(capaMarcadores);
        bounds.push([p.lat, p.lng]);
    });

    if (bounds.length > 0) {
        mapaCarga.fitBounds(bounds, { padding: [20, 20] });
    }
}


// ✅ 2. Botón original: abre el modal
document.getElementById('boton-subir-mapa-2').addEventListener('click', function () {
    document.getElementById('modal-opciones').style.display = 'flex';
});

// ✅ 3. Botón del modal: ejecuta la lógica
document.getElementById('btn-monitoreo-operario').addEventListener('click', function () {
    document.getElementById('modal-opciones').style.display = 'none';
    iniciarMonitoreoOperario();
});

// Botón: GENERAR RUTAS
document.getElementById('btn-generar-rutas').addEventListener('click', function () {
    document.getElementById('modal-opciones').style.display = 'none';

    // Mostrar spinner
    document.getElementById('spinner-mapa').style.display = 'block';

    // Ejecutar generarRutas después de permitir que el navegador pinte el spinner
    setTimeout(() => {
        try {
            generarRutas(); // tu función de generación de rutas
        } catch (err) {
            console.error("Error al generar rutas:", err);
        } finally {
            document.getElementById('spinner-mapa').style.display = 'none';
        }
    }, 50); // 50 ms es suficiente
});

// Cerrar modal
function cerrarModal() {
    document.getElementById('modal-pdf').style.display = 'none';
}

// Evento botón GENERAR RUTA
document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "btn-generar-ruta") {

        // Mostrar spinner
        document.getElementById('spinner-mapa').style.display = 'block';

        // Ejecutar la generación del PDF después de que el navegador pinte el spinner
        setTimeout(async () => {
            try {
                await generarPDFTodasLasCargas(); // función que genera el PDF
            } catch (err) {
                console.error("Error al generar PDF:", err);
            } finally {
                // Ocultar spinner cuando termine
                document.getElementById('spinner-mapa').style.display = 'none';
            }
        }, 50); // 50ms es suficiente para que se renderice el spinner
    }
});


async function generarPDFTodasLasCargas() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    const cargas = Object.keys(datosFiltradosPorCarga);

    const imgWidth = 1280; // resolución solicitada a Mapbox
    const imgHeight = 1280;

    for (let i = 0; i < cargas.length; i++) {
        const carga = cargas[i];
        const puntos = datosFiltradosPorCarga[carga];

        // ✅ 1. Calcular bounding box base
        const bboxCoords = calcularBoundingBox(puntos);

        // ✅ 2. Ajustar bbox para que coincida con la proporción de la imagen
        const bboxAjustado = ajustarBBoxParaAspectRatio(bboxCoords, imgWidth, imgHeight);
        console.log(`Carga ${carga} - BBox ajustado:`, bboxAjustado);

        // ✅ 3. Descargar imagen desde Mapbox usando bbox ajustado
        let base64Mapa;
        try {
            base64Mapa = await getMapboxImageByBounds(bboxAjustado, imgWidth, imgHeight);
        } catch (err) {
            console.error(`Error descargando mapa para carga ${carga}:`, err);
            continue; // saltamos esta carga si falla
        }

        if (i > 0) pdf.addPage();

        // ✅ 4. Insertar mapa en el PDF
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(base64Mapa, "PNG", 0, 0, pageWidth, pageHeight);

        // Título sobre el mapa
        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 0); // Negro
        pdf.setFont("helvetica", "bold"); // Negrita
        pdf.text(`Mapa de CARGA: ${carga}`, 40, 40);


        // ✅ 5. Dibujar puntos ajustados al bbox corregido
        puntos.forEach((p, index) => {
            const lat = Number(p.lat);
            const lng = Number(p.lng);

            const coords = latLngToPixel(lat, lng, bboxAjustado, imgWidth, imgHeight);
            const px = (coords.x / imgWidth) * pageWidth;
            const py = (coords.y / imgHeight) * pageHeight;

            console.log(`Punto ${p.orden} (${lat}, ${lng}) -> px:${px}, py:${py}`);

            const hue = (index * 40) % 360;
            const rgb = hslToRgb(hue / 360, 0.7, 0.5);
            pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
            pdf.circle(px, py, 6, 'F');

            // Texto sobre el punto
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            const text = p.orden.toString();
            const textWidth = pdf.getTextWidth(text);
            pdf.text(text, px - textWidth / 2, py + 3);
        });

        // ✅ 6. Página 2: Tabla con detalles
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Detalle de CARGA: ${carga}`, 40, 40);

        const columnas = ["NEX_CLI", "NEX_DIR", "NEX_MED", "NEX_CIC", "NEX_NOM", "CARGA", "ORDEN"];
        const filas = puntos.map(p => [
            p.NEX_CLI || "",
            p.NEX_DIR || "",
            p.NEX_MED || "",
            p.NEX_CIC || "",
            p.NEX_NOM || "",
            p.carga || "",
            p.orden || ""
        ]);

        pdf.autoTable({
            startY: 60,
            head: [columnas],
            body: filas,
            theme: 'striped',
            styles: { fontSize: 8 }
        });
    }

    const pdfUrl = pdf.output('bloburl');
    document.getElementById('visor-pdf').src = pdfUrl;
    document.getElementById('modal-pdf').style.display = 'flex';
}

/* ---------- FUNCIONES AUXILIARES ---------- */
function calcularBoundingBox(puntos) {
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    puntos.forEach(p => {
        const lat = parseFloat(p.lat || p.LATITUD);
        const lng = parseFloat(p.lng || p.LONGITUD);
        if (!isNaN(lat) && !isNaN(lng)) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
        }
    });

    // Convertir a Mercator
    const sw = latLngToMercator(minLat, minLng);
    const ne = latLngToMercator(maxLat, maxLng);

    return {
        minX: sw.x,
        minY: sw.y,
        maxX: ne.x,
        maxY: ne.y
    };
}



// ✅ Ajuste del BBox para mantener proporción correcta con la imagen solicitada
function ajustarBBoxParaAspectRatio(bbox, imgWidth, imgHeight) {
    let minX = bbox.minX, maxX = bbox.maxX, minY = bbox.minY, maxY = bbox.maxY;
    const spanX = maxX - minX;
    const spanY = maxY - minY;

    const bboxAspect = spanX / spanY;
    const imgAspect = imgWidth / imgHeight;

    if (bboxAspect > imgAspect) {
        // bbox más ancho → expandir Y
        const newSpanY = spanX / imgAspect;
        const extra = (newSpanY - spanY) / 2;
        minY -= extra;
        maxY += extra;
    } else {
        // bbox más alto → expandir X
        const newSpanX = spanY * imgAspect;
        const extra = (newSpanX - spanX) / 2;
        minX -= extra;
        maxX += extra;
    }

    const swDeg = mercatorToLatLng(minX, minY);
    const neDeg = mercatorToLatLng(maxX, maxY);

    return {
        minX, maxX, minY, maxY,
        minLat: swDeg.lat, minLng: swDeg.lng,
        maxLat: neDeg.lat, maxLng: neDeg.lng
    };
}

// ✅ Descargar imagen de MAPBOX usando bbox ajustado
async function getMapboxImageByBounds(bbox, width = 1280, height = 1280) {
    const token = "pk.eyJ1IjoianVsaW9hbGRhaXIxNSIsImEiOiJjbWVybmluZnIwODZkMmlvYjE1eXFtbjd5In0.0ZyKo-JHlHZ26_L1NwTiSw";
    const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/[${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}]/${width}x${height}?access_token=${token}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error descargando mapa de Mapbox");
    const blob = await response.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

// ✅ Conversión lat/lng a pixel
function latLngToPixel(lat, lng, bbox, imgWidth, imgHeight) {
    const p = latLngToMercator(lat, lng);
    const spanX = (bbox.maxX - bbox.minX) || 1;
    const spanY = (bbox.maxY - bbox.minY) || 1;

    const x = ((p.x - bbox.minX) / spanX) * imgWidth;
    const y = ((bbox.maxY - p.y) / spanY) * imgHeight; // invertimos Y
    return { x, y };
}

// ✅ Conversión HSL a RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ✅ Proyección Mercator
const RADIUS = 6378137.0;
function latLngToMercator(lat, lng) {
    const x = RADIUS * lng * Math.PI / 180.0;
    const y = RADIUS * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 360)));
    return { x, y };
}
function mercatorToLatLng(x, y) {
    const lng = (x / RADIUS) * 180.0 / Math.PI;
    const lat = (2 * Math.atan(Math.exp(y / RADIUS)) - Math.PI / 2) * 180.0 / Math.PI;
    return { lat, lng };
}


document.getElementById("cerrar-ventana").addEventListener("click", () => {
    document.getElementById("ventana-detalle").style.display = "none";
});

document.getElementById("cerrar-detalle").addEventListener("click", () => {
    document.getElementById("ventana-flotante-detalle").style.display = "none";
});



document.getElementById('renombrar-form').addEventListener('submit', async function() {
        const inputPath = document.getElementById('actividad-input').value;
        const resultadosDiv = document.getElementById('resultado-log');
        resultadosDiv.innerHTML = '<p>Procesando...</p>';

        try {
            const response = await fetch('/renombrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: inputPath })
            });

            const resultados = await response.json();
            
            // Limpiar el contenido anterior
            resultadosDiv.innerHTML = '';

            // Generar la tabla de resultados
            const tabla = document.createElement('table');
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Estado</th>
                        <th>Mensaje</th>
                    </tr>
                </thead>
                <tbody>
                    ${resultados.map(log => `
                        <tr>
                            <td>${log.status}</td>
                            <td>${log.message}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            resultadosDiv.appendChild(tabla);
        } catch (error) {
            resultadosDiv.innerHTML = `<p>Ocurrió un error al conectar con el servidor: ${error.message}</p>`;
        }
    });


function showMainTab(tabId) {
            // Oculta todos los contenidos de las pestañas principales
            const tabContents = document.querySelectorAll('.main-tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Muestra el contenido de la pestaña seleccionada
            document.getElementById(tabId).classList.add('active');

            // Actualiza el estado activo de los botones de las pestañas
            const tabButtons = document.querySelectorAll('.main-tab-button');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            // Busca el botón que corresponde al tabId y lo marca como activo
            const activeButton = document.querySelector(`.main-tab-button[onclick="showMainTab('${tabId}')"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }

        // Asegurarse de que al cargar la página se muestre la primera pestaña activa
        document.addEventListener('DOMContentLoaded', () => {
            showMainTab('asignacion-tab-content');
        });



// ----------------------------------------------------------------------
// 1. VARIABLES GLOBALES
// ----------------------------------------------------------------------
// Almacena los datos previsualizados (común para Carga y Trabajo Diario)
let previewData = [];
// Lee el valor inicial de la acción al cargar el script
let currentAction = document.getElementById('accion-asignacion')?.value || 'subir-carga'; 

// ----------------------------------------------------------------------
// 2. FUNCIONES DE UTILIDAD Y CONTROLADORAS
// ----------------------------------------------------------------------

/** Actualiza dinámicamente las cabeceras de la tabla de previsualización. */
function updatePreviewTableHeaders(headersArray) {
    const tableHead = document.querySelector('#preview-asignacion-table thead tr');
    if (tableHead) {
        tableHead.innerHTML = '';
        headersArray.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tableHead.appendChild(th);
        });
    }
}

/** Gestiona el cambio en el selector de acción. */
function changeAction() {
    const accionSelect = document.getElementById('accion-asignacion');
    const tableBody = document.querySelector('#preview-asignacion-table tbody');

    currentAction = accionSelect ? accionSelect.value : 'subir-carga';
    
    if (tableBody) tableBody.innerHTML = '';
    previewData = [];         
    
    // Adaptar las cabeceras al cambiar la acción
    if (currentAction === 'subir-carga') {
         updatePreviewTableHeaders(['Suministro', 'Dirección', 'Actividad', 'Operario']);
    } else if (currentAction === 'subir-trabajo-diario') {
         updatePreviewTableHeaders(['NEX CLI', 'Material', 'Cantidad', 'Operario', 'Descripción Nuevo', 'Estado']);
    } else {
         updatePreviewTableHeaders([]);
    }
}

/** Controlador para el botón SUBIR (Previsualización). */
function handleUpload() {
    if (currentAction === 'subir-carga') {
        uploadCarga();
    } else if (currentAction === 'subir-trabajo-diario') {
        uploadTrabajoDiario();
    } else {
        alert('Por favor, selecciona una acción válida (Subir Carga o Subir Trabajo Diario).');
    }
}

/** Controlador para el botón GUARDAR (Envío al backend). */
function handleSave() {
    if (previewData.length === 0) {
        alert('No hay datos cargados para guardar. Sube y previsualiza un archivo primero.');
        return;
    }
    
    if (currentAction === 'subir-carga') {
        saveCarga();
    } else if (currentAction === 'subir-trabajo-diario') {
        saveTrabajoDiario();
    } else {
        alert('No se puede guardar. Selecciona una acción primero.');
    }
}

// ----------------------------------------------------------------------
// 3. LÓGICA ESPECÍFICA: SUBIR CARGA (Planificación)
// ----------------------------------------------------------------------

function uploadCarga() {
    const fileInput = document.getElementById('seleccionar-archivo');
    const file = fileInput.files[0];
    const tableBody = document.querySelector('#preview-asignacion-table tbody');
    
    tableBody.innerHTML = '';
    previewData = [];

    if (!file) {
        alert('Por favor, selecciona un archivo Excel.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawData.length <= 1) { 
            alert('El archivo Excel está vacío o solo contiene cabeceras.');
            return;
        }

        const headers = rawData[0];
        const dataRows = rawData.slice(1);

        // Mapeo: [Cabecera del Excel] -> [Nombre de la columna en la DB]
        const headerMapping = {
            'NEX CLI': 'suministro',
            'NEX DIR': 'direccion',
            'DESCRIPCION NUEVO': 'actividad',
            'NOMBRE OPERADOR': 'operario'
        };
        
        const headerIndices = {};
        
        // Mapear los nombres de las columnas del Excel a sus índices
        Object.keys(headerMapping).forEach(excelHeader => {
            const index = headers.findIndex(h => h && h.toUpperCase().trim() === excelHeader.toUpperCase().trim());
            if (index !== -1) {
                headerIndices[excelHeader] = index;
            }
        });
        
        // Verificar que las 4 columnas mínimas existan
        if (Object.keys(headerIndices).length < 4) {
             alert('Error: El archivo Excel no contiene todas las columnas requeridas para CARGA DÍA (NEX CLI, NEX DIR, DESCRIPCION NUEVO, NOMBRE OPERADOR).');
             return;
        }

        // Procesar y previsualizar
        dataRows.forEach(row => {
            const rowData = {};
            const tableRow = document.createElement('tr');
            
            // Extraer solo las columnas requeridas y construir la fila de previsualización
            let columnsExtracted = 0;
            Object.keys(headerMapping).forEach(excelHeader => {
                const dbKey = headerMapping[excelHeader];
                const colIndex = headerIndices[excelHeader];
                const cellValue = (colIndex !== undefined && row[colIndex] !== undefined) ? row[colIndex] : ''; 
                
                rowData[dbKey] = cellValue.toString().trim(); 
                columnsExtracted++;

                const tableCell = document.createElement('td');
                tableCell.textContent = rowData[dbKey];
                tableRow.appendChild(tableCell);
            });
            
            if (columnsExtracted > 0) { // Solo si se extrajo algo
                tableBody.appendChild(tableRow);
                previewData.push(rowData);
            }
        });

        alert(`Previsualización cargada con ${previewData.length} filas.`);
    };

    reader.readAsArrayBuffer(file);
}

async function saveCarga() {
    if (previewData.length === 0) return alert('No hay datos para guardar.');
    
    const fechaEjecutar = document.getElementById('fecha-ejecutar').value;
    if (!fechaEjecutar) return alert('Por favor, selecciona una Fecha a Ejecutar.');

    const payload = {
        fecha_ejecutar: fechaEjecutar,
        cargas: previewData
    };
    
    try {
        const response = await fetch('/api/guardar_carga_dia', { // Endpoint de Flask para CargaDia
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`¡Éxito! ${result.count} registros guardados en carga_dia (Planificación).`);
            // Limpiar
            document.querySelector('#preview-asignacion-table tbody').innerHTML = '';
            previewData = [];
            document.getElementById('seleccionar-archivo').value = '';
        } else {
            alert(`Error al guardar: ${result.error || 'Ocurrió un error en el servidor.'}`);
        }
    } catch (error) {
        console.error('Error de red al guardar:', error);
        alert('Error de conexión al intentar guardar los datos.');
    }
}

// ----------------------------------------------------------------------
// 4. LÓGICA ESPECÍFICA: SUBIR TRABAJO DIARIO (Ejecución)
// ----------------------------------------------------------------------

function uploadTrabajoDiario() {
    const fileInput = document.getElementById('seleccionar-archivo');
    const file = fileInput.files[0];
    const tableBody = document.querySelector('#preview-asignacion-table tbody');

    tableBody.innerHTML = '';
    previewData = [];

    if (!file) {
        alert('Por favor, selecciona un archivo Excel.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawData.length <= 1) { 
            alert('El archivo Excel está vacío o solo contiene cabeceras.');
            return;
        }

        const headers = rawData[0]; 
        const dataRows = rawData.slice(1);

        // Mapeo: [Cabecera del Excel] -> [Nombre de la columna para envío]
        const requiredColumns = {
            'NEX CLI': 'nex_cli',
            'MATERIAL': 'material',
            'CANTIDAD': 'cantidad',
            'NOMBRE OPERADOR': 'operario',
            'DESCRIPCION NUEVO': 'actividad' // Usado para coincidir con carga_dia.actividad
        };
        
        const headerIndices = {};

        Object.keys(requiredColumns).forEach(excelHeader => {
            const index = headers.findIndex(h => h && h.toUpperCase().trim() === excelHeader.toUpperCase().trim());
            if (index !== -1) {
                headerIndices[excelHeader] = index;
            }
        });
        
        // Verificar que las 5 columnas mínimas existan
        if (Object.keys(headerIndices).length < 5) {
             alert('Error: El archivo Excel no contiene todas las columnas requeridas para TRABAJO DIARIO (NEX CLI, MATERIAL, CANTIDAD, OPERARIO, DESCRIPCION NUEVO).');
             return;
        }

        // Procesar y previsualizar
        dataRows.forEach(row => {
            const rowData = {};
            const tableRow = document.createElement('tr');
            
            // Extraer solo las columnas requeridas
            Object.keys(requiredColumns).forEach(excelHeader => {
                const dbKey = requiredColumns[excelHeader];
                const colIndex = headerIndices[excelHeader];
                const cellValue = (colIndex !== undefined && row[colIndex] !== undefined) ? row[colIndex] : ''; 
                
                rowData[dbKey] = cellValue.toString().trim();

                const tableCell = document.createElement('td');
                tableCell.textContent = rowData[dbKey];
                tableRow.appendChild(tableCell);
            });
            
            // Columna de estado para la validación (Visual)
            const statusCell = document.createElement('td');
            statusCell.textContent = "Pendiente de Validación";
            statusCell.style.color = "blue";
            tableRow.appendChild(statusCell);
            
            tableBody.appendChild(tableRow);
            previewData.push(rowData);
        });

        alert(`Previsualización cargada con ${previewData.length} filas listas para validar.`);
    };

    reader.readAsArrayBuffer(file);
}

async function saveTrabajoDiario() {
    if (previewData.length === 0) return alert('No hay datos para guardar.');
    
    const fechaEjecutar = document.getElementById('fecha-ejecutar').value;
    if (!fechaEjecutar) return alert('Por favor, selecciona una Fecha a Ejecutar.');

    const payload = {
        fecha_ejecucion: fechaEjecutar,
        trabajos: previewData
    };
    
    try {
        const response = await fetch('/api/guardar_trabajo_diario', { // Endpoint de Flask para CargaEjecutada
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`¡Éxito! ${result.saved_count} registros de ejecución guardados después de validar la planificación.`);
            // Limpiar
            document.querySelector('#preview-asignacion-table tbody').innerHTML = '';
            previewData = [];
            document.getElementById('seleccionar-archivo').value = '';
        } else {
            alert(`Error al guardar: ${result.error || 'Ocurrió un error en el servidor.'}`);
        }
    } catch (error) {
        console.error('Error de red al guardar:', error);
        alert('Error de conexión al intentar guardar los datos.');
    }
}


// ----------------------------------------------------------------------
// 5. INICIALIZACIÓN DE EVENTOS
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar controlador principal a los botones
    document.querySelector('.upload-btn').addEventListener('click', handleUpload);
    document.querySelector('.save-btn').addEventListener('click', handleSave);
    
    // 2. Asignar controlador al selector de acción
    const accionSelect = document.getElementById('accion-asignacion');
    if (accionSelect) {
        accionSelect.addEventListener('change', changeAction);
    }
    
    // 3. Inicializar la tabla y el estado al cargar la página
    changeAction();
});


//CONVERTIR A DBF
// --- 1. Lógica para mostrar/ocultar campos (sin cambios) ---
function verificarActividad() {
    const selector = document.getElementById('selector-actividad-1');
    const camposExtra = document.getElementById('campos-inspecciones');
    const resultado = document.getElementById('contenedor-resultado');

    if (selector.value === 'INSPECCIONES') {
        camposExtra.style.display = 'flex';
    } else {
        camposExtra.style.display = 'none';
        resultado.style.display = 'none';
    }
}

// --- 2. NUEVA FUNCIÓN: Pinta la tabla con los datos de un grupo específico ---
function renderTablaGrupo(data) {
    const contenedorResultado = document.getElementById('contenedor-resultado');
    const thead = contenedorResultado.querySelector('table thead');
    const tbody = contenedorResultado.querySelector('table tbody');

    // Limpiar tabla anterior
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%">Este grupo no tiene datos.</td></tr>';
        return;
    }

    // --- Crear Cabecera (Thead) ---
    const headersToShow = [
        'CLICODFAC', 'NACTINT', 'NACTEXT', 'CICLOREAL', 'FECNOTIMED',
        'HORANOTI', 'FCHINSREAL', 'HREAL', 'LECTURA', 'OBS', 'FUGAINT',
        'FUGAEXT', 'FUGANOVIS', 'AUSENTE', 'DCLAJUDA', 'USACEPCONS', 'OBSERS', 'NUU', 'USOINM'

    ];
    
    const headerRow = document.createElement('tr');
    headersToShow.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // --- Crear Cuerpo (Tbody) ---
    data.forEach(rowData => {
        const row = document.createElement('tr');
        headersToShow.forEach(headerText => {
            const td = document.createElement('td');
            let value = rowData[headerText];
            if (value === null || value === undefined || value === '') {
                value = '---';
            }
            td.textContent = value;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}


// --- 3. FUNCIÓN MODIFICADA: Ahora construye las PESTAÑAS ---
function construirTabsYTabla(dataPorGrupo) {
    const contenedorResultado = document.getElementById('contenedor-resultado');
    const tabsContainer = document.getElementById('tabla-tabs-container');
    tabsContainer.innerHTML = ''; // Limpiar pestañas anteriores

    const grupos = Object.keys(dataPorGrupo);

    if (grupos.length === 0) {
        // No hay grupos, mostrar mensaje
        renderTablaGrupo(null); // Llama a render para mostrar mensaje de "sin datos"
        contenedorResultado.style.display = 'block';
        return;
    }

    // Crear una pestaña (botón) para cada grupo
    grupos.forEach((grupo, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.textContent = `Grupo ${grupo} (${dataPorGrupo[grupo].length} filas)`;
        tabButton.dataset.grupo = grupo;

        // Añadir evento de clic
        tabButton.addEventListener('click', () => {
            // 1. Quitar 'active' de todas las pestañas
            tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            // 2. Añadir 'active' a esta pestaña
            tabButton.classList.add('active');
            // 3. Renderizar la tabla para este grupo
            renderTablaGrupo(dataPorGrupo[grupo]);
        });

        tabsContainer.appendChild(tabButton);
    });

    // Mostrar el contenedor principal
    contenedorResultado.style.display = 'block';
    
    // Simular clic en la primera pestaña para mostrarla por defecto
    if (tabsContainer.firstChild) {
        tabsContainer.firstChild.click();
    }
}


// --- 4. Función para PREVISUALIZAR (Botón "CONVERTIR") ---
async function previsualizarConversion() {
    const fechaInput = document.getElementById('fecha-input');
    const archivoInput = document.getElementById('archivo-input');
    const btnConvertir = document.getElementById('btn-convertir');

    // Validaciones
    if (!fechaInput.value) { alert('Por favor, seleccione una fecha.'); return; }
    if (archivoInput.files.length === 0) { alert('Por favor, seleccione un archivo Excel.'); return; }

    const formData = new FormData();
    formData.append('fecha', fechaInput.value);
    formData.append('archivo', archivoInput.files[0]);

    btnConvertir.textContent = 'CARGANDO VISTA...';
    btnConvertir.disabled = true;

    try {
        const response = await fetch('/previsualizar-dbf', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error desconocido en el servidor');
        }

        // ¡Ahora esperamos un objeto de grupos!
        const dataPorGrupo = await response.json();
        
        // Llamamos a la nueva función que construye las pestañas
        construirTabsYTabla(dataPorGrupo);

    } catch (error) {
        console.error('Error en la previsualización:', error);
        alert(`Error: ${error.message}`);
        document.getElementById('contenedor-resultado').style.display = 'none';
    } finally {
        btnConvertir.textContent = 'CONVERTIR';
        btnConvertir.disabled = false;
    }
}

// --- 5. Función para DESCARGAR (Botón "DESCARGAR ZIP" - sin cambios) ---
async function descargarZip() {
    const fechaInput = document.getElementById('fecha-input');
    const archivoInput = document.getElementById('archivo-input');
    const btnDescargar = document.getElementById('btn-descargar-1');

    if (!fechaInput.value || archivoInput.files.length === 0) {
        alert('Faltan la fecha o el archivo para descargar.');
        return;
    }

    const formData = new FormData();
    formData.append('fecha', fechaInput.value);
    formData.append('archivo', archivoInput.files[0]);

    btnDescargar.textContent = 'GENERANDO ZIP...';
    btnDescargar.disabled = true;

    try {
        const response = await fetch('/descargar-dbf', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al generar el ZIP');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'conversiones_dbf.zip';
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error en la descarga:', error);
        alert(`Error: ${error.message}`);
    } finally {
        btnDescargar.textContent = 'DESCARGAR ZIP';
        btnDescargar.disabled = false;
    }
}


// --- 6. Asignar los eventos a los botones (sin cambios) ---
document.addEventListener('DOMContentLoaded', () => {
    
    const btnConvertir = document.getElementById('btn-convertir');
    if (btnConvertir) {
        btnConvertir.onclick = null; // Limpiar 'onclick' del HTML
        btnConvertir.addEventListener('click', previsualizarConversion);
    }

    const btnDescargar = document.getElementById('btn-descargar-1');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', descargarZip);
    }
});


/// GENERAR CARGAS
// --- 1. FUNCIÓN (NUEVA): Construye la previsualización (UNA SOLA TABLA) ---
function construirPrevisualizacion_1(data) {
    const contenedorResultado = document.getElementById('contenedor-resultado-1');
    const tabsContainer = document.getElementById('tabla-tabs-container-1');
    const thead = contenedorResultado.querySelector('.tabla-estilo-1 thead');
    const tbody = contenedorResultado.querySelector('.tabla-estilo-1 tbody');

    // Limpiar contenido anterior
    thead.innerHTML = '';
    tbody.innerHTML = '';
    tabsContainer.innerHTML = ''; 

    // --- INICIO MODIFICACIÓN: Leer 'columns' y 'rows' del objeto 'data' ---
    const headers = data.columns; // <-- Lista ordenada desde Python
    const rowsData = data.rows;   // <-- Lista de datos
    // --- FIN MODIFICACIÓN ---

    if (!rowsData || rowsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%">No se encontraron datos para procesar.</td></tr>';
        contenedorResultado.style.display = 'block';
        return;
    }

    // --- Crear Cabecera (Thead) ---
    const headerRow = document.createElement('tr');
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        
        // --- ARREGLO DE BUG ---
        // Tu código anterior ( .replace('_COPIA') ) era incorrecto.
        if (headerText.endsWith('_COPIA')) {
            th.textContent = headerText.replace('_COPIA', ' (Obs Nueva)');
        } else {
            th.textContent = headerText;
        }
        // --- FIN ARREGLO DE BUG ---

        // (Tu lógica para la clase angosta está perfecta)
        if (headerText === 'nrcx_med' || headerText === 'nex_med' || headerText === 'MEDIDOR'|| headerText === 'nex_cic'|| headerText === 'nrcx_cic') {
            th.classList.add('col-angosta');
        }

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // --- Crear Cuerpo (Tbody) ---
    // Usamos 'rowsData' y 'headers' para garantizar el orden
    rowsData.forEach(rowData => {
        const row = document.createElement('tr');
        headers.forEach(headerText => { // Iteramos sobre 'headers' para mantener el orden
            const td = document.createElement('td');
            let value = rowData[headerText]; // Buscamos el valor por el nombre del header
            
            if (value === null || value === undefined || value === '') {
                value = '---';
            }

            // (Tu lógica para la clase angosta está perfecta)
            if (headerText === 'nrcx_med' || headerText === 'nex_med' || headerText === 'MEDIDOR'|| headerText === 'nex_cic'|| headerText === 'nrcx_cic') {
                td.classList.add('col-angosta');
            }
            
            td.textContent = value;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    
    contenedorResultado.style.display = 'block';
}

// --- 2. Función para PREVISUALIZAR (Botón "GENERAR") ---
// (Esta función es la misma que me diste, solo asegúrate 
// de que llame a la 'construirPrevisualizacion_1' actualizada)
async function previsualizarCarga() {
    const archivoInput = document.getElementById('archivo-input-1');
    const btnConvertir = document.getElementById('btn-convertir-1');
    const selectorActividad = document.getElementById('selector-actividad-2');

    if (selectorActividad.value === "") { alert('Por favor, seleccione una Actividad.'); return; }
    if (archivoInput.files.length === 0) { alert('Por favor, seleccione un archivo Excel.'); return; }

    const formData = new FormData();
    formData.append('archivo', archivoInput.files[0]);
    formData.append('actividad', selectorActividad.value);

    btnConvertir.textContent = 'PROCESANDO...';
    btnConvertir.disabled = true;

    try {
        const response = await fetch('/previsualizar-carga', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error desconocido en el servidor');
        }

        const data = await response.json(); // data ahora es { columns: [...], rows: [...] }
        
        construirPrevisualizacion_1(data); // Llamamos a la función actualizada

    } catch (error) {
        console.error('Error en la previsualización:', error);
        alert(`Error: ${error.message}`);
        document.getElementById('contenedor-resultado-1').style.display = 'none';
    } finally {
        btnConvertir.textContent = 'GENERAR';
        btnConvertir.disabled = false;
    }
}

// --- 3. Función para DESCARGAR (Botón "DESCARGAR" - ACTUALIZADA) ---
async function descargarCarga() {
    const archivoInput = document.getElementById('archivo-input-1');
    const btnDescargar = document.getElementById('btn-descargar-2');
    const selectorActividad = document.getElementById('selector-actividad-2');

    if (selectorActividad.value === "" || archivoInput.files.length === 0) {
        alert('Faltan la Actividad o el Archivo para descargar.');
        return;
    }

    // --- INICIO DE LA MODIFICACIÓN ---
    const archivo = archivoInput.files[0];
    const nombreOriginal = archivo.name;
    // --- FIN DE LA MODIFICACIÓN ---

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('actividad', selectorActividad.value);
    
    // --- AÑADIDO: Enviamos el nombre original al backend ---
    formData.append('nombre_original', nombreOriginal);

    btnDescargar.textContent = 'GENERANDO EXCEL...';
    btnDescargar.disabled = true;

    try {
        const response = await fetch('/descargar-carga', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al generar el Excel');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // (El nombre del archivo lo determinará el backend,
        // pero establecemos el nombre modificado aquí como respaldo)
        const nombreBase = nombreOriginal.substring(0, nombreOriginal.lastIndexOf('.')) || nombreOriginal;
        a.download = `${nombreBase}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error('Error en la descarga:', error);
        alert(`Error: ${error.message}`);
    } finally {
        btnDescargar.textContent = 'DESCARGAR';
        btnDescargar.disabled = false;
    }
}

// --- 4. Asignar los eventos a los botones ---
document.addEventListener('DOMContentLoaded', () => {
    
    const btnConvertir = document.getElementById('btn-convertir-1');
    if (btnConvertir) {
        btnConvertir.onclick = null; // Limpiar 'onclick' del HTML
        btnConvertir.addEventListener('click', previsualizarCarga);
    }

    const btnDescargar = document.getElementById('btn-descargar-2');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', descargarCarga);
    }
});


// DASHBOARD
document.addEventListener('DOMContentLoaded', function() {
    // Poner fecha de hoy por defecto en el input
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filtro-fecha').value = today;
    
    // Cargar datos iniciales
    loadData();
});

function loadData() {
    // 1. Obtener valores de los filtros
    const fecha = document.getElementById('filtro-fecha').value;
    const zona = document.getElementById('filtro-zona').value;

    // 2. Llamar al Backend con parámetros
    fetch(`/api/dashboard-data?fecha=${fecha}&zona=${zona}`)
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
        })
        .catch(err => console.error("Error:", err));
}

function updateDashboard(data) {
    // KPIs
    document.getElementById('val-total').innerText = data.kpis.total;
    document.getElementById('val-sla').innerText = data.kpis.sla + " días";
    document.getElementById('val-efectividad').innerText = data.kpis.efectividad + "%";

    // Timeline
    renderTimeline(data.timeline);

    // Anomalías
    renderAnomalies(data.anomalies);
}

function renderTimeline(seriesData) {
    // Si no hay datos, mostrar mensaje
    if (!seriesData || seriesData.length === 0) {
        document.querySelector("#timeline-chart").innerHTML = "<div style='text-align:center; padding:40px; color:#999'>No hay datos para esta fecha. Intenta cambiar el filtro.</div>";
        return;
    }

    var options = {
        series: [{ data: seriesData }],
        chart: { type: 'rangeBar', height: 350, toolbar: {show:false} },
        plotOptions: {
            bar: { horizontal: true, rangeBarGroupRows: true, barHeight: '50%' }
        },
        xaxis: {
            type: 'datetime',
            labels: { datetimeFormatter: { hour: 'HH:mm' } }
        },
        tooltip: {
            custom: function({series, seriesIndex, dataPointIndex, w}) {
                var data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
                var start = new Date(data.y[0]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                var end = new Date(data.y[1]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
                return `<div style="padding:10px; border:1px solid #ccc; background:white">
                        <b>${data.meta}</b><br>
                        ${start} - ${end}
                        </div>`;
            }
        }
    };

    document.querySelector("#timeline-chart").innerHTML = "";
    new ApexCharts(document.querySelector("#timeline-chart"), options).render();
}

function renderAnomalies(list) {
    const tbody = document.getElementById('anomalies-body');
    tbody.innerHTML = "";
    
    if(!list || list.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px; color:green'><i class='fas fa-check-circle'></i> Sin tiempos muertos</td></tr>";
        return;
    }

    list.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.operario}</strong></td>
                <td>${item.hora_fin}</td>
                <td>${item.hora_inicio}</td>
                <td><span class="badge-time">${item.duracion} min</span></td>
            </tr>`;
    });
}


document.getElementById('formCartas').addEventListener('submit', async function(e) {
            e.preventDefault(); // Evitar recarga normal
            
            const btn = document.getElementById('btnGenerar');
            const status = document.getElementById('statusMessage');
            const iframe = document.getElementById('pdfFrame');
            const formData = new FormData(this);

            // Validar que haya 2 archivos
            if (document.getElementById('excelFiles').files.length < 2) {
                alert("Debe seleccionar al menos 2 archivos.");
                return;
            }

            // UI Loading
            btn.disabled = true;
            btn.innerText = "PROCESANDO...";
            status.innerText = "El servidor está procesando los archivos y generando el PDF...";
            status.style.color = "#2d3748";
            iframe.style.display = 'none';

            try {
                // Enviar a la ruta Flask
                const response = await fetch('/generar_cartas_pdf', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error en el servidor");
                }

                // Convertir respuesta a Blob (Archivo en memoria del navegador)
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                // Mostrar en Iframe
                iframe.src = url;
                iframe.style.display = 'block';
                status.style.display = 'none'; // Ocultar mensaje

            } catch (error) {
                console.error(error);
                status.innerText = "Error: " + error.message;
                status.style.color = "red";
                status.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.innerText = "GENERAR";
            }
        });

function openSubTab(evt, tabId) {
    // 1. Ocultar todos los contenidos con clase "sub-tab-content" DENTRO de #cartas
    // Esto asegura que no afectemos a otras partes de la web
    const parentSection = document.getElementById('cartas');
    const tabContents = parentSection.getElementsByClassName("sub-tab-content");
    
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // 2. Quitar clase "active" de los botones
    const tabLinks = parentSection.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    // 3. Mostrar el tab seleccionado
    document.getElementById(tabId).classList.add("active");
    
    // 4. Activar visualmente el botón clickeado
    evt.currentTarget.classList.add("active");
}


// 1. BASE DE DATOS DE EMPLEADOS (Tu lista completa)
const EMPLEADOS_DB = [
    "64 ABANTO RODRIGUEZ LILY JANINA", "65 ACEVEDO BOBADILLA GLADYS MAXIMINA", "3 ACOSTA OCAS FERNANDO MIGUEL",
    "304 ALAN PEDRO ORTIZ BOCANEGRA", "30 ALEJO PINEDO JUAN JULIO", "49 ALFARO ANDRADE RAUL GREGORIO",
    "50 ALVA ANGULO VICTOR JAVIER", "149 ALVA MORALES NATALIE LISETH", "67 ARCE RODRIGUEZ GLENDY MARIVEL",
    "291 AREDO VELASQUEZ DAVID RICARDO", "184 ARGOMEDO GUZMAN DIEGO ARTURO", "148 AVALOS VELASQUEZ JESUS BRAYAN",
    "68 BARRIOS VENEGAS RUTH ALEXANDRA", "4 BAZAN TELLO FRANK ALBERTO", "31 BLAS MENDOZA ANDERSON DAVID",
    "5 BURGOS ARGOMEDO IVAN EDUARDO", "6 CAHUAZA BORDOY MILTON GABRIEL", "116 CALLE CARREÑO WILMER EMILIO",
    "32 CAMPOS CAHUACHI MARLITA SELDITA", "52 CAPA DOMINGUEZ CARLOS ENRIQUE", "69 CASANOVA CORREA ELEANA FABIOLA",
    "70 CASTILLO GOMEZ ANTONY FABRICIO", "71 CASTILLO PEREZ RICARDO", "86 CASTRO MORENO JHONATAN ELMER",
    "53 CHARCAPE PAREDES OSCAR ENRIQUE", "34 CHAVEZ MONZON LUIS DAVID", "35 CHICLAYO GUARNIZ JULIO ALBERTO",
    "7 CHOTON CIPRIANO ERIC ALEXANDER", "178 CIPIRAN BARRIOS EDERSON MISURO", "54 CONTRERAS ULLOA ALVARO JOVANNY",
    "87 CRUZ POLO CARLOS ALBERTO", "88 CRUZADO PINEDO JUAN ANDRES", "299 DIAZ ROJAS JAVIER",
    "286 EDINSON JAIR BERNABE MEDINA", "118 ESPINALES MANOSALVA ROBERTO CARLOS", "72 ESPINOZA MORENO FREDDY GONZALO",
    "8 FERNANDEZ DIAZ MARCOS ENRIQUE", "73 FLORES GARCIA ROSARIO ELIAS", "36 FLORES VASQUEZ VICTOR RICARDO",
    "37 FLORIANO MENDOZA YONN MELER", "89 GAMBOA ANGASPILCO CESAR IVAN", "119 GARCIA DE LA CRUZ OSCAR ENRIQUE",
    "315 GILMER REMIGIO JACINTO", "9 GONZALES GARCIA JOSBER EDWIN", "109 GONZALES RODRIGUEZ PIERO",
    "62 GRADOS JARA CARLOS ALBERTO", "185 GUAILUPO ALVA CARLOS ALBERTO", "55 GUTIERREZ REYES RODOLFO",
    "38 HERNANDEZ PINEDO PAUL HENRY", "112 HERNANDEZ TICLEA ANGEL GIOVANY", "297 HINOSTROZA PLASENCIA MARTIN",
    "90 HURTADO PAREDES SANTOS CLEMENTE", "91 HURTADO RODRIGUEZ HENRY ENRIQUE", "110 JAIME LAIZA CRISPIN",
    "320 JORGE MIGUEL SEGURA AGURTO", "321 JUAN CARLOS  ARAMBULO TUCTO", "164 LAYZA FALLA ABNER ABEL",
    "56 LAYZA JAIME ELMO JOEL", "57 LECCA SANDOVAL CESAR AUGUSTO", "11 LEON SILVA FERNANDO", "12 LIZARZABURU LOZANO JUAN RICARDO", "92 LUCIANO VARAS RAFAEL DURAN",
    "76 MANNUCCI FASABI ROSA ESTHER YOLANDA", "322 MARCOS MIULER MERCEDES DIESTRA", "39 MARTINEZ BECERRA ZAIDA MARGOT",
    "58 MEDINA SALINAS LEONCIO JOSE GABRIEL", "13 MENDOZA DE LA CRUZ HORACIO ESTEBAN", "93 MENDOZA MARTINEZ JOSE CARLOS",
    "77 MENDOZA NACARINO ALEXANDER JUNIOR", "78 MERINO VARGAS JESICA ELISABETH", "40 MIRANDA CHAVEZ JHUDY JHANNET",
    "120 MONDRAGON LOPEZ ROGER", "183 MONTES VALLES RAQUEL", "301 MONZON POZO ANDERSON ALEJANDRO",
    "94 MORAN ROJAS MARIO EDHITSON", "79 MORENO CRUZ MAGGALY", "15 NEGREIROS VALDERRAMA WILFREDO OCTVIO",
    "16 ORBEGOSO DE LA CRUZ MARIA MARIBEL", "17 ORTIZ CHERREZ JESUS DE LOS MILAGROS", "18 ORTIZ REYNA HUIMAN HEBELIO",
    "59 PAOLI MIRANDA CARLOS GABRIEL", "42 PAREDES BURGOS SANTOS GLORIA", "121 PAREDES TOLEDO JOHAN MAX",
    "96 PARIMANGO ROJAS MIGUEL GIOVANNI", "97 PLASENCIA BERMUDEZ ANTHONY JOEL", "60 POLO GALLARDO HUBERT ALFREDO",
    "43 POZO SILVA YANE MARIELA", "117 PRINCIPE ROJAS VICTOR", "44 QUEZADA GARCIA ROCIO YOVANNA",
    "45 QUIROZ AGUIRRE CAROLAYNE JACKELYNE", "122 RISCO CHAVEZ JOSUE ISAI", "294 RISCO PEÑA ELI JHONATAN",
    "174 ROBLES SANCHEZ DIANA ALEIDA", "63 RODRIGUEZ ALVA JEAN CARLO", "99 RODRIGUEZ CRUZADO JHEAR JHONATAN",
    "19 RODRIGUEZ CUEVA CESAR CARLOS", "46 ROMERO QUIROZ LUIS LEONARDO", "20 ROMERO REYNA LEYSER OSMAN",
    "21 RUBIO GERONIMO MARCO FAVIO", "285 RUFASTO DIAZ  YURI PAVEL", "80 RUIZ GONZALES DIEGO FERNANDO",
    "61 RUIZ ROJAS WILMER EDWARD", "162 SALAVERRY NEIRA DANIEL", "47 SALAZAR VALDIVIA LUIS ALBERTO",
    "22 SANCHEZ CHAFLOQUE ALEXANDER JHONATAN", "123 SANCHEZ ESQUIVEL EVER MILCIADES", "300 SANCHEZ VASQUEZ JUNIOR EDUARDO",
    "101 SEGURA AGURTO ROBERTO RICARDO", "181 SIAPO RODRIGUEZ  JUNIOR ALEXIS", "160 SILVESTRE OTINIANO CESAR",
    "103 SOLANO CALDERON JAIME RAUL", "319 STECK JACKSON AQUINO AGUIRRE", "104 SULUCO CARREÑO ANTONY YOEL",
    "163 TISNADO JAIME ROSAS VICO", "106 TUCTO JULCA JORGE ROLANDO", "25 TUFINIO LOPEZ WILDER ELI",
    "26 VASQUEZ FERNANDEZ JUAN CARLOS", "82 VASQUEZ SALAS ANA CECILIA", "27 VEGA QUISPE EDWARD WILLIAM",
    "83 VILLACORTA ROBLES KEVIN ALONSO", "29 VILLACORTA RODRIGUEZ WALDIR", "107 YBAÑEZ ROJAS LUIS ALEXANDER",
    "48 ZUMAETA BORDOY JUDY DEL CARMEN", "506 CONTRERAS SANTA CRUZ MARCO NOE", "488 MONTES VALLES NAZIA", "487 ORTIZA BAZAN ANDERSON", "486 TERRONES BARRIOS TATIANA JUDITH", "426 AGUILAR MENDOZA JEYSON ABIMAEL"
];

// 1. FUNCIÓN PARA CREAR EL DATALIST (Solo una vez)
function setupDatalist() {
    // Si ya existe, no lo creamos de nuevo
    if (document.getElementById('listaEmpleados')) return;

    const datalist = document.createElement('datalist');
    datalist.id = 'listaEmpleados';
    
    let options = '';
    EMPLEADOS_DB.forEach(emp => {
        // En el datalist, el value es lo que se busca y selecciona
        options += `<option value="${emp}">`; 
    });
    
    datalist.innerHTML = options;
    document.body.appendChild(datalist); // Lo agregamos al final del body invisiblemente
}

// 2. FUNCIÓN ANALIZAR (ACTUALIZADA CON INPUT BUSCABLE)
function analizarCargas() {
    setupDatalist();

    const fileInput = document.getElementById('archivoCarga');
    const fCalendario = document.getElementById('fechaCalendario');
    const fEjecucion = document.getElementById('fechaEjecucion');
    const grid = document.getElementById('loadsGrid');
    const area = document.getElementById('areaAsignacion');

    if (!fileInput.files.length || !fCalendario.value || !fEjecucion.value) {
        alert("Por favor, complete todos los campos (Archivo y ambas Fechas).");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Leer como matriz para procesar fila por fila
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (rawData.length === 0) return;

        // --- BUSCAR COLUMNAS CLAVE ---
        let colCargard = -1;
        let colFciclo = -1;
        let headerRow = -1;

        // Buscamos en las primeras 10 filas
        for (let r = 0; r < Math.min(rawData.length, 10); r++) {
            const row = rawData[r];
            for (let c = 0; c < row.length; c++) {
                const valor = String(row[c]).toLowerCase().trim();
                if (valor === 'cargard') colCargard = c;
                if (valor === 'fciclo') colFciclo = c;
            }
            if (colCargard !== -1) { headerRow = r; break; }
        }

        if (colCargard === -1) {
            alert("No se encontró la columna 'cargard'.");
            return;
        }

        // --- LÓGICA DE RE-CÁLCULO (SIMULANDO AL BACKEND) ---
        const limite = 528;
        const cargasSimuladas = new Set();
        
        // Agrupar filas por ciclo (fciclo) para calcular los nuevos IDs de carga
        const filasPorCiclo = {};
        for (let i = headerRow + 1; i < rawData.length; i++) {
            const row = rawData[i];
            const ciclo = colFciclo !== -1 ? String(row[colFciclo]).trim() : "unico";
            if (!filasPorCiclo[ciclo]) filasPorCiclo[ciclo] = [];
            filasPorCiclo[ciclo].push(row[colCargard]);
        }

        // Calcular qué números de carga resultarán después de la partición
        Object.keys(filasPorCiclo).forEach(ciclo => {
            const filas = filasPorCiclo[ciclo];
            if (filas.length === 0) return;

            // Tomamos el primer ID de carga del ciclo como base
            const cargaBase = parseInt(filas[0]) || 0;

            filas.forEach((_, index) => {
                const nuevaCarga = cargaBase + Math.floor(index / limite);
                cargasSimuladas.add(nuevaCarga.toString());
            });
        });

        // --- GENERAR UI ---
        grid.innerHTML = ''; 
        const sortedCargas = Array.from(cargasSimuladas).sort((a, b) => a - b);

        sortedCargas.forEach(carga => {
            const card = document.createElement('div');
            card.className = 'load-card';
            card.innerHTML = `
                <span class="load-title">Carga n° ${carga}</span>
                <input type="text" class="operario-input" name="carga_${carga}" 
                       list="listaEmpleados" placeholder="Asignar operario..." autocomplete="off">
            `;
            grid.appendChild(card);
        });

        area.style.display = 'block';
    };
}

// 3. FUNCIÓN GENERAR FINAL (ACTUALIZADA PARA EXTRAER EL ID)
async function generarAsignacionFinal() {
    const inputs = document.querySelectorAll('.operario-input');
    const mapping = {};
    let faltantes = 0;

    inputs.forEach(inp => {
        const cargaName = inp.name.replace('carga_', '');
        const val = inp.value; // Ejemplo: "3 ACOSTA..."

        if (val) {
            // EXTRAER SOLO EL CÓDIGO (Números al inicio)
            // Si el valor es "3 ACOSTA...", extraemos "3"
            const match = val.match(/^(\d+)/);
            if (match) {
                mapping[cargaName] = match[1]; // Guardamos solo el ID
            } else {
                mapping[cargaName] = val; // Si no hay número, guardamos todo
            }
        } else {
            faltantes++;
        }
    });

    if (faltantes > 0) {
        if (!confirm(`Hay ${faltantes} cargas sin operario asignado. ¿Desea continuar?`)) return;
    }

    const formData = new FormData();
    formData.append('archivo', document.getElementById('archivoCarga').files[0]);
    // ENVIAMOS LAS DOS FECHAS
    formData.append('fecha_calendario', document.getElementById('fechaCalendario').value);
    formData.append('fecha_ejecucion', document.getElementById('fechaEjecucion').value);
    formData.append('mapping', JSON.stringify(mapping));

    try {
        const btn = document.querySelector('#areaAsignacion button');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "PROCESANDO...";

        const response = await fetch('/procesar_asignacion', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Error en el servidor");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Asignacion_Cargas.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();

        btn.disabled = false;
        btn.innerText = originalText;

    } catch (error) {
        alert("Error: " + error.message);
        const btn = document.querySelector('#areaAsignacion button');
        btn.disabled = false;
        btn.innerText = "📥 GENERAR ASIGNACIÓN";
    }
}


/////// GESTIÓN DE EMPLEADOS ///////
document.addEventListener('DOMContentLoaded', function() {
    
    // Variables globales para la paginación
    let empleadosData = []; // Guardará todos los datos originales
    let empleadosFiltrados = []; // Guardará los datos después de buscar
    let paginaActual = 1;
    const registrosPorPagina = 10; // <--- Cambia esto si quieres más registros por página

    const tbody = document.getElementById('tbody-empleados');
    const infoPaginacion = document.getElementById('info-paginacion');
    const controlesPaginacion = document.getElementById('controles-paginacion');

    // 1. FUNCIÓN PARA CARGAR LOS EMPLEADOS DESDE LA API
    function cargarListaEmpleados() {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Cargando empleados...</td></tr>';

        fetch('/api/empleados/listar')
            .then(response => response.json())
            .then(data => {
                empleadosData = data;
                empleadosFiltrados = data; // Al inicio, los filtrados son todos
                renderizarTabla();
            })
            .catch(error => {
                console.error("Error al cargar:", error);
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red; padding: 20px;">Error al cargar los datos.</td></tr>';
            });
    }

    // 2. FUNCIÓN PARA DIBUJAR LA TABLA SEGÚN LA PÁGINA
    function renderizarTabla() {
        tbody.innerHTML = '';

        // Calcular índices para cortar el arreglo
        const inicio = (paginaActual - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const datosPagina = empleadosFiltrados.slice(inicio, fin);

        if (datosPagina.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No se encontraron registros.</td></tr>';
        } else {
            // Iteramos solo los datos de la página actual
            datosPagina.forEach(emp => {
                const rowClass = emp.estado !== 'ACTIVO' ? 'row-inactive' : '';
                const badgeClass = emp.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger';
                
                const tr = document.createElement('tr');
                if(rowClass) tr.className = rowClass;
                
                tr.innerHTML = `
                    <td class="col-checkbox"><input type="checkbox" class="check-item" value="${emp.id}"></td>
                    <td class="fw-bold">${emp.dni || '-'}</td>
                    <td><div class="user-name">${emp.apellidos_nombres || '-'}</div></td>
                    <td>${emp.area || '-'}</td>
                    <td class="text-muted">${emp.cargo || '-'}</td>
                    <td><span class="badge ${badgeClass}">${emp.estado || 'DESCONOCIDO'}</span></td>
                    <td class="col-actions">
                        <button class="action-btn view-btn" data-id="${emp.id}" title="Ver Detalles">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>

                        <button class="action-btn edit-btn" data-id="${emp.id}" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="action-btn delete-btn" data-id="${emp.id}" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        actualizarPaginacion();
    }

    // 3. FUNCIÓN PARA DIBUJAR LOS BOTONES DE PAGINACIÓN (Estilo: Anterior | pag. X de Y | Siguiente)
    function actualizarPaginacion() {
        const totalRegistros = empleadosFiltrados.length;
        // Si no hay registros, asumimos al menos 1 página vacía para que no diga "pag. 1 de 0"
        const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina)); 
        
        // Texto informativo de la izquierda (Opcional, lo mantenemos por si te gusta)
        const inicioInfo = totalRegistros === 0 ? 0 : ((paginaActual - 1) * registrosPorPagina) + 1;
        const finInfo = Math.min(paginaActual * registrosPorPagina, totalRegistros);
        infoPaginacion.textContent = `Mostrando ${inicioInfo} a ${finInfo} de ${totalRegistros} registros`;

        // Limpiar controles de la derecha
        controlesPaginacion.innerHTML = '';

        // Botón "Anterior"
        const btnPrev = document.createElement('button');
        btnPrev.className = 'page-btn';
        btnPrev.textContent = 'Anterior';
        btnPrev.disabled = paginaActual === 1 || totalRegistros === 0;
        btnPrev.onclick = () => { 
            if (paginaActual > 1) {
                paginaActual--; 
                renderizarTabla(); 
            }
        };
        controlesPaginacion.appendChild(btnPrev);

        // Texto "pag. X de Y"
        const textPage = document.createElement('span');
        textPage.style.padding = '6px 12px';
        textPage.style.fontSize = '13px';
        textPage.style.color = '#475569';
        textPage.style.fontWeight = '500';
        textPage.textContent = `pag. ${paginaActual} de ${totalPaginas}`;
        controlesPaginacion.appendChild(textPage);

        // Botón "Siguiente"
        const btnNext = document.createElement('button');
        btnNext.className = 'page-btn';
        btnNext.textContent = 'Siguiente';
        btnNext.disabled = paginaActual >= totalPaginas || totalRegistros === 0;
        btnNext.onclick = () => { 
            if (paginaActual < totalPaginas) {
                paginaActual++; 
                renderizarTabla(); 
            }
        };
        controlesPaginacion.appendChild(btnNext);
    }

    // 4. BÚSQUEDA EN TIEMPO REAL RE-ADAPTADA
    const searchInput = document.getElementById('buscar-empleado');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Filtramos el arreglo original directamente
            empleadosFiltrados = empleadosData.filter(emp => {
                const filaTexto = `${emp.dni} ${emp.apellidos_nombres} ${emp.area} ${emp.cargo} ${emp.estado}`.toLowerCase();
                return filaTexto.includes(searchTerm);
            });
            
            // Regresamos a la página 1 cuando se busca algo nuevo
            paginaActual = 1;
            renderizarTabla();
        });
    }

    // 5. ESCUCHA DE ACCIONES EN LA TABLA (Ver, Editar, Eliminar)
    tbody.addEventListener('click', function(e) {
        // 5a. Lógica para VER PERFIL
        const btnVer = e.target.closest('.view-btn');
        if (btnVer) {
            const idEmpleado = btnVer.getAttribute('data-id');
            abrirPerfil(idEmpleado);
        }

        // 5b. Lógica para ELIMINAR (CESAR) <--- INSERTA ESTO AQUÍ
        const btnEliminar = e.target.closest('.delete-btn');
        if (btnEliminar) {
            const idEmpleado = btnEliminar.getAttribute('data-id');
            
            // Usamos una confirmación simple del navegador
            if (confirm('¿Estás seguro de que deseas cambiar el estado de este empleado a CESADO?')) {
                
                fetch(`/empleado/cesar/${idEmpleado}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Empleado cesado correctamente.');
                        cargarListaEmpleados(); // Recarga los datos de la API para actualizar la tabla
                    } else {
                        alert('Error al procesar: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert('Ocurrió un error en la comunicación con el servidor.');
                });
            }
        }
    });

    // Función que divide la pantalla y llena los datos
    function abrirPerfil(id_empleado) {
        const tabla = document.getElementById('columna-tabla');
        const perfil = document.getElementById('columna-perfil');
        
        // Animamos la vista (encogemos tabla y mostramos perfil)
        tabla.classList.add('comprimida');
        perfil.classList.add('abierto');
        
        // Buscamos al empleado en tu arreglo de datos que ya está cargado en memoria
        const emp = empleadosFiltrados.find(e => e.id == id_empleado);
        
        if(emp) {
            // Llenamos los datos en el HTML
            document.getElementById('perfil-nombre').textContent = emp.apellidos_nombres || 'Sin Nombre';
            document.getElementById('perfil-cargo').textContent = emp.cargo || 'Sin Cargo asignado';
            document.getElementById('perfil-dni').textContent = emp.dni || '-';
            document.getElementById('perfil-area').textContent = emp.area || '-';
            
            document.getElementById('perfil-ingreso').textContent = emp.fecha_ingreso || '-';
            document.getElementById('perfil-cese').textContent = emp.fecha_cese || '-';
            document.getElementById('perfil-fecha-nac').textContent = emp.fecha_nacimiento || '-';
            document.getElementById('perfil-sueldo').textContent = emp.sueldo_basico || '0.00';
            document.getElementById('perfil-banco').textContent = emp.banco || '-';
            document.getElementById('perfil-cuenta').textContent = emp.numero_cuenta || '-';
            document.getElementById('perfil-cci').textContent = emp.cci || '-';
            
            // Horarios
            document.getElementById('perfil-hora-ingreso').textContent = emp.hora_ingreso || '-';
            document.getElementById('perfil-hora-salida').textContent = emp.hora_salida || '-';
            
            // Actualizar el estado y sus colores
            const badgeEstado = document.getElementById('perfil-estado');
            badgeEstado.textContent = emp.estado || 'DESCONOCIDO';
            badgeEstado.className = 'badge ' + (emp.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger');
            
            // Actualizar la foto
            const imgFoto = document.getElementById('perfil-foto');
            imgFoto.src = emp.foto_url ? emp.foto_url : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }
    }

    // Exponemos la función cerrarPerfil a "window" para que el botón HTML la pueda ejecutar
    window.cerrarPerfil = function() {
        const tabla = document.getElementById('columna-tabla');
        const perfil = document.getElementById('columna-perfil');
        
        tabla.classList.remove('comprimida');
        perfil.classList.remove('abierto');
    };

    // 6. LÓGICA PARA EL MODAL DE REPORTES (ACTUALIZADO CON FECHAS)
    const modal = document.getElementById('modal-reportes');
    const btnReporte = document.getElementById('btn-generar-reporte');

    if (btnReporte) {
        btnReporte.onclick = function() {
            modal.style.display = "flex";
            cargarEmpleadosSelect();

            document.getElementById('tipo-dashboard').value = 'todos';
            document.getElementById('tipo-dashboard').dispatchEvent(new Event('change'));
            
            // AUTOCOMPLETAR FECHAS: 1er y último día del mes actual
            const inputInicio = document.getElementById('fecha-inicio');
            const inputFin = document.getElementById('fecha-fin');
            
            if (!inputInicio.value || !inputFin.value) {
                const hoy = new Date();
                // Formato YYYY-MM-DD
                const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
                const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];
                
                inputInicio.value = primerDia;
                inputFin.value = ultimoDia;
            }

            // Dibuja Áreas y Estados
            inicializarGraficos();
            
            // Dibuja Asistencias automáticamente con las fechas por defecto
            if(window.actualizarReportesPorFecha) {
                window.actualizarReportesPorFecha();
            }
        }
    }

    // Función global para cerrar el modal
    window.cerrarModalReportes = function() {
        modal.style.display = "none";
    };

    // Cerrar si hacen clic fuera del fondo oscuro
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // 7. FUNCIÓN PARA PROCESAR DATOS Y CREAR GRÁFICOS (Áreas y Estados)
    function inicializarGraficos() {
        if (empleadosData.length === 0) return;

        const conteoAreas = {};
        const conteoEstados = { 'ACTIVO': 0, 'CESADO': 0 };

        empleadosData.forEach(emp => {
            const area = emp.area || 'Sin Área';
            conteoAreas[area] = (conteoAreas[area] || 0) + 1;
            
            const estado = emp.estado || 'DESCONOCIDO';
            if (conteoEstados.hasOwnProperty(estado)) {
                conteoEstados[estado]++;
            }
        });

        const ctxAreas = document.getElementById('chartAreas').getContext('2d');
        if (window.myChart1) window.myChart1.destroy();
        window.myChart1 = new Chart(ctxAreas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoAreas),
                datasets: [{
                    data: Object.values(conteoAreas),
                    backgroundColor: ['#0f172a', '#1e3a8a', '#3b82f6', '#94a3b8', '#cbd5e1']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctxEstados = document.getElementById('chartEstados').getContext('2d');
        if (window.myChart2) window.myChart2.destroy();
        window.myChart2 = new Chart(ctxEstados, {
            type: 'bar',
            data: {
                labels: ['Activos', 'Cesados'],
                datasets: [{
                    label: 'Personal',
                    data: [conteoEstados['ACTIVO'], conteoEstados['CESADO']],
                    backgroundColor: ['#10b981', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    // 8. LÓGICA PARA EL GRÁFICO DE ASISTENCIAS Y GERENCIALES CON FILTRO DE FECHAS
    window.actualizarReportesPorFecha = function() {
        const fInicio = document.getElementById('fecha-inicio').value;
        const fFin = document.getElementById('fecha-fin').value;
        const tipo = document.getElementById('tipo-dashboard').value; // Leemos el tipo seleccionado
        const empleado = document.getElementById('select-empleado').value;

        if (!fInicio || !fFin) {
            alert("Por favor selecciona ambos rangos de fecha.");
            return;
        }

        // =========================================================
        // A. LÓGICA DE VISIBILIDAD (Solo ocurre al hacer clic)
        // =========================================================
        const contAreas = document.getElementById('container-areas');
        const contEstados = document.getElementById('container-estados');
        const contAsistencias = document.getElementById('container-asistencias');
        const contIncidencias = document.getElementById('container-incidencias');
        const contGastos = document.getElementById('container-gastos');

        // Ocultamos todos por defecto
        contAreas.style.display = 'none';
        contEstados.style.display = 'none';
        contAsistencias.style.display = 'none';
        contIncidencias.style.display = 'none';
        contGastos.style.display = 'none';

        // Mostramos según selección
        if (tipo === 'todos') {
            contAreas.style.display = 'block';
            contEstados.style.display = 'block';
            contAsistencias.style.display = 'block';
            contIncidencias.style.display = 'block';
            contGastos.style.display = 'block';
        } else if (tipo === 'operativo') {
            contAreas.style.display = 'block';
            contEstados.style.display = 'block';
        } else if (tipo === 'asistencias') {
            contAsistencias.style.display = 'block';
        } else if (tipo === 'gerencial') {
            contIncidencias.style.display = 'block';
            contGastos.style.display = 'block';
        }

        // =========================================================
        // B. ACTUALIZACIÓN DE DATOS (Las gráficas ocultas igual se actualizan en memoria)
        // =========================================================
        
        // 1. Llamamos a la API para el Gráfico de Asistencias
        fetch(`/api/reportes/asistencia?inicio=${fInicio}&fin=${fFin}&empleado=${empleado}`)
            .then(res => res.json())
            .then(data => {
                renderizarGraficoAsistencia(data);
            })
            .catch(err => {
                console.error("Error obteniendo asistencias:", err);
                renderizarGraficoAsistencia({ A: 180, F: 12, DM: 4, LSG: 2 }); 
            });

        // 2. Llamamos a las gráficas gerenciales
        cargarGraficasGerenciales(fInicio, fFin, empleado);
    };

    function renderizarGraficoAsistencia(data) {
        const ctx = document.getElementById('chartAsistencias').getContext('2d');
        
        if (window.myChartAsistencia) window.myChartAsistencia.destroy();

        window.myChartAsistencia = new Chart(ctx, {
            type: 'bar',
            data: {
                // Ponemos todas las descripciones de tu tabla como etiquetas
                labels: [
                    'Día Asistido (A)', 'Dom. Trabajado (DT)', 'Fer. Trabajado (FT)', 
                    'Lic. con Goce (LG)', 'Descanso Médico (DM)', 'Vacaciones (V)', 
                    'Lic. sin Goce (LSG)', 'Falta (F)', 'Renunció (R)', 
                    'Susp. Perfecta (SU)', 'Cese (CE)', 'Feriado Ganado (FG)', 
                    'Lic. Defunción (LD)', 'Día Compensado (DC)', 'Asist. Proyectada (AP)', 
                    'Lic. Paternidad (LP)', 'Térm. Contrato (TC)'
                ],
                datasets: [{
                    label: 'Total de Registros',
                    // Mapeamos exactamente las 17 claves que envía Python
                    data: [
                        data.A || 0, data.DT || 0, data.FT || 0, data.LG || 0, 
                        data.DM || 0, data.V || 0, data.LSG || 0, data.F || 0, 
                        data.R || 0, data.SU || 0, data.CE || 0, data.FG || 0, 
                        data.LD || 0, data.DC || 0, data.AP || 0, data.LP || 0, 
                        data.TC || 0
                    ],
                    // Añadimos una paleta de 17 colores para diferenciar las barras
                    backgroundColor: [
                        '#10b981', '#059669', '#047857', '#3b82f6', 
                        '#f59e0b', '#8b5cf6', '#6366f1', '#ef4444', 
                        '#b91c1c', '#7f1d1d', '#111827', '#14b8a6', 
                        '#6b7280', '#0ea5e9', '#84cc16', '#d946ef', 
                        '#4b5563'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Récord General de Eventos (Periodo Seleccionado)' },
                    legend: { display: false } // Ocultamos la leyenda para no saturar la vista con 17 items
                },
                scales: {
                    x: {
                        ticks: {
                            font: { size: 10 },
                            maxRotation: 45, // Inclinamos el texto para que quepan las 17 etiquetas
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    async function cargarGraficasGerenciales(inicio, fin, empleado) {
    try {
        const response = await fetch(`/api/reportes/gastos_incidencias?inicio=${inicio}&fin=${fin}&empleado=${empleado}`);
        const data = await response.json();
    
            // ----------------------------------------------------
            // A. LLENAR TABLAS DE RANKING (NUEVO)
            // ----------------------------------------------------
            const tbodyGastos = document.getElementById('listado-gastos');
            if (tbodyGastos && data.ranking_gastos) {
                tbodyGastos.innerHTML = '';
                data.ranking_gastos.slice(0, 10).forEach(emp => {
                    tbodyGastos.innerHTML += `
                        <tr>
                            <td style="text-align: left; font-weight: 500;">${emp.nombre}</td>
                            <td style="text-align: left;">${emp.area}</td> <td style="text-align: right;">S/ ${parseFloat(emp.pasajes).toFixed(2)}</td>
                            <td style="text-align: right; font-weight: bold;">S/ ${parseFloat(emp.viaticos).toFixed(2)}</td>
                        </tr>
                    `;
                });
            }

            const tbodyIncidencias = document.getElementById('listado-incidencias');
            if (tbodyIncidencias && data.ranking_incidencias) {
                tbodyIncidencias.innerHTML = '';
                data.ranking_incidencias.slice(0, 10).forEach(emp => {
                    tbodyIncidencias.innerHTML += `
                        <tr>
                            <td style="text-align: left;">${emp.nombre}</td>
                            <td style="text-align: left;">${emp.area}</td> <td style="text-align: center;"><span class="ranking-badge" style="background: #ffebee; color: #c62828;">${emp.faltas}</span></td>
                            <td style="text-align: center;"><span class="ranking-badge" style="background: #fff3e0; color: #ef6c00;">${emp.dm}</span></td>
                        </tr>
                    `;
                });
            }

            

        // ----------------------------------------------------
        // B. GRÁFICA DE INCIDENCIAS POR DÍA (Faltas y DM)
        // ----------------------------------------------------
        const ctxIncidencias = document.getElementById('chartIncidencias').getContext('2d');
        if (window.myChartIncidencias) window.myChartIncidencias.destroy();

        window.myChartIncidencias = new Chart(ctxIncidencias, {
            type: 'bar',
            data: {
                labels: Object.keys(data.incidencias), // ['Lunes', 'Martes'...]
                datasets: [{
                    label: 'Cantidad de Inasistencias (Faltas/DM)',
                    data: Object.values(data.incidencias),
                    // Usamos colores cálidos (rojo/naranja) para simular el "calor" de la incidencia
                    backgroundColor: 'rgba(239, 68, 68, 0.8)', 
                    borderColor: 'rgba(220, 38, 38, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Frecuencia de Incidencias por Día (Mapa de Faltas)' }
                }
            }
        });

        // ----------------------------------------------------
        // C. PROYECCIÓN DE GASTOS (Viáticos y Pasajes)
        // ----------------------------------------------------
        const ctxGastos = document.getElementById('chartGastos').getContext('2d');
        if (window.myChartGastos) window.myChartGastos.destroy();

        window.myChartGastos = new Chart(ctxGastos, {
            type: 'bar',
            data: {
                labels: data.gastos.areas,
                datasets: [
                    {
                        label: 'Viáticos (S/)',
                        data: data.gastos.viaticos,
                        backgroundColor: '#3b82f6', // Azul
                        borderRadius: 4
                    },
                    {
                        label: 'Pasajes (S/)',
                        data: data.gastos.pasajes,
                        backgroundColor: '#10b981', // Verde esmeralda
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Proyección de Gastos Operativos por Área' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': S/ ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: { stacked: true }, // Apila los pasajes encima de los viáticos
                    y: { stacked: true }
                }
            }
        });

    } catch (error) {
        console.error('Error cargando gráficas gerenciales:', error);
    }
}

// =================================================================
    // NUEVO: LÓGICA PARA OCULTAR/MOSTRAR GRÁFICAS SEGÚN EL SELECTOR
    // =================================================================
    const selectorDashboard = document.getElementById('tipo-dashboard');
    
    if (selectorDashboard) {
        selectorDashboard.addEventListener('change', function() {
            const tipo = this.value; // 'todos', 'asistencias', 'operativo', 'gerencial'
            
            // Referencias a los contenedores
            const contAreas = document.getElementById('container-areas');
            const contEstados = document.getElementById('container-estados');
            const contAsistencias = document.getElementById('container-asistencias');
            const contIncidencias = document.getElementById('container-incidencias');
            const contGastos = document.getElementById('container-gastos');
            const contRankingIncidencias = document.getElementById('container-ranking-incidencias');
            const contRankingGastos = document.getElementById('container-ranking-gastos');

            // 1. Ocultamos todos por defecto
            contAreas.style.display = 'none';
            contEstados.style.display = 'none';
            contAsistencias.style.display = 'none';
            contIncidencias.style.display = 'none';
            contGastos.style.display = 'none';
            if(contRankingIncidencias) contRankingIncidencias.style.display = 'none';
            if(contRankingGastos) contRankingGastos.style.display = 'none';

            // 2. Mostramos los correspondientes según el tipo seleccionado
            if (tipo === 'todos') {
                contAreas.style.display = 'block';
                contEstados.style.display = 'block';
                contAsistencias.style.display = 'block';
                contIncidencias.style.display = 'block';
                contGastos.style.display = 'block';
                if(contRankingIncidencias) contRankingIncidencias.style.display = 'block';
                if(contRankingGastos) contRankingGastos.style.display = 'block';
            } 
            else if (tipo === 'operativo') {
                contAreas.style.display = 'block';
                contEstados.style.display = 'block';
            } 
            else if (tipo === 'asistencias') {
                contAsistencias.style.display = 'block';
            } 
            else if (tipo === 'gerencial') {
                contIncidencias.style.display = 'block';
                contGastos.style.display = 'block';
                if(contRankingIncidencias) contRankingIncidencias.style.display = 'block';
                if(contRankingGastos) contRankingGastos.style.display = 'block'
            }
        });
    }

    let selectEmpleadoInstance = null;

    // ===============================
    // CARGAR EMPLEADOS AL SELECT
    // ===============================
    function cargarEmpleadosSelect() {

        fetch('/api/empleados/select')
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener empleados');
                return response.json();
            })
            .then(data => {

                const select = document.getElementById('select-empleado');

                // Limpiar por si se vuelve a abrir el modal
                select.innerHTML = '<option value="">Todos</option>';

                data.forEach(emp => {
                    const option = document.createElement('option');
                    option.value = emp.id;
                    option.textContent = `${emp.nombre} (${emp.dni})`;
                    select.appendChild(option);
                });

                // Destruir si ya existe (evita duplicados)
                if (selectEmpleadoInstance) {
                    selectEmpleadoInstance.destroy();
                }

                // Inicializar TomSelect
                selectEmpleadoInstance = new TomSelect('#select-empleado', {
                    create: false,
                    sortField: {
                        field: "text",
                        direction: "asc"
                    },
                    placeholder: "Buscar empleado..."
                });

            })
            .catch(error => {
                console.error('Error cargando empleados:', error);
            });
    }

    // INICIAR
    cargarListaEmpleados();
});

// Función para Exportar a EXCEL Profesional
function exportarExcel() {
    const inicio = document.getElementById('fecha-inicio').value;
    const fin = document.getElementById('fecha-fin').value;
    const tipo = document.getElementById('tipo-dashboard').value;
    const empleado = document.getElementById('select-empleado').value;

    if (!inicio || !fin) return alert("Seleccione fechas");

    window.location.href = `/api/exportar/excel?inicio=${inicio}&fin=${fin}&tipo=${tipo}&empleado=${empleado}`;
}

// Función para Exportar a PDF tipo Informe
function exportarPDF() {
    const inicio = document.getElementById('fecha-inicio').value;
    const fin = document.getElementById('fecha-fin').value;
    const tipo = document.getElementById('tipo-dashboard').value;

    if (!inicio || !fin) return alert("Seleccione fechas");

    window.location.href = `/api/exportar/pdf?inicio=${inicio}&fin=${fin}&tipo=${tipo}`;
}

// ==========================================
// LÓGICA DE LA VISTA DIVIDIDA (PERFIL)
// ==========================================
function abrirPerfil(id_empleado) {
        const tabla = document.getElementById('columna-tabla');
        const perfil = document.getElementById('columna-perfil');
        
        tabla.classList.add('comprimida');
        perfil.classList.add('abierto');
        
        const emp = empleadosFiltrados.find(e => e.id == id_empleado);
        
        if(emp) {
            // -- Cabecera --
            document.getElementById('perfil-nombre').textContent = emp.apellidos_nombres || 'Sin Nombre';
            document.getElementById('perfil-cargo').textContent = emp.cargo || 'Sin Cargo';
            
            const badgeEstado = document.getElementById('perfil-estado');
            badgeEstado.textContent = emp.estado || 'DESCONOCIDO';
            badgeEstado.className = 'badge ' + (emp.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger');
            
            document.getElementById('perfil-foto').src = emp.foto_url ? emp.foto_url : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

            // -- Datos Personales --
            document.getElementById('p-dni').textContent = emp.dni || '-';
            document.getElementById('p-fnac').textContent = emp.fecha_nac || '-';
            document.getElementById('p-sexo').textContent = emp.sexo || '-';
            document.getElementById('p-ecivil').textContent = emp.estado_civil || '-';
            document.getElementById('p-tel').textContent = emp.telefono || '-';
            document.getElementById('p-correo').textContent = emp.correo || '-';
            document.getElementById('p-dir').textContent = emp.direccion || '-';

            // -- Datos Laborales --
            document.getElementById('p-area').textContent = emp.area || '-';
            document.getElementById('p-contrato').textContent = emp.tipo_contrato || '-';
            document.getElementById('p-regimen').textContent = emp.regimen || '-';
            document.getElementById('p-jornada').textContent = emp.jornada || '-';
            document.getElementById('p-fingreso').textContent = emp.fecha_ingreso || '-';
            document.getElementById('p-fcese').textContent = emp.fecha_cese || '-';
            
            document.getElementById('p-hingreso').textContent = emp.hora_ingreso || '-';
            document.getElementById('p-hsalida').textContent = emp.hora_salida || '-';
            document.getElementById('p-href-ini').textContent = emp.ref_inicio || '-';
            document.getElementById('p-href-fin').textContent = emp.ref_fin || '-';

            // -- Remuneración --
            document.getElementById('p-sueldo').textContent = emp.sueldo ? `${emp.moneda === 'USD' ? '$' : 'S/'} ${emp.sueldo}` : '-';
            document.getElementById('p-moneda').textContent = emp.moneda || '-';
            document.getElementById('p-asigfam').textContent = emp.asig_fam || '0.00';
            document.getElementById('p-bono').textContent = emp.bono || '0.00';

            // -- Datos Bancarios --
            document.getElementById('p-banco').textContent = emp.banco || '-';
            document.getElementById('p-tipocta').textContent = emp.tipo_cuenta || '-';
            document.getElementById('p-cuenta').textContent = emp.numero_cuenta || '-';
            document.getElementById('p-cci').textContent = emp.cci || '-';
        }
    }

// Función para cerrar el panel
function cerrarPerfil() {
    const tabla = document.getElementById('columna-tabla');
    const perfil = document.getElementById('columna-perfil');
    
    tabla.classList.remove('comprimida');
    perfil.classList.remove('abierto');
}

// Escuchar los clics de la tabla de forma inteligente (Delegación de eventos)
// Asumiendo que tu <tbody> tiene un ID, si no, usa document.querySelector('tbody')
document.querySelector('tbody').addEventListener('click', function(e) {
    // Si se hace clic en el botón del ojito o su ícono SVG
    const btnVer = e.target.closest('.view-btn');
    
    if (btnVer) {
        const idEmpleado = btnVer.getAttribute('data-id');
        abrirPerfil(idEmpleado);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    
    // VARIABLE GLOBAL: Nos dice si estamos creando o editando
    let empleadoIdEnEdicion = null;

    let visorDocumentosArray = []; // Guardará los documentos actuales
    let visorIndexActual = 0;      // Saber qué documento estamos viendo

    // --- LÓGICA DEL MODAL Y PESTAÑAS ---
    const modalEmpleado = document.getElementById('modal-nuevo-empleado');
    const btnAbrirModal = document.getElementById('btn-nuevo-empleado');
    const btnCerrarModalX = document.getElementById('btn-close-modal');
    const btnCerrarModalFoot = document.getElementById('btn-cancelar-modal');
    const btnGuardarFinal = document.getElementById('btn-guardar-final');

    // Función para abrir (Creación Nueva)
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', () => {
            empleadoIdEnEdicion = null; // Modo Creación
            document.querySelector('#modal-nuevo-empleado h2').innerText = "Nuevo Empleado";
            btnGuardarFinal.innerText = "Guardar Empleado";
            
            // Ocultar y limpiar la zona de documentos al crear nuevo
            const seccionDocs = document.getElementById('seccion-documentos-actuales');
            const listaDocs = document.getElementById('lista-documentos');
            if(seccionDocs) seccionDocs.style.display = 'none';
            if(listaDocs) listaDocs.innerHTML = '';
            
            modalEmpleado.classList.add('mostrar-modal');
        });
    }

    // Funciones para cerrar
    const cerrarModal = () => {
        modalEmpleado.classList.remove('mostrar-modal');
        document.getElementById('form-empleado').reset(); 
        empleadoIdEnEdicion = null; // Reiniciamos la variable
        
        // Limpiamos la lista visual de documentos
        const seccionDocs = document.getElementById('seccion-documentos-actuales');
        const listaDocs = document.getElementById('lista-documentos');
        if(seccionDocs) seccionDocs.style.display = 'none';
        if(listaDocs) listaDocs.innerHTML = '';
    };
    
    if (btnCerrarModalX) btnCerrarModalX.addEventListener('click', cerrarModal);
    if (btnCerrarModalFoot) btnCerrarModalFoot.addEventListener('click', cerrarModal);

    // Navegación por pestañas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            const targetId = btn.getAttribute('data-target');
            btn.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- MODO EDICIÓN: CAPTURAR CLIC EN LA TABLA ---
    const tablaEmpleados = document.getElementById('tabla-empleados') || document.querySelector('table');
    if (tablaEmpleados) {
        tablaEmpleados.addEventListener('click', async (e) => {
            const btnEditar = e.target.closest('.edit-btn');
            
            if (btnEditar) {
                e.preventDefault();
                empleadoIdEnEdicion = btnEditar.getAttribute('data-id');
                
                document.querySelector('#modal-nuevo-empleado h2').innerText = "Editar Empleado";
                btnGuardarFinal.innerText = "Actualizar Cambios";
                
                try {
                    const respuesta = await fetch(`/api/empleados/${empleadoIdEnEdicion}`);
                    const datos = await respuesta.json();
                    
                    if (respuesta.ok) {
                        // Llenar campos
                        document.getElementById('emp_nombres').value = datos.nombres || "";
                        document.getElementById('emp_apellidos').value = datos.apellidos || "";
                        document.getElementById('emp_dni').value = datos.dni || "";
                        document.getElementById('emp_fecha_nac').value = datos.fecha_nacimiento || "";
                        document.getElementById('emp_sexo').value = datos.sexo || "";
                        document.getElementById('emp_estado_civil').value = datos.estado_civil || "";
                        document.getElementById('emp_direccion').value = datos.direccion || "";
                        document.getElementById('emp_telefono').value = datos.telefono || "";
                        document.getElementById('emp_correo').value = datos.correo || "";
                        
                        document.getElementById('emp_area').value = datos.area || "";
                        document.getElementById('emp_cargo').value = datos.cargo || "";
                        document.getElementById('emp_tipo_contrato').value = datos.tipo_contrato || "";
                        document.getElementById('emp_jornada').value = datos.jornada_laboral || "";
                        document.getElementById('emp_hora_ingreso').value = datos.hora_ingreso || "";
                        document.getElementById('emp_hora_salida').value = datos.hora_salida || "";
                        document.getElementById('emp_ref_inicio').value = datos.refrigerio_inicio || "";
                        document.getElementById('emp_ref_fin').value = datos.refrigerio_fin || "";
                        document.getElementById('emp_regimen').value = datos.regimen_laboral || "";
                        document.getElementById('emp_estado').value = datos.estado || "ACTIVO";
                        document.getElementById('emp_fecha_ingreso').value = datos.fecha_ingreso || "";
                        document.getElementById('emp_fecha_cese').value = datos.emp_fecha_cese || "";
                        
                        if(document.getElementById('rem_sueldo')) document.getElementById('rem_sueldo').value = datos.sueldo_basico || "";
                        if(document.getElementById('rem_moneda')) document.getElementById('rem_moneda').value = datos.moneda || "PEN";

                        // --- NUEVA LÓGICA DE DOCUMENTOS (LISTA MULTIPLE) ---
                        const seccionDocs = document.getElementById('seccion-documentos-actuales');
                        const listaDocs = document.getElementById('lista-documentos');

                        if (seccionDocs && listaDocs) {
                            listaDocs.innerHTML = '';
                            
                            if (datos.documentos && datos.documentos.length > 0) {
                                seccionDocs.style.display = 'block';
                                
                                // ¡IMPORTANTE! Guardamos el array para usarlo en el visor
                                visorDocumentosArray = datos.documentos; 
                                
                                // Agregamos el parámetro 'index' al forEach
                                datos.documentos.forEach((doc, index) => {
                                    const itemDoc = document.createElement('div');
                                    itemDoc.className = 'emp-doc-row';
                                    
                                    let iconoDoc = "📄"; 
                                    if (doc.tipo.toLowerCase().includes("foto")) iconoDoc = "🖼️";
                                    if (doc.tipo.toLowerCase().includes("dni")) iconoDoc = "🪪";

                                    // CAMBIO: La etiqueta <a> de Ver ahora es un <button> con data-index
                                    itemDoc.innerHTML = `
                                        <div class="emp-doc-left">
                                            <span class="emp-doc-icon">${iconoDoc}</span>
                                            <div class="emp-doc-texts">
                                                <span class="emp-doc-title">${doc.tipo}</span>
                                                <span class="emp-doc-date">Subido: ${doc.fecha}</span>
                                            </div>
                                        </div>
                                        <div class="emp-doc-actions">
                                            <button type="button" class="emp-doc-btn emp-btn-view btn-ver-doc" data-index="${index}" title="Ver archivo">
                                                <i class="fas fa-eye"></i> 
                                            </button>
                                            
                                            <button type="button" class="emp-doc-btn emp-btn-delete btn-borrar-doc" data-id="${doc.id_doc}" title="Eliminar">
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    `;
                                    listaDocs.appendChild(itemDoc);
                                });
                            } else {
                                seccionDocs.style.display = 'none';
                                visorDocumentosArray = []; // Vaciamos si no hay
                            }
                        }
                        
                        // Reiniciamos el select de "Nuevo Documento" para que esté en "Seleccione..."
                        if (document.getElementById('doc_tipo')) {
                            document.getElementById('doc_tipo').value = "";
                        }
                        
                        modalEmpleado.classList.add('mostrar-modal');
                    } else {
                        alert("Error al obtener datos: " + datos.error);
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error de conexión al cargar datos.");
                }
            }
        });
    }

    // --- LÓGICA DEL VISOR Y BORRADO DE DOCUMENTOS ---
    const seccionDocsActuales = document.getElementById('seccion-documentos-actuales');
    
    // Elementos del visor en el DOM
    const visorOverlay = document.getElementById('visor-documentos-overlay');
    const visorContentArea = document.getElementById('visor-content-area');
    const visorTitulo = document.getElementById('visor-titulo');
    const visorFecha = document.getElementById('visor-fecha');
    const visorContador = document.getElementById('visor-contador');
    const btnVisorPrev = document.getElementById('visor-btn-prev');
    const btnVisorNext = document.getElementById('visor-btn-next');
    const btnVisorCerrar = document.getElementById('visor-btn-cerrar');
    const btnVisorBorrar = document.getElementById('visor-btn-borrar');

    // Función para renderizar el documento actual en el visor
    const renderizarVisor = () => {
        if (visorDocumentosArray.length === 0) return;
        
        const docActual = visorDocumentosArray[visorIndexActual];
        visorTitulo.innerText = docActual.tipo;
        visorFecha.innerText = "Subido el: " + docActual.fecha;
        visorContador.innerText = `${visorIndexActual + 1} / ${visorDocumentosArray.length}`;

        // Limpiamos el area
        visorContentArea.innerHTML = '';

        // Detectar si es imagen o PDF basándonos en la ruta (URL)
        const rutaLower = docActual.ruta.toLowerCase();
        if (rutaLower.endsWith('.jpg') || rutaLower.endsWith('.jpeg') || rutaLower.endsWith('.png') || rutaLower.endsWith('.gif') || rutaLower.endsWith('.webp')) {
            visorContentArea.innerHTML = `<img src="${docActual.ruta}" alt="${docActual.tipo}">`;
        } else {
            // Si es PDF u otro, usamos iframe
            visorContentArea.innerHTML = `<iframe src="${docActual.ruta}#toolbar=0" title="${docActual.tipo}"></iframe>`;
        }

        // Controlar estado de flechas
        btnVisorPrev.disabled = visorIndexActual === 0;
        btnVisorNext.disabled = visorIndexActual === visorDocumentosArray.length - 1;
        
        // Asignar ID al botón de borrar del visor
        btnVisorBorrar.setAttribute('data-id', docActual.id_doc);
    };

    // Navegación
    if(btnVisorPrev) btnVisorPrev.addEventListener('click', () => { if (visorIndexActual > 0) { visorIndexActual--; renderizarVisor(); } });
    if(btnVisorNext) btnVisorNext.addEventListener('click', () => { if (visorIndexActual < visorDocumentosArray.length - 1) { visorIndexActual++; renderizarVisor(); } });
    
    // Cerrar visor
    const cerrarVisor = () => { visorOverlay.classList.remove('activo'); visorContentArea.innerHTML = ''; };
    if(btnVisorCerrar) btnVisorCerrar.addEventListener('click', cerrarVisor);

    // FUNCIÓN CENTRAL PARA BORRAR API (Reutilizable)
    const eliminarDocumentoAPI = async (idDoc, botonReferencia) => {
        if (!confirm("¿Estás seguro de que quieres eliminar este documento permanentemente?")) return false;
        
        botonReferencia.disabled = true;
        try {
            const respuesta = await fetch(`/api/documentos/${idDoc}`, { method: 'DELETE' });
            const data = await respuesta.json();

            if (respuesta.ok) {
                alert("¡" + data.mensaje + "!");
                return true; // Borrado exitoso
            } else {
                alert("Error: " + data.error);
                botonReferencia.disabled = false;
                return false;
            }
        } catch (error) {
            console.error("Error al borrar documento:", error);
            alert("Error de conexión al intentar eliminar.");
            botonReferencia.disabled = false;
            return false;
        }
    };

    // Delegación de eventos en la lista de documentos (Ver y Borrar)
    if (seccionDocsActuales) {
        seccionDocsActuales.addEventListener('click', async (e) => {
            // Acción: VER DOCUMENTO (Ojito)
            const btnVer = e.target.closest('.btn-ver-doc');
            if (btnVer) {
                e.preventDefault();
                visorIndexActual = parseInt(btnVer.getAttribute('data-index'));
                renderizarVisor();
                visorOverlay.classList.add('activo');
            }

            // Acción: BORRAR DESDE LA LISTA
            const btnBorrarFila = e.target.closest('.btn-borrar-doc');
            if (btnBorrarFila) {
                e.preventDefault();
                const idDoc = btnBorrarFila.getAttribute('data-id');
                const exito = await eliminarDocumentoAPI(idDoc, btnBorrarFila);
                
                if (exito) {
                    const filaDoc = btnBorrarFila.closest('.emp-doc-row');
                    filaDoc.style.transition = 'all 0.3s ease';
                    filaDoc.style.opacity = '0';
                    filaDoc.style.transform = 'scale(0.8)';
                    setTimeout(() => filaDoc.remove(), 300);
                    
                    // Actualizamos nuestro array interno sacando el borrado
                    visorDocumentosArray = visorDocumentosArray.filter(d => d.id_doc != idDoc);
                    if(visorDocumentosArray.length === 0) seccionDocsActuales.style.display = 'none';
                }
            }
        });
    }

    // Acción: BORRAR DESDE ADENTRO DEL VISOR
    if (btnVisorBorrar) {
        btnVisorBorrar.addEventListener('click', async (e) => {
            const idDoc = btnVisorBorrar.getAttribute('data-id');
            const exito = await eliminarDocumentoAPI(idDoc, btnVisorBorrar);
            
            if (exito) {
                // Sacar del array
                visorDocumentosArray = visorDocumentosArray.filter(d => d.id_doc != idDoc);
                
                // Remover la fila visual del fondo
                const botonEnLista = document.querySelector(`.btn-borrar-doc[data-id="${idDoc}"]`);
                if(botonEnLista) botonEnLista.closest('.emp-doc-row').remove();

                if (visorDocumentosArray.length === 0) {
                    // Ya no quedan documentos, cerramos visor y ocultamos sección
                    cerrarVisor();
                    seccionDocsActuales.style.display = 'none';
                } else {
                    // Quedan documentos, ajustamos el índice si borramos el último
                    if (visorIndexActual >= visorDocumentosArray.length) {
                        visorIndexActual = visorDocumentosArray.length - 1;
                    }
                    renderizarVisor();
                    btnVisorBorrar.disabled = false; // Reactivar el botón para el siguiente doc
                }
            }
        });
    }
    

    // --- LÓGICA DE GUARDADO (CREAR O ACTUALIZAR) ---
    if (btnGuardarFinal) {
        btnGuardarFinal.addEventListener('click', async (e) => {
            e.preventDefault(); 

            // 1. Recolectamos obligatorios
            const inputNombres = document.getElementById('emp_nombres').value.trim();
            const inputDni = document.getElementById('emp_dni').value.trim();
            const inputCargo = document.getElementById('emp_cargo').value.trim();
            const inputArea = document.getElementById('emp_area').value.trim();
            const inputFechaIngreso = document.getElementById('emp_fecha_ingreso').value; 
            const inputFechaCese = document.getElementById('emp_fecha_cese').value;

            if (!inputNombres || !inputDni || !inputCargo || !inputArea || !inputFechaIngreso) {
                alert("Por favor, completa los campos obligatorios.");
                return;
            }

            // 2. Armamos el FormData
            const formData = new FormData();
            formData.append('nombres', inputNombres);
            formData.append('apellidos', document.getElementById('emp_apellidos').value.trim());
            formData.append('dni', inputDni);
            formData.append('fecha_nacimiento', document.getElementById('emp_fecha_nac').value);
            formData.append('sexo', document.getElementById('emp_sexo').value);
            formData.append('estado_civil', document.getElementById('emp_estado_civil').value);
            formData.append('direccion', document.getElementById('emp_direccion').value);
            formData.append('telefono', document.getElementById('emp_telefono').value);
            formData.append('correo', document.getElementById('emp_correo').value);
            
            formData.append('area', inputArea);
            formData.append('cargo', inputCargo);
            formData.append('tipo_contrato', document.getElementById('emp_tipo_contrato').value);
            formData.append('jornada_laboral', document.getElementById('emp_jornada').value);
            formData.append('hora_ingreso', document.getElementById('emp_hora_ingreso').value);
            formData.append('hora_salida', document.getElementById('emp_hora_salida').value);
            formData.append('refrigerio_inicio', document.getElementById('emp_ref_inicio').value);
            formData.append('refrigerio_fin', document.getElementById('emp_ref_fin').value);
            formData.append('regimen_laboral', document.getElementById('emp_regimen').value);
            formData.append('estado', document.getElementById('emp_estado').value);
            formData.append('fecha_ingreso', inputFechaIngreso);
            formData.append('fecha_cese', inputFechaCese);
            
            const remSueldo = document.getElementById('rem_sueldo');
            const remMoneda = document.getElementById('rem_moneda');
            formData.append('sueldo_basico', remSueldo ? remSueldo.value : "");
            formData.append('moneda', remMoneda ? remMoneda.value : "PEN");

            const docArchivo = document.getElementById('doc_archivo');
            const docTipo = document.getElementById('doc_tipo');
            if (docArchivo && docArchivo.files.length > 0) {
                formData.append('archivo', docArchivo.files[0]);
                formData.append('tipo_documento', docTipo ? docTipo.value : "");
            }

            // 3. Decidimos qué ruta usar
            const urlFetch = empleadoIdEnEdicion ? `/api/empleados/actualizar/${empleadoIdEnEdicion}` : '/api/empleados/registrar_todo';
            const metodoFetch = empleadoIdEnEdicion ? 'PUT' : 'POST';

            try {
                btnGuardarFinal.disabled = true;
                btnGuardarFinal.innerText = "Guardando...";

                const respuesta = await fetch(urlFetch, {
                    method: metodoFetch,
                    body: formData 
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert("¡" + data.mensaje + "!");
                    cerrarModal();
                    // window.location.reload(); // Descomenta si quieres que recargue la página para ver los cambios
                } else {
                    alert("Error: " + data.error);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error de conexión con el servidor.");
            } finally {
                btnGuardarFinal.disabled = false;
                btnGuardarFinal.innerText = empleadoIdEnEdicion ? "Actualizar Cambios" : "Guardar Empleado";
            }
        });
    }

    // --- RESTRICCIÓN: SOLO NÚMEROS EN DNI Y TELÉFONO ---
    const inputDni = document.getElementById('emp_dni');
    const inputTelefono = document.getElementById('emp_telefono');

    // Función que reemplaza cualquier carácter que no sea dígito (0-9) por nada ('')
    const forzarSoloNumeros = function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    };

    if (inputDni) {
        inputDni.addEventListener('input', forzarSoloNumeros);
    }
    
    if (inputTelefono) {
        inputTelefono.addEventListener('input', forzarSoloNumeros);
    }

    // --- CONVERTIR TODO A MAYÚSCULAS MIENTRAS SE ESCRIBE ---
    // Seleccionamos todos los inputs y textareas de tu formulario
    const inputsFormulario = document.querySelectorAll('#form-empleado input, #form-empleado textarea');
    
    inputsFormulario.forEach(input => {
        // Filtramos para aplicar esto solo a los campos de texto
        // (no queremos estropear campos de tipo fecha, números o contraseñas)
        if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea') {
            input.addEventListener('input', function() {
                // Posición del cursor para que no salte al final al editar texto en el medio
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                // Convertimos el valor a mayúsculas
                this.value = this.value.toUpperCase();
                
                // Restauramos la posición del cursor
                this.setSelectionRange(start, end);
            });
        }
    });
});
