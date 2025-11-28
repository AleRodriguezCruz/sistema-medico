// doctores.js - Gestión de Doctores
// Maneja la interfaz y lógica para gestionar doctores

class DoctoresManager {
    static async cargar() {
        activarMenu('doctores');
        actualizarTitulo('Equipo Médico');
        
        mostrarLoader();
        
        try {
            const response = await DoctoresService.getAll();
            const doctores = response.data || [];
            
            // Obtener especialidades únicas para el filtro
            const especialidades = [...new Set(doctores.map(d => d.especialidad))];
            
            const html = `
                <div class="section-header">
                    <div class="filters-container">
                        <select id="filter-especialidad" onchange="DoctoresManager.filtrar()">
                            <option value="">Todas las especialidades</option>
                            ${especialidades.map(esp => 
                                `<option value="${esp}">${esp}</option>`
                            ).join('')}
                        </select>
                        <div class="search-container">
                            <input type="text" id="search-doctores" placeholder="Buscar doctor..." onkeyup="DoctoresManager.filtrar()">
                            <i class="ph ph-magnifying-glass"></i>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="DoctoresManager.abrirFormulario()">
                        <i class="ph-bold ph-plus"></i> Registrar Doctor
                    </button>
                </div>
                <div class="card-grid" id="doctores-grid">
                    ${doctores.length > 0 ? 
                        doctores.map(doctor => this.crearTarjetaDoctor(doctor)).join('') :
                        '<div class="empty-state">No hay doctores registrados</div>'
                    }
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
        } catch (error) {
            mostrarError('Error al cargar doctores');
            console.error(error);
        }
    }

    static crearTarjetaDoctor(doctor) {
        return `
            <div class="stat-card doctor-card-item" data-especialidad="${doctor.especialidad}">
                <div style="position:absolute; top:15px; right:15px; color:#475569">
                    <i class="ph-duotone ph-first-aid" style="font-size:2rem"></i>
                </div>
                <h3 class="doctor-especialidad">${doctor.especialidad}</h3>
                <div class="value doctor-nombre" style="font-size:1.1rem; margin:10px 0">${doctor.nombre}</div>
                <div style="display:flex; align-items:center; gap:5px; color:#64748b; font-size:0.9rem">
                    <i class="ph ph-clock"></i> ${doctor.horarioInicio} - ${doctor.horarioFin}
                </div>
                <div style="margin-top:10px; display:flex; gap:4px; flex-wrap:wrap">
                    ${doctor.diasDisponibles.map(dia => 
                        `<span style="background:rgba(30, 41, 59, 0.8); color:#94a3b8; padding:4px 8px; border-radius:6px; font-size:0.75rem; border:1px solid var(--luxury-border)">
                            ${dia.substring(0,3)}
                        </span>`
                    ).join('')}
                </div>
                <div style="margin-top:15px; display:flex; gap:5px">
                    <button class="btn-secondary" style="flex:1" onclick="DoctoresManager.verAgenda('${doctor.id}', '${doctor.nombre}')">
                        <i class="ph ph-calendar"></i> Agenda
                    </button>
                    <button class="btn-secondary" onclick="DoctoresManager.editar('${doctor.id}')">
                        <i class="ph ph-pencil"></i>
                    </button>
                </div>
            </div>
        `;
    }

    static filtrar() {
        const input = document.getElementById('search-doctores');
        const especialidadFilter = document.getElementById('filter-especialidad').value;
        const searchText = input.value.toLowerCase();
        const cards = document.querySelectorAll('.doctor-card-item');
        
        cards.forEach(card => {
            const nombre = card.querySelector('.doctor-nombre').textContent.toLowerCase();
            const especialidad = card.querySelector('.doctor-especialidad').textContent;
            const cardText = card.textContent.toLowerCase();
            
            const coincideTexto = searchText === '' || nombre.includes(searchText) || cardText.includes(searchText);
            const coincideEspecialidad = especialidadFilter === '' || especialidad === especialidadFilter;
            
            card.style.display = (coincideTexto && coincideEspecialidad) ? '' : 'none';
        });
    }

    static async verAgenda(id, nombre) {
        try {
            const response = await DoctoresService.getAgenda(id);
            const agenda = response.data || [];
            
            // Estadísticas de la agenda
            const totalCitas = agenda.length;
            const citasProgramadas = agenda.filter(c => c.estado === 'programada').length;
            const citasCanceladas = agenda.filter(c => c.estado === 'cancelada').length;
            const citasCompletadas = agenda.filter(c => c.estado === 'completada').length;
            
            let html = `
                <div class="agenda-header" style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--luxury-border);">
                    <h4 style="color: var(--primary-light); margin-bottom: 0.5rem;">📅 Agenda de ${nombre}</h4>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                        <div style="background: rgba(37, 99, 235, 0.1); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(37, 99, 235, 0.3);">
                            <div style="font-size: 0.8rem; color: #94a3b8;">Total</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: #e2e8f0;">${totalCitas}</div>
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            <div style="font-size: 0.8rem; color: #94a3b8;">Programadas</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: #34d399;">${citasProgramadas}</div>
                        </div>
                        <div style="background: rgba(239, 68, 68, 0.1); padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                            <div style="font-size: 0.8rem; color: #94a3b8;">Canceladas</div>
                            <div style="font-size: 1.2rem; font-weight: bold; color: #fca5a5;">${citasCanceladas}</div>
                        </div>
                    </div>
                </div>
                <div class="agenda-container">
            `;
            
            if (agenda.length === 0) {
                html += `
                    <div class="agenda-empty">
                        <i class="ph ph-calendar-blank"></i>
                        <h4>No hay citas programadas</h4>
                        <p style="color: #64748b; margin-top: 0.5rem;">Este doctor no tiene citas en su agenda.</p>
                    </div>
                `;
            } else {
                html += `
                    <table class="agenda-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Paciente</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                // Ordenar agenda por fecha y hora (más recientes primero)
                const agendaOrdenada = agenda.sort((a, b) => {
                    const fechaA = new Date(a.fecha + 'T' + a.hora);
                    const fechaB = new Date(b.fecha + 'T' + b.hora);
                    return fechaB - fechaA; // Orden descendente (más reciente primero)
                });
                
                agendaOrdenada.forEach(cita => {
                    html += `
                        <tr>
                            <td>
                                <strong>${cita.fecha}</strong>
                            </td>
                            <td>${cita.hora}</td>
                            <td>${cita.pacienteId}</td>
                            <td>
                                <span style="display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
                                      title="${cita.motivo}">
                                    ${cita.motivo}
                                </span>
                            </td>
                            <td>
                                <span class="agenda-status ${cita.estado}">${cita.estado}</span>
                            </td>
                        </tr>
                    `;
                });
                
                html += `</tbody></table>`;
            }
            
            html += `</div>`;
            
            abrirModal(`📅 Agenda Completa: ${nombre}`, html);
            
        } catch (error) {
            mostrarError('Error al cargar la agenda');
            console.error(error);
        }
    }

    static abrirFormulario(doctor = null) {
        const esEdicion = doctor !== null;
        const titulo = esEdicion ? 'Editar Doctor' : 'Nuevo Doctor';
        
        const diasHTML = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map(d => 
            `<label>
                <input type="checkbox" name="dias" value="${d}" ${esEdicion && doctor.diasDisponibles.includes(d) ? 'checked' : ''}>
                ${d}
            </label>`
        ).join('');
        
        const html = `
            <form id="form-doctor" onsubmit="DoctoresManager.guardar(event, ${esEdicion ? `'${doctor.id}'` : 'null'})">
                <div class="form-group">
                    <label for="docNombre">Nombre completo</label>
                    <input type="text" id="docNombre" value="${esEdicion ? doctor.nombre : ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="docEsp">Especialidad</label>
                    <input type="text" id="docEsp" value="${esEdicion ? doctor.especialidad : ''}" required>
                </div>
                
                <div style="display:flex; gap:10px">
                    <div class="form-group" style="flex:1">
                        <label for="ini">Horario de inicio</label>
                        <input type="time" id="ini" value="${esEdicion ? doctor.horarioInicio : ''}" required>
                    </div>
                    <div class="form-group" style="flex:1">
                        <label for="fin">Horario de fin</label>
                        <input type="time" id="fin" value="${esEdicion ? doctor.horarioFin : ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Días disponibles</label>
                    <div class="checkbox-group">
                        ${diasHTML}
                    </div>
                </div>
                
                <button type="submit" class="btn-primary" style="width:100%">
                    ${esEdicion ? 'Actualizar' : 'Registrar'} Doctor
                </button>
            </form>
        `;

        abrirModal(titulo, html);
    }

    static async editar(id) {
        try {
            const response = await DoctoresService.getById(id);
            this.abrirFormulario(response.data);
        } catch (error) {
            mostrarError('Error al cargar datos del doctor');
            console.error(error);
        }
    }

    static async guardar(event, id = null) {
        event.preventDefault();
        
        const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(c => c.value);
        
        if (!dias.length) {
            mostrarError('Selecciona al menos un día disponible');
            return;
        }

        const formData = {
            nombre: document.getElementById('docNombre').value,
            especialidad: document.getElementById('docEsp').value,
            horarioInicio: document.getElementById('ini').value,
            horarioFin: document.getElementById('fin').value,
            diasDisponibles: dias
        };

        // Validaciones del cliente
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            let response;
            if (id) {
                response = await DoctoresService.update(id, formData);
            } else {
                response = await DoctoresService.create(formData);
            }

            if (response.success) {
                cerrarModal();
                this.cargar();
                mostrarExito(id ? 'Doctor actualizado correctamente' : 'Doctor registrado correctamente');
            } else {
                mostrarError(response.message || 'Error al guardar doctor');
            }
        } catch (error) {
            mostrarError('Error al guardar doctor');
            console.error(error);
        }
    }

    static validarFormulario(data) {
        // Validar horarios
        if (data.horarioInicio >= data.horarioFin) {
            mostrarError('El horario de inicio debe ser anterior al horario de fin');
            return false;
        }

        // Validar días disponibles
        if (data.diasDisponibles.length === 0) {
            mostrarError('Selecciona al menos un día disponible');
            return false;
        }

        return true;
    }
}