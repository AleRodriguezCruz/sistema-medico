// citas.js - Gestión de Citas Médicas
// Maneja la interfaz y lógica para agendar, ver y cancelar citas

class CitasManager {
    static async cargar() {
        activarMenu('citas');
        actualizarTitulo('Gestión de Citas');
        
        mostrarLoader();
        
        try {
            const response = await CitasService.getAll();
            const citas = response.data || [];
            
            const html = `
                <div class="section-header">
                    <div class="filters-container">
                        <select id="filter-estado" onchange="CitasManager.filtrar()">
                            <option value="">Todos los estados</option>
                            <option value="programada">Programada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="completada">Completada</option>
                        </select>
                        <input type="date" id="filter-fecha" onchange="CitasManager.filtrar()">
                    </div>
                    <button class="btn-primary" onclick="CitasManager.abrirFormulario()">
                        <i class="ph-bold ph-calendar-plus"></i> Agendar Cita
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Paciente</th>
                                <th>Doctor</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-citas">
                            ${citas.length > 0 ? 
                                citas.map(cita => this.crearFilaCita(cita)).join('') :
                                '<tr><td colspan="7" class="empty-state">No hay citas registradas</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
        } catch (error) {
            mostrarError('Error al cargar citas');
            console.error(error);
        }
    }

    static crearFilaCita(cita) {
        return `
            <tr>
                <td><strong>${cita.fecha}</strong></td>
                <td>${cita.hora}</td>
                <td>${cita.pacienteId}</td>
                <td>${cita.doctorId}</td>
                <td>${cita.motivo}</td>
                <td><span class="status-badge status-${cita.estado}">${cita.estado}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="CitasManager.verDetalle('${cita.id}')" title="Ver detalles">
                            <i class="ph ph-eye"></i>
                        </button>
                        ${cita.estado === 'programada' ? 
                            `<button class="btn-danger" onclick="CitasManager.cancelar('${cita.id}')" title="Cancelar cita">
                                <i class="ph-bold ph-x"></i>
                            </button>` : 
                            ''
                        }
                    </div>
                </td>
            </tr>
        `;
    }

    static filtrar() {
        const estado = document.getElementById('filter-estado').value;
        const fecha = document.getElementById('filter-fecha').value;
        const table = document.getElementById('tabla-citas');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let show = true;
            
            if (estado && cells[5]) {
                const estadoCell = cells[5].textContent.trim().toLowerCase();
                if (estadoCell !== estado.toLowerCase()) show = false;
            }
            
            if (fecha && cells[0]) {
                const fechaCell = cells[0].textContent.trim();
                if (fechaCell !== fecha) show = false;
            }
            
            rows[i].style.display = show ? '' : 'none';
        }
    }

    static async abrirFormulario() {
        try {
            const [pacientesResponse, doctoresResponse] = await Promise.all([
                PacientesService.getAll(),
                DoctoresService.getAll()
            ]);

            const pacientes = pacientesResponse.data || [];
            const doctores = doctoresResponse.data || [];

            // Obtener fecha mínima (hoy)
            const hoy = new Date();
            const fechaMin = hoy.toISOString().split('T')[0];

            // Obtener fecha máxima (3 meses desde hoy)
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);
            const fechaMax = maxDate.toISOString().split('T')[0];

            const html = `
                <form id="form-cita">
                    <div class="form-group">
                        <label for="cp">Paciente *</label>
                        <select id="cp" required>
                            <option value="">Seleccionar paciente...</option>
                            ${pacientes.map(p => `<option value="${p.id}">${p.nombre} - ${p.email}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cd">Doctor *</label>
                        <select id="cd" required onchange="CitasManager.actualizarInfoDoctor()">
                            <option value="">Seleccionar doctor...</option>
                            ${doctores.map(d => `
                                <option value="${d.id}" 
                                        data-dias="${d.diasDisponibles.join(',')}" 
                                        data-horario="${d.horarioInicio}-${d.horarioFin}"
                                        data-nombre="${d.nombre}"
                                        data-especialidad="${d.especialidad}">
                                    ${d.nombre} - ${d.especialidad}
                                </option>
                            `).join('')}
                        </select>
                        <div id="doctor-info" class="doctor-info-container">
                            <small>
                                <strong class="doctor-info-title">👨‍⚕️ Información del doctor:</strong><br>
                                <strong class="doctor-info-label">Horario:</strong> <span id="doctor-horario" class="doctor-info-value"></span><br>
                                <strong class="doctor-info-label">Días disponibles:</strong> <span id="doctor-dias" class="doctor-info-value"></span>
                            </small>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px">
                        <div class="form-group" style="flex:1">
                            <label for="cf">Fecha *</label>
                            <input type="date" id="cf" required 
                                   min="${fechaMin}" 
                                   max="${fechaMax}"
                                   onchange="CitasManager.validarDisponibilidad()">
                            <small style="color: var(--text-light); font-size: 0.8rem;">
                                Fecha entre ${fechaMin} y ${fechaMax}
                            </small>
                        </div>
                        <div class="form-group" style="flex:1">
                            <label for="ch">Hora *</label>
                            <input type="time" id="ch" required 
                                   min="06:00" max="22:00"
                                   onchange="CitasManager.validarDisponibilidad()">
                            <small style="color: var(--text-light); font-size: 0.8rem;">
                                Horario de atención: 6:00 - 22:00
                            </small>
                        </div>
                    </div>
                    
                    <div id="disponibilidad-mensaje" style="margin: 1rem 0; padding: 0.8rem; border-radius: 6px; display: none;"></div>
                    
                    <div class="form-group">
                        <label for="cm">Motivo de consulta *</label>
                        <textarea id="cm" required rows="3" maxlength="200" placeholder="Describa el motivo de la consulta..."></textarea>
                        <small style="color: var(--text-light); font-size: 0.8rem;">
                            <span id="char-count">0</span>/200 caracteres
                        </small>
                    </div>
                    
                    <button type="button" class="btn-primary" style="width:100%" id="btn-submit-cita" onclick="CitasManager.guardar()">
                        <i class="ph ph-calendar-check"></i> Confirmar Cita
                    </button>
                </form>
            `;

            abrirModal('Agendar Nueva Cita', html);

            // Contador de caracteres
            const textarea = document.getElementById('cm');
            const charCount = document.getElementById('char-count');
            textarea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });

            // Inicializar validación
            this.actualizarInfoDoctor();

        } catch (error) {
            mostrarError('Error al cargar datos para agendar cita');
            console.error('Error en abrirFormulario:', error);
        }
    }

    static actualizarInfoDoctor() {
        const selectDoctor = document.getElementById('cd');
        const selectedOption = selectDoctor.options[selectDoctor.selectedIndex];
        const doctorInfo = document.getElementById('doctor-info');
        const doctorHorario = document.getElementById('doctor-horario');
        const doctorDias = document.getElementById('doctor-dias');
        
        if (selectedOption && selectedOption.value) {
            const horario = selectedOption.getAttribute('data-horario');
            const dias = selectedOption.getAttribute('data-dias');
            const nombre = selectedOption.getAttribute('data-nombre');
            const especialidad = selectedOption.getAttribute('data-especialidad');
            
            doctorHorario.textContent = horario.replace('-', ' a ');
            doctorDias.textContent = dias;
            doctorInfo.style.display = 'block';
            
            // Actualizar título del modal con información del doctor
            document.getElementById('modal-title').textContent = `Agendar cita con ${nombre} - ${especialidad}`;
        } else {
            doctorInfo.style.display = 'none';
            document.getElementById('modal-title').textContent = 'Agendar Nueva Cita';
        }
        
        this.validarDisponibilidad();
    }

    static validarDisponibilidad() {
        const selectDoctor = document.getElementById('cd');
        const fechaInput = document.getElementById('cf');
        const horaInput = document.getElementById('ch');
        const mensajeDiv = document.getElementById('disponibilidad-mensaje');
        const btnSubmit = document.getElementById('btn-submit-cita');
        
        console.log('🔍 Validando disponibilidad:');
        console.log('   Doctor:', selectDoctor.value);
        console.log('   Fecha:', fechaInput.value);
        console.log('   Hora:', horaInput.value);
        
        // Reset
        mensajeDiv.style.display = 'none';
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="ph ph-calendar-check"></i> Confirmar Cita';
        
        if (!selectDoctor.value || !fechaInput.value || !horaInput.value) {
            return;
        }
        
        const selectedOption = selectDoctor.options[selectDoctor.selectedIndex];
        const diasDisponibles = selectedOption.getAttribute('data-dias').split(',');
        const horario = selectedOption.getAttribute('data-horario').split('-');
        const doctorNombre = selectedOption.getAttribute('data-nombre');
        const horarioInicio = horario[0];
        const horarioFin = horario[1];
        
        // Obtener día de la semana CORREGIDO (usar mediodía para evitar zona horaria)
        const [anio, mes, dia] = fechaInput.value.split('-').map(Number);
        const fecha = new Date(anio, mes - 1, dia, 12, 0, 0); // Mediodía local
        
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = dias[fecha.getDay()];
        
        console.log('📅 Día calculado en frontend:', diaSemana);
        
        const hora = horaInput.value;
        
        let mensaje = '';
        let tipo = 'error';
        let disponible = true;
        
        // Validar si es fecha pasada
        const hoy = new Date();
        hoy.setHours(12, 0, 0, 0);
        if (fecha < hoy) {
            mensaje = `❌ <strong>No se pueden agendar citas en fechas pasadas</strong>`;
            disponible = false;
        }
        // Validar día
        else if (!diasDisponibles.includes(diaSemana)) {
            mensaje = `❌ <strong>${doctorNombre}</strong> no trabaja los <strong>${diaSemana}s</strong><br>
                      <small>Días disponibles: ${diasDisponibles.join(', ')}</small>`;
            disponible = false;
        }
        // Validar horario dentro del rango del doctor
        else if (hora < horarioInicio || hora >= horarioFin) {
            mensaje = `❌ <strong>Fuera del horario de atención</strong><br>
                      <small>Horario disponible: ${horarioInicio} a ${horarioFin}</small>`;
            disponible = false;
        }
        // Validar que no sea en el pasado (misma fecha)
        else if (fecha.toDateString() === hoy.toDateString() && hora < new Date().toTimeString().slice(0, 5)) {
            mensaje = `❌ <strong>No se pueden agendar citas en horarios pasados</strong><br>
                      <small>Selecciona una hora posterior a la actual</small>`;
            disponible = false;
        }
        else {
            mensaje = `✅ <strong>Horario disponible confirmado</strong><br>
                      <small>${doctorNombre} atiende los ${diaSemana}s de ${horarioInicio} a ${horarioFin}</small>`;
            tipo = 'success';
        }
        
        mensajeDiv.innerHTML = mensaje;
        mensajeDiv.style.display = 'block';
        mensajeDiv.style.background = tipo === 'success' ? '#f0fdf4' : '#fef2f2';
        mensajeDiv.style.borderLeft = tipo === 'success' ? '4px solid #22c55e' : '4px solid #ef4444';
        mensajeDiv.style.color = tipo === 'success' ? '#166534' : '#991b1b';
        
        btnSubmit.disabled = !disponible;
        if (!disponible) {
            btnSubmit.innerHTML = '<i class="ph ph-warning"></i> Corregir datos primero';
        }
    }

    static async guardar() {
        const pacienteId = document.getElementById('cp').value;
        const doctorId = document.getElementById('cd').value;
        const fecha = document.getElementById('cf').value;
        const hora = document.getElementById('ch').value;
        const motivo = document.getElementById('cm').value;

        console.log('📝 Intentando guardar cita:', { pacienteId, doctorId, fecha, hora, motivo });

        // Validaciones básicas del frontend
        if (!pacienteId || !doctorId || !fecha || !hora || !motivo) {
            mostrarError('Por favor complete todos los campos obligatorios');
            return;
        }

        if (motivo.trim().length === 0) {
            mostrarError('El motivo de la consulta es obligatorio');
            return;
        }

        if (motivo.length > 200) {
            mostrarError('El motivo no puede exceder los 200 caracteres');
            return;
        }

        const formData = {
            pacienteId,
            doctorId,
            fecha,
            hora,
            motivo: motivo.trim()
        };

        try {
            console.log('🔄 Enviando datos al servidor...');
            const response = await CitasService.create(formData);

            if (response.success) {
                console.log('✅ Cita agendada exitosamente');
                cerrarModal();
                this.cargar();
                mostrarExito('✅ Cita agendada correctamente');
            } else {
                console.log('❌ Error del servidor:', response.message);
                mostrarError(response.message || 'Error al agendar cita');
            }
        } catch (error) {
            console.error('💥 Error en la petición:', error);
            mostrarError('Error de conexión al agendar cita');
        }
    }

    static async verDetalle(id) {
        try {
            const response = await CitasService.getById(id);
            const cita = response.data;
            
            const html = `
                <div class="cita-detalle">
                    <div class="detalle-item">
                        <label>Paciente:</label>
                        <span>${cita.pacienteId}</span>
                    </div>
                    <div class="detalle-item">
                        <label>Doctor:</label>
                        <span>${cita.doctorId}</span>
                    </div>
                    <div class="detalle-item">
                        <label>Fecha:</label>
                        <span>${cita.fecha}</span>
                    </div>
                    <div class="detalle-item">
                        <label>Hora:</label>
                        <span>${cita.hora}</span>
                    </div>
                    <div class="detalle-item">
                        <label>Motivo:</label>
                        <span>${cita.motivo}</span>
                    </div>
                    <div class="detalle-item">
                        <label>Estado:</label>
                        <span class="status-badge status-${cita.estado}">${cita.estado}</span>
                    </div>
                </div>
                ${cita.estado === 'programada' ? `
                    <div style="margin-top: 1.5rem; text-align: center;">
                        <button class="btn-danger" onclick="CitasManager.cancelar('${cita.id}')">
                            <i class="ph-bold ph-x"></i> Cancelar Cita
                        </button>
                    </div>
                ` : ''}
            `;
            
            abrirModal('Detalle de Cita', html);
            
        } catch (error) {
            mostrarError('Error al cargar detalles de la cita');
            console.error(error);
        }
    }

    static async cancelar(id) {
        if (confirm('¿Está seguro de cancelar esta cita?')) {
            try {
                const response = await CitasService.cancelar(id);
                
                if (response.success) {
                    this.cargar();
                    mostrarExito('Cita cancelada correctamente');
                } else {
                    mostrarError(response.message || 'Error al cancelar cita');
                }
            } catch (error) {
                mostrarError('Error al cancelar cita');
                console.error(error);
            }
        }
    }
}