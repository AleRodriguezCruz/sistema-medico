// citas.js - Gestión de Citas Médicas
class CitasManager {
    
    static async cargar() {
        if (typeof activarMenu === 'function') activarMenu('citas');
        if (typeof actualizarTitulo === 'function') actualizarTitulo('Gestión de Citas');
        
        // 1. Mostrar loader
        mostrarLoader('Cargando citas...');
        
        try {
            // 2. Cargar datos necesarios
            const [citasRes, pacRes, docRes] = await Promise.all([
                CitasService.getAll(),
                PacientesService.getAll(),
                DoctoresService.getAll()
            ]);

            const pacientes = pacRes.data || [];
            const doctores = docRes.data || [];
            
            // 3. Cruzar datos para tener nombres reales
            const citas = (citasRes.data || []).map(c => {
                const p = pacientes.find(x => x.id === c.pacienteId);
                const d = doctores.find(x => x.id === c.doctorId);
                return {
                    ...c,
                    pacienteNombre: p ? p.nombre : 'Desconocido',
                    doctorNombre: d ? d.nombre : 'Desconocido'
                };
            });
            
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
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-citas">
                            ${citas.length > 0 ? 
                                citas.map(cita => this.crearFilaCita(cita)).join('') :
                                '<tr><td colspan="6" class="empty-state">No hay citas registradas</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
            // 4. IMPORTANTE: Quitar el loader al terminar
            ocultarLoader();
            
        } catch (error) {
            console.error(error);
            ocultarLoader(); // Quitar loader si hay error
            mostrarError('Error al cargar citas');
        }
    }

    static crearFilaCita(cita) {
        return `
            <tr class="cita-row" data-estado="${cita.estado}" data-fecha="${cita.fecha}">
                <td data-label="Fecha">
                    <div style="font-weight:600">${cita.fecha}</div>
                </td>
                <td data-label="Hora">${cita.hora}</td>
                <td data-label="Paciente">${cita.pacienteNombre}</td>
                <td data-label="Doctor">${cita.doctorNombre}</td>
                <td data-label="Estado">
                    <span class="status-badge status-${cita.estado}">${cita.estado}</span>
                </td>
                <td data-label="Acciones">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="CitasManager.verDetalle('${cita.id}')" title="Ver detalles">
                            <i class="ph ph-eye"></i>
                        </button>
                        
                        ${cita.estado === 'programada' ? `
                            <button class="btn-secondary" style="color:#16a34a; border-color:#16a34a;" onclick="CitasManager.completar('${cita.id}')" title="Completar cita">
                                <i class="ph-bold ph-check"></i>
                            </button>
                            <button class="btn-danger" onclick="CitasManager.cancelar('${cita.id}')" title="Cancelar cita">
                                <i class="ph-bold ph-x"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    static filtrar() {
        const estado = document.getElementById('filter-estado').value.toLowerCase();
        const fecha = document.getElementById('filter-fecha').value;
        const rows = document.querySelectorAll('.cita-row');
        
        rows.forEach(row => {
            const rowEstado = row.dataset.estado.toLowerCase();
            const rowFecha = row.dataset.fecha;
            
            const matchEstado = !estado || rowEstado === estado;
            const matchFecha = !fecha || rowFecha === fecha;
            
            row.style.display = (matchEstado && matchFecha) ? '' : 'none';
        });
    }

    static async abrirFormulario() {
        mostrarLoader('Preparando formulario...');
        try {
            const [pacientesResponse, doctoresResponse] = await Promise.all([
                PacientesService.getAll(),
                DoctoresService.getAll()
            ]);
            
            ocultarLoader(); // Quitar loader antes de mostrar modal

            const pacientes = pacientesResponse.data || [];
            const doctores = doctoresResponse.data || [];

            const hoy = new Date();
            const fechaMin = hoy.toISOString().split('T')[0];
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
                        <div id="doctor-info" class="doctor-info-container" style="display:none; margin-top:0.5rem;">
                            <small>
                                <strong class="doctor-info-title">👨‍⚕️ Disponibilidad:</strong><br>
                                <span class="doctor-info-label">Horario:</span> <span id="doctor-horario" class="doctor-info-value"></span><br>
                                <span class="doctor-info-label">Días:</span> <span id="doctor-dias" class="doctor-info-value"></span>
                            </small>
                        </div>
                    </div>
                    
                    <div class="dashboard-sections" style="gap:1rem; grid-template-columns: 1fr 1fr; margin-bottom:0;">
                        <div class="form-group">
                            <label for="cf">Fecha *</label>
                            <input type="date" id="cf" required min="${fechaMin}" max="${fechaMax}" onchange="CitasManager.validarDisponibilidad()">
                        </div>
                        <div class="form-group">
                            <label for="ch">Hora *</label>
                            <input type="time" id="ch" required onchange="CitasManager.validarDisponibilidad()">
                        </div>
                    </div>
                    
                    <div id="disponibilidad-mensaje" style="margin-bottom: 1rem; padding: 0.8rem; border-radius: 6px; display: none; font-size:0.9rem;"></div>
                    
                    <div class="form-group">
                        <label for="cm">Motivo *</label>
                        <textarea id="cm" required rows="2" maxlength="200" placeholder="Motivo de la consulta..."></textarea>
                    </div>
                    
                    <button type="button" class="btn-primary" style="width:100%" id="btn-submit-cita" onclick="CitasManager.guardar()">
                        <i class="ph ph-calendar-check"></i> Confirmar Cita
                    </button>
                </form>
            `;

            abrirModal('Agendar Nueva Cita', html);

        } catch (error) {
            ocultarLoader();
            mostrarError('Error al cargar formulario');
            console.error(error);
        }
    }

    static actualizarInfoDoctor() {
        const select = document.getElementById('cd');
        const infoDiv = document.getElementById('doctor-info');
        
        if (select.value) {
            const opt = select.selectedOptions[0];
            document.getElementById('doctor-horario').innerText = opt.dataset.horario;
            document.getElementById('doctor-dias').innerText = opt.dataset.dias;
            infoDiv.style.display = 'block';
        } else {
            infoDiv.style.display = 'none';
        }
        this.validarDisponibilidad();
    }

    static validarDisponibilidad() {
        const docSelect = document.getElementById('cd');
        const fechaVal = document.getElementById('cf').value;
        const horaVal = document.getElementById('ch').value;
        const msgDiv = document.getElementById('disponibilidad-mensaje');
        const btn = document.getElementById('btn-submit-cita');

        if (!docSelect.value || !fechaVal || !horaVal) {
            msgDiv.style.display = 'none';
            return;
        }

        const opt = docSelect.selectedOptions[0];
        const diasHabiles = opt.dataset.dias.split(',');
        const [hInicio, hFin] = opt.dataset.horario.split('-');

        const fechaObj = new Date(fechaVal + 'T12:00:00');
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaNombre = diasSemana[fechaObj.getDay()];

        const esDiaValido = diasHabiles.includes(diaNombre);
        const esHoraValida = horaVal >= hInicio && horaVal <= hFin;

        msgDiv.style.display = 'block';
        
        if (!esDiaValido) {
            msgDiv.innerHTML = `❌ El doctor no atiende los <strong>${diaNombre}s</strong>`;
            msgDiv.style.background = '#fef2f2'; msgDiv.style.color = '#dc2626';
            btn.disabled = true;
        } else if (!esHoraValida) {
            msgDiv.innerHTML = `❌ Hora fuera de rango (${hInicio} - ${hFin})`;
            msgDiv.style.background = '#fef2f2'; msgDiv.style.color = '#dc2626';
            btn.disabled = true;
        } else {
            msgDiv.innerHTML = `✅ Horario disponible`;
            msgDiv.style.background = '#f0fdf4'; msgDiv.style.color = '#16a34a';
            btn.disabled = false;
        }
    }

    static async guardar() {
        const data = {
            pacienteId: document.getElementById('cp').value,
            doctorId: document.getElementById('cd').value,
            fecha: document.getElementById('cf').value,
            hora: document.getElementById('ch').value,
            motivo: document.getElementById('cm').value
        };

        if(!data.pacienteId || !data.doctorId || !data.fecha || !data.hora || !data.motivo) {
            return mostrarError('Complete todos los campos');
        }

        try {
            mostrarLoader('Agendando...');
            const res = await CitasService.create(data);
            ocultarLoader();

            if (res.success) {
                cerrarModal();
                this.cargar();
                mostrarExito('Cita agendada');
            } else {
                mostrarError(res.message || 'Error al agendar');
            }
        } catch (e) {
            ocultarLoader();
            mostrarError('Error de conexión');
        }
    }

    static async verDetalle(id) {
        mostrarLoader();
        try {
            const res = await CitasService.getById(id);
            const cita = res.data;
            ocultarLoader();
            
            const html = `
                <div class="cita-detalle">
                    <div class="detalle-item"><label>Fecha:</label> <span>${cita.fecha} ${cita.hora}</span></div>
                    <div class="detalle-item"><label>Motivo:</label> <span>${cita.motivo}</span></div>
                    <div class="detalle-item"><label>Estado:</label> <span class="status-badge status-${cita.estado}">${cita.estado}</span></div>
                </div>
            `;
            abrirModal('Detalle Cita', html);
        } catch (e) { 
            ocultarLoader();
            mostrarError('Error al cargar detalle'); 
        }
    }

    static async completar(id) {
        if (confirm('¿Marcar cita como completada?')) {
            try {
                mostrarLoader();
                // 1. Obtener cita actual
                const cita = (await CitasService.getById(id)).data;
                cita.estado = 'completada';
                
                // 2. Actualizar (PUT)
                // Nota: Usamos ApiService directo si no existe CitasService.update
                const res = await ApiService.request(`/citas/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(cita)
                });
                
                ocultarLoader();

                if (res.success) {
                    this.cargar();
                    mostrarExito('Cita completada');
                } else {
                    mostrarError(res.message);
                }
            } catch (e) {
                ocultarLoader();
                console.error(e);
                mostrarError('Error al completar cita');
            }
        }
    }

    static async cancelar(id) {
        if (confirm('¿Cancelar cita?')) {
            try {
                mostrarLoader();
                const res = await CitasService.cancelar(id);
                ocultarLoader();
                
                if (res.success) { this.cargar(); mostrarExito('Cita cancelada'); }
                else mostrarError(res.message);
            } catch (e) { 
                ocultarLoader();
                mostrarError('Error al cancelar'); 
            }
        }
    }
}
