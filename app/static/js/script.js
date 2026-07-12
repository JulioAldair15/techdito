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
// --- 1. Lógica para mostrar/ocultar campos ---
function verificarActividad() {
    const selector = document.getElementById('selector-actividad-1');
    const camposInspecciones = document.getElementById('campos-inspecciones');
    const camposPersuasivas = document.getElementById('campos-persuasivas');
    const camposCierres = document.getElementById('campos-cierres'); // Nuevo
    const resultado = document.getElementById('contenedor-resultado');

    camposInspecciones.style.display = 'none';
    camposPersuasivas.style.display = 'none';
    camposCierres.style.display = 'none'; // Nuevo
    if (resultado) resultado.style.display = 'none';

    if (selector.value === 'INSPECCIONES') {
        camposInspecciones.style.display = 'flex';
    } else if (selector.value === 'PERSUASIVAS') {
        camposPersuasivas.style.display = 'flex';
    } else if (selector.value === 'CIERRES') {
        camposCierres.style.display = 'flex'; // Mostrar nuevo
    }
}

// --- 2. FUNCIÓN DINÁMICA: Detecta el esquema y pinta la tabla correspondiente ---
function renderTablaGrupo(data) {
    const contenedorResultado = document.getElementById('contenedor-resultado');
    const thead = contenedorResultado.querySelector('table thead');
    const tbody = contenedorResultado.querySelector('table tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%">Este grupo no tiene datos.</td></tr>';
        return;
    }

    // Definición de las columnas de cada área para respetar el orden exacto
    const headersInspecciones = [
        'CLICODFAC', 'NACTINT', 'NACTEXT', 'CICLOREAL', 'FECNOTIMED',
        'HORANOTI', 'FCHINSREAL', 'HREAL', 'LECTURA', 'OBS', 'FUGAINT',
        'FUGAEXT', 'FUGANOVIS', 'AUSENTE', 'DCLAJUDA', 'USACEPCONS', 'OBSERS', 'NUU', 'USOINM'
    ];

    const headersPersuasivas = [
        'NRCX_OFI', 'NRCX_AGE', 'NRCX_NRO', 'NRCX_CLI', 'NRCX_NOM', 
        'NRCX_DIR', 'NRCX_MED', 'NRCX_TAR', 'NRCX_OBS', 'NRCX_FOB', 'NRCX_HOB', 'NRCX_GLO'
    ];

    const headersCierres = [
        'NEX_CLI', 'NEX_NOM', 'NRCX_OPECX', 'NRX_AMB', 'CODPRECINT', 
        'TIPODISPCX', 'NEX_GLO', 'NEX_FEC', 'NEX_HRA', 'SERVIDOR'
    ];

    // Mapeo dinámico: Evalúa el primer registro para saber qué juego de cabeceras usar
    let headersToShow = [];
    if ('CLICODFAC' in data[0]) {
        headersToShow = headersInspecciones;
    } else if ('NRCX_FOB' in data[0] || 'NRCX_OBS' in data[0]) { 
        headersToShow = headersPersuasivas;
    } else if ('TIPODISPCX' in data[0] && 'NEX_CLI' in data[0]) {
        // Detecta que son Cierres por la combinación de estas columnas
        headersToShow = headersCierres;
    } else {
        headersToShow = Object.keys(data[0]);
    }
    
    // --- Crear Cabecera (Thead) ---
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

// --- 3. Construcción de Pestañas (Tabs) ---
function construirTabsYTabla(dataPorGrupo) {
    const contenedorResultado = document.getElementById('contenedor-resultado');
    const tabsContainer = document.getElementById('tabla-tabs-container');
    tabsContainer.innerHTML = ''; 

    const grupos = Object.keys(dataPorGrupo);

    if (grupos.length === 0) {
        renderTablaGrupo(null); 
        contenedorResultado.style.display = 'block';
        return;
    }

    grupos.forEach((grupo, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = 'tab-button';
        tabButton.textContent = `Grupo ${grupo} (${dataPorGrupo[grupo].length} filas)`;
        tabButton.dataset.grupo = grupo;

        tabButton.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            tabButton.classList.add('active');
            renderTablaGrupo(dataPorGrupo[grupo]);
        });

        tabsContainer.appendChild(tabButton);
    });

    contenedorResultado.style.display = 'block';
    
    if (tabsContainer.firstChild) {
        tabsContainer.firstChild.click();
    }
}

// --- 4. MÓDULO INSPECCIONES: Previsualizar ---
async function previsualizarConversion() {
    const fechaInput = document.getElementById('fecha-input');
    const archivoInput = document.getElementById('archivo-input');
    const btnConvertir = document.getElementById('btn-convertir');

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
            throw new Error(errorData.error || 'Error en el servidor');
        }

        const dataPorGrupo = await response.json();
        construirTabsYTabla(dataPorGrupo);

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
        document.getElementById('contenedor-resultado').style.display = 'none';
    } finally {
        btnConvertir.textContent = 'CONVERTIR';
        btnConvertir.disabled = false;
    }
}

// --- 5. MÓDULO PERSUASIVAS: Previsualizar entregable ---
async function generarEntregable() {
    const archivosInput = document.getElementById('archivos-dbf-cdx');
    const reporteInput = document.getElementById('archivo-reporte');
    const btnGenerar = document.getElementById('btn-generar-entregable');

    if (archivosInput.files.length === 0) { alert('Por favor, cargue los archivos .dbf y .cdx originales.'); return; }
    if (reporteInput.files.length === 0) { alert('Por favor, cargue el reporte Excel de su sistema.'); return; }

    const formData = new FormData();
    for (let i = 0; i < archivosInput.files.length; i++) {
        formData.append('archivos_base', archivosInput.files[i]);
    }
    formData.append('reporte', reporteInput.files[0]);

    btnGenerar.textContent = 'PROCESANDO VISTA...';
    btnGenerar.disabled = true;

    try {
        const response = await fetch('/api/persuasivas/previsualizar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error procesando archivos.');
        }

        const dataPorServidor = await response.json();
        construirTabsYTabla(dataPorServidor);

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
    } finally {
        btnGenerar.textContent = 'GENERAR ENTREGABLE';
        btnGenerar.disabled = false;
    }
}

// --- 5B. NUEVO MÓDULO CIERRES: Previsualizar entregable ---
async function generarEntregableCierres() {
    const archivosInput = document.getElementById('archivos-dbf-cdx-cierres');
    const reporteInput = document.getElementById('archivo-reporte-cierres');
    const btnGenerar = document.getElementById('btn-generar-cierres');

    if (archivosInput.files.length === 0) { alert('Cargue los archivos .dbf y .cdx originales.'); return; }
    if (reporteInput.files.length === 0) { alert('Cargue el reporte Excel de cierres.'); return; }

    const formData = new FormData();
    for (let i = 0; i < archivosInput.files.length; i++) {
        formData.append('archivos_base', archivosInput.files[i]);
    }
    formData.append('reporte', reporteInput.files[0]);

    btnGenerar.textContent = 'PROCESANDO...';
    btnGenerar.disabled = true;

    try {
        const response = await fetch('/api/cierres/previsualizar', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error procesando archivos.');
        }

        const dataPorServidor = await response.json();
        construirTabsYTabla(dataPorServidor);

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
    } finally {
        btnGenerar.textContent = 'GENERAR CIERRES';
        btnGenerar.disabled = false;
    }
}

// --- 6. FUNCIÓN DE DESCARGA: Discrimina la ruta según el selector activo ---
async function ejecutarDescargaZip() {
    const actividad = document.getElementById('selector-actividad-1').value;
    const btnDescargar = document.getElementById('btn-descargar-1');
    const formData = new FormData();
    let endpoint = '';
    let nombreBase = ''; // Usamos nombreBase sin el ".zip" para poder concatenarle la fecha

    // --- GENERADOR DE FECHA Y HORA (Formato: YYYYMMDD_HHMMSS) ---
    const ahora = new Date();
    const timestamp = ahora.getFullYear().toString() +
                      String(ahora.getMonth() + 1).padStart(2, '0') +
                      String(ahora.getDate()).padStart(2, '0') + '_' +
                      String(ahora.getHours()).padStart(2, '0') +
                      String(ahora.getMinutes()).padStart(2, '0') +
                      String(ahora.getSeconds()).padStart(2, '0');

    if (actividad === 'INSPECCIONES') {
        const fechaInput = document.getElementById('fecha-input');
        const archivoInput = document.getElementById('archivo-input');
        if (!fechaInput.value || archivoInput.files.length === 0) { alert('Faltan datos de inspecciones.'); return; }
        
        formData.append('fecha', fechaInput.value);
        formData.append('archivo', archivoInput.files[0]);
        endpoint = '/descargar-dbf';
        nombreBase = 'conversiones_inspecciones';
        
    } else if (actividad === 'PERSUASIVAS') {
        const archivosInput = document.getElementById('archivos-dbf-cdx');
        const reporteInput = document.getElementById('archivo-reporte');
        if (archivosInput.files.length === 0 || reporteInput.files.length === 0) { alert('Faltan archivos de persuasivas.'); return; }

        for (let i = 0; i < archivosInput.files.length; i++) {
            formData.append('archivos_base', archivosInput.files[i]);
        }
        formData.append('reporte', reporteInput.files[0]);
        endpoint = '/api/persuasivas/descargar';
        nombreBase = 'entregable_persuasivas';
        
    } else if (actividad === 'CIERRES') {
        const archivosInput = document.getElementById('archivos-dbf-cdx-cierres');
        const reporteInput = document.getElementById('archivo-reporte-cierres');
        if (archivosInput.files.length === 0 || reporteInput.files.length === 0) { alert('Faltan archivos de cierres.'); return; }

        for (let i = 0; i < archivosInput.files.length; i++) {
            formData.append('archivos_base', archivosInput.files[i]);
        }
        formData.append('reporte', reporteInput.files[0]);
        endpoint = '/api/cierres/descargar';
        nombreBase = 'entregable_cierres';
    }

    btnDescargar.textContent = 'GENERANDO ZIP...';
    btnDescargar.disabled = true;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error al generar el archivo ZIP.');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // CORRECCIÓN AQUÍ: Usamos la variable combinada en lugar del ternario quemado en duro
        a.download = `${nombreBase}_${timestamp}.zip`; 
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        alert(error.message);
    } finally {
        btnDescargar.textContent = 'DESCARGAR ZIP';
        btnDescargar.disabled = false;
    }
}


// --- 7. Inicialización de Eventos de Escucha ---
document.addEventListener('DOMContentLoaded', () => {
    // Evento para Inspecciones
    const btnConvertir = document.getElementById('btn-convertir');
    if (btnConvertir) {
        btnConvertir.onclick = null;
        btnConvertir.addEventListener('click', previsualizarConversion);
    }

    // Evento para Persuasivas
    const btnGenerarEntregable = document.getElementById('btn-generar-entregable');
    if (btnGenerarEntregable) {
        btnGenerarEntregable.addEventListener('click', generarEntregable);
    }

    // Reasociación unificada del botón Descargar
    const btnDescargar = document.getElementById('btn-descargar-1');
    if (btnDescargar) {
        btnDescargar.replaceWith(btnDescargar.cloneNode(true)); 
        document.getElementById('btn-descargar-1').addEventListener('click', ejecutarDescargaZip);
    }
});


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
    if (document.getElementById('listaEmpleados')) return;
    
    console.log("Configurando datalist de empleados...");
    const datalist = document.createElement('datalist');
    datalist.id = 'listaEmpleados';
    
    let options = '';
    EMPLEADOS_DB.forEach(emp => {
        options += `<option value="${emp}">`; 
    });
    
    datalist.innerHTML = options;
    document.body.appendChild(datalist);
}

// 2. FUNCIÓN ANALIZAR (CORREGIDA PARA LEER EXCEL EN AMBOS MODOS)
function analizarCargas() {
    console.log("--- INICIANDO analizarCargas() ---");
    setupDatalist();

    const fileInput = document.getElementById('archivoCarga');
    const fCalendario = document.getElementById('fechaCalendario');
    const fEjecucion = document.getElementById('fechaEjecucion');
    const subActividad = document.getElementById('subActividad').value; 
    const grid = document.getElementById('loadsGrid');
    const area = document.getElementById('areaAsignacion');
    const tituloOperarios = document.getElementById('tituloOperarios');

    console.log("Sub-Actividad seleccionada:", subActividad);

    if (!fileInput.files.length || !fCalendario.value || !fEjecucion.value || !subActividad) {
        alert("Por favor, complete todos los campos obligatorios.");
        return;
    }

    // Aseguramos mostrar el contenedor de UI de operarios
    if (tituloOperarios) tituloOperarios.style.display = 'block'; 

    console.log("Iniciando lectura del archivo Excel...");
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function(e) {
        console.log("Excel leído en memoria. Procesando datos con SheetJS...");
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (rawData.length === 0) return;

        let colCargard = -1;
        let colFciclo = -1;
        let headerRow = -1;

        // Buscar columnas clave
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

        const cargasSimuladas = new Set();

        // --- BIFURCACIÓN DE LÓGICA SEGÚN SUB-ACTIVIDAD ---
        if (subActividad === 'CONTINUOS') {
            console.log("Modo CONTINUOS: Aplicando regla de partición límite 528...");
            const limite = 528;
            const filasPorCiclo = {};

            for (let i = headerRow + 1; i < rawData.length; i++) {
                const row = rawData[i];
                const ciclo = colFciclo !== -1 ? String(row[colFciclo]).trim() : "unico";
                if (!filasPorCiclo[ciclo]) filasPorCiclo[ciclo] = [];
                filasPorCiclo[ciclo].push(row[colCargard]);
            }

            Object.keys(filasPorCiclo).forEach(ciclo => {
                const filas = filasPorCiclo[ciclo];
                if (filas.length === 0) return;
                const cargaBase = parseInt(filas[0]) || 0;

                filas.forEach((_, index) => {
                    const nuevaCarga = cargaBase + Math.floor(index / limite);
                    cargasSimuladas.add(nuevaCarga.toString());
                });
            });

        } else if (subActividad === 'DISPERSOS') {
            console.log("Modo DISPERSOS: Extrayendo cargas únicas sin partición...");
            // Solo extraemos las cargas que ya vienen por defecto en el archivo
            for (let i = headerRow + 1; i < rawData.length; i++) {
                const row = rawData[i];
                const valorCarga = row[colCargard];
                if (valorCarga !== undefined && valorCarga !== "") {
                    // Limpiamos la carga a enteros si es posible, para mantener uniformidad
                    const numCarga = parseInt(valorCarga);
                    if (!isNaN(numCarga)) {
                        cargasSimuladas.add(numCarga.toString());
                    } else {
                        cargasSimuladas.add(String(valorCarga).trim());
                    }
                }
            }
        }

        // --- GENERACIÓN DE TARJETAS UI (PARA AMBOS MODOS) ---
        grid.innerHTML = ''; 
        
        // Ordenamos numéricamente
        const sortedCargas = Array.from(cargasSimuladas).sort((a, b) => {
            const numA = parseInt(a), numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });

        console.log("Cargas generadas para UI:", sortedCargas);

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

        console.log("Tarjetas renderizadas en pantalla.");
        area.style.display = 'block';
    };
}

// 3. FUNCIÓN GENERAR FINAL (CORREGIDA PARA ENVIAR OPERARIOS EN AMBOS MODOS)
async function generarAsignacionFinal() {
    console.log("--- INICIANDO generarAsignacionFinal() ---");
    const inputs = document.querySelectorAll('.operario-input');
    const subActividad = document.getElementById('subActividad').value; 
    const mapping = {};
    let faltantes = 0;

    console.log("Recopilando asignaciones de operarios para modo:", subActividad);
    
    // AHORA RECOPILAMOS LOS INPUTS SIN IMPORTAR SI ES CONTINUOS O DISPERSOS
    inputs.forEach(inp => {
        const cargaName = inp.name.replace('carga_', '');
        const val = inp.value;

        if (val) {
            const match = val.match(/^(\d+)/);
            if (match) {
                mapping[cargaName] = match[1]; 
            } else {
                mapping[cargaName] = val; 
            }
        } else {
            faltantes++;
        }
    });

    console.log("Mapeo recopilado:", mapping);

    if (faltantes > 0) {
        console.warn(`Faltan ${faltantes} cargas por asignar.`);
        if (!confirm(`Hay ${faltantes} cargas sin operario asignado. ¿Desea continuar?`)) {
            return;
        }
    }

    const formData = new FormData();
    formData.append('archivo', document.getElementById('archivoCarga').files[0]);
    formData.append('fecha_calendario', document.getElementById('fechaCalendario').value);
    formData.append('fecha_ejecucion', document.getElementById('fechaEjecucion').value);
    formData.append('sub_actividad', subActividad); 
    formData.append('mapping', JSON.stringify(mapping)); // Ahora siempre enviará datos

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

let datosOriginalesExcel = []; // Almacenará el Excel subido en memoria
let datosLimpiosFinales = []; // Lo que enviaremos al ZIP

// Diccionario de sinónimos para autodetectar columnas
const diccionariosDetect = {
    'map_suministro': ['suministro', 'codigo', 'clicodfac', 'codigo cliente', 'número de suministro', 'numero de suministro'],
    'map_nombre': ['nombre completo', 'nombre', 'nombre del usuario que solicita la verificación', 'clinombre', 'cl nombre'],
    'map_localidad': ['localidad', 'distrito'],
    'map_urbanizacion': ['urbanizacion', 'urbanización', 'urbanizac', 'dirección donde se encuentra el medidor', 'urbaniza'],
    'map_calle': ['calle', 'direccion', 'dirección'],
    'map_numero': ['numero', 'número', 'nummun', 'n°', 'n'],
    'map_ciclo': ['ciclo', 'cicloreal'],
    'map_medidor': ['medcodigo', 'medidor', 'n° de serie del medidor', 'serie'],
    'map_documento': ['carta', 'conact', 'secuencia', 'n° reclamo', 'reclamo', 'item']
};

// Función auxiliar para detectar datos basura (Vacíos o Errores de Excel)
function esCeldaVaciaOError(celda) {
    if (celda === undefined || celda === null) return true;
    const val = String(celda).trim().toUpperCase();
    return val === "" || val === "N/D" || val === "#N/D" || val === "N/A" || val === "#N/A";
}

// 1. LEE EL ARCHIVO, IGNORA HOJAS CON #N/D MASIVOS Y ENCUENTRA LA HOJA REAL
function procesarExcelTransformacion(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        
        let sheetEncontrada = false;
        let cabecerasDetectadas = [];
        datosOriginalesExcel = []; 

        console.log("Iniciando escaneo inteligente de hojas...");

        // PASO 1: Recorrer TODAS las hojas del libro de Excel
        for (let s = 0; s < workbook.SheetNames.length; s++) {
            const sheetName = workbook.SheetNames[s];
            const worksheet = workbook.Sheets[sheetName];
            
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            if (rawData.length === 0) continue; 

            let headerRowIndex = -1;

            // PASO 2: Buscar la fila de cabeceras (máximo hasta la fila 20)
            for (let r = 0; r < Math.min(rawData.length, 20); r++) {
                const row = rawData[r];
                
                // Extraemos dinámicamente TODAS tus palabras clave del diccionario principal
                const todasLasPalabrasClave = Object.values(diccionariosDetect).flat();

                const pareceCabecera = row.some(celda => {
                    const val = String(celda).toLowerCase().trim();
                    return todasLasPalabrasClave.includes(val);
                });

                if (pareceCabecera) {
                    headerRowIndex = r;
                    break; 
                }
            }

            // PASO 3: Evaluar si la hoja tiene DATOS REALES debajo de la cabecera
            if (headerRowIndex !== -1) {
                let tieneDatosReales = false;
                
                // Detectar qué columnas son "ITEM" o correlativos para IGNORARLAS en la validación
                const cabecerasHoja = rawData[headerRowIndex].map(c => String(c).toLowerCase().trim());
                const indicesAIgnorar = [];
                cabecerasHoja.forEach((cab, idx) => {
                    if (cab === 'item' || cab === 'n°' || cab === 'nro') {
                        indicesAIgnorar.push(idx);
                    }
                });
                
                // Revisamos las filas que están justo debajo de las cabeceras
                for (let d = headerRowIndex + 1; d < rawData.length; d++) {
                    const rowData = rawData[d];
                    
                    // Comprobamos si esta fila tiene al menos UNA celda válida (y que no pertenezca a la columna ITEM)
                    const esFilaValida = rowData.some((celda, idx) => {
                        if (indicesAIgnorar.includes(idx)) return false; // Ignoramos si es la columna ITEM
                        return !esCeldaVaciaOError(celda);
                    });

                    if (esFilaValida) {
                        tieneDatosReales = true;
                        break; // Encontramos datos, detenemos la búsqueda en esta hoja
                    }
                }

                // PASO 4: Procesar solo si la hoja demostró tener datos reales
                if (tieneDatosReales) {
                    console.log(`✅ Hoja válida encontrada: "${sheetName}". Extrayendo datos...`);
                    
                    cabecerasDetectadas = rawData[headerRowIndex].map((c, index) => String(c).trim() || `Columna_Vacia_${index}`);
                    
                    // Extraer los datos, omitiendo también las filas individuales que sean puro #N/D
                    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                        const rawRow = rawData[i];
                        
                        // Si la fila solo tiene un correlativo en ITEM pero el resto es basura, se ignora
                        const esFilaTotalmenteBasura = !rawRow.some((celda, idx) => {
                            if (indicesAIgnorar.includes(idx)) return false; // Ignoramos si es la columna ITEM
                            return !esCeldaVaciaOError(celda);
                        });
                        
                        if (esFilaTotalmenteBasura) continue; 

                        const objFila = {};
                        cabecerasDetectadas.forEach((cabecera, idx) => {
                            const valorCelda = rawRow[idx];
                            objFila[cabecera] = esCeldaVaciaOError(valorCelda) ? "" : valorCelda;
                        });
                        
                        datosOriginalesExcel.push(objFila);
                    }
                    
                    sheetEncontrada = true;
                    break; // Salimos del bucle principal de hojas
                } else {
                    console.log(`⚠️ Hoja descartada: "${sheetName}". Solo contiene correlativos en ITEM y el resto es basura o #N/D.`);
                }
            }
        }

        // Validación final si el Excel entero era pura basura
        if (!sheetEncontrada || datosOriginalesExcel.length === 0) {
            alert("No se encontró ninguna hoja válida. El archivo parece estar completamente vacío o solo contiene correlativos con errores como #N/D.");
            document.getElementById('panelTransformacion').style.display = 'none';
            return;
        }

        llenarSelectores(cabecerasDetectadas);
        document.getElementById('panelTransformacion').style.display = 'flex';
        actualizarPrevisualizacion();
    };
    
    reader.readAsArrayBuffer(file);
}

// 2. AUTO-MAPPING INTELIGENTE
function llenarSelectores(cabeceras) {
    const selectsIds = Object.keys(diccionariosDetect);
    
    selectsIds.forEach(idSelect => {
        const selectElement = document.getElementById(idSelect);
        selectElement.innerHTML = '<option value="">-- No existe --</option>'; // Opción por defecto
        
        let mejorCoincidencia = "";

        // Llenar opciones
        cabeceras.forEach(cabecera => {
            const cabeceraLimpia = cabecera.toLowerCase().trim();
            const option = document.createElement('option');
            option.value = cabecera;
            option.text = cabecera;
            selectElement.appendChild(option);

            // Buscar si coincide con el diccionario
            if (diccionariosDetect[idSelect].includes(cabeceraLimpia)) {
                mejorCoincidencia = cabecera;
            }
        });

        // Si encontró una columna que se llama igual, la selecciona automáticamente
        if (mejorCoincidencia !== "") {
            selectElement.value = mejorCoincidencia;
        }
    });
}

// Función auxiliar para crear exactamente 11 dígitos
function generarSuministroAleatorio() {
    let codigo = '';
    
    // Generamos el primer dígito (del 1 al 9 para asegurar que no empiece con cero)
    codigo += Math.floor(Math.random() * 9) + 1;
    
    // Generamos los 10 dígitos restantes (del 0 al 9)
    for (let i = 0; i < 10; i++) {
        codigo += Math.floor(Math.random() * 10);
    }
    
    return codigo;
}

// 3. REGLAS DE LIMPIEZA
function limpiarSuministro(val) {
    // Si la celda viene completamente nula o indefinida desde el Excel
    if (!val) return generarSuministroAleatorio();
    
    // Elimina TODO lo que no sea un número (letras, espacios, guiones, etc.)
    const num = String(val).replace(/\D/g, ''); 
    
    // Si después de quitar las letras el resultado quedó vacío, genera el aleatorio
    return num === "" ? generarSuministroAleatorio() : num;
}

function limpiarTexto(val) {
    if (!val) return "-";
    // Convertimos a mayúsculas, quitamos espacios extra y saltos de línea
    let txt = String(val).toUpperCase().trim().replace(/[\r\n\t]/g, ' '); 
    
    // Si es mayor a 50 caracteres, lo recortamos inteligentemente
    if (txt.length > 50) {
        let truncado = txt.substring(0, 50);
        // Buscamos el último espacio para no cortar una palabra por la mitad
        let ultimoEspacio = truncado.lastIndexOf(" ");
        if (ultimoEspacio > 0) {
            truncado = truncado.substring(0, ultimoEspacio);
        }
        return truncado + "...";
    }
    return txt;
}

// Función exclusiva para limpiar el NOMBRE (Sin puntos, ni comas)
function limpiarNombre(val) {
    if (!val) return "-";
    
    // 1. Convertimos a mayúsculas, quitamos saltos de línea y espacios extra
    let txt = String(val).toUpperCase().trim().replace(/[\r\n\t]/g, ' '); 
    
    // 2. NUEVA REGLA: Eliminamos puntos, comas, puntos y comas, y dos puntos
    txt = txt.replace(/[.,;:]/g, '');
    
    // 3. Aplicamos el recorte inteligente si pasa de 50 caracteres
    if (txt.length > 50) {
        let truncado = txt.substring(0, 50);
        let ultimoEspacio = truncado.lastIndexOf(" ");
        if (ultimoEspacio > 0) {
            truncado = truncado.substring(0, ultimoEspacio);
        }
        return truncado + "...";
    }
    
    // Si al quitar los puntos/comas se quedó completamente vacío
    return txt.trim() === "" ? "-" : txt;
}

// Función para eliminar la urbanización si está duplicada al inicio de la calle
function limpiarCalleDuplicada(urb, calle) {
    // Si alguno está vacío o tiene el guion por defecto, devolvemos la calle (en mayúsculas si existe)
    if (!urb || !calle || urb === "-" || calle === "-") {
        return calle && calle !== "-" ? String(calle).toUpperCase() : calle;
    }

    // Normalizamos a mayúsculas (y las usaremos para el resultado final)
    const urbNorm = urb.toUpperCase().trim();
    const calleNorm = calle.toUpperCase().trim();

    if (calleNorm.startsWith(urbNorm) && urbNorm.length > 3) {
        // Cortamos usando la versión que ya está en mayúsculas (calleNorm)
        let nuevaCalle = calleNorm.substring(urbNorm.length).trim();

        nuevaCalle = nuevaCalle.replace(/^[.,\-;:_]\s*/, '').trim();

        return nuevaCalle === "" ? "-" : nuevaCalle;
    }

    // Retornamos la versión en mayúsculas directamente
    return calleNorm;
}

// Función exclusiva para limpiar el CICLO (Solo números, por defecto 1)
function limpiarCiclo(val) {
    // Si la celda viene completamente vacía o nula desde el Excel
    if (val === undefined || val === null || String(val).trim() === "") {
        return "1";
    }
    
    // Elimina cualquier carácter que no sea un dígito (borra guiones, letras, espacios)
    const num = String(val).replace(/\D/g, ''); 
    
    // Si después de la limpieza el resultado quedó vacío, se coloca un "1"
    return num === "" ? "1" : num;
}

// Función exclusiva para limpiar el NÚMERO (Máximo 8 caracteres)
function limpiarNumero(val) {
    if (!val) return "-";
    
    // 1. Quitamos saltos de línea y espacios extra
    let txt = String(val).trim().replace(/[\r\n\t]/g, ' '); 
    
    // 2. Si el texto tiene más de 8 caracteres, lo cortamos
    if (txt.length > 8) {
        // Cortamos exactamente a los 8 caracteres y quitamos espacios que queden en los bordes
        txt = txt.substring(0, 8).trim();
    }
    
    // 3. Si después de todo se quedó vacío, devolvemos el guion por defecto
    return txt === "" ? "-" : txt;
}

// Función para voltear la fecha a DD/MM/YYYY
function formatearFechaDDMMYYYY(fechaInput) {
    if (!fechaInput) return "-";
    // El input devuelve YYYY-MM-DD, lo separamos por el guion
    const partes = fechaInput.split('-'); 
    if (partes.length !== 3) return fechaInput; // Por si acaso
    
    // Lo rearmamos al revés
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
}

// 4. GENERAR LA VISTA PREVIA Y APLICAR REGLAS DE NEGOCIO
function actualizarPrevisualizacion() {
    if (datosOriginalesExcel.length === 0) return;

    // Capturar configuraciones
    const subActElement = document.getElementById('subActividadTransform');
    const tipoOrden = subActElement.value;
    const nombreSubAct = subActElement.options[subActElement.selectedIndex].text;
    
    // Capturar fechas y darles el formato DD/MM/YYYY
    const rawEmision = document.getElementById('fechaEmisionTransform').value;
    const rawEnvio = document.getElementById('fechaEnvioTransform').value;
    
    const fEmision = formatearFechaDDMMYYYY(rawEmision);
    const fEnvio = formatearFechaDDMMYYYY(rawEnvio);

    // Capturar mapeo actual
    const map = {
        suministro: document.getElementById('map_suministro').value,
        nombre: document.getElementById('map_nombre').value,
        localidad: document.getElementById('map_localidad').value,
        urbanizacion: document.getElementById('map_urbanizacion').value,
        calle: document.getElementById('map_calle').value,
        numero: document.getElementById('map_numero').value,
        ciclo: document.getElementById('map_ciclo').value,
        medidor: document.getElementById('map_medidor').value,
        documento: document.getElementById('map_documento').value
    };

    const tbody = document.querySelector('#tablaPreview tbody');
    tbody.innerHTML = '';
    datosLimpiosFinales = []; // Reiniciamos el arreglo final

    // Procesar fila por fila (Limitar preview a 100 filas para que no se congele el navegador)
    const limitePreview = Math.min(datosOriginalesExcel.length, 100);

    for (let i = 0; i < datosOriginalesExcel.length; i++) {
        const filaExcel = datosOriginalesExcel[i];
        
        // 1. Limpiamos individualmente Urbanización y Calle
        let urbLimpia = limpiarTexto(filaExcel[map.urbanizacion]);
        let calleLimpia = limpiarTexto(filaExcel[map.calle]);

        // 2. Aplicamos la regla de duplicidad (compara y corta si es necesario)
        calleLimpia = limpiarCalleDuplicada(urbLimpia, calleLimpia);

        // 3. Construimos la nueva fila limpia
        const filaLimpia = {
            'ITEM': i + 1,
            'SUMINISTRO': limpiarSuministro(filaExcel[map.suministro]),
            'NOMBRE': limpiarNombre(filaExcel[map.nombre]),
            'LOCALIDAD': limpiarTexto(filaExcel[map.localidad]),
            'URBANIZACION': urbLimpia, // Usamos la variable ya procesada
            'CALLE': calleLimpia,      // Usamos la variable sin el duplicado
            'NUMERO': limpiarNumero(filaExcel[map.numero]),
            'CICLO': limpiarCiclo(filaExcel[map.ciclo]),
            'MEDIDOR': limpiarTexto(filaExcel[map.medidor]),
            'N° DOCUMENTO': '', 
            'FECHA EMISION': fEmision,
            'FECHA ENVIO': fEnvio,
            'CARGA_RD': '',
            'ORDEN_RD': '',
            'TIPO_ORDEN': tipoOrden
        };

        // --- LÓGICA ESPECIAL PARA N° DOCUMENTO ---
        let numDocFinal = "";

        if (nombreSubAct === 'COMUNICACIÓN TARIFA' && map.documento === '') {
            numDocFinal = filaExcel['ITEM'] || filaExcel['item'] || (i + 1);
        } else if (nombreSubAct.includes('RESOLUCION')) {
            let rec = String(filaExcel['RECLAMO'] || filaExcel['reclamo'] || '').replace(/[a-zA-Z]/g, '');
            let res = String(filaExcel['RESOLUCION'] || filaExcel['resolucion'] || '').replace(/[a-zA-Z]/g, '');
            numDocFinal = `${rec}-${res}`;
        } else if (map.documento && filaExcel[map.documento]) {
            numDocFinal = String(filaExcel[map.documento]).trim();
        } else {
            numDocFinal = i + 1;
        }

        // NUEVA REGLA ESTRICTA: Reemplazar cualquier cosa que NO sea un dígito (\d) o un guion (-) por vacío
        numDocFinal = String(numDocFinal).replace(/[^\d-]/g, '');

        // Regla final: Nunca debe ir vacío. Si al limpiarle las letras/puntos quedó vacío, le asignamos el correlativo
        filaLimpia['N° DOCUMENTO'] = numDocFinal === "" ? (i + 1) : numDocFinal;

        // Guardamos en la memoria total
        datosLimpiosFinales.push(filaLimpia);

        // Solo dibujamos hasta el límite en el HTML para evitar lag
        if (i < limitePreview) {
            const tr = document.createElement('tr');
            Object.values(filaLimpia).forEach(valor => {
                const td = document.createElement('td');
                td.innerText = valor;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    }
}

// 5. ENVIAR A PYTHON PARA DESCARGAR
async function generarZipTransformado() {
    if (datosLimpiosFinales.length === 0) return alert("No hay datos para procesar");

    const btn = document.querySelector('.btn-descarga-premium');
    btn.innerHTML = "Generando...";
    btn.disabled = true;

    // Nombre del archivo base solicitado
    const subActElement = document.getElementById('subActividadTransform');
    const nombreSubAct = subActElement.options[subActElement.selectedIndex].text;
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreBase = `${nombreSubAct}_${fechaActual}`;

    // Como ya limpiamos TODO en Javascript, solo le mandamos el JSON resultante al Backend
    // para que lo empaquete en un ZIP (Es mucho más eficiente).
    
    const formData = new FormData();
    formData.append('datos_limpios', JSON.stringify(datosLimpiosFinales));
    formData.append('nombre_base', nombreBase);

    try {
        const response = await fetch('/descargar_transformado', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Error generando el archivo");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nombreBase}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> DESCARGAR ZIP FINAL`;
        btn.disabled = false;
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


///////// GESTION DE ALMACEN //////////
async function agregarNuevaUnidad() {
    const nuevaUnidad = prompt("Ingrese el nombre de la nueva unidad de medida (ej. KILOS, LITROS):");
    
    if (!nuevaUnidad || nuevaUnidad.trim() === "") return; 

    const nombreUnidad = nuevaUnidad.trim().toUpperCase();
    const select = document.getElementById('sel-unidad-prod');

    // Comprobar si ya está visualmente en el select
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === nombreUnidad) {
            alert("Esta unidad ya existe en la lista.");
            select.value = nombreUnidad;
            return;
        }
    }

    try {
        // Enviar a Flask
        const response = await fetch('/almacen/api/unidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombreUnidad })
        });

        const data = await response.json();

        if (response.ok) {
            // Se guardó en la BD, la añadimos al desplegable
            const opcion = document.createElement('option');
            opcion.value = nombreUnidad;
            opcion.text = nombreUnidad;
            select.add(opcion);
            select.value = nombreUnidad; // Dejarla seleccionada
            
        } else {
            // Si el servidor (Flask) manda error, te lo muestra aquí:
            alert("No se pudo guardar: " + data.error);
        }
    } catch (error) {
        console.error("Error Fetch:", error);
        alert("Ocurrió un error al intentar comunicarse con el servidor.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/almacen/api/unidades');
        if (response.ok) {
            const unidades = await response.json();
            const select = document.getElementById('sel-unidad-prod');
            
            // Si la base de datos trae unidades, limpiamos el select y las metemos
            if (unidades.length > 0) {
                select.innerHTML = ''; // Limpiamos las opciones fijas (BIDÓN, CAJA...)
                
                unidades.forEach(u => {
                    const opcion = document.createElement('option');
                    opcion.value = u.nombre;
                    opcion.text = u.nombre;
                    select.add(opcion);
                });
            }
        }
    } catch (error) {
        console.error("Error al cargar las unidades de medida:", error);
    }
});

function duplicarCampos(btn) {
    const filaActual = btn.closest('tr');
    const tabla = btn.closest('table');
    const filasDeDatos = tabla.querySelectorAll('tbody tr:not(.alm-entry-row)');
    
    if (filasDeDatos.length > 0) {
        const ultimaFilaGuardada = filasDeDatos[0]; 
        const celdasGuardadas = ultimaFilaGuardada.cells;
        const inputsActuales = filaActual.querySelectorAll('.alm-input');

        if (tabla.closest('.alm-card').innerHTML.includes('Registro de Entradas')) {
            inputsActuales[0].value = celdasGuardadas[0].innerText.split('/').reverse().join('-'); 
            inputsActuales[1].value = celdasGuardadas[1].innerText.split('/').reverse().join('-');
            inputsActuales[2].value = celdasGuardadas[2].innerText;
            inputsActuales[3].value = celdasGuardadas[3].innerText;
            
            const selectProv = inputsActuales[6];
            Array.from(selectProv.options).forEach(opt => {
                if(opt.text === celdasGuardadas[7].innerText) selectProv.value = opt.value;
            });
        } else {
            inputsActuales[0].value = celdasGuardadas[0].innerText.split('/').reverse().join('-');
            const selectEmp = inputsActuales[4];
            Array.from(selectEmp.options).forEach(opt => {
                if(opt.text === celdasGuardadas[4].innerText) selectEmp.value = opt.value;
            });
            inputsActuales[5].value = celdasGuardadas[5].innerText; 
        }
    }
}

function toggleListadoProductos() {
    const btn = document.getElementById('btn-toggle-listado');
    const panel = document.getElementById('panel-listado-productos');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'table-row';
        btn.classList.add('open');
        document.getElementById('filtro-busqueda').focus();
    } else {
        panel.style.display = 'none';
        btn.classList.remove('open');
    }
}

function filtrarProductos() {
    const textoBuscado = document.getElementById('filtro-busqueda').value.toUpperCase();
    const catSeleccionada = document.getElementById('filtro-categoria-lista').value.toUpperCase();
    const filas = document.querySelectorAll('.fila-producto-item');

    filas.forEach(fila => {
        const codigo = fila.querySelector('.codigo-item').innerText.toUpperCase();
        const nombre = fila.querySelector('.nombre-item').innerText.toUpperCase();
        const categoria = fila.querySelector('.categoria-item').innerText.toUpperCase();

        const coincideTexto = codigo.includes(textoBuscado) || nombre.includes(textoBuscado);
        const coincideCat = (catSeleccionada === "TODOS") || (categoria === catSeleccionada);

        if (coincideTexto && coincideCat) {
            fila.style.display = ''; 
        } else {
            fila.style.display = 'none'; 
        }
    });
}

// ==================================================
// FUNCIONES CRUD Y MODO EDICIÓN
// ==================================================

function cargarDatosParaEditar(idProducto, idCat, codigo, nombre, unidad) {
    
    const btnGuardar = document.getElementById('btn-guardar-prod');
    btnGuardar.innerHTML = '<i class="fas fa-save"></i>';
    btnGuardar.classList.replace('alm-bg-green', 'alm-bg-accent');
    
    document.getElementById('btn-cancelar-edicion').style.display = 'inline-flex';

    document.getElementById('id-producto-editar').value = idProducto;
    $('#sel-cat-producto').val(idCat).trigger('change'); 
    document.getElementById('txt-codigo-generado').value = codigo; 
    document.getElementById('txt-nombre-prod').value = nombre;
    document.getElementById('sel-unidad-prod').value = unidad;
}

function cancelarEdicion() {
    
    const btnGuardar = document.getElementById('btn-guardar-prod');
    btnGuardar.innerHTML = '<i class="fas fa-plus"></i>';
    btnGuardar.classList.replace('alm-bg-accent', 'alm-bg-green');
    
    document.getElementById('btn-cancelar-edicion').style.display = 'none';

    document.getElementById('id-producto-editar').value = "";
    $('#sel-cat-producto').val("").trigger('change');
    document.getElementById('txt-codigo-generado').value = "";
    document.getElementById('txt-nombre-prod').value = "";
    document.getElementById('sel-unidad-prod').value = "UND";
}

function editarDesdeLista(idProducto, idCat, codigo, nombre, unidad) {
    cargarDatosParaEditar(idProducto, idCat, codigo, nombre, unidad);
    toggleListadoProductos();
    
    const formulario = document.getElementById('txt-nombre-prod');
    formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const filaEdicion = formulario.closest('tr');
    filaEdicion.style.backgroundColor = '#fef2f2'; 
    setTimeout(() => { filaEdicion.style.backgroundColor = 'var(--active-bg)'; }, 800);
}

function guardarCategoria() {
    const inputNombre = document.getElementById('txt-nueva-cat');
    const nombre = inputNombre.value.toUpperCase();

    fetch('/almacen/crear-categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_categoria: nombre })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert('Categoría creada exitosamente: ' + data.prefijo);
            // 1. Limpiamos la caja de texto
            inputNombre.value = '';
            // 2. ACTUALIZAMOS LOS DATOS SIN RECARGAR LA PÁGINA
            cargarDatosMaestros(); 
        } else {
            alert(data.message); 
        }
    });
}

function guardarProducto() {
    const idCat = document.getElementById('sel-cat-producto').value;
    const nombre = document.getElementById('txt-nombre-prod').value.toUpperCase();
    const unidad = document.getElementById('sel-unidad-prod').value;
    const idEdicion = document.getElementById('id-producto-editar').value; 

    const endpoint = idEdicion ? '/almacen/editar-producto' : '/almacen/crear-producto';
    const payload = { id_categoria: idCat, nombre_prod: nombre, unidad_medida: unidad };
    
    if (idEdicion) { payload.id_producto = idEdicion; }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) { return res.json().then(err => { throw err; }); }
        return res.json();
    })
    .then(data => {
        const mensaje = idEdicion ? 'Producto actualizado correctamente.' : ('Producto guardado correctamente. Código: ' + data.codigo);
        alert(mensaje);
        // 1. Limpiamos los campos y salimos del modo edición
        cancelarEdicion();
        // 2. ACTUALIZAMOS LA TABLA SIN RECARGAR LA PÁGINA
        cargarDatosMaestros();
    })
    .catch(err => {
        alert(err.message);
    });
}

function guardarProveedor() {
    const idEdicion = document.getElementById('id-proveedor-editar').value;
    const endpoint = idEdicion ? '/almacen/editar-proveedor' : '/almacen/crear-proveedor';

    const payload = {
        ruc: document.getElementById('prov-ruc').value,
        razon_social: document.getElementById('prov-razon').value,
        nombre_comercial: document.getElementById('prov-comercial').value,
        celular: document.getElementById('prov-celular').value,
        correo: document.getElementById('prov-correo').value,
        direccion: document.getElementById('prov-dir').value
    };

    if (idEdicion) { payload.id_proveedor = idEdicion; }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) { return res.json().then(err => { throw err; }); }
        return res.json();
    })
    .then(data => {
        const mensaje = idEdicion ? 'Proveedor actualizado correctamente.' : 'Proveedor guardado correctamente.';
        alert(mensaje);
        cancelarEdicionProveedor(); // Limpia campos visualmente
        cargarDatosMaestros();      // Actualiza las tablas por detrás
    })
    .catch(err => {
        alert(err.message);
    });
}

// CARGA DE DATOS ASÍNCRONA VÍA AJAX
function cargarDatosMaestros() {
    fetch('/almacen/api/listar-datos')
        .then(res => {
            // 🛡️ ESCUDO PROTECTOR: Si el servidor falla (Error 500, 404, etc.)
            if (!res.ok) {
                throw new Error(`Error del servidor: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data.categorias) throw new Error("El servidor no envió las categorías");
            window.productosData = data.productos;
            window.historicoEntradas = data.entradas;
            window.historicoSalidas = data.salidas;
            window.empleadosData = data.empleados;
            window.lotesData = data.lotes_disponibles;
            
            const selectCrear = document.getElementById('sel-cat-producto');
            const selectFiltro = document.getElementById('filtro-categoria-lista');
            
            // IMPORTANTE: Limpiar los options antes de llenarlos para que no se dupliquen
            selectCrear.innerHTML = '<option value="">Seleccione Categoría...</option>';
            selectFiltro.innerHTML = '<option value="TODOS">Todas las Categorías</option>';
            
            data.categorias.forEach(cat => {
                selectCrear.add(new Option(cat.texto_select, cat.id));
                selectFiltro.add(new Option(cat.nombre, cat.nombre));
            });

            // --- Cargar tabla de PRODUCTOS ---
            const tbodyProductos = document.getElementById('body-tabla-productos');
            if(!tbodyProductos) return; 
            
            tbodyProductos.innerHTML = ''; 

            if (data.productos.length === 0) {
                // Cambiamos a colspan="6" porque ahora hay 6 columnas
                tbodyProductos.innerHTML = `<tr><td colspan="6" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay productos registrados aún.</td></tr>`;
                return;
            }

            data.productos.forEach(p => {
                
                const filaHTML = `
                    <tr class="fila-producto-item">
                        <td><span class="alm-badge alm-badge-outline codigo-item">${p.codigo}</span></td>
                        <td class="alm-bold nombre-item" style="color: #475569;">${p.nombre}</td>
                        <td class="categoria-item">${p.categoria_nombre}</td>
                        <td>${p.unidad}</td>
                        <td class="alm-text-center"> <div class="alm-action-group">
                                <button type="button" class="alm-icon-btn" title="Editar Producto" 
                                    onclick="editarDesdeLista('${p.id_producto}', '${p.id_categoria}', '${p.codigo}', '${p.nombre}', '${p.unidad}')">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbodyProductos.insertAdjacentHTML('beforeend', filaHTML);
            });
            
            $('#sel-cat-producto').trigger('change');

            // --- Cargar tabla de PROVEEDORES ---
            const tbodyProveedores = document.getElementById('body-tabla-proveedores');
            if(tbodyProveedores) {
                tbodyProveedores.innerHTML = '';
                
                if (data.proveedores.length === 0) {
                    tbodyProveedores.innerHTML = `<tr><td colspan="7" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay proveedores registrados aún.</td></tr>`;
                } else {
                    data.proveedores.forEach(pr => {
                        // Determinar si es inactivo
                        const estado = pr.estado || 'ACTIVO';
                        const esInactivo = (estado === 'INACTIVO');
                        
                        // Estilos visuales para inactivos (Fila opaca y etiqueta roja)
                        const rowStyle = esInactivo ? 'background-color: #f8fafc; opacity: 0.65;' : '';
                        const badge = esInactivo ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px; font-weight: bold;">INACTIVO</span>' : '';
                        
                        // Si es inactivo, solo mostramos el botón de Reactivar. Si es activo, Editar e Inactivar.
                        let botones = '';
                        if (esInactivo) {
                            botones = `
                                <button type="button" class="alm-icon-btn" title="Reactivar Proveedor" style="color: #10b981;"
                                    onclick="reactivarProveedor('${pr.id_proveedor}', '${pr.razon_social.replace(/'/g, "&#39;")}')">
                                    <i class="fas fa-undo"></i>
                                </button>
                            `;
                        } else {
                            botones = `
                                <button type="button" class="alm-icon-btn" title="Editar Proveedor" 
                                    onclick="editarDesdeListaProveedor('${pr.id_proveedor}', '${pr.ruc}', '${pr.razon_social.replace(/'/g, "&#39;")}', '${pr.nombre_comercial.replace(/'/g, "&#39;")}', '${pr.celular}', '${pr.correo}', '${pr.direccion}')">
                                    <i class="fas fa-pencil-alt"></i>
                                </button>
                                <button type="button" class="alm-icon-btn" title="Inactivar Proveedor" style="color: #ef4444;"
                                    onclick="eliminarProveedor('${pr.id_proveedor}', '${pr.razon_social.replace(/'/g, "&#39;")}')">
                                    <i class="fas fa-ban"></i>
                                </button>
                            `;
                        }

                        // Atributo data-estado añadido al <tr> para usarlo en el filtro
                        const filaHTML = `
                            <tr class="fila-proveedor-item" data-estado="${estado}" style="${rowStyle}">
                                <td class="alm-bold prov-ruc-item">${pr.ruc}</td>
                                <td class="prov-razon-item" style="color: #475569;">${pr.razon_social} ${badge}</td>
                                <td>${pr.nombre_comercial}</td>
                                <td>${pr.celular}</td>
                                <td>${pr.correo}</td>
                                <td>${pr.direccion}</td>
                                <td class="alm-text-center">
                                    <div class="alm-action-group">
                                        ${botones}
                                    </div>
                                </td>
                            </tr>
                        `;
                        tbodyProveedores.insertAdjacentHTML('beforeend', filaHTML);
                    });

                    // DESPUÉS DE DIBUJAR, EJECUTAMOS EL FILTRO PARA OCULTAR LOS INACTIVOS POR DEFECTO
                    filtrarProveedores();
                }
            }

            // --- LLENAR SELECTS DEL INVENTARIO ---
            const invSelProducto = document.getElementById('inv-sel-producto');
            const invSelProv = document.getElementById('inv-sel-proveedor');
            const invSelCat = document.getElementById('inv-sel-categoria');

            if(invSelProducto) {
                invSelProducto.innerHTML = '<option value="">Buscar producto...</option>';
                data.productos.forEach(p => invSelProducto.add(new Option(p.nombre, p.id_producto)));
            }

            if(invSelProv) {
                invSelProv.innerHTML = '<option value="">Buscar proveedor...</option>';
                data.proveedores.forEach(pr => invSelProv.add(new Option(pr.razon_social, pr.id_proveedor)));
            }

            if(invSelCat) {
                invSelCat.innerHTML = '<option value="">Buscar categoría...</option>';
                data.categorias.forEach(c => invSelCat.add(new Option(c.nombre, c.id)));
            }

            // --- LLENAR LA TABLA INTERACTIVA DE INVENTARIO ---
            const tbodyInventario = document.getElementById('body-tabla-inventario');
            if(tbodyInventario) {
                tbodyInventario.innerHTML = '';

                let sumaPrecio = 0;
                let sumaTotal = 0;
                
                if (!data.inventario_fisico || data.inventario_fisico.length === 0) {
                    tbodyInventario.innerHTML = `<tr><td colspan="13" class="alm-text-center" style="color: #94a3b8; padding: 40px;">No hay movimientos de ingreso registrados.</td></tr>`;
                } else {
                    data.inventario_fisico.forEach(m => {
                        const idMov = m.id_movimiento; 
                        
                        // Hacemos el cálculo matemático puro
                        const totalMatematico = m.cantidad * m.precio_igv;

                        // Sumamos a los totales globales
                        sumaPrecio += parseFloat(m.precio_igv) || 0;
                        sumaTotal += totalMatematico;

                        const stockActual = parseFloat(m.cantidad) || 0;
                        
                        let atributoValue = '';
                        let atributoDisabled = ''; 
                        let estiloInput = 'width: 80px; text-align: center; border-color: #0ea5e9; font-weight: bold; background-color: #ffffff;'; 
                        let textoDif = '-';
                        let colorDif = '#94a3b8'; 

                        if (m.conteo_fisico !== "") {
                            const conteoNum = parseFloat(m.conteo_fisico);
                            atributoValue = `value="${conteoNum}"`;
                            
                            atributoDisabled = 'disabled';
                            estiloInput = 'width: 80px; text-align: center; border-color: transparent; font-weight: bold; background-color: #f1f5f9;';
                            
                            const dif = conteoNum - stockActual;
                            textoDif = dif >= 0 ? `+${dif}` : dif;
                            
                            if (dif > 0) colorDif = '#10b981'; 
                            else if (dif < 0) colorDif = '#ef4444'; 
                            else colorDif = '#f59e0b'; 
                        }

                        tbodyInventario.insertAdjacentHTML('beforeend', `
                            <tr class="fila-inv-item">
                                <td class="alm-bold">${m.fecha_ingreso}</td>
                                <td><span class="alm-badge alm-badge-outline inv-codigo-item">${m.codigo}</span></td>
                                <td class="inv-nombre-item" style="color: #475569; font-weight: 600;">${m.nombre}</td>
                                
                                <td style="color: #8b5cf6; font-weight: bold; text-align: center;">${m.talla}</td>
                                
                                <td>${m.proveedor}</td>
                                <td>${m.categoria}</td>
                                <td>${m.unidad}</td>
                                <td class="alm-bold" id="stock-${idMov}">${m.cantidad}</td>
                                
                                <td>${formatearMoneda(m.precio_igv)}</td>
                                <td style="color: #0369a1; font-weight: bold;">${formatearMoneda(totalMatematico)}</td>
                                
                                <td>
                                    <input type="number" id="conteo-${idMov}" class="alm-input" ${atributoValue} ${atributoDisabled} placeholder="-" 
                                        style="${estiloInput}"
                                        onkeyup="calcularDiferenciaInline('${idMov}')" 
                                        onchange="guardarConteoInline('${idMov}')">
                                </td>
                                
                                <td><span id="dif-${idMov}" style="font-weight: bold; font-size: 1.1rem; color: ${colorDif};">${textoDif}</span></td>
                                
                                <td class="alm-text-center">
                                    <div class="alm-action-group" style="min-width: 40px;">
                                        <button type="button" id="btn-edit-${idMov}" class="alm-icon-btn" title="Editar" 
                                            onclick="habilitarEdicionConteo('${idMov}')">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>
                                        <span id="status-${idMov}" style="font-size: 1rem; color: #10b981; display: none;">
                                            <i class="fas fa-check-circle"></i>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        `);
                    });
                }
                
                // 🚨 APLICAMOS EL FORMATO A LOS TOTALES GENERALES DEL FOOTER
                const elSumaPrecio = document.getElementById('inv-total-precio');
                const elSumaTotal = document.getElementById('inv-total-general');
                
                if(elSumaPrecio) elSumaPrecio.innerText = `S/ ${formatearMoneda(sumaPrecio)}`;
                if(elSumaTotal) elSumaTotal.innerText = `S/ ${formatearMoneda(sumaTotal)}`;
            }

            const entSelProducto = document.getElementById('ent-sel-producto');
            const entSelProv = document.getElementById('ent-sel-proveedor');
            
            if(entSelProducto) {
                entSelProducto.innerHTML = '<option value="">Buscar producto...</option>';
                data.productos.forEach(p => entSelProducto.add(new Option(p.nombre, p.id_producto)));
            }
            if(entSelProv) {
                entSelProv.innerHTML = '<option value="">Buscar proveedor...</option>';
                data.proveedores.forEach(pr => entSelProv.add(new Option(pr.razon_social, pr.id_proveedor)));
            }

            // PINTAR HISTORIAL DE ENTRADAS
            const tbodyEntradas = document.getElementById('body-tabla-entradas');
            if(tbodyEntradas && data.entradas) {
                tbodyEntradas.innerHTML = '';
                
                // Aseguramos el colspan de 13 para el mensaje de vacío
                if(data.entradas.length === 0) {
                    tbodyEntradas.innerHTML = `<tr><td colspan="13" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay entradas registradas.</td></tr>`;
                } else {
                    data.entradas.forEach(e => {
                        const precioFormateado = e.precio ? parseFloat(e.precio).toFixed(2) : '0.00';
                        
                        tbodyEntradas.insertAdjacentHTML('beforeend', `
                            <tr>
                                <td>${e.fecha_fac}</td> <td>${e.fecha_ing}</td>
                                <td>${e.factura}</td>
                                <td>${e.guia}</td>
                                <td><span class="alm-badge alm-badge-outline">${e.codigo}</span></td>
                                <td style="color: #475569; font-weight: 600;">${e.producto}</td>
                                
                                <td style="color: #8b5cf6; font-weight: bold; text-align: center;">${e.talla ? e.talla : '-'}</td>
                                
                                <td style="font-size: 0.85rem; color: #475569;">${e.empleado_recupero ? e.empleado_recupero : '-'}</td>
                                
                                <td class="alm-text-green alm-bold">+${e.cantidad}</td>
                                <td class="alm-bold">S/ ${precioFormateado}</td>
                                <td>${e.proveedor}</td>
                                <td>${e.obs}</td>
                                <td class="alm-text-center">
                                    <button type="button" class="alm-icon-btn" style="color: #ef4444;" title="Eliminar Movimiento" onclick="eliminarMovimientoBd(${e.id_mov})">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                }
            }

            // 1. Llenar Select de Productos para Salidas
            const salSelProducto = document.getElementById('sal-sel-producto');
            if(salSelProducto && data.lotes_disponibles) {
                salSelProducto.innerHTML = '<option value="">Buscar producto (Nombre - Prov - Fecha)...</option>';
                
                data.lotes_disponibles.forEach(lote => {
                    // 1. Separamos la talla en dos versiones
                    const textoTallaPlano = lote.talla && lote.talla !== '-' ? ` | TALLA: ${lote.talla}` : '';
                    const textoTallaHtml = lote.talla && lote.talla !== '-' ? ` | <b>TALLA:</b> ${lote.talla}` : '';
                    
                    // 2. A. Texto PLANO (usa obligatoriamente 'textoTallaPlano')
                    const textoPlano = `${lote.nombre}${textoTallaPlano} | PROV: ${lote.proveedor} | INGRESÓ: ${lote.fecha_ingreso} | STOCK: ${lote.stock_restante}`;
                    
                    // 2. B. Texto HTML (usa obligatoriamente 'textoTallaHtml')
                    const textoHtml = `<span>${lote.nombre}${textoTallaHtml} | <b>PROV:</b> ${lote.proveedor} | <b>INGRESÓ:</b> ${lote.fecha_ingreso} | <b>STOCK:</b> ${lote.stock_restante}</span>`;
                    
                    // C. Crear la opción insertando la magia en el 'data-html'
                    const option = document.createElement('option');
                    option.value = lote.id_lote;
                    option.text = textoPlano; 
                    option.setAttribute('data-html', textoHtml);
                    
                    salSelProducto.appendChild(option);
                });
            }
            // 2. Llenar Select de Empleados (Buscador por nombres)
            const salSelEmpleado = document.getElementById('sal-sel-empleado');
            if(salSelEmpleado && data.empleados) {
                salSelEmpleado.innerHTML = '<option value="">Buscar empleado...</option>';
                data.empleados.forEach(emp => {
                    salSelEmpleado.add(new Option(emp.nombres, emp.id_empleado));
                });
            }

            // 3. Pintar Historial de Salidas
            const tbodySalidas = document.getElementById('body-tabla-salidas');
            if(tbodySalidas && data.salidas) {
                tbodySalidas.innerHTML = ''; // Limpiamos
                
                if(data.salidas.length === 0) {
                    tbodySalidas.innerHTML = `<tr><td colspan="8" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay salidas registradas.</td></tr>`;
                } else {
                    data.salidas.forEach(s => {
                        // MODIFICACIÓN AQUÍ: Añadimos el botón de eliminar a la columna de acción
                        tbodySalidas.insertAdjacentHTML('beforeend', `
                            <tr>
                                <td>${s.fecha_salida}</td>
                                <td class="alm-text-red alm-bold">-${s.cantidad}</td>
                                <td><span class="alm-badge alm-badge-outline">${s.codigo}</span></td>
                                <td style="color: #475569; font-weight: 600;">${s.producto}</td>
                                <td>${s.empleado}</td>
                                <td>${s.area}</td>
                                <td>${s.obs}</td>
                                <td class="alm-text-center">
                                    <div class="alm-action-group">
                                        <a href="#" class="alm-icon-btn" title="Ver Adjunto"><i class="fas fa-paperclip"></i></a>
                                        <button type="button" class="alm-icon-btn" style="color: #ef4444;" title="Eliminar Movimiento" onclick="eliminarMovimientoBd(${s.id_mov})">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `);
                    });
                }
            }

            // Llenar empleados para recupero en Entradas
            const entSelEmpleadoRec = document.getElementById('ent-sel-empleado-recupero');
            if(entSelEmpleadoRec && data.empleados) {
                entSelEmpleadoRec.innerHTML = '<option value="">- No aplica -</option>';
                data.empleados.forEach(emp => {
                    entSelEmpleadoRec.add(new Option(emp.nombres, emp.id_empleado));
                });
            }
        })
        .catch(error => {
            console.error("Error cargando los datos:", error);
            const tbodyProductos = document.getElementById('body-tabla-productos');
            if(tbodyProductos) {
                tbodyProductos.innerHTML = `<tr><td colspan="6" class="alm-text-center" style="color: #ef4444; padding: 20px;">Error al cargar los datos.</td></tr>`;
            }
        });
}

// Variables globales para la tabla de Inventario Físico
let invSortCol = -1;
let invSortAsc = true;

function ordenarTablaInventario(colIndex, tipoDato) {
    const tbody = document.getElementById('body-tabla-inventario');
    
    // Usamos la clase específica para evitar intentar ordenar la fila de "Cargando..." o "Vacío"
    const filas = Array.from(tbody.querySelectorAll('tr.fila-inv-item'));
    
    if (filas.length === 0) return;

    // Determinar la dirección del orden
    if (invSortCol === colIndex) {
        invSortAsc = !invSortAsc;
    } else {
        invSortAsc = true;
        invSortCol = colIndex;
    }

    // Actualizar los iconos (triangulitos)
    const iconos = document.querySelectorAll('.inv-sort-icon');
    iconos.forEach((icono, index) => {
        if (index === colIndex) {
            icono.className = invSortAsc ? 'fas fa-caret-down inv-sort-icon' : 'fas fa-caret-up inv-sort-icon';
            icono.style.color = '#0ea5e9'; 
        } else {
            icono.className = 'fas fa-sort inv-sort-icon';
            icono.style.color = '#94a3b8';
        }
    });

    // Ordenar las filas
    filas.sort((a, b) => {
        let valA, valB;

        // 🚨 CASO ESPECIAL: Si es el Conteo Físico, leemos el <input>
        if (tipoDato === 'input-numero') {
            const inputA = a.cells[colIndex].querySelector('input');
            const inputB = b.cells[colIndex].querySelector('input');
            
            // Si el input está vacío, le damos un valor muy bajo para que se vaya al fondo
            valA = (inputA && inputA.value !== "") ? parseFloat(inputA.value) : -999999;
            valB = (inputB && inputB.value !== "") ? parseFloat(inputB.value) : -999999;
        } else {
            valA = a.cells[colIndex].innerText.trim();
            valB = b.cells[colIndex].innerText.trim();
        }

        // Lógica de conversión según el tipo de dato
        if (tipoDato === 'fecha') {
            const parsearFecha = (str) => {
                if (!str || str === '-') return 0;
                const partes = str.split('-');
                if (partes.length === 3) return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
                return 0;
            };
            valA = parsearFecha(valA);
            valB = parsearFecha(valB);
            
        } else if (tipoDato === 'numero') {
            // Limpia todo menos números, puntos y signo negativo real
            valA = parseFloat(valA.replace(/[^+0-9.-]+/g, "")) || 0;
            valB = parseFloat(valB.replace(/[^+0-9.-]+/g, "")) || 0;
            
        } else if (tipoDato !== 'input-numero') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        // Comparar
        if (valA === valB) return 0;
        let comparacion = valA > valB ? 1 : -1;
        
        return invSortAsc ? comparacion : -comparacion;
    });

    // Reinyectar ordenado
    filas.forEach(fila => tbody.appendChild(fila));
}

// Variable global para recordar si estamos en orden ascendente o descendente en SALIDAS
let ordenSalidaDescendente = true; 

function ordenarPorFechaSalida() {
    const tbody = document.getElementById('body-tabla-salidas');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    // Si la tabla está vacía o tiene el mensaje de "No hay salidas", no hacemos nada
    if (filas.length === 0 || (filas.length === 1 && filas[0].cells.length === 1)) return;

    // Invertimos el orden actual
    ordenSalidaDescendente = !ordenSalidaDescendente;
    
    // Cambiamos el triangulito visualmente
    const icono = document.getElementById('icono-sort-salida');
    if (icono) {
        icono.className = ordenSalidaDescendente ? 'fas fa-caret-down' : 'fas fa-caret-up';
        icono.style.color = '#0ea5e9'; 
    }

    // Ordenamos las filas
    filas.sort((a, b) => {
        // La fecha de salida está en la primera columna (índice 0)
        const textoA = a.cells[0].innerText.trim();
        const textoB = b.cells[0].innerText.trim();
        
        // Función interna para convertir "DD-MM-YYYY" a milisegundos
        const parsearFecha = (fechaStr) => {
            if (!fechaStr || fechaStr === '-') return 0;
            const partes = fechaStr.split('-');
            if (partes.length === 3) {
                // Formato: año, mes (base 0), día
                return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
            }
            return 0;
        };

        const valorA = parsearFecha(textoA);
        const valorB = parsearFecha(textoB);

        if (valorA === valorB) return 0;
        
        if (ordenSalidaDescendente) {
            return valorA < valorB ? 1 : -1; // Más recientes primero
        } else {
            return valorA > valorB ? 1 : -1; // Más antiguos primero
        }
    });

    // Reinsertamos las filas ya ordenadas
    filas.forEach(fila => tbody.appendChild(fila));
}

function filtrarProveedores() {
    const textoBuscado = document.getElementById('filtro-busqueda-prov').value.toUpperCase();
    const mostrarInactivos = document.getElementById('chk-mostrar-inactivos').checked;
    const filas = document.querySelectorAll('.fila-proveedor-item');

    filas.forEach(fila => {
        const ruc = fila.querySelector('.prov-ruc-item').innerText.toUpperCase();
        const razon = fila.querySelector('.prov-razon-item').innerText.toUpperCase();
        const estado = fila.getAttribute('data-estado');

        // Validaciones
        const coincideTexto = ruc.includes(textoBuscado) || razon.includes(textoBuscado);
        const coincideEstado = mostrarInactivos ? true : (estado === 'ACTIVO');

        if (coincideTexto && coincideEstado) {
            fila.style.display = ''; 
        } else {
            fila.style.display = 'none'; 
        }
    });
}

// Función para formatear números a moneda (Ej: 108988.39 -> 108,988.39)
const formatearMoneda = (numero) => {
    return parseFloat(numero).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};


// ==================================================
// LÓGICA INTERACTIVA DEL INVENTARIO FÍSICO
// ==================================================
function calcularDiferenciaInline(idMov) { // Cambiamos idProducto por idMov para que coincida con el HTML
    // Buscamos los elementos usando el ID único del movimiento (lote)
    const inputConteo = document.getElementById(`conteo-${idMov}`);
    const spanDiferencia = document.getElementById(`dif-${idMov}`);
    
    // Obtenemos el stock RESTANTE del HTML (que ya viene actualizado del backend)
    const stockActual = parseFloat(document.getElementById(`stock-${idMov}`).innerText) || 0;
    
    // Si la caja está vacía, reiniciamos visualmente
    if (inputConteo.value === "") {
        spanDiferencia.innerText = "-"; // Volvemos al estado inicial
        spanDiferencia.style.color = '#94a3b8';
        return;
    }

    const conteo = parseFloat(inputConteo.value) || 0;
    const diferencia = conteo - stockActual;

    // Formateamos la diferencia: si es positiva, agregamos el signo '+'
    spanDiferencia.innerText = diferencia >= 0 ? `+${diferencia}` : diferencia;

    // Colores dinámicos
    if (diferencia > 0) {
        spanDiferencia.style.color = '#10b981'; // Verde (Sobra)
    } else if (diferencia < 0) {
        spanDiferencia.style.color = '#ef4444'; // Rojo (Falta)
    } else {
        spanDiferencia.style.color = '#f59e0b'; // Naranja (Exacto/Cuadrado)
    }
}


function guardarConteoInline(idMov) {
    const inputConteo = document.getElementById(`conteo-${idMov}`);
    const valor = inputConteo.value;

    if (valor === "") return;

    // 🚨 CORRECCIÓN AQUÍ: Los IDs deben coincidir exactamente con el HTML
    const statusIcon = document.getElementById(`status-${idMov}`);
    const btnEdit = document.getElementById(`btn-edit-${idMov}`);
    
    // Bloquear visualmente el input
    inputConteo.disabled = true; 
    inputConteo.style.backgroundColor = '#f1f5f9'; // Fondo gris claro
    inputConteo.style.borderColor = 'transparent';
    
    // Ocultar el lápiz temporalmente
    if (btnEdit) btnEdit.style.display = 'none';

    // Petición AJAX
    fetch('/almacen/guardar-conteo-fisico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: idMov, conteo_fisico: valor }) 
        // Nota: Enviamos idMov bajo la llave 'id_producto' porque así lo configuramos en Python
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            // Mostrar check verde de éxito
            if (statusIcon) statusIcon.style.display = 'inline-block';
            
            // Después de 2 segundos, quitar el check verde y regresar el lápiz
            setTimeout(() => {
                if (statusIcon) statusIcon.style.display = 'none';
                if (btnEdit) btnEdit.style.display = 'inline-block';
            }, 2000);
        } else {
            alert(data.message);
            inputConteo.disabled = false;
            if (btnEdit) btnEdit.style.display = 'inline-block';
        }
    })
    .catch(error => {
        console.error("Error al guardar conteo:", error);
        inputConteo.disabled = false;
        if (btnEdit) btnEdit.style.display = 'inline-block';
    });
}

function habilitarEdicionConteo(idProducto) {
    const inputConteo = document.getElementById(`conteo-${idProducto}`);
    
    // Desbloquear input
    inputConteo.disabled = false;
    inputConteo.style.backgroundColor = '#ffffff';
    inputConteo.style.borderColor = '#0ea5e9'; // Borde azul indicando que está activo
    
    // Poner el cursor de escritura automáticamente adentro
    inputConteo.focus();
    
    // Seleccionar todo el número que haya adentro para borrarlo rápido si escribe
    inputConteo.select();
}


// ==================================================
// FUNCIONALIDAD PARA PROVEEDORES
// ==================================================

function toggleListadoProveedores() {
    const btn = document.getElementById('btn-toggle-listado-prov');
    const panel = document.getElementById('panel-listado-proveedores');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'table-row';
        btn.classList.add('open');
        document.getElementById('filtro-busqueda-prov').focus();
    } else {
        panel.style.display = 'none';
        btn.classList.remove('open');
    }
}

// 🚨 ESTA DEBE SER LA ÚNICA FUNCIÓN "filtrarProveedores" EN TODO TU ARCHIVO
function filtrarProveedores() {
    const textoBuscado = document.getElementById('filtro-busqueda-prov').value.toUpperCase();
    
    // Verificamos si el checkbox existe para evitar errores si aún no lo agregaste al HTML
    const chkInactivos = document.getElementById('chk-mostrar-inactivos');
    const mostrarInactivos = chkInactivos ? chkInactivos.checked : false;
    
    const filas = document.querySelectorAll('.fila-proveedor-item');

    filas.forEach(fila => {
        const ruc = fila.querySelector('.prov-ruc-item').innerText.toUpperCase();
        const razon = fila.querySelector('.prov-razon-item').innerText.toUpperCase();
        const estado = fila.getAttribute('data-estado');

        // Validaciones
        const coincideTexto = ruc.includes(textoBuscado) || razon.includes(textoBuscado);
        const coincideEstado = mostrarInactivos ? true : (estado === 'ACTIVO');

        if (coincideTexto && coincideEstado) {
            fila.style.display = ''; 
        } else {
            fila.style.display = 'none'; 
        }
    });
}

// 🚨 ESTA DEBE SER LA ÚNICA FUNCIÓN "eliminarProveedor" EN TODO TU ARCHIVO
function eliminarProveedor(id, razonSocial) {
    if (!confirm(`¿Deseas pasar a INACTIVO al proveedor "${razonSocial}"?\nYa no aparecerá en las opciones de almacén.`)) return;

    fetch('/almacen/eliminar-proveedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proveedor: id })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) throw new Error(data.error);
        cargarDatosMaestros();
        const idEdicion = document.getElementById('id-proveedor-editar').value;
        if (idEdicion == id) cancelarEdicionProveedor();
    })
    .catch(err => alert('Error: ' + err.message));
}

function reactivarProveedor(id, razonSocial) {
    if (!confirm(`¿Deseas REACTIVAR al proveedor "${razonSocial}"?`)) return;

    fetch('/almacen/reactivar-proveedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proveedor: id })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) throw new Error(data.error);
        cargarDatosMaestros();
    })
    .catch(err => alert('Error: ' + err.message));
}

function cargarDatosParaEditarProveedor(id, ruc, razon, comercial, celular, correo, dir) {
    const btnGuardar = document.getElementById('btn-guardar-prov');
    btnGuardar.innerHTML = '<i class="fas fa-save"></i>';
    document.getElementById('btn-cancelar-edicion-prov').style.display = 'inline-flex';

    document.getElementById('id-proveedor-editar').value = id;
    document.getElementById('prov-ruc').value = ruc;
    document.getElementById('prov-razon').value = razon;
    document.getElementById('prov-comercial').value = comercial;
    document.getElementById('prov-celular').value = celular;
    document.getElementById('prov-correo').value = correo;
    document.getElementById('prov-dir').value = dir;
}

function cancelarEdicionProveedor() {
    const btnGuardar = document.getElementById('btn-guardar-prov');
    btnGuardar.innerHTML = '<i class="fas fa-plus"></i>';
    document.getElementById('btn-cancelar-edicion-prov').style.display = 'none';

    document.getElementById('id-proveedor-editar').value = "";
    document.getElementById('prov-ruc').value = "";
    document.getElementById('prov-razon').value = "";
    document.getElementById('prov-comercial').value = "";
    document.getElementById('prov-celular').value = "";
    document.getElementById('prov-correo').value = "";
    document.getElementById('prov-dir').value = "";
}

function editarDesdeListaProveedor(id, ruc, razon, comercial, celular, correo, dir) {
    cargarDatosParaEditarProveedor(id, ruc, razon, comercial, celular, correo, dir);
    toggleListadoProveedores();
    
    const formulario = document.getElementById('prov-ruc');
    formulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const filaEdicion = formulario.closest('tr');
    filaEdicion.style.backgroundColor = '#fef2f2';
    setTimeout(() => { filaEdicion.style.backgroundColor = '#fffbeb'; }, 800);
}


// Variable global para guardar los datos y consultarlos rápido sin saturar la red
window.productosData = [];
document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. MANEJO DE VISTAS (Pestañas principales y subpestañas)
    // ==========================================
    const mainTabs = document.querySelectorAll('#almacen .alm-main-tab');
    const views = document.querySelectorAll('#almacen .alm-view-content');

    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            mainTabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => { v.classList.remove('active'); v.style.display = 'none'; });
            
            tab.classList.add('active');
            const targetView = document.getElementById(tab.getAttribute('data-view'));
            targetView.style.display = 'block';
            setTimeout(() => { targetView.classList.add('active'); }, 10);
        });
    });

    const subTabs = document.querySelectorAll('#almacen .alm-sub-tab');
    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    const activeTabId = sessionStorage.getItem('activeAlmacenTab');
    if (activeTabId) {
        const tabToActivate = document.querySelector(`[data-view="${activeTabId}"]`);
        if (tabToActivate) { tabToActivate.click(); }
        sessionStorage.removeItem('activeAlmacenTab'); 
    }

    // ==========================================
    // 2. INICIALIZAR CATÁLOGOS MAESTROS (Categorías y Productos)
    // ==========================================
    $('#sel-cat-producto').select2({
        placeholder: "Buscar categoría...",
        allowClear: true,
        width: '100%'
    });

    $('#sel-cat-producto').on('change', function() {
        const idCat = $(this).val();
        const inputCodigo = document.getElementById('txt-codigo-generado');
        const idEdicion = document.getElementById('id-producto-editar').value;
        
        if (!idCat) {
            inputCodigo.value = "";
            return;
        }

        if (idEdicion !== "") { return; }

        fetch(`/almacen/siguiente-codigo/${idCat}`)
            .then(res => res.json())
            .then(data => {
                if(data.success) { inputCodigo.value = data.codigo; }
            });
    });

    $('#ent-sel-producto, #ent-sel-proveedor, #ent-sel-empleado-recupero').select2({
        placeholder: "Buscar...",
        allowClear: true,
        width: '100%'
    });

    // ==========================================
    // 3. INICIALIZAR MÓDULO DE ENTRADAS
    // ==========================================
    $('#ent-sel-producto, #ent-sel-proveedor').select2({
        placeholder: "Buscar...",
        allowClear: true,
        width: '100%'
    });

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('ent-fecha-fac').value = hoy;
    document.getElementById('ent-fecha-ing').value = hoy;

    // 🚨 CORRECCIÓN: DELEGACIÓN DE EVENTOS PARA EVITAR EL BLOQUEO ZOMBIE
    $(document).on('change', '#ent-sel-producto', function() {
        const idProd = $(this).val();
        const inputTalla = document.getElementById('ent-talla');
        
        if (!idProd) {
            document.getElementById('ent-codigo').value = '';
            // Reset al estado bloqueado
            inputTalla.disabled = true;
            inputTalla.value = '';
            inputTalla.placeholder = '-';
            inputTalla.style.backgroundColor = '#cbd5e1';
            inputTalla.style.borderColor = 'transparent';
            return;
        }
        
        const prod = window.productosData.find(p => p.id_producto == idProd);
        if (prod) { 
            document.getElementById('ent-codigo').value = prod.codigo; 
            
            // Verificamos de forma segura si la propiedad existe
            const categoria = (prod.categoria_nombre || '').toUpperCase();
            
            if (categoria.includes('UNIFORME') || categoria.includes('ROPA')) {
                // 🔓 DESBLOQUEAR
                inputTalla.disabled = false;
                inputTalla.placeholder = "S, M...";
                inputTalla.style.backgroundColor = "#f5f3ff";
                inputTalla.style.borderColor = "#8b5cf6";
                inputTalla.focus();
            } else {
                // 🔒 BLOQUEAR
                inputTalla.disabled = true;
                inputTalla.value = '';
                inputTalla.placeholder = '-';
                inputTalla.style.backgroundColor = '#cbd5e1';
                inputTalla.style.borderColor = 'transparent';
            }
        }
    });

    // 🚨 EL EVENTO MÁGICO DEL RECUPERO Y DEVOLUCIÓN DINEÁMICO 🚨
    $(document).on('change', '#ent-sel-proveedor', function() {
        const provTexto = $(this).find("option:selected").text().toUpperCase();
        const esRecupero = provTexto.includes('RECUPERO') || provTexto.includes('DEVOLUCION');
        
        // 🚨 NUEVA VERIFICACIÓN: Identificamos si es específicamente una Devolución
        const esDevolucion = provTexto.includes('DEVOLUCION');
        
        const inFactura = document.getElementById('ent-factura');
        const inGuia = document.getElementById('ent-guia');
        const inPrecio = document.getElementById('ent-precio');
        const selEmpleado = $('#ent-sel-empleado-recupero'); 

        if (esRecupero) {
            // 🚨 CONFIGURACIÓN DINÁMICA: Asignamos prefijos y guías según el caso
            const prefijo = esDevolucion ? 'DEV-' : 'REC-';
            const textoGuia = esDevolucion ? 'DEVOLUCION' : 'RECUPERO';

            // 🔒 BLOQUEAR COMPRAS CON DATOS AUTOGENERADOS
            inFactura.value = prefijo + Date.now().toString().slice(-6); 
            inFactura.disabled = true;
            inFactura.style.backgroundColor = '#e2e8f0';
            
            inGuia.value = textoGuia;
            inGuia.disabled = true;
            inGuia.style.backgroundColor = '#e2e8f0';
            
            inPrecio.value = '0.00';
            inPrecio.disabled = true;
            inPrecio.style.backgroundColor = '#e2e8f0';

            // 🔓 DESBLOQUEAR EMPLEADO
            selEmpleado.prop('disabled', false);
            selEmpleado.next('.select2-container').find('.select2-selection').css({
                'background-color': '#f5f3ff',
                'border-color': '#8b5cf6'
            });
            
        } else {
            // 🔓 DEVOLVER A LA NORMALIDAD (Compras regulares)
            
            // 🚨 LIMPIEZA ADAPTADA: Borramos la factura si empezó con REC- o con DEV-
            if (inFactura.value.startsWith('REC-') || inFactura.value.startsWith('DEV-')) { 
                inFactura.value = ''; 
            }
            inFactura.disabled = false;
            inFactura.style.backgroundColor = '#ffffff';
            
            // Borramos la guía si contenía cualquiera de los dos textos automáticos
            if (inGuia.value === 'RECUPERO' || inGuia.value === 'DEVOLUCION') { 
                inGuia.value = ''; 
            }
            inGuia.disabled = false;
            inGuia.style.backgroundColor = '#ffffff';
            
            if (inPrecio.value === '0.00') { inPrecio.value = ''; }
            inPrecio.disabled = false;
            inPrecio.style.backgroundColor = '#ffffff';

            // 🔒 BLOQUEAR EMPLEADO
            selEmpleado.val('').trigger('change'); 
            selEmpleado.prop('disabled', true);
            selEmpleado.next('.select2-container').find('.select2-selection').css({
                'background-color': '#cbd5e1',
                'border-color': 'transparent'
            });
        }
    });

    // INICIALIZAR SELECTS DE SALIDAS
    $('#sal-sel-producto').select2({
        placeholder: "Buscar producto (Nombre - Prov - Fecha)...",
        allowClear: true,
        width: '100%',
        templateResult: function (data) {
            if (!data.id) { return data.text; }
            return $(data.element.getAttribute('data-html'));
        },
        templateSelection: function (data) {
            if (!data.id) { return data.text; }
            return $(data.element.getAttribute('data-html'));
        }
    });

    $('#sal-sel-empleado').select2({
        placeholder: "Buscar empleado...",
        allowClear: true,
        width: '100%'
    });

    // Poner la fecha de hoy por defecto en salidas
    const hoySalida = new Date().toISOString().split('T')[0];
    const inputSalFecha = document.getElementById('sal-fecha');
    if(inputSalFecha) inputSalFecha.value = hoySalida;

    // Auto-completar el código del producto al seleccionarlo en SALIDAS
    $('#sal-sel-producto').on('change', function() {
        const idLote = $(this).val(); // 🚨 Esto ahora es un id_lote
        
        if (!idLote) {
            document.getElementById('sal-codigo').value = '';
            return;
        }
        
        // 🚨 Buscamos en lotesData, NO en productosData
        const lote = window.lotesData.find(l => l.id_lote == idLote);
        if (lote) { 
            document.getElementById('sal-codigo').value = lote.codigo; 
        }
    });

    $('#sal-sel-empleado').on('change', function() {
        const idEmp = $(this).val();
        const inputArea = document.getElementById('sal-area');
        
        // Si borra el empleado, limpiamos el área
        if (!idEmp) {
            inputArea.value = '';
            return;
        }
        
        // Buscar empleado en la memoria y extraer su área
        const empleado = window.empleadosData.find(e => e.id_empleado == idEmp);
        if (empleado) {
            inputArea.value = empleado.area;
        }
    });

    // ==========================================
    // 4. EJECUTAR CONSULTA A BD AL INICIAR
    // ==========================================
    cargarDatosMaestros();
    cargarHistorialKardex(1);
});

// MATEMÁTICA EN TIEMPO REAL
function calcularInventario() {
    const stock = parseFloat(document.getElementById('inv-stock').value) || 0;
    const precio = parseFloat(document.getElementById('inv-precio').value) || 0;
    const conteo = parseFloat(document.getElementById('inv-conteo').value) || 0;

    const total = stock * precio;
    const diferencia = conteo - stock;

    document.getElementById('inv-total').value = total.toFixed(2);
    
    const inputDiferencia = document.getElementById('inv-diferencia');
    inputDiferencia.value = diferencia;

    // Colorear diferencia para feedback visual
    if (diferencia > 0) {
        inputDiferencia.style.color = '#10b981'; // Verde (Sobra)
    } else if (diferencia < 0) {
        inputDiferencia.style.color = '#ef4444'; // Rojo (Falta)
    } else {
        inputDiferencia.style.color = '#475569'; // Gris (Cuadrado)
    }
}


// ==================================================
// GUARDAR Y ACORDEÓN DE INVENTARIO
// ==================================================

function guardarInventario() {
    const idProd = document.getElementById('inv-sel-producto').value;
    const stock = document.getElementById('inv-stock').value;
    const precio = document.getElementById('inv-precio').value;

    if (!idProd) {
        alert("Debe seleccionar un producto primero.");
        return;
    }

    fetch('/almacen/guardar-inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_producto: idProd,
            stock: stock,
            precio_igv: precio
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert(data.message);
            // Limpiamos la pantalla
            $('#inv-sel-producto').val('').trigger('change');
            document.getElementById('inv-conteo').value = '';
            
            sessionStorage.setItem('activeAlmacenTab', 'alm-view-inventario');
            location.reload(); 
        } else {
            alert(data.message);
        }
    });
}

function toggleListadoInventario() {
    const btn = document.getElementById('btn-toggle-listado-inv');
    const panel = document.getElementById('panel-listado-inventario');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'table-row';
        btn.classList.add('open');
        document.getElementById('filtro-busqueda-inv').focus();
    } else {
        panel.style.display = 'none';
        btn.classList.remove('open');
    }
}

function filtrarInventario() {
    const inputBuscado = document.getElementById('filtro-busqueda-inv').value.toUpperCase().trim();
    
    // 1. Separamos lo que el usuario escribió por espacios. 
    // .filter(Boolean) elimina espacios en blanco adicionales si el usuario pone doble espacio.
    const palabras = inputBuscado.split(/\s+/).filter(Boolean);
    
    const filas = document.querySelectorAll('.fila-inv-item');

    // Variables para los totales
    let sumaPrecioFiltrado = 0;
    let sumaTotalFiltrado = 0;

    filas.forEach(fila => {
        const celdas = fila.getElementsByTagName('td');
        
        const fecha = celdas[0].textContent.toUpperCase();
        const codigo = celdas[1].textContent.toUpperCase();
        const nombre = celdas[2].textContent.toUpperCase();
        const proveedor = celdas[4].textContent.toUpperCase();
        const categoria = celdas[5].textContent.toUpperCase();

        // 2. Unimos todo el texto relevante de la fila en un solo "bloque" de texto
        const contenidoFila = `${fecha} ${codigo} ${nombre} ${proveedor} ${categoria}`;

        // 3. Magia del filtro: Verificamos si TODAS las palabras buscadas están incluidas en el contenido
        // Si el usuario no escribió nada (palabras está vacío), .every() retorna true y muestra todo.
        const coincide = palabras.every(palabra => contenidoFila.includes(palabra));

        if (coincide) {
            fila.style.display = ''; // Mostramos la fila
            
            // 🚨 MEJORA DE SEGURIDAD: 
            // Usamos una expresión regular /[^0-9.-]+/g que elimina TODO lo que no sea número o punto.
            // Así, si el texto dice "S/ 1,200.50", lo limpia dejando solo "1200.50" para sumar sin errores (NaN).
            const textoPrecio = celdas[8].textContent.replace(/[^0-9.-]+/g, "");
            const textoTotal = celdas[9].textContent.replace(/[^0-9.-]+/g, "");
            
            const precioFila = parseFloat(textoPrecio) || 0;
            const totalFila = parseFloat(textoTotal) || 0;
            
            sumaPrecioFiltrado += precioFila;
            sumaTotalFiltrado += totalFila;
            
        } else {
            fila.style.display = 'none'; // Ocultamos la fila
        }
    });

    // 🚨 ACTUALIZAMOS EL FOOTER AL TERMINAR DE FILTRAR
    const elSumaPrecio = document.getElementById('inv-total-precio');
    const elSumaTotal = document.getElementById('inv-total-general');
    
    if(elSumaPrecio) elSumaPrecio.innerText = `S/ ${formatearMoneda(sumaPrecioFiltrado)}`;
    if(elSumaTotal) elSumaTotal.innerText = `S/ ${formatearMoneda(sumaTotalFiltrado)}`;
}


function exportarExcelInventario() {
    const search = document.getElementById('filtro-busqueda-inv').value;
    const url = `/almacen/api/exportar-excel-inventario?search=${encodeURIComponent(search)}`;
    window.open(url, '_blank');
}

// ==================================================
// FUNCIONES DEL KARDEX DE ENTRADAS (RETENCIÓN)
// ==================================================

let listaEntradasTemporales = [];

function agregarFilaTemporal() {
    const fechaFac = document.getElementById('ent-fecha-fac').value;
    const fechaIng = document.getElementById('ent-fecha-ing').value;
    const factura = document.getElementById('ent-factura').value.toUpperCase();
    const guia = document.getElementById('ent-guia').value.toUpperCase();
    const idProv = document.getElementById('ent-sel-proveedor').value;
    const proveedorTexto = $("#ent-sel-proveedor option:selected").text();

    const esRecupero = proveedorTexto.includes('RECUPERO') || proveedorTexto.includes('DEVOLUCION');
    const idEmpRec = document.getElementById('ent-sel-empleado-recupero').value;
    const empRecTexto = $("#ent-sel-empleado-recupero option:selected").text();
    
    const idProd = document.getElementById('ent-sel-producto').value;
    const productoTexto = $("#ent-sel-producto option:selected").text();
    const codigoProd = document.getElementById('ent-codigo').value;
    const cantidad = parseFloat(document.getElementById('ent-cantidad').value);
    let precio = parseFloat(document.getElementById('ent-precio').value);
    if (esRecupero) precio = 0.00;
    const obs = document.getElementById('ent-obs').value;

    const inputTalla = document.getElementById('ent-talla');
    const talla = inputTalla.value.trim().toUpperCase();

    // 1. Validaciones generales mínimas para cualquier tipo de ingreso
    if (!idProv || !idProd || isNaN(cantidad) || cantidad <= 0) {
        alert("Proveedor, Producto y Cantidad son obligatorios y deben ser válidos.");
        return;
    }

    // 2. Si es un proceso de RECUPERO o DEVOLUCIÓN
    if (esRecupero) {
        if (!idEmpRec) {
            alert("Debe seleccionar al Empleado que entrega el material recuperado/devuelto.");
            return;
        }
    } 
    // 3. Si es un INGRESO NORMAL (Compra comercial regular)
    else {
        if (!factura || factura.trim() === "") {
            alert("El Nro de Factura es obligatorio para ingresos normales.");
            return;
        }
        if (isNaN(precio) || precio < 0) {
            alert("El Precio es obligatorio y debe ser un número válido para ingresos normales.");
            return;
        }

    }

    if (listaEntradasTemporales.length === 0) {
        document.querySelectorAll('.alm-input-lock').forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#e2e8f0';
        });
        $('#ent-sel-proveedor').prop('disabled', true);
        
        // 🚨 También bloqueamos al empleado para que todo el lote pertenezca a la misma persona
        $('#ent-sel-empleado-recupero').prop('disabled', true); 
    }

    listaEntradasTemporales.push({
        idTemporal: Date.now(), 
        fecha_fac: fechaFac,
        fecha_ing: fechaIng,
        factura: factura,
        guia: guia,
        id_proveedor: idProv,
        proveedor_nombre: proveedorTexto,
        id_producto: idProd,
        producto_nombre: productoTexto,
        codigo: codigoProd,
        cantidad: cantidad,
        precio: precio,
        talla: talla !== "" ? talla : '-',
        id_empleado_recupero: esRecupero ? idEmpRec : null,
        empleado_recupero_nombre: esRecupero ? empRecTexto : '-',
        obs: obs
    });

    $('#ent-sel-producto').val('').trigger('change');
    document.getElementById('ent-cantidad').value = '';
    
    if (!esRecupero) { // Solo limpiamos el precio si no es recupero
        document.getElementById('ent-precio').value = '';
    }
    
    document.getElementById('ent-obs').value = '';
    inputTalla.value = '';
    
    $('#ent-sel-producto').select2('open');

    renderizarTablaTemporales();
}

function renderizarTablaTemporales() {
    const tbody = document.getElementById('body-tabla-entradas');
    tbody.innerHTML = '';

    // 1. Si el usuario ESTÁ DIGITANDO
    if (listaEntradasTemporales.length > 0) {
        listaEntradasTemporales.forEach(item => {
            const fila = `
                <tr style="background-color: #fffbeb;">
                    <td>${item.fecha_fac}</td>
                    <td>${item.fecha_ing}</td>
                    <td>${item.factura}</td>
                    <td>${item.guia}</td>
                    <td><span class="alm-badge alm-badge-outline">${item.codigo}</span></td>
                    <td style="color: #475569; font-weight: 600;">${item.producto_nombre}</td>
                    
                    <td style="color: #8b5cf6; font-weight: bold; text-align: center;">${item.talla}</td>
                    
                    <td style="font-size: 0.85rem; color: #475569;">${item.empleado_recupero_nombre}</td>
                    
                    <td class="alm-text-green alm-bold">+${item.cantidad}</td>
                    <td class="alm-bold">S/ ${item.precio.toFixed(2)}</td>
                    <td>${item.proveedor_nombre}</td>
                    <td>${item.obs}</td>
                    <td class="alm-text-center">
                        <button class="alm-icon-btn" style="color: #ef4444;" onclick="eliminarFilaTemporal(${item.idTemporal})" title="Eliminar fila (Temporal)"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });
    } 
    // 2. Si la memoria está VACÍA (HISTÓRICO BD)
    else {
        if (!window.historicoEntradas || window.historicoEntradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay historial de entradas. Agregue productos a la lista con el botón (+).</td></tr>`;
        } else {
            window.historicoEntradas.forEach(e => {
                const fila = `
                    <tr>
                        <td>${e.fecha_fac}</td>
                        <td>${e.fecha_ing}</td>
                        <td>${e.factura}</td>
                        <td>${e.guia}</td>
                        <td><span class="alm-badge alm-badge-outline">${e.codigo}</span></td>
                        <td style="color: #475569; font-weight: 600;">${e.producto}</td>
                        
                        <td style="color: #8b5cf6; font-weight: bold; text-align: center;">${e.talla ? e.talla : '-'}</td>
                        
                        <td style="font-size: 0.85rem; color: #475569;">${e.empleado_recupero ? e.empleado_recupero : '-'}</td>
                        
                        <td class="alm-text-green alm-bold">+${e.cantidad}</td>
                        <td>S/ ${e.precio ? e.precio.toFixed(2) : '0.00'}</td>
                        <td>${e.proveedor}</td>
                        <td>${e.obs ? e.obs : '-'}</td>
                        <td class="alm-text-center">
                            <button type="button" class="alm-icon-btn" style="color: #ef4444;" title="Eliminar Movimiento" onclick="eliminarMovimientoBd(${e.id_mov})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', fila);
            });
        }

        // Desbloquear cabeceras
        document.querySelectorAll('.alm-input-lock').forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = '#ffffff';
        });
        $('#ent-sel-proveedor').prop('disabled', false);
        $('#ent-sel-empleado-recupero').prop('disabled', false);
    }
}

function eliminarFilaTemporal(idTemp) {
    listaEntradasTemporales = listaEntradasTemporales.filter(item => item.idTemporal !== idTemp);
    renderizarTablaTemporales();
}

function guardarEntradasLote() {
    if (listaEntradasTemporales.length === 0) {
        alert("No hay productos en la lista para guardar.");
        return;
    }

    const confirmacion = confirm(`¿Está seguro de GUARDAR ESTA FACTURA con ${listaEntradasTemporales.length} producto(s)?\n\nEsto actualizará automáticamente el stock en el Inventario Físico.`);
    if (!confirmacion) return;

    const primerItem = listaEntradasTemporales[0];
    const payload = {
        cabecera: {
            fecha_fac: primerItem.fecha_fac,
            fecha_ing: primerItem.fecha_ing,
            factura: primerItem.factura,
            guia: primerItem.guia,
            id_proveedor: primerItem.id_proveedor
        },
        detalles: listaEntradasTemporales.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio: item.precio,
            talla: item.talla,
            id_empleado_recupero: item.id_empleado_recupero,
            obs: item.obs
        }))
    };

    const btnGuardar = document.getElementById('btn-guardar-lote');
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    btnGuardar.disabled = true;

    fetch('/almacen/guardar-entrada-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("¡Factura guardada y stock actualizado exitosamente!");
            listaEntradasTemporales = [];
            renderizarTablaTemporales();
            
            document.getElementById('ent-factura').value = '';
            document.getElementById('ent-guia').value = '';
            $('#ent-sel-proveedor').val('').trigger('change');
            $('#ent-sel-producto').val('').trigger('change');
            $('#ent-sel-empleado-recupero').val('').trigger('change');
            
            cargarDatosMaestros();
            cargarHistorialKardex(1); 
        } else {
            alert(data.message);
        }
    })
    .finally(() => {
        btnGuardar.innerHTML = '<i class="fas fa-save"></i>';
        btnGuardar.disabled = false;
    });
}


// Variable global para recordar si estamos en orden ascendente o descendente
let ordenFechaDescendente = true; 

function ordenarPorFechaFactura() {
    const tbody = document.getElementById('body-tabla-entradas');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    // Si la tabla está vacía (o tiene el mensaje de "No hay entradas"), no hacemos nada
    if (filas.length === 0 || (filas.length === 1 && filas[0].cells.length === 1)) return;

    // Invertimos el orden actual
    ordenFechaDescendente = !ordenFechaDescendente;
    
    // Cambiamos el triangulito visualmente (Arriba / Abajo) y lo pintamos de azul
    const icono = document.getElementById('icono-sort-fecha');
    if (icono) {
        icono.className = ordenFechaDescendente ? 'fas fa-caret-down' : 'fas fa-caret-up';
        icono.style.color = '#0ea5e9'; 
    }

    // Ordenamos las filas
    filas.sort((a, b) => {
        // La fecha de factura está en la primera columna (índice 0)
        const textoA = a.cells[0].innerText.trim();
        const textoB = b.cells[0].innerText.trim();
        
        // Función interna para convertir "DD-MM-YYYY" a milisegundos para comparar
        const parsearFecha = (fechaStr) => {
            if (!fechaStr || fechaStr === '-') return 0; // Si no hay fecha, se va al fondo
            const partes = fechaStr.split('-');
            if (partes.length === 3) {
                // Formato: año, mes (base 0), día
                return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
            }
            return 0;
        };

        const valorA = parsearFecha(textoA);
        const valorB = parsearFecha(textoB);

        if (valorA === valorB) return 0;
        
        if (ordenFechaDescendente) {
            return valorA < valorB ? 1 : -1; // Más recientes primero
        } else {
            return valorA > valorB ? 1 : -1; // Más antiguos primero
        }
    });

    // Reinsertamos las filas en el tbody ya ordenadas (JavaScript las mueve, no las duplica)
    filas.forEach(fila => tbody.appendChild(fila));
}


// Variable global para las salidas
let listaSalidasTemporales = [];
function agregarFilaTemporalSalida() {
    const fecha = document.getElementById('sal-fecha').value;
    const idEmp = document.getElementById('sal-sel-empleado').value;
    const empTexto = $("#sal-sel-empleado option:selected").text();
    const area = document.getElementById('sal-area').value;
    
    // 🚨 AQUÍ ESTABA EL ERROR: Declaramos idLote en lugar del antiguo idProd
    const idLote = document.getElementById('sal-sel-producto').value;
    const prodTexto = $("#sal-sel-producto option:selected").html();
    const codigoProd = document.getElementById('sal-codigo').value;
    const cantidad = parseFloat(document.getElementById('sal-cantidad').value);
    const obs = document.getElementById('sal-obs').value;

    if (!fecha || !idEmp || !idLote || isNaN(cantidad) || cantidad <= 0) {
        alert("Faltan datos: Fecha, Empleado, Producto y Cantidad son obligatorios.");
        return;
    }

    // VALIDACIÓN INTELIGENTE: Ahora sí idLote existe y coincide con la búsqueda
    //const loteRef = window.lotesData.find(l => l.id_lote == idLote);
    //if (loteRef && cantidad > loteRef.stock_restante) {
        //alert(`¡Alerta! Stock insuficiente. Solo quedan ${loteRef.stock_restante} unidades disponibles para este registro consolidado.`);
        //return;
    //}

    // Bloquear los datos de cabecera en el primer item ingresado
    if (listaSalidasTemporales.length === 0) {
        document.querySelectorAll('.alm-input-lock-sal').forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#e2e8f0';
        });
        $('#sal-sel-empleado').prop('disabled', true);
    }

    listaSalidasTemporales.push({
        idTemporal: Date.now(),
        fecha: fecha,
        id_empleado: idEmp,
        empleado_nombre: empTexto,
        area: area,
        id_lote: idLote, // Guardamos el ID combinado (ej: "1,4,5")
        producto_nombre: prodTexto,
        codigo: codigoProd,
        cantidad: cantidad,
        obs: obs
    });

    // Limpiar para seguir "bipeando" o digitando productos
    $('#sal-sel-producto').val('').trigger('change');
    document.getElementById('sal-cantidad').value = '';
    document.getElementById('sal-obs').value = '';
    $('#sal-sel-producto').select2('open');

    renderizarTablaTemporalesSalida();
}

function renderizarTablaTemporalesSalida() {
    const tbody = document.getElementById('body-tabla-salidas');
    tbody.innerHTML = '';

    // 1. Mostrar la lista en memoria (lo que se está digitando)
    if (listaSalidasTemporales.length > 0) {
        listaSalidasTemporales.forEach(item => {
            const fila = `
                <tr style="background-color: #fef2f2;"> <td>${item.fecha}</td>
                    <td class="alm-text-red alm-bold">-${item.cantidad}</td>
                    <td><span class="alm-badge alm-badge-outline">${item.codigo}</span></td>
                    <td style="color: #475569; font-weight: 600;">${item.producto_nombre}</td>
                    <td>${item.empleado_nombre}</td>
                    <td>${item.area}</td>
                    <td>${item.obs}</td>
                    <td class="alm-text-center">
                        <button class="alm-icon-btn" style="color: #ef4444;" onclick="eliminarFilaTemporalSalida(${item.idTemporal})" title="Eliminar fila"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', fila);
        });
    } 
    // 2. Si no hay temporales, mostrar el historial de BD
    else {
        if (!window.historicoSalidas || window.historicoSalidas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="alm-text-center" style="color: #94a3b8; padding: 20px;">No hay salidas registradas.</td></tr>`;
        } else {
            window.historicoSalidas.forEach(s => {
                const fila = `
                    <tr>
                        <td>${s.fecha_salida}</td>
                        <td class="alm-text-red alm-bold">-${s.cantidad}</td>
                        <td><span class="alm-badge alm-badge-outline">${s.codigo}</span></td>
                        <td style="color: #475569; font-weight: 600;">${s.producto}</td>
                        <td>${s.empleado}</td>
                        <td>${s.area}</td>
                        <td>${s.obs}</td>
                        <td class="alm-text-center">
                            <a href="#" class="alm-icon-btn" title="Ver Adjunto"><i class="fas fa-paperclip"></i></a>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', fila);
            });
        }

        // Desbloquear cabeceras al volver a cero
        document.querySelectorAll('.alm-input-lock-sal').forEach(input => {
            input.disabled = false;
            input.style.backgroundColor = '#ffffff';
        });
        $('#sal-sel-empleado').prop('disabled', false);
    }
}

function eliminarFilaTemporalSalida(idTemp) {
    listaSalidasTemporales = listaSalidasTemporales.filter(item => item.idTemporal !== idTemp);
    renderizarTablaTemporalesSalida();
}

function guardarSalidasLote() {
    if (listaSalidasTemporales.length === 0) {
        alert("No hay productos en la lista para despachar.");
        return;
    }

    const confirmacion = confirm(`¿Está seguro de REGISTRAR LA SALIDA de ${listaSalidasTemporales.length} producto(s)?`);
    if (!confirmacion) return;

    const primerItem = listaSalidasTemporales[0];
    const payload = {
        cabecera: {
            fecha: primerItem.fecha,
            id_empleado: primerItem.id_empleado,
            area: primerItem.area
        },
        detalles: listaSalidasTemporales.map(item => ({
            id_lote: item.id_lote,
            cantidad: item.cantidad,
            obs: item.obs
        }))
    };

    const btnGuardar = document.getElementById('btn-guardar-lote-salida');
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; 
    btnGuardar.disabled = true;

    fetch('/almacen/guardar-salida-lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("¡Salida registrada y stock actualizado exitosamente!");
            listaSalidasTemporales = [];
            renderizarTablaTemporalesSalida();
            
            // Limpiar área
            document.getElementById('sal-area').value = '';
            $('#sal-sel-empleado').val('').trigger('change');
            
            cargarDatosMaestros(); 
            cargarHistorialKardex(1);
        } else {
            alert(data.message);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Error de conexión al intentar guardar la salida.");
    })
    .finally(() => {
        btnGuardar.innerHTML = '<i class="fas fa-save"></i>';
        btnGuardar.disabled = false;
    });
}


let historialCurrentPage = 1;
let historialCurrentTipo = 'TODO';
let debounceTimerHistorial;

function filtrarHistorial(tipo) {
    historialCurrentTipo = tipo;
    
    // Cambiar clase activa en las pestañas
    document.querySelectorAll('.alm-header-tabs .alm-sub-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.alm-header-tabs .alm-sub-tab[data-target="${tipo}"]`).classList.add('active');
    
    cargarHistorialKardex(1); // Volver a la página 1 al cambiar de filtro
}

function ejecutarBusquedaHistorial() {
    clearTimeout(debounceTimerHistorial);
    debounceTimerHistorial = setTimeout(() => {
        cargarHistorialKardex(1);
    }, 400); // 400ms de retraso para no saturar el servidor mientras tipea
}

function cargarHistorialKardex(page = 1) {
    const tbody = document.getElementById('body-tabla-historico');
    const search = document.getElementById('filtro-hist-texto').value;
    
    // 1. CAPTURAMOS LAS FECHAS DEL HTML
    const fechaInicio = document.getElementById('filtro-hist-inicio').value;
    const fechaFin = document.getElementById('filtro-hist-fin').value;
    
    tbody.innerHTML = `<tr><td colspan="19" class="alm-text-center" style="padding: 30px;"><i class="fas fa-spinner fa-spin fa-lg"></i> Actualizando...</td></tr>`;

    // 2. CONSTRUIMOS LA URL
    let url = `/almacen/api/historico-kardex?page=${page}&limit=20&tipo=${historialCurrentTipo}&search=${encodeURIComponent(search)}`;
    
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    
    // 🚨 LA SOLUCIÓN: Deshabilitamos el caché en los headers
    fetch(url, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        cache: 'no-store' // Obliga al navegador a ir siempre a la BD
    })
        .then(res => res.json())
        .then(response => {
            if(!response.success) throw new Error(response.error);
            
            tbody.innerHTML = '';
            
            if(response.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="19" class="alm-text-center" style="color: #94a3b8; padding: 30px;">No se encontraron movimientos.</td></tr>`;
                actualizarPaginacionUI({ total_records: 0, current_page: 1, total_pages: 1, per_page: 20 });
                return;
            }

            // Renderizar Filas
            response.data.forEach(m => {
                const isEntrada = m.tipo === 'ENTRADA';
                const badgeTipo = isEntrada ? `<span class="alm-badge alm-badge-entrada"><i class="fas fa-arrow-down"></i> ENTRADA</span>` : `<span class="alm-badge alm-badge-salida"><i class="fas fa-arrow-up"></i> SALIDA</span>`;
                const colorCant = isEntrada ? '#16a34a' : '#ef4444';
                const signoCant = isEntrada ? '+' : '-';

                tbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td class="alm-bold">${m.fecha}</td>
                        <td class="alm-text-center">${badgeTipo}</td>
                        <td><span class="alm-badge alm-badge-outline">${m.codigo}</span></td>
                        <td style="color: #475569; font-weight: 600;">${m.producto}</td>
                        <td style="color: #8b5cf6; font-weight: bold; text-align: center;">${m.talla ? m.talla : '-'}</td>
                        <td>${m.unidad}</td>
                        <td>${m.categoria}</td>
                        <td class="alm-text-center alm-bold" style="color: ${colorCant}; font-size:1.1rem;">${signoCant}${m.cantidad}</td>
                        <td class="alm-bold">${m.stock_actual}</td>
                        <td>${m.proveedor}</td>
                        <td style="color: #0369a1; font-weight: 500;">${m.empleado_recupero ? m.empleado_recupero : '-'}</td>
                        <td>${m.empleado}</td>
                        <td>${m.area}</td>
                        <td>${m.cargo}</td>
                        <td>${m.documento}</td>
                        <td>${m.fecha_factura}</td>
                        <td>${m.guia}</td>
                        <td>${m.obs}</td>
                        <td class="alm-text-center"><a href="#" class="alm-icon-btn"><i class="fas fa-paperclip"></i></a></td>
                    </tr>
                `);
            });

            actualizarPaginacionUI(response.pagination);
        })
        .catch(err => {
            console.error("Error cargando historial:", err);
            tbody.innerHTML = `<tr><td colspan="17" class="alm-text-center" style="color: #ef4444; padding: 20px;">Error al cargar los datos.</td></tr>`;
        });
}

// Variables globales para guardar el estado del ordenamiento
let kardexSortCol = -1;
let kardexSortAsc = true;

function ordenarTablaKardex(colIndex, tipoDato) {
    const tbody = document.getElementById('body-tabla-historico');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    
    // Evitar errores si la tabla dice "Cargando..." o "No hay movimientos"
    if (filas.length === 0 || (filas.length === 1 && filas[0].cells.length === 1)) return;

    // Determinar dirección del orden
    if (kardexSortCol === colIndex) {
        kardexSortAsc = !kardexSortAsc; // Invertir si es la misma columna
    } else {
        kardexSortAsc = true; // Empezar ascendente si es nueva columna
        kardexSortCol = colIndex;
    }

    // Actualizar TODOS los triangulitos de la cabecera
    const iconos = document.querySelectorAll('.kardex-sort-icon');
    iconos.forEach((icono, index) => {
        if (index === colIndex) {
            // Activar el icono de la columna clickeada
            icono.className = kardexSortAsc ? 'fas fa-caret-down kardex-sort-icon' : 'fas fa-caret-up kardex-sort-icon';
            icono.style.color = '#0ea5e9'; 
        } else {
            // Apagar los demás
            icono.className = 'fas fa-sort kardex-sort-icon';
            icono.style.color = '#94a3b8';
        }
    });

    // Ordenar mágicamente
    filas.sort((a, b) => {
        let valA = a.cells[colIndex].innerText.trim();
        let valB = b.cells[colIndex].innerText.trim();

        if (tipoDato === 'fecha') {
            const parsearFecha = (str) => {
                if (!str || str === '-') return 0;
                // Si la fecha tiene hora "14-03-2026 15:30", la separamos
                const partes = str.split(' ')[0].split('-');
                if (partes.length === 3) return new Date(partes[2], partes[1] - 1, partes[0]).getTime();
                return 0;
            };
            valA = parsearFecha(valA);
            valB = parsearFecha(valB);
            
        } else if (tipoDato === 'numero') {
            // Limpia todo menos números, puntos y el signo negativo real
            valA = parseFloat(valA.replace(/[^+0-9.-]+/g, "")) || 0;
            valB = parseFloat(valB.replace(/[^+0-9.-]+/g, "")) || 0;
            
        } else {
            // Texto por defecto
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        // Comparación final
        if (valA === valB) return 0;
        let comparacion = valA > valB ? 1 : -1;
        
        return kardexSortAsc ? comparacion : -comparacion;
    });

    // Reinyectar las filas ordenadas al instante
    filas.forEach(fila => tbody.appendChild(fila));
}

function eliminarMovimientoBd(idMovimiento) {
    const confirmar = confirm("¿Está seguro de ELIMINAR definitivamente este registro?\n\nEl stock regresará a su estado anterior. Esta acción borrará la información de la base de datos permanentemente.");
    
    if (!confirmar) return;

    fetch('/almacen/eliminar-movimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_mov: idMovimiento })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            cargarHistorialKardex(historialCurrentPage); // Recarga la tabla en la misma página
            cargarDatosMaestros(); // Actualiza el stock global de la SPA
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error("Error eliminando:", err);
        alert("Ocurrió un error de conexión al intentar eliminar el registro.");
    });
}

function actualizarPaginacionUI(pagData) {
    historialCurrentPage = pagData.current_page;
    
    // Textos informativos
    const inicioRec = (pagData.current_page - 1) * pagData.per_page + 1;
    const finRec = Math.min(pagData.current_page * pagData.per_page, pagData.total_records);
    document.getElementById('hist-pag-info').innerText = pagData.total_records > 0 
        ? `Mostrando ${inicioRec} a ${finRec} de ${pagData.total_records} registros`
        : `Mostrando 0 registros`;

    // Botones
    const divControles = document.getElementById('hist-pag-controles');
    divControles.innerHTML = '';

    if (pagData.total_pages <= 1) return;

    // Botón Anterior
    divControles.insertAdjacentHTML('beforeend', `<button class="alm-btn-page" ${pagData.current_page === 1 ? 'disabled' : ''} onclick="cargarHistorialKardex(${pagData.current_page - 1})"><i class="fas fa-chevron-left"></i></button>`);

    // Lógica simple para mostrar números (En un sistema masivo se usa "1 ... 4 5 6 ... 10", pero esto cubre la funcionalidad base)
    let startPage = Math.max(1, pagData.current_page - 2);
    let endPage = Math.min(pagData.total_pages, pagData.current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === pagData.current_page ? 'active' : '';
        divControles.insertAdjacentHTML('beforeend', `<button class="alm-btn-page ${activeClass}" onclick="cargarHistorialKardex(${i})">${i}</button>`);
    }

    // Botón Siguiente
    divControles.insertAdjacentHTML('beforeend', `<button class="alm-btn-page" ${pagData.current_page === pagData.total_pages ? 'disabled' : ''} onclick="cargarHistorialKardex(${pagData.current_page + 1})"><i class="fas fa-chevron-right"></i></button>`);
}


function exportarExcelKardex() {
    // 1. Capturamos los mismos filtros que el usuario ve en pantalla
    const search = document.getElementById('filtro-hist-texto').value;
    const fechaInicio = document.getElementById('filtro-hist-inicio').value;
    const fechaFin = document.getElementById('filtro-hist-fin').value;
    const tipo = historialCurrentTipo; // Variable global que ya tienes
    
    // 2. Construimos la URL de descarga
    let url = `/almacen/api/exportar-excel-kardex?tipo=${tipo}&search=${encodeURIComponent(search)}`;
    
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    
    // 3. Redirigimos al usuario (esto fuerza la descarga del archivo)
    window.open(url, '_blank');
}



/* =========================================
       REVALIDACION DE LECTURAS
    ========================================= */

function switchTabPro(event, tabId) {
    // Quitamos la clase 'active' de todos los botones y contenidos
    document.querySelectorAll('.tab-btn-clean').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content-clean').forEach(tab => tab.classList.remove('active'));
    
    // Agregamos la clase 'active' al botón clicado y a su contenedor correspondiente
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
    const csvInput = document.getElementById('csv-upload');
    const fileNameDisplay = document.querySelector('.file-name-clean');
    const previewBody = document.getElementById('preview-tbody');
    const btnSubirData = document.getElementById('btn-accion-matriz'); // Capturamos el botón de subir

    // ==========================================
    // 1. PREVISUALIZAR EL CSV AL SELECCIONARLO
    // ==========================================
    csvInput.addEventListener('change', function(e) {
        const file = e.target.files[0];

        if (!file) {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado...';
            fileNameDisplay.style.color = '';
            previewBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-20"><i class="fas fa-file-csv" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display:block;"></i>La data del CSV aparecerá aquí antes de subir.</td></tr>';
            return;
        }

        // Mostrar nombre del archivo con estilo de éxito
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.style.color = 'var(--c-blue)';
        fileNameDisplay.style.fontWeight = '600';

        const reader = new FileReader();
        
        reader.onload = function(event) {
            const text = event.target.result;
            // Detectar delimitador: Algunos Excel guardan CSV con ';' en lugar de ','
            const delimiter = text.indexOf(';') !== -1 ? ';' : ',';
            
            // Separar por saltos de línea y eliminar líneas vacías
            const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
            
            if (rows.length <= 1) {
                previewBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-20 fw-600">El archivo CSV está vacío o no contiene registros válidos.</td></tr>';
                return;
            }

            previewBody.innerHTML = ''; // Limpiar estado inicial

            // Límite visual de 50 filas para no colgar el DOM
            const limit = Math.min(rows.length, 51); 

            // Empezamos desde i=1 para omitir la fila de cabeceras del CSV
            for (let i = 1; i < limit; i++) {
                // Separar celdas respetando comillas si existieran
                const cols = rows[i].split(new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`));
                
                let tr = document.createElement('tr');
                
                // Iterar sobre las 10 columnas requeridas (Corregido a j < 10)
                for (let j = 0; j < 9; j++) {
                    let td = document.createElement('td');
                    let cellData = cols[j] ? cols[j].trim().replace(/^"|"$/g, '') : '-';
                    td.textContent = cellData || '-';
                    tr.appendChild(td);
                }
                previewBody.appendChild(tr);
            }

            // Si hay más de 50 registros, mostrar un aviso
            if (rows.length > 51) {
                let infoRow = document.createElement('tr');
                infoRow.innerHTML = `<td colspan="9" class="text-center py-10 text-muted" style="background: var(--c-gray-bg); font-weight: 600;">
                    Mostrando previsualización de 50 filas (Total de registros a subir: ${rows.length - 1})
                </td>`;
                previewBody.appendChild(infoRow);
            }
        };

        reader.onerror = function() {
            previewBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-20 fw-600">Error al leer el archivo. Verifique el formato.</td></tr>';
        };

        // Leer el archivo como texto UTF-8
        reader.readAsText(file, 'UTF-8');
    });

    // ==========================================
    // 2. ENVIAR EL CSV AL BACKEND AL HACER CLIC
    // ==========================================
    if (btnSubirData) {
        btnSubirData.addEventListener('click', async () => {
            const file = csvInput.files[0];
            
            if (!file) {
                alert("Por favor, seleccione un archivo CSV primero.");
                return;
            }

            // Cambiar estado del botón para evitar múltiples clics
            const originalText = btnSubirData.innerHTML;
            btnSubirData.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btnSubirData.disabled = true;

            // Preparar la data para enviar por POST (FormData)
            const formData = new FormData();
            formData.append('archivo_csv', file);

            try {
                const response = await fetch('/subir_matriz_csv', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    // Éxito: Mostrar alerta, cerrar modal y limpiar el input
                    alert(result.mensaje); 
                    document.getElementById('modal-gestion').style.display = 'none';
                    
                    // Limpiar el estado del modal de subida
                    csvInput.value = ''; 
                    cargarLecturasGestion(1);
                    fileNameDisplay.textContent = 'Ningún archivo seleccionado...';
                    fileNameDisplay.style.color = '';
                    previewBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-20"><i class="fas fa-file-csv" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display:block;"></i>La data del CSV aparecerá aquí antes de subir.</td></tr>';
                    
                } else {
                    // Error del servidor
                    alert("Error: " + result.error);
                }
            } catch (error) {
                console.error("Error en la petición:", error);
                alert("Ocurrió un error de conexión al intentar subir el archivo.");
            } finally {
                // Restaurar el botón
                btnSubirData.innerHTML = originalText;
                btnSubirData.disabled = false;
            }
        });
    }
});

// Variable global
let paginaActualGestion = 1;

// ==========================================
// 1. CARGAR LISTA DINÁMICA DE OPERARIOS
// ==========================================
async function cargarOperariosDatalist() {
    try {
        const response = await fetch('/obtener_operarios_matriz');
        const data = await response.json();
        
        if (data.success) {
            const datalist = document.getElementById('lista-operarios-gestion');
            datalist.innerHTML = '<option value="TODOS"></option>'; // Opción base
            
            data.operarios.forEach(op => {
                const option = document.createElement('option');
                option.value = op;
                datalist.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar la lista de operarios:", error);
    }
}

// ==========================================
// 2. CARGAR TABLA CON FILTROS (MODAL DE GESTIÓN)
// ==========================================
async function cargarLecturasGestion(page = 1) {
    paginaActualGestion = page;
    const operadorInput = document.getElementById('filtro-operario-gestion').value;
    const fechaInput = document.getElementById('filtro-fecha-gestion').value; 
    
    const tbody = document.getElementById('tbody-gestion-lecturas');
    const paginationContainer = document.querySelector('.pagination-pro');

    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20"><i class="fas fa-spinner fa-spin text-blue"></i> Cargando datos...</td></tr>';

    try {
        // Volvemos a la URL original, SIN el parámetro de estado
        const response = await fetch(`/obtener_lecturas?page=${page}&operador=${encodeURIComponent(operadorInput)}&fecha=${encodeURIComponent(fechaInput)}`);
        const data = await response.json();

        tbody.innerHTML = '';

        if (data.lecturas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-20">No se encontraron registros para esta fecha/operario.</td></tr>';
            paginationContainer.style.display = 'none';
            return;
        }

        // Pintar filas sin la columna acción
        data.lecturas.forEach(lec => {
            let statusDot = lec.estado === 'PENDIENTE' ? 'dot-warning' : 'bg-green';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge-code">${lec.clicodfac}</span></td>
                <td>${lec.medcodygo}</td>
                <td class="fw-600">${lec.lectura}</td>
                <td>${lec.feclec}</td>
                <td><span class="status-dot ${statusDot}"></span> ${lec.estado}</td>
            `;
            tbody.appendChild(tr);
        });

        // Pintar paginación
        paginationContainer.style.display = 'flex';
        let startRecord = ((data.current_page - 1) * data.per_page) + 1;
        let endRecord = Math.min(data.current_page * data.per_page, data.total);
        
        let paginationHTML = `
            <span class="text-sm text-muted">Mostrando <span class="fw-600 text-dark">${startRecord}</span> a <span class="fw-600 text-dark">${endRecord}</span> de <span class="fw-600 text-dark">${data.total}</span></span>
            <div class="pagination-buttons">
                <button class="btn-page" ${data.current_page === 1 ? 'disabled' : ''} onclick="cargarLecturasGestion(${data.current_page - 1})"><i class="fas fa-chevron-left"></i></button>
        `;

        let startPage = Math.max(1, data.current_page - 2);
        let endPage = Math.min(data.pages, data.current_page + 2);

        for (let i = startPage; i <= endPage; i++) {
            let activeClass = i === data.current_page ? 'active' : '';
            paginationHTML += `<button class="btn-page ${activeClass}" onclick="cargarLecturasGestion(${i})">${i}</button>`;
        }

        paginationHTML += `
                <button class="btn-page" ${data.current_page === data.pages ? 'disabled' : ''} onclick="cargarLecturasGestion(${data.current_page + 1})"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        paginationContainer.innerHTML = paginationHTML;

    } catch (error) {
        console.error("Error al cargar lecturas:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-20">Error al consultar los datos.</td></tr>';
    }
}

// ==========================================
// 3. EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnBuscarGestion = document.getElementById('btn-buscar-gestion');
    if (btnBuscarGestion) {
        btnBuscarGestion.addEventListener('click', () => {
            cargarLecturasGestion(1);
        });
    }

    const tabGestionBtn = document.querySelector('button[onclick*="tab-gestion"]');
    if (tabGestionBtn) {
        tabGestionBtn.addEventListener('click', () => {
            cargarOperariosDatalist(); // Cargar la lista del datalist dinámicamente
            cargarLecturasGestion(1);  // Cargar la tabla
        }, { once: true });
    }

    // Lógica para el botón 'X' del buscador de operarios
    const inputOperario = document.getElementById('filtro-operario-gestion');
    const clearOperarioBtn = document.getElementById('clear-operario-gestion');

    if (inputOperario && clearOperarioBtn) {
        // Mostrar/ocultar la 'X' según si hay texto o no
        inputOperario.addEventListener('input', () => {
            clearOperarioBtn.style.display = inputOperario.value.length > 0 ? 'block' : 'none';
        });

        // Limpiar el input al hacer clic en la 'X'
        clearOperarioBtn.addEventListener('click', () => {
            inputOperario.value = '';
            clearOperarioBtn.style.display = 'none';
            inputOperario.focus(); // Devuelve el cursor al input
            // Opcional: cargarLecturasGestion(1); // Descomenta esto si quieres que al limpiar se actualice la tabla automáticamente
        });
    }
});


/* =========================================
   NUEVO MÓDULO: VALIDACIÓN DE LECTURAS (REVISIÓN)
   ========================================= */

let paginaActualRevalidacion = 1; // Variable global para saber en qué página estamos

// 👇 NUEVA FUNCIÓN QUE HACE EL FETCH Y DIBUJA LA PAGINACIÓN 👇
async function cargarLecturasRevalidacion(page = 1) {
    paginaActualRevalidacion = page;

    const fecha = document.getElementById('fecha-lectura').value;
    const operario = $('#operario-select').val() || ''; 
    const estadoSelect = document.getElementById('estado-select');
    const estado = estadoSelect ? estadoSelect.value : '';

    const tbody = document.querySelector('#revalidacion .table-pro tbody');
    const paginationContainer = document.getElementById('pagination-revalidacion'); // Contenedor de paginación
    
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-20"><i class="fas fa-spinner fa-spin text-blue"></i> Buscando suministros...</td></tr>';

    try {
        // LLAMAMOS A LA API (Ahora le pasamos el &page=...)
        const response = await fetch(`/api/matriz_revision?page=${page}&fecha=${encodeURIComponent(fecha)}&operario=${encodeURIComponent(operario)}&estado=${encodeURIComponent(estado)}`);
        const data = await response.json();

        tbody.innerHTML = '';

        if (!data.success || data.data.length === 0) {
            const textoEstado = estado ? estado : "POR MODIFICAR";
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-20">No hay suministros "${textoEstado}" para esta fecha y operario.</td></tr>`;
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        // Dibujamos las filas con tu semáforo de colores
        data.data.forEach(item => {
            const tr = document.createElement('tr');
            
            let statusDot = '';
            switch (item.estado.toUpperCase()) {
                case 'PENDIENTE': 
                    statusDot = 'dot-warning'; 
                    break;
                case 'POR MODIFICAR': 
                    statusDot = 'bg-blue'; 
                    break;
                case 'MODIFICADO': 
                case 'VALIDADO': 
                    statusDot = 'bg-green'; 
                    break;
                case 'RECHAZADO': 
                    statusDot = 'bg-red'; 
                    break;
                case 'DESCARGADO':
                    statusDot = 'bg-purple'; 
                    break;
                default: 
                    statusDot = 'bg-gray'; 
            }
            
            tr.innerHTML = `
                <td><span class="badge-code">${item.suministro}</span></td>
                <td class="text-green fw-600">${item.lectura_nueva}</td>
                <td class="text-muted">${item.observacion_nueva}</td>
                <td class="text-muted">${item.newmed}</td>
                <td><span class="status-dot ${statusDot}"></span> ${item.estado}</td>
                <td class="action-cells">
                    <button class="btn-square bg-blue btn-ver-foto" data-suministro="${item.suministro}" data-feclec="${item.feclec}" title="Ver Foto">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="btn-square bg-green btn-aceptar-mod" data-id="${item.id_matriz}" title="Validar"><i class="fas fa-check"></i></button>
                    <button class="btn-square bg-red btn-rechazar-mod" data-id="${item.id_matriz}" title="Rechazar"><i class="fas fa-times"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // 👇 LÓGICA DE DIBUJAR LOS BOTONES DE PAGINACIÓN 👇
        if (paginationContainer && data.total) {
            paginationContainer.style.display = 'flex';
            let startRecord = ((data.current_page - 1) * data.per_page) + 1;
            let endRecord = Math.min(data.current_page * data.per_page, data.total);
            
            let paginationHTML = `
                <span class="text-sm text-muted">Mostrando <span class="fw-600 text-dark">${startRecord}</span> a <span class="fw-600 text-dark">${endRecord}</span> de <span class="fw-600 text-dark">${data.total}</span></span>
                <div class="pagination-buttons">
                    <button class="btn-page" ${data.current_page === 1 ? 'disabled' : ''} onclick="cargarLecturasRevalidacion(${data.current_page - 1})"><i class="fas fa-chevron-left"></i></button>
            `;

            let startPage = Math.max(1, data.current_page - 2);
            let endPage = Math.min(data.pages, data.current_page + 2);

            for (let i = startPage; i <= endPage; i++) {
                let activeClass = i === data.current_page ? 'active' : '';
                paginationHTML += `<button class="btn-page ${activeClass}" onclick="cargarLecturasRevalidacion(${i})">${i}</button>`;
            }

            paginationHTML += `
                    <button class="btn-page" ${data.current_page === data.pages ? 'disabled' : ''} onclick="cargarLecturasRevalidacion(${data.current_page + 1})"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
            paginationContainer.innerHTML = paginationHTML;
        } else if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

    } catch (error) {
        console.error("Error al cargar la matriz de revisión:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-20">Error al consultar los datos.</td></tr>';
    }
}

// Convertimos la función a global para que el HTML pueda ejecutarla al dar clic en los números
window.cargarLecturasRevalidacion = cargarLecturasRevalidacion;


document.addEventListener("DOMContentLoaded", () => {
    // 1. Convertir el select normal en un buscador Select2
    if (window.jQuery && $.fn.select2) {
        $('#operario-select').select2({
            placeholder: "Buscar operario...",
            allowClear: true,
            width: '100%'
        });
    }

    // 2. Evento: Al elegir una fecha, buscar los operarios de ese día
    $('#fecha-lectura').on('change', async function() {
        const fecha = $(this).val(); 
        const selectOperario = $('#operario-select');
        
        selectOperario.empty().append('<option value="">Buscar operario...</option>');

        if (!fecha) return;

        try {
            const response = await fetch(`/api/operarios_por_fecha?fecha=${fecha}`);
            const operarios = await response.json();

            operarios.forEach(op => {
                selectOperario.append(new Option(op, op));
            });
            selectOperario.trigger('change');
        } catch (error) {
            console.error("Error cargando operarios:", error);
        }
    });

    // 3. Evento: Al dar clic en "Buscar"
    const btnBuscarLecturas = document.getElementById('btn-buscar-lecturas');
    
    if (btnBuscarLecturas) {
        btnBuscarLecturas.addEventListener('click', () => {
            // Ya no hacemos el fetch aquí, solo llamamos a la función iniciando en la página 1
            cargarLecturasRevalidacion(1);
        });
    }
});

/* =========================================
   LÓGICA DEL VISOR FOTOGRÁFICO
   ========================================= */

// Variables globales para el visor
let imagenesVisor = [];
let indiceImagenActual = 0;
let rotacionActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    
    const tbodyValidacion = document.querySelector('#revalidacion .table-pro tbody');
    const photoFrame = document.querySelector('.photo-frame-pro');
    const labelSuministro = document.getElementById('visor-suministro-codigo');

    // 1. Escuchar clics en el botón de la cámara dentro de la tabla
    if (tbodyValidacion) {
        tbodyValidacion.addEventListener('click', async (e) => {
            const btnCamara = e.target.closest('.btn-ver-foto');
            if (!btnCamara) return; 

            // 1. Quitamos la clase 'fila-activa' de todas las filas
            tbodyValidacion.querySelectorAll('tr').forEach(tr => tr.classList.remove('fila-activa'));
            // 2. Le ponemos la clase solo a la fila donde hicimos clic
            const filaActual = btnCamara.closest('tr');
            if (filaActual) filaActual.classList.add('fila-activa');

            const suministro = btnCamara.getAttribute('data-suministro');
            const feclec = btnCamara.getAttribute('data-feclec'); // Ej: "12/05/2026"
            labelSuministro.textContent = suministro;

            // Lógica para extraer "YYYYMM" de la fecha "DD/MM/YYYY" o "DD-MM-YYYY"
            let prefijoBuscado = "";
            if (feclec) {
                const partes = feclec.split(/[-/]/); 
                if (partes.length >= 3) {
                    prefijoBuscado = partes[2] + partes[1]; // Junta "2026" + "05" -> "202605"
                }
            }

            // Reiniciar estado del visor
            imagenesVisor = [];
            indiceImagenActual = 0;
            rotacionActual = 0;

            photoFrame.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; color: var(--c-blue); gap: 12px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p style="margin: 0; font-weight: 600; font-size: 0.95rem;">Buscando fotos en el servidor...</p>
                </div>
            `;

            try {
                const response = await fetch('/buscar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo: suministro })
                });
                
                const data = await response.json();

                if (data.resultados && data.resultados.length > 0) {
                    const bloqueLecturas = data.resultados.find(r => r.leyenda === "LECTURAS");
                    
                    if (bloqueLecturas && bloqueLecturas.subgrupos) {
                        bloqueLecturas.subgrupos.forEach(subgrupo => {
                            // ✅ FILTRO MÁGICO: Solo toma la carpeta si empieza con "202605"
                            if (prefijoBuscado === "" || subgrupo.carpeta.startsWith(prefijoBuscado)) {
                                subgrupo.imagenes.forEach(img => {
                                    const rutaCarpeta = subgrupo.carpeta.replace(/\\/g, '/');
                                    
                                    // ✅ CORREGIDO: Ruta absoluta apuntando al servidor de almacenamiento real
                                    const BASE_IMAGE_URL = "http://200.233.44.171/app_oraclesedalib/public/storage/images/lecturas";
                                    imagenesVisor.push(`${BASE_IMAGE_URL}/${rutaCarpeta}/${img}`);
                                });
                            }
                        });
                    }
                }

                if (imagenesVisor.length > 0) {
                    renderizarImagen();
                } else {
                    photoFrame.innerHTML = `
                        <div class="no-photo-placeholder">
                            <i class="fas fa-image-slash" style="font-size: 3rem; color: #ccc;"></i>
                            <p style="margin-top:10px; color: #888;">No hay fotos para el mes de esta lectura.</p>
                        </div>
                    `;
                }

            } catch (error) {
                console.error("Error al buscar imágenes:", error);
                photoFrame.innerHTML = `
                    <div class="no-photo-placeholder text-danger">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                        <p>Error de conexión al buscar las fotos.</p>
                    </div>
                `;
            }
        });
    }

    // 4. Escuchar clics para los botones Validar (Verde) y Rechazar (Rojo)
    if (tbodyValidacion) {
        tbodyValidacion.addEventListener('click', async (e) => {
            const btnAceptar = e.target.closest('.btn-aceptar-mod');
            const btnRechazar = e.target.closest('.btn-rechazar-mod');
            
            // Si el clic no fue en ninguno de los dos botones de acción, ignorar
            if (!btnAceptar && !btnRechazar) return;
            
            const btnActual = btnAceptar || btnRechazar;
            const idMatriz = btnActual.getAttribute('data-id');
            const nuevoEstado = btnAceptar ? 'MODIFICADO' : 'RECHAZADO';
            const fila = btnActual.closest('tr');

            // Ventana de confirmación sutil para evitar errores accidentales en oficina
            if (!confirm(`¿Está seguro de marcar este suministro como ${nuevoEstado}?`)) return;

            // Deshabilitar temporalmente los botones de la fila para evitar doble clic erróneo
            fila.querySelectorAll('.btn-square').forEach(b => b.disabled = true);

            try {
                // Enviar la petición POST a Flask
                const response = await fetch('/api/cambiar_estado_revision', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id_matriz: idMatriz, 
                        estado: nuevoEstado 
                    })
                });
                
                const result = await response.json();

                if (result.success) {
                    // Animación sutil de desvanecimiento para remover la fila
                    if (fila) {
                        fila.style.transition = 'all 0.4s ease';
                        fila.style.opacity = '0';
                        fila.style.background = nuevoEstado === 'MODIFICADO' ? '#d1fae5' : '#fee2e2'; // Destello verde o rojo
                        
                        setTimeout(() => {
                            fila.remove();
                            
                            // Si la tabla se queda completamente vacía tras remover la fila, mostrar mensaje limpia
                            if (tbodyValidacion.querySelectorAll('tr').length === 0) {
                                tbodyValidacion.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-20">No quedan más registros pendientes en esta búsqueda.</td></tr>`;
                            }
                        }, 400);
                    }
                } else {
                    alert("Error: " + result.message);
                    fila.querySelectorAll('.btn-square').forEach(b => b.disabled = false); // Reactivar si falla
                }

            } catch (error) {
                console.error("Error al actualizar el estado de revisión:", error);
                alert("Ocurrió un error de conexión con el servidor.");
                fila.querySelectorAll('.btn-square').forEach(b => b.disabled = false); // Reactivar si falla
            }
        });
    }

    // 2. Función para dibujar la imagen actual en el marco
    function renderizarImagen() {
        // Un contenedor negro con overflow hidden para que la imagen no se salga al rotar
        photoFrame.innerHTML = `
            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #0f172a; border-radius: 8px;">
                <img id="img-visor-activa" src="${imagenesVisor[indiceImagenActual]}" 
                     style="max-width: 100%; max-height: 100%; object-fit: contain; transform: rotate(${rotacionActual}deg); transition: transform 0.2s ease-in-out;">
                
                <div style="position: absolute; bottom: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
                    ${indiceImagenActual + 1} / ${imagenesVisor.length}
                </div>
            </div>
        `;
    }

    // 3. Controles del Visor
    const btnPrev = document.getElementById('btn-foto-prev');
    const btnNext = document.getElementById('btn-foto-next');
    const btnRotar = document.getElementById('btn-foto-rotar');

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (imagenesVisor.length <= 1) return;
            indiceImagenActual = (indiceImagenActual === 0) ? imagenesVisor.length - 1 : indiceImagenActual - 1;
            rotacionActual = 0; // Reiniciar rotación al cambiar de foto
            renderizarImagen();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (imagenesVisor.length <= 1) return;
            indiceImagenActual = (indiceImagenActual === imagenesVisor.length - 1) ? 0 : indiceImagenActual + 1;
            rotacionActual = 0; // Reiniciar rotación al cambiar de foto
            renderizarImagen();
        });
    }

    if (btnRotar) {
        btnRotar.addEventListener('click', () => {
            if (imagenesVisor.length === 0) return;
            rotacionActual += 90;
            if (rotacionActual >= 360) rotacionActual = 0;
            
            const imgElement = document.getElementById('img-visor-activa');
            if (imgElement) {
                imgElement.style.transform = `rotate(${rotacionActual}deg)`;
            }
        });
    }
});


/* =========================================
   MÓDULO: AVANCE DE VALIDACIÓN DINÁMICO
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const btnBuscarAvance = document.getElementById('btn-buscar-avance');
    const contenedorBarras = document.getElementById('contenedor-barras-avance');
    const fechaInputAvance = document.getElementById('avance-fecha');
    const operarioInputAvance = document.getElementById('avance-operario');

    // 1. Inicializar Select2 en el Modal (El dropdownParent es vital para que no quede oculto detrás del modal)
    if (window.jQuery && $.fn.select2) {
        $('#avance-operario').select2({
            placeholder: "Ej. TODOS, o escriba un operario...",
            allowClear: true,
            dropdownParent: $('#modal-gestion') // Conecta el buscador a tu modal
        });
    }

    // 2. Llenar la lista de operarios dinámicamente cuando la fecha cambie
    $('#avance-fecha').on('change', async function() {
        const fecha = $(this).val(); 
        const selectOp = $('#avance-operario');
        
        // Limpiamos opciones anteriores
        selectOp.empty().append('<option value="">Ej. TODOS, o escriba un operario...</option>');

        if (!fecha) return;

        try {
            // Reutilizamos tu API existente
            const response = await fetch(`/api/operarios_por_fecha?fecha=${fecha}`);
            const operarios = await response.json();

            operarios.forEach(op => {
                selectOp.append(new Option(op, op));
            });
            
            // Actualizar diseño de Select2
            selectOp.trigger('change');
        } catch (error) {
            console.error("Error cargando operarios para avance:", error);
        }
    });

    // 3. Establecer la fecha de hoy por defecto al abrir y disparar el llenado de operarios
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaInputAvance) {
        fechaInputAvance.value = hoy;
        $('#avance-fecha').trigger('change'); // Forzamos la búsqueda de operarios de hoy
    }

    // 4. Lógica de tu botón BUSCAR
    if (btnBuscarAvance) {
        btnBuscarAvance.addEventListener('click', async () => {
            const fecha = fechaInputAvance.value;
            const operario = $('#avance-operario').val() || ''; // Capturamos el valor de Select2

            // Validación estricta: La fecha es obligatoria
            if (!fecha) {
                alert("Por favor, seleccione una fecha. Es obligatoria para medir el avance.");
                fechaInputAvance.focus();
                return;
            }

            // Estado de carga
            contenedorBarras.innerHTML = `
                <div style="margin: auto; text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin text-blue fa-2x"></i>
                    <p style="margin-top: 15px; font-weight: 600; color: var(--c-blue);">Calculando avance en tiempo real...</p>
                </div>
            `;

            try {
                // Llamamos a nuestra nueva API
                const response = await fetch(`/api/avance_validacion?fecha=${encodeURIComponent(fecha)}&operario=${encodeURIComponent(operario)}`);
                const data = await response.json();

                contenedorBarras.innerHTML = ''; // Limpiamos

                if (!data.success) {
                    contenedorBarras.innerHTML = `<div class="text-center text-danger py-20 fw-600">${data.error}</div>`;
                    return;
                }

                if (data.data.length === 0) {
                    contenedorBarras.innerHTML = `
                        <div style="margin: auto; text-align: center; padding: 40px;">
                            <i class="fas fa-folder-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
                            <p style="margin: 0; font-size: 1rem; font-weight: 600; color: #64748b;">No hay registros cargados ni avance para esta fecha.</p>
                        </div>
                    `;
                    return;
                }

                // Dibujamos tarjetas con diseño premium y colores térmicos
                data.data.forEach(item => {
                    let porcentaje = 0;
                    if (item.total > 0) {
                        porcentaje = Math.round((item.procesados / item.total) * 100);
                    }
                    
                    // 🌟 RECOMENDACIÓN INTEGRADA: Regla de semáforo inteligente 🌟
                    let colorBarra = '';
                    let colorFondoTag = '';
                    let colorBordeTag = '';

                    if (porcentaje <= 30) {
                        // Crítico (Rojo)
                        colorBarra = '#ef4444';
                        colorFondoTag = '#fef2f2';
                        colorBordeTag = '#fee2e2';
                    } else if (porcentaje <= 70) {
                        // En Progreso Medio (Naranja)
                        colorBarra = '#f97316';
                        colorFondoTag = '#fff7ed';
                        colorBordeTag = '#ffedd5';
                    } else if (porcentaje < 100) {
                        // Avanzado (Azul Oficina)
                        colorBarra = '#3b82f6';
                        colorFondoTag = '#eff6ff';
                        colorBordeTag = '#dbeafe';
                    } else {
                        // Completado al 100% (Verde Éxito)
                        colorBarra = '#10b981';
                        colorFondoTag = '#ecfdf5';
                        colorBordeTag = '#d1fae5';
                    }

                    const div = document.createElement('div');
                    // Diseño fino: Bordes más delgados, fuentes elegantes, barras estilizadas
                    div.innerHTML = `
                        <div style="padding: 12px 16px; border: 1px solid #f1f5f9; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.01); transition: transform 0.2s;">
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #475569; font-size: 0.88rem; letter-spacing: -0.01em;">
                                    ${item.operario}
                                </span>
                                
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <span style="font-size: 0.8rem; font-weight: 500; color: #94a3b8;">
                                        ${item.procesados} de ${item.total}
                                    </span>
                                    <span style="color: ${colorBarra}; background: ${colorFondoTag}; padding: 2px 8px; border-radius: 6px; border: 1px solid ${colorBordeTag}; font-size: 0.78rem; font-weight: 700; min-width: 38px; text-align: center;">
                                        ${porcentaje}%
                                    </span>
                                </div>
                            </div>

                            <div style="height: 5px; background: #f8fafc; border-radius: 10px; width: 100%; border: 1px solid #f1f5f9;">
                                <div style="height: 100%; width: ${porcentaje}%; background-color: ${colorBarra}; border-radius: 10px; transition: width 0.8s cubic-bezier(0.25, 1, 0.5, 1);"></div>
                            </div>
                            
                        </div>
                    `;
                    contenedorBarras.appendChild(div);
                });

            } catch (error) {
                console.error("Error al cargar el avance:", error);
                contenedorBarras.innerHTML = `
                    <div style="margin: auto; text-align: center; padding: 40px;">
                        <i class="fas fa-spinner fa-spin text-blue fa-2x"></i>
                        <p style="margin-top: 15px; font-weight: 600; color: var(--c-blue);">Calculando avance en tiempo real...</p>
                    </div>
                `;
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    
    const inputFecha = document.getElementById('reporte-fecha');
    const selectOperarios = $('#reporte-operarios');
    const btnPrevisualizar = document.getElementById('btn-previsualizar-reporte');
    const btnDescargar = document.getElementById('btn-descargar-excel');

    // Inicializar Select2
    if (selectOperarios.length > 0) {
        selectOperarios.select2({
            placeholder: "Seleccione fecha primero...",
            allowClear: true,
            width: '100%',
            dropdownParent: $('#modal-gestion') 
        });
    }

    // ==========================================
    // MAGIA: Llenar operarios al cambiar la fecha
    // ==========================================
    if (inputFecha) {
        inputFecha.addEventListener('change', async () => {
            const fecha = inputFecha.value;
            
            console.log("🗓️ 1. Se seleccionó la fecha en el input:", fecha); // DEBUG
            
            selectOperarios.empty();
            selectOperarios.append(new Option("TODOS", "TODOS", true, true));

            if (!fecha) return; 

            try {
                console.log(`🌐 2. Consultando al servidor: /api/operarios_por_fecha?fecha=${fecha}`); // DEBUG
                
                const response = await fetch(`/api/operarios_por_fecha?fecha=${fecha}`);
                const listaOperarios = await response.json();

                console.log("✅ 3. El servidor respondió con esta lista:", listaOperarios); // DEBUG

                if (listaOperarios.length > 0) {
                    listaOperarios.forEach(op => {
                        selectOperarios.append(new Option(op, op, false, false));
                    });
                } else {
                    console.warn("⚠️ 4. La lista llegó vacía. Asegúrate de que existan registros en la base de datos para esa fecha exacta.");
                }
                
                selectOperarios.trigger('change'); 

            } catch (error) {
                console.error("❌ Error al cargar operarios:", error);
            }
        });
    }

    // ==========================================
    // PREVISUALIZAR
    // ==========================================
    if (btnPrevisualizar) {
        btnPrevisualizar.addEventListener('click', async () => {
            const fecha = document.getElementById('reporte-fecha').value;
            let operarios = selectOperarios.val() || [];
            if (operarios.includes("TODOS")) operarios = ["TODOS"];
            const estado = document.getElementById('reporte-estado').value;
            
            const tbody = document.getElementById('tbody-reportes');

            if (!fecha) {
                alert("Por favor, seleccione una Fecha de Lectura primero.");
                return;
            }

            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-20"><i class="fas fa-spinner fa-spin text-muted"></i> Cargando data...</td></tr>`;

            try {
                // ENVIAMOS LA FECHA TAMBIÉN AL BACKEND
                const response = await fetch('/api/reportes/previsualizar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha, operarios, estado })
                });
                
                const result = await response.json();

                if (result.success && result.data.length > 0) {
                    document.getElementById('reporte-contador').textContent = `PREVISUALIZACIÓN DE REPORTE (${result.total} registros)`;
                    
                    tbody.innerHTML = result.data.map(r => `
                        <tr>
                            <td><strong>${r.clicodfac}</strong></td>
                            <td>${r.medcodygo}</td>
                            <td>${r.lectura}</td>
                            <td>${r.feclec}</td>
                            <td>${r.operador}</td>
                            <td><span class="badge" style="background:#e2e8f0; color:#334155; padding: 4px 8px; border-radius: 4px; font-size:10px; font-weight:bold;">${r.estado}</span></td>
                            <td style="color:#10b981; font-weight:bold;">${r.nueva_lect}</td>
                            <td style="color:#ef4444; font-weight:bold;">${r.nuevo_med}</td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-20">No se encontraron registros.</td></tr>`;
                    document.getElementById('reporte-contador').textContent = `PREVISUALIZACIÓN DE REPORTE (0 registros)`;
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    // ==========================================
    // DESCARGAR EXCEL
    // ==========================================
    if (btnDescargar) {
        btnDescargar.addEventListener('click', async () => {
            const fecha = document.getElementById('reporte-fecha').value;
            let operarios = selectOperarios.val() || [];
            if (operarios.includes("TODOS")) operarios = ["TODOS"];
            const estado = document.getElementById('reporte-estado').value;

            if (!fecha) {
                alert("Por favor, seleccione una Fecha de Lectura primero.");
                return;
            }

            const originalHTML = btnDescargar.innerHTML;
            btnDescargar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';
            btnDescargar.disabled = true;

            try {
                // ENVIAMOS LA FECHA TAMBIÉN AL BACKEND EXCEL
                const response = await fetch('/api/reportes/descargar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fecha, operarios, estado })
                });

                if (!response.ok) throw new Error("Error en la descarga");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_${fecha}.xlsx`; // Nombre con la fecha exacta
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

            } catch (error) {
                alert("Ocurrió un error al intentar generar el archivo Excel.");
            } finally {
                btnDescargar.innerHTML = originalHTML;
                btnDescargar.disabled = false;
            }
        });
    }
});




//// GESTION DE CARTAS ////
let cartasGlobalesBD = []; 

// =========================================================
// 1. CONTROL DE VISTAS Y MODALES
// =========================================================
function cambiarPestanaCartas(idVista, boton) {
    document.querySelectorAll('#cartas_1 .crt-main-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#cartas_1 .crt-view-content').forEach(v => v.classList.remove('active'));
    boton.classList.add('active');
    document.getElementById('vista-' + idVista).classList.add('active');
}

function abrirModalCarta() {
    document.getElementById('modalCarta').classList.add('active');
    // Llenamos el buscador automáticamente cada vez que se abre el modal
    cargarOpcionesBuscador(); 
}

function cerrarModalCarta() {
    document.getElementById('modalCarta').classList.remove('active');
    // Limpiar formulario y resetear estados al cerrar
    document.getElementById('formRegistrarCarta').reset();
    document.getElementById('ocr-loading').style.display = 'none';
    document.getElementById('carta_referencia_id').value = '';
    const listaResultados = document.getElementById('lista_resultados_cartas');
    if(listaResultados) listaResultados.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const inputPdf = document.getElementById('input_archivo_pdf');
    const loadingDiv = document.getElementById('ocr-loading');
    
    if(inputPdf) {
        inputPdf.addEventListener('change', async function() {
            const file = this.files[0];
            if (!file) return;

            // Mostrar el loader
            loadingDiv.style.display = 'flex';

            const formData = new FormData();
            formData.append('archivo_pdf', file);

            try {
                const response = await fetch('/api/cartas/analizar-pdf', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.exito) {
                    if (result.datos.numero_carta) {
                        document.getElementById('input_numero_carta').value = result.datos.numero_carta;
                    }
                    if (result.datos.asunto) {
                        document.getElementById('input_asunto').value = result.datos.asunto;
                    }
                } else {
                    console.error("No se pudo extraer texto: ", result.error);
                }
            } catch (error) {
                console.error("Error de conexión con el OCR:", error);
            } finally {
                loadingDiv.style.display = 'none';
            }
        });
    }
});

// =========================================================
// 3. FORMATEO Y GUARDADO DE CARTA (Al darle a Guardar)
// =========================================================
async function guardarCartaFormateada(event) {
    event.preventDefault(); // Detenemos el envío normal

    const form = event.target;
    const formData = new FormData(form);
    const btnSubmit = form.querySelector('button[type="submit"]');

    // Cambiar estado del botón a cargando
    const textoOriginalBtn = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btnSubmit.disabled = true;

    // 1. FORMATEAR EL NÚMERO DE CARTA (Respeta la digitación manual del año)
    let numCarta = document.getElementById('input_numero_carta').value.trim();
    if (numCarta) {
        formData.set('numero_carta', numCarta);
    }

    // 2. FORMATEAR ASUNTO A MAYÚSCULAS
    let asunto = document.getElementById('input_asunto').value.toUpperCase();
    formData.set('asunto', asunto);

    // El ID de referencia se captura automáticamente porque el input "hidden" 
    // tiene el atributo name="carta_referencia_id".

    // 3. ENVIAR A FLASK
    try {
        const response = await fetch('/api/cartas/registrar', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.exito) {
            cerrarModalCarta();
            cargarTablaCartas(1); // Recargamos la tabla visual
        } else {
            alert("Error al guardar: " + result.error);
        }
    } catch (error) {
        console.error("Fallo de red:", error);
        alert("Ocurrió un error de red al intentar guardar.");
    } finally {
        // Restaurar botón
        btnSubmit.innerHTML = textoOriginalBtn;
        btnSubmit.disabled = false;
    }
}

// =========================================================
// 4. LÓGICA DEL BUSCADOR INTERACTIVO PERSONALIZADO
// =========================================================
async function cargarOpcionesBuscador() {
    try {
        const response = await fetch('/api/cartas/todas-basico'); 
        const result = await response.json();
        
        if (result.exito) {
            cartasGlobalesBD = result.datos; // Guardamos en memoria para filtrar rápido
            renderizarListaBuscador(cartasGlobalesBD);
        }
    } catch (e) {
        console.error("Error cargando cartas previas:", e);
    }
}

function renderizarListaBuscador(listaCartas) {
    const contenedor = document.getElementById('lista_resultados_cartas');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if(listaCartas.length === 0) {
        contenedor.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.85rem; text-align: center;">No hay coincidencias</div>';
        return;
    }

    listaCartas.forEach(carta => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 10px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155; transition: background 0.2s;";
        item.innerHTML = `<strong style="color: #0f172a;">${carta.numero_carta}</strong><br><span style="color: #64748b;">${carta.asunto}</span>`;
        
        item.onmouseover = () => item.style.backgroundColor = '#f8fafc';
        item.onmouseout = () => item.style.backgroundColor = 'transparent';
        
        item.onclick = () => {
            document.getElementById('buscador_referencia').value = `${carta.numero_carta} | ${carta.asunto}`;
            document.getElementById('carta_referencia_id').value = carta.id;
            contenedor.style.display = 'none';
        };
        
        contenedor.appendChild(item);
    });
}

function mostrarOpcionesBuscador() {
    const contenedor = document.getElementById('lista_resultados_cartas');
    if(contenedor) contenedor.style.display = 'block';
    // Limpiamos el ID oculto si el usuario empieza a escribir algo nuevo manualmente
    document.getElementById('carta_referencia_id').value = ""; 
}

function filtrarOpcionesBuscador() {
    const texto = document.getElementById('buscador_referencia').value.toLowerCase();
    const cartasFiltradas = cartasGlobalesBD.filter(c => 
        c.numero_carta.toLowerCase().includes(texto) || 
        c.asunto.toLowerCase().includes(texto)
    );
    renderizarListaBuscador(cartasFiltradas);
}

// Ocultar la lista flotante si el usuario hace clic fuera de ella
document.addEventListener('click', function(e) {
    const container = document.getElementById('contenedor-buscador');
    const lista = document.getElementById('lista_resultados_cartas');
    if (container && lista && !container.contains(e.target)) {
        lista.style.display = 'none';
    }
});


// =====================================================================
// 5. PAGINACIÓN Y CARGA DE LA BANDEJA PRINCIPAL
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarTablaCartas(1);
});

// Variable global para no saturar el servidor al teclear rápido
let temporizadorFiltro = null;

function aplicarFiltrosCartas() {
    clearTimeout(temporizadorFiltro);
    // Espera 400ms después de que el usuario deje de escribir para hacer la búsqueda
    temporizadorFiltro = setTimeout(() => {
        cargarTablaCartas(1); // Siempre que filtramos, volvemos a la página 1
    }, 400);
}

async function cargarTablaCartas(pagina) {
    const tbody = document.querySelector('#vista-bandeja .crt-table tbody');
    const paginadorContainer = document.querySelector('.crt-pagination');
    
    if(!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="crt-text-center" style="padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Cargando documentos...</td></tr>`;

    // 1. CAPTURAR LOS VALORES DE LOS FILTROS
    const search = document.getElementById('filtro_buscar') ? document.getElementById('filtro_buscar').value : '';
    const tipo = document.getElementById('filtro_tipo') ? document.getElementById('filtro_tipo').value : '';
    const estado = document.getElementById('filtro_estado') ? document.getElementById('filtro_estado').value : '';

    // 2. CONSTRUIR LA URL CON LOS PARÁMETROS DE BÚSQUEDA
    let url = `/api/cartas/listar?page=${pagina}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (tipo) url += `&tipo=${encodeURIComponent(tipo)}`;
    if (estado) url += `&estado=${encodeURIComponent(estado)}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.exito) {
            tbody.innerHTML = ''; 
            
            if (result.datos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="crt-text-center" style="padding: 20px; color: #64748b;">No se encontraron documentos con esos filtros.</td></tr>`;
            } else {
                result.datos.forEach(carta => {
                    let badgeFlujo = carta.tipo === 'RECIBIDA' 
                        ? '<span class="crt-badge crt-badge-entrada"><i class="fas fa-arrow-down"></i> RECIBIDA</span>'
                        : '<span class="crt-badge crt-badge-salida"><i class="fas fa-arrow-up"></i> EMITIDA</span>';
                        
                    let badgeEstado = carta.estado === 'PENDIENTE'
                        ? '<span class="crt-badge crt-badge-pendiente">PENDIENTE</span>'
                        : '<span class="crt-badge crt-badge-atendida">' + carta.estado + '</span>';

                    let badgeVencimiento = carta.fecha_limite === '-' 
                        ? '<span style="color: #94a3b8;">-</span>' 
                        : `<span style="color: #ef4444; font-weight: 600;"><i class="far fa-calendar-times"></i> ${carta.fecha_limite}</span>`;

                    let btnVerPDF = `<button onclick="abrirVisorPDF('${carta.ruta_pdf}', '${carta.numero_carta}')" title="Ver Documento" style="background: transparent; border: 1px solid #cbd5e1; color: #3b82f6; padding: 6px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#3b82f6';" onmouseout="this.style.background='transparent'; this.style.borderColor='#cbd5e1';"><i class="fas fa-eye"></i></button>`;

                    tbody.innerHTML += `
                        <tr style="transition: background 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                            <td style="color: var(--crt-accent); font-weight: 600;">${carta.numero_carta}</td>
                            <td>${badgeFlujo}</td>
                            <td>${carta.asunto}</td>
                            <td>${carta.fecha}</td>
                            <td>${badgeVencimiento}</td>
                            <td>${badgeEstado}</td>
                            <td style="text-align: center;">${btnVerPDF}</td>
                        </tr>
                    `;
                });
            }
            dibujarControlesPaginacion(result.meta, paginadorContainer);
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="crt-text-center" style="color: red;">Error: ${result.error}</td></tr>`;
        }
    } catch (error) {
        console.error("Error cargando la tabla:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="crt-text-center" style="color: red;">Error de conexión.</td></tr>`;
    }
}


// =====================================================================
// AUTOLOAD (Al abrir la página, cargamos la tabla y las opciones del buscador)
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarTablaCartas(1);
    cargarOpcionesBuscador(); // Carga las cartas globales en la variable cartasGlobalesBD
});

// =====================================================================
// LÓGICA DEL BUSCADOR/SELECCIONADOR PRINCIPAL DE LA TABLA
// =====================================================================
function mostrarOpcionesFiltro() {
    filtrarOpcionesFiltro(); // Al hacer clic, evalúa si debe mostrar algo
}

function filtrarOpcionesFiltro() {
    const texto = document.getElementById('filtro_buscar').value.toLowerCase();
    const contenedor = document.getElementById('lista_resultados_filtro');
    
    // 1. Disparamos la búsqueda real en la tabla de fondo
    aplicarFiltrosCartas();

    if (!contenedor) return;

    // 2. Si el texto está vacío, ocultamos la lista flotante
    if (texto.trim() === '') {
        contenedor.style.display = 'none';
        return;
    }

    // 3. Mostramos y llenamos la lista
    contenedor.style.display = 'block';
    contenedor.innerHTML = '';
    
    // Filtramos de la variable global y limitamos a 10 resultados para no saturar la pantalla
    const cartasFiltradas = cartasGlobalesBD.filter(c => 
        c.numero_carta.toLowerCase().includes(texto) || 
        c.asunto.toLowerCase().includes(texto)
    ).slice(0, 10); 

    if(cartasFiltradas.length === 0) {
        contenedor.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.85rem; text-align: center;">No hay coincidencias</div>';
        return;
    }

    cartasFiltradas.forEach(carta => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 10px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155; transition: background 0.2s;";
        item.innerHTML = `<strong style="color: #0f172a;">${carta.numero_carta}</strong><br><span style="color: #64748b;">${carta.asunto}</span>`;
        
        item.onmouseover = () => item.style.backgroundColor = '#f8fafc';
        item.onmouseout = () => item.style.backgroundColor = 'transparent';
        
        // 4. AL SELECCIONAR: Autocompleta el input y oculta la lista
        item.onclick = () => {
            document.getElementById('filtro_buscar').value = carta.numero_carta;
            contenedor.style.display = 'none';
            aplicarFiltrosCartas(); // Fuerza la recarga de la tabla con la carta exacta
        };
        
        contenedor.appendChild(item);
    });
}

// 5. CERRAR LISTAS AL HACER CLIC AFUERA
document.addEventListener('click', function(e) {
    // Para el modal
    const containerModal = document.getElementById('contenedor-buscador');
    const listaModal = document.getElementById('lista_resultados_cartas');
    if (containerModal && listaModal && !containerModal.contains(e.target)) {
        listaModal.style.display = 'none';
    }

    // Para la barra principal
    const containerFiltro = document.getElementById('contenedor-filtro-buscador');
    const listaFiltro = document.getElementById('lista_resultados_filtro');
    if (containerFiltro && listaFiltro && !containerFiltro.contains(e.target)) {
        listaFiltro.style.display = 'none';
    }
});

function dibujarControlesPaginacion(meta, container) {
    // Estilos generales del contenedor para alinearlo todo a la derecha
    container.style.display = 'flex';
    container.style.justifyContent = 'flex-end';
    container.style.alignItems = 'center';
    container.style.gap = '20px';
    container.style.marginTop = '20px';
    container.style.paddingTop = '15px';
    container.style.borderTop = '1px solid #e2e8f0';

    if (!meta || meta.total_items === 0) {
        container.innerHTML = '<div style="color: #64748b; font-size: 0.85rem;">No hay documentos para mostrar.</div>';
        return;
    }

    let inicio = ((meta.current_page - 1) * 10) + 1;
    let fin = Math.min(meta.current_page * 10, meta.total_items);

    // Texto de información
    let html = `<div style="color: #64748b; font-size: 0.85rem;">Mostrando <strong>${inicio}</strong> a <strong>${fin}</strong> de <strong>${meta.total_items}</strong> documentos</div>`;
    
    // Contenedor de los botones
    html += `<div style="display: flex; gap: 5px;">`;

    // Variables de diseño para los botones
    const btnBase = "padding: 6px 12px; border: 1px solid #cbd5e1; background: white; color: #475569; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s;";
    const btnActive = "padding: 6px 12px; border: 1px solid #0f172a; background: #0f172a; color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 600;";
    const btnDisabled = "padding: 6px 12px; border: 1px solid #e2e8f0; background: #f8fafc; color: #94a3b8; border-radius: 4px; cursor: not-allowed; font-size: 0.85rem;";

    // Botón "Anterior"
    if (meta.has_prev) {
        html += `<button style="${btnBase}" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'" onclick="cargarTablaCartas(${meta.current_page - 1})"><i class="fas fa-chevron-left"></i></button>`;
    } else {
        html += `<button style="${btnDisabled}" disabled><i class="fas fa-chevron-left"></i></button>`;
    }

    // Botones numéricos
    for (let i = 1; i <= meta.total_pages; i++) {
        if (i === meta.current_page) {
            html += `<button style="${btnActive}">${i}</button>`;
        } else {
            html += `<button style="${btnBase}" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'" onclick="cargarTablaCartas(${i})">${i}</button>`;
        }
    }

    // Botón "Siguiente"
    if (meta.has_next) {
        html += `<button style="${btnBase}" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'" onclick="cargarTablaCartas(${meta.current_page + 1})"><i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button style="${btnDisabled}" disabled><i class="fas fa-chevron-right"></i></button>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// =====================================================================
// LÓGICA DEL VISOR DE PDF
// =====================================================================
// IVARGAS - 11/07/2026
// =====================================
async function abrirVisorPDF(rutaPDF, tituloCarta) {
    if (!rutaPDF || rutaPDF === 'null') {
        alert("El archivo PDF no se encuentra disponible.");
        return;
    }

    document.getElementById('tituloVisorPDF').innerHTML = `<i class="far fa-file-pdf" style="color: #ef4444; margin-right: 8px;"></i> ${tituloCarta}`;
    document.getElementById('pdfLoadingSpinner').style.display = 'block';
    document.getElementById('modalVisorPDF').classList.add('active');

    try {
        const response = await fetch(rutaPDF);
        const data = await response.json();

        if (!response.ok || !data.exito) {
            throw new Error(data.error || 'No se pudo obtener la URL del documento.');
        }

        const signedUrl = data.url;
        document.getElementById('btnDescargarPDF').href = signedUrl;
        document.getElementById('iframePDF').src = signedUrl;
    } catch (error) {
        console.error('Error al obtener documento:', error);
        document.getElementById('pdfLoadingSpinner').style.display = 'none';
        alert('No se pudo cargar el documento. Intente nuevamente.');
        document.getElementById('modalVisorPDF').classList.remove('active');
    }
}
// =====================================

function cerrarVisorPDF() {
    document.getElementById('modalVisorPDF').classList.remove('active');
    // Limpiamos el iframe por seguridad y rendimiento de memoria
    setTimeout(() => { document.getElementById('iframePDF').src = ''; }, 300);
}

// =====================================================================
// LÓGICA DE LA PESTAÑA DE HILOS / EXPEDIENTES
// =====================================================================

// 1. Buscador Inteligente para Hilos
function mostrarOpcionesHilo() {
    filtrarOpcionesHilo();
}

function filtrarOpcionesHilo() {
    const texto = document.getElementById('filtro_hilo').value.toLowerCase();
    const contenedor = document.getElementById('lista_resultados_hilo');
    
    if (!contenedor) return;

    if (texto.trim() === '') {
        contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'block';
    contenedor.innerHTML = '';
    
    const cartasFiltradas = cartasGlobalesBD.filter(c => 
        c.numero_carta.toLowerCase().includes(texto) || 
        c.asunto.toLowerCase().includes(texto)
    ).slice(0, 10); 

    if(cartasFiltradas.length === 0) {
        contenedor.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.85rem; text-align: center;">No hay coincidencias</div>';
        return;
    }

    cartasFiltradas.forEach(carta => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 10px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; color: #334155; transition: background 0.2s;";
        item.innerHTML = `<strong style="color: #0f172a;">${carta.numero_carta}</strong><br><span style="color: #64748b;">${carta.asunto}</span>`;
        
        item.onmouseover = () => item.style.backgroundColor = '#f8fafc';
        item.onmouseout = () => item.style.backgroundColor = 'transparent';
        
        item.onclick = () => {
            document.getElementById('filtro_hilo').value = carta.numero_carta;
            document.getElementById('hilo_carta_id').value = carta.id;
            contenedor.style.display = 'none';
        };
        
        contenedor.appendChild(item);
    });
}

// Agregar al EventListener global de clics para cerrar esta lista también
document.addEventListener('click', function(e) {
    const containerHilo = document.getElementById('contenedor-filtro-hilo');
    const listaHilo = document.getElementById('lista_resultados_hilo');
    if (containerHilo && listaHilo && !containerHilo.contains(e.target)) {
        listaHilo.style.display = 'none';
    }
});


// 2. Trazabilidad: Obtener y dibujar la línea de tiempo
async function rastrearExpediente() {
    const cartaId = document.getElementById('hilo_carta_id').value;
    const timelineContainer = document.getElementById('contenedor_timeline');
    
    if (!cartaId) {
        alert("Por favor, selecciona una carta de la lista sugerida.");
        return;
    }

    timelineContainer.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Rastreando historial...</div>';

    try {
        // Llamamos al backend para que nos arme la rama completa
        const response = await fetch(`/api/cartas/hilo/${cartaId}`);
        const result = await response.json();

        if (result.exito) {
            timelineContainer.innerHTML = '';
            const hilo = result.datos; // Array ordenado cronológicamente

            if (hilo.length === 0) {
                timelineContainer.innerHTML = '<div style="color: red;">No se encontró información.</div>';
                return;
            }

            // Actualizamos el resumen izquierdo
            document.getElementById('resumen_expediente').style.display = 'block';
            document.getElementById('resumen_inicio').textContent = hilo[0].numero_carta;
            document.getElementById('resumen_total').textContent = hilo.length;

            // Dibujamos cada ítem de la línea de tiempo
            hilo.forEach(carta => {
                let colorMarker = carta.tipo === 'RECIBIDA' ? 'received' : 'emitted';
                let iconMarker = carta.tipo === 'RECIBIDA' ? 'fa-arrow-down' : 'fa-arrow-up';
                
                let badgeFlujo = carta.tipo === 'RECIBIDA' 
                    ? '<span class="crt-badge crt-badge-entrada">RECIBIDA</span>'
                    : '<span class="crt-badge crt-badge-salida">EMITIDA</span>';
                
                let badgeEstado = carta.estado === 'PENDIENTE'
                    ? '<span class="crt-badge crt-badge-pendiente" style="margin-left: 5px;">PENDIENTE</span>'
                    : `<span class="crt-badge crt-badge-atendida" style="margin-left: 5px;">${carta.estado}</span>`;

                timelineContainer.innerHTML += `
                    <div class="crt-timeline-item">
                        <div class="crt-timeline-marker ${colorMarker}"><i class="fas ${iconMarker}"></i></div>
                        <div class="crt-timeline-content">
                            <div class="crt-timeline-header">
                                <span style="color: var(--crt-accent); font-weight: 600; font-size: 1.05rem;">${carta.numero_carta}</span>
                                <span style="color: var(--crt-text-muted); font-size: 0.85rem;">${carta.fecha}</span>
                            </div>
                            <p style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--crt-text-main);"><strong>Asunto:</strong> ${carta.asunto}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>${badgeFlujo} ${badgeEstado}</div>
                                <!-- Inyectamos tu maravilloso visor de PDF directo en la línea de tiempo -->
                                <button onclick="abrirVisorPDF('${carta.ruta_pdf}', '${carta.numero_carta}')" class="crt-btn" style="padding: 4px 10px; font-size: 0.75rem; background: transparent; color: #3b82f6; border: 1px solid #cbd5e1;">
                                    <i class="fas fa-eye"></i> Leer PDF
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

        } else {
            timelineContainer.innerHTML = `<div style="color: red;">Error: ${result.error}</div>`;
        }
    } catch (error) {
        console.error(error);
        timelineContainer.innerHTML = '<div style="color: red;">Error de conexión.</div>';
    }
}
