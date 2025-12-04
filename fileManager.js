// doctores.js - Aquí manejo toda la lógica de los médicos y sus agendas

class DoctoresManager {
    // Guardo las citas aquí temporalmente para filtrar rápido sin recargar la página
    static agendaCache = []; 

    static async cargar() {
        // Activo el menú lateral para que se vea azul
        if (typeof activarMenu === 'function') activarMenu('doctores');
        if (typeof actualizarTitulo === 'function') actualizarTitulo('Equipo Médico');
        
        mostrarLoader('Cargando doctores...');
        
        try {
            // Pido la lista al backend
            const response = await DoctoresService.getAll();
            const doctores = response.data || [];
            
            // Truco con Set para sacar las especialidades sin repetir
            const especialidades = [...new Set(doctores.map(d => d.especialidad))];
            
            // Armo el HTML del encabezado y filtros
            const html = `
                <div class="section-header">
                    <div class="filters-container">
                        <select id="filter-especialidad" onchange="DoctoresManager.filtrar()">
                            <option value="">Todas las especialidades</option>
                            ${especialidades.map(esp => `<option value="${esp}">${esp}</option>`).join('')}
                        </select>
                        <div class="search-container">
                            <input type="text" id="search-doctores" placeholder="Buscar doctor..." onkeyup="DoctoresManager.filtrar()">
                            <i class="ph ph-magnifying-glass"></i>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="DoctoresManager.abrirFormulario()">
                        <i class="ph-bold ph-plus"></i> Nuevo Doctor
                    </button>
                </div>
                
                <div class="card-grid" id="grid-doctores">
                    ${this.generarTarjetasDoctores(doctores)}
                </div>
            `;
            
            document.getElementById('app-content').innerHTML = html;
            ocultarLoader();

        } catch (error) {
            console.error(error); // Para ver el error en la consola
            ocultarLoader();
            mostrarError('No se pudieron cargar los doctores');
        }
    }

    // Función auxiliar para dibujar las tarjetas (cards)
    static generarTarjetasDoctores(doctores) {
        if (doctores.length === 0) return '<div class="empty-state">No hay doctores registrados</div>';

        return doctores.map(doc => {
            // Si tiene foto la pongo, si no, pongo la inicial de su nombre
            const avatarContent = doc.fotoUrl 
                ? `<img src="${doc.fotoUrl}" alt="${doc.nombre}" style="width:100%; height:100%; object-fit:cover;">`
                : doc.nombre.charAt(0);
            
            const avatarStyle = doc.fotoUrl ? 'padding:0; background:transparent;' : '';

            return `
            <div class="stat-card doctor-card-item">
                <div class="doctor-header" style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
                    <div class="avatar" style="width:60px; height:60px; font-size:1.5rem; overflow:hidden; ${avatarStyle}">
                        ${avatarContent}
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:1.1rem;">${doc.nombre}</h3>
                        <div class="status-badge" style="background:#ecfdf5; color:#059669; font-size:0.75rem; margin-top:0.25rem; display:inline-block;">Activo</div>
                    </div>
                </div>
                
                <p style="color:var(--text-muted); margin-bottom:0.5rem; font-weight:600;">${doc.especialidad}</p>
                
                <div style="font-size:0.9rem; color:var(--secondary); margin-bottom:1rem; background:#f8fafc; padding:0.5rem; border-radius:8px;">
                    <i class="ph ph-clock"></i> ${doc.horarioInicio} - ${doc.horarioFin}
                </div>
                
                <div class="doctor-actions" style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="btn-secondary" style="flex:1" onclick="DoctoresManager.verAgenda('${doc.id}')">
                        <i class="ph ph-calendar"></i> Agenda
                    </button>
                    <button class="btn-secondary" onclick="DoctoresManager.abrirFormulario('${doc.id}')">
                        <i class="ph ph-pencil"></i>
                    </button>
                </div>
            </div>
        `}).join('');
    }

    // ==========================================
    // LOGICA DE LA AGENDA (MODAL)
    // ==========================================

    static async verAgenda(id) {
        mostrarLoader('Cargando agenda...');
        
        try {
            // Uso Promise.all para cargar doctor y citas al mismo tiempo (es más rápido)
            const [doctorRes, agendaRes] = await Promise.all([
                DoctoresService.getById(id),
                DoctoresService.getAgenda(id)
            ]);
            
            const doctor = doctorRes.data;
            this.agendaCache = agendaRes.data || [];
            
            // Ordeno las citas por fecha y luego por hora
            this.agendaCache.sort((a, b) => {
                if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
                return a.hora.localeCompare(b.hora);
            });

            const html = `
                <div class="doctor-info-container" style="display:block; margin-bottom: 1.5rem;">
                    <h4 class="doctor-info-title">Dr. ${doctor.nombre}</h4>
                    <p class="doctor-info-value">${doctor.especialidad}</p>
                    <small>Horario: ${doctor.horarioInicio} - ${doctor.horarioFin}</small>
                </div>

                <div class="agenda-filters">
                    <button class="filter-btn active" onclick="DoctoresManager.filtrarAgenda('hoy', this)">Hoy</button>
                    <button class="filter-btn" onclick="DoctoresManager.filtrarAgenda('semana', this)">Esta Semana</button>
                    <button class="filter-btn" onclick="DoctoresManager.filtrarAgenda('proximos', this)">Próximos 7 días</button>
                    <button class="filter-btn" onclick="DoctoresManager.filtrarAgenda('todos', this)">Ver Todo</button>
                </div>

                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="agenda-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Paciente</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="agenda-body"></tbody>
                    </table>
                </div>
            `;

            ocultarLoader();
            abrirModal('Agenda Médica', html);
            
            // Cargo por defecto las citas de hoy
            this.filtrarAgenda('hoy', document.querySelector('.filter-btn')); 

        } catch (error) {
            console.error(error);
            ocultarLoader();
            mostrarError('No se pudo abrir la agenda');
        }
    }

    // Filtra las citas en memoria (sin ir al servidor)
    static filtrarAgenda(filtro, btnElement) {
        // Cambio el color del botón activo
        if (btnElement) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btnElement.classList.add('active');
        }

        const tbody = document.getElementById('agenda-body');
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        
        // Logica para filtrar por rangos de fecha
        const citasFiltradas = this.agendaCache.filter(cita => {
            const fechaCita = new Date(cita.fecha + 'T00:00:00'); // El 'T00' es para evitar líos de zona horaria
            
            switch(filtro) {
                case 'hoy': return cita.fecha === hoyStr;
                case 'semana':
                    // Calculo el lunes y domingo de esta semana
                    const diaSemana = hoy.getDay() || 7;
                    const lunes = new Date(hoy);
                    lunes.setHours(0,0,0,0);
                    lunes.setDate(hoy.getDate() - diaSemana + 1);
                    const domingo = new Date(lunes);
                    domingo.setDate(lunes.getDate() + 6);
                    domingo.setHours(23,59,59,999);
                    return fechaCita >= lunes && fechaCita <= domingo;
                case 'proximos':
                    // Próximos 7 días
                    const limite = new Date(hoy);
                    limite.setDate(hoy.getDate() + 7);
                    const ft = fechaCita.getTime();
                    const ht = new Date(hoyStr).getTime();
                    return ft >= ht && ft <= limite.getTime();
                default: return true; // 'todos'
            }
        });

        // Renderizo la tabla
        if (citasFiltradas.length > 0) {
            tbody.innerHTML = citasFiltradas.map(cita => `
                <tr>
                    <td data-label="Fecha">${cita.fecha}</td>
                    <td data-label="Hora" style="font-weight: 600;">${cita.hora}</td>
                    <td data-label="Paciente">${cita.pacienteNombre || 'Paciente Registrado'}</td>
                    <td data-label="Estado">
                        <span class="status-badge status-${cita.estado.toLowerCase()}">
                            ${cita.estado}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            let mensaje = filtro === 'hoy' ? 'No hay citas para hoy' : 'No hay citas en este rango';
            tbody.innerHTML = `<tr><td colspan="4" class="agenda-empty"><i class="ph ph-calendar-slash"></i><p>${mensaje}</p></td></tr>`;
        }
    }

    // ==========================================
    // FORMULARIO (CREAR/EDITAR)
    // ==========================================

    static async abrirFormulario(id = null) {
        mostrarLoader('Cargando formulario...');
        try {
            let doc = {};
            // Si hay ID, es edición, así que busco los datos
            if(id) {
                const res = await DoctoresService.getById(id);
                doc = res.data;
            }
            ocultarLoader();

            // Armo el formulario modal
            const html = `
                 <form id="form-doctor" onsubmit="event.preventDefault(); DoctoresManager.guardar('${id || ''}')">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" name="nombre" value="${doc.nombre || ''}" required placeholder="Dr. Ejemplo">
                    </div>
                    
                    <div class="dashboard-sections" style="gap:1rem; margin-bottom:0">
                        <div class="form-group">
                            <label>Especialidad</label>
                            <input type="text" name="especialidad" list="lista-especialidades" value="${doc.especialidad || ''}" required>
                            <datalist id="lista-especialidades">
                                <option value="Medicina General"></option>
                                <option value="Cardiología"></option>
                                <option value="Pediatría"></option>
                                <option value="Dermatología"></option>
                            </datalist>
                        </div>
                    </div>

                    <div class="dashboard-sections" style="gap:1rem; margin-bottom:0">
                        <div class="form-group">
                            <label>Horario Inicio</label>
                            <input type="time" name="horarioInicio" id="ini" value="${doc.horarioInicio || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Horario Fin</label>
                            <input type="time" name="horarioFin" id="fin" value="${doc.horarioFin || ''}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Días Disponibles</label>
                        <div class="checkbox-group">
                            ${['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(dia => `
                                <label>
                                    <input type="checkbox" name="dias" value="${dia}" 
                                    ${doc.diasDisponibles && doc.diasDisponibles.includes(dia) ? 'checked' : ''}> 
                                    ${dia.substring(0,3)}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn-primary">Guardar Doctor</button>
                    </div>
                </form>
            `;
            abrirModal(id ? 'Editar Doctor' : 'Nuevo Doctor', html);
            
        } catch (error) {
            ocultarLoader();
            mostrarError('Error al cargar datos');
        }
    }

    // Aquí guardo los datos en la "Base de datos"
    static async guardar(id) {
        // Saco los días seleccionados
        const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(cb => cb.value);
        
        // --- CORRECCIÓN --- 
        // Antes tronaba aquí porque buscaba el input fotoUrl y no existía en el HTML.
        // Ahora valido si existe antes de pedir el value.
        const fotoInput = document.querySelector('[name="fotoUrl"]');
        const fotoVal = fotoInput ? fotoInput.value : '';

        const data = {
            nombre: document.querySelector('[name="nombre"]').value,
            especialidad: document.querySelector('[name="especialidad"]').value,
            fotoUrl: fotoVal, 
            horarioInicio: document.querySelector('[name="horarioInicio"]').value,
            horarioFin: document.querySelector('[name="horarioFin"]').value,
            diasDisponibles: dias
        };

        // Validaciones lógicas
        if(data.horarioInicio >= data.horarioFin) return mostrarError('El horario de inicio debe ser antes que el de salida');
        if(dias.length === 0) return mostrarError('Selecciona al menos un día de trabajo');

        try {
            mostrarLoader('Guardando...');
            // Si hay ID hago update, si no hago create
            const res = id ? await DoctoresService.update(id, data) : await DoctoresService.create(data);
            ocultarLoader();
            
            if(res.success) {
                cerrarModal();
                this.cargar(); // Recargo la tabla para ver cambios
                mostrarExito('Doctor guardado correctamente');
            } else {
                mostrarError(res.message);
            }
        } catch(e) { 
            ocultarLoader();
            console.error(e); 
            mostrarError('Error al guardar'); 
        }
    }

    // Buscador en tiempo real (filtra lo que ya está en pantalla)
    static filtrar() {
        const texto = document.getElementById('search-doctores').value.toLowerCase();
        const esp = document.getElementById('filter-especialidad').value.toLowerCase();
        const cards = document.querySelectorAll('.doctor-card-item');
        
        cards.forEach(card => {
            const nombre = card.querySelector('h3').innerText.toLowerCase();
            const especialidad = card.querySelector('p').innerText.toLowerCase();
            
            const matchTexto = nombre.includes(texto);
            const matchEsp = esp === '' || especialidad === esp;
            
            // Muestro u oculto la tarjeta
            card.style.display = (matchTexto && matchEsp) ? 'block' : 'none';
        });
    }
}
