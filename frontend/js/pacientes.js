class PacientesManager {
    static async cargar() {
        activarMenu('pacientes');
        actualizarTitulo('Directorio de Pacientes');
        
        mostrarLoader();
        
        try {
            const response = await PacientesService.getAll();
            const pacientes = response.data || [];
            
            const html = `
                <div class="section-header">
                    <div class="search-container">
                        <input type="text" id="search-pacientes" placeholder="Buscar paciente..." onkeyup="PacientesManager.filtrar()">
                        <i class="ph ph-magnifying-glass"></i>
                    </div>
                    <button class="btn-primary" onclick="PacientesManager.abrirFormulario()">
                        <i class="ph-bold ph-plus"></i> Nuevo Paciente
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Contacto</th>
                                <th>Fecha Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-pacientes">
                            ${pacientes.length > 0 ? 
                                pacientes.map(paciente => this.crearFilaPaciente(paciente)).join('') :
                                '<tr><td colspan="4" class="empty-state">No hay pacientes registrados</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
        } catch (error) {
            mostrarError('Error al cargar pacientes');
            console.error(error);
        }
    }

    static crearFilaPaciente(paciente) {
        return `
            <tr>
                <td>
                    <strong>${paciente.nombre}</strong><br>
                    <small class="text-light">ID: ${paciente.id} | ${paciente.edad} años</small>
                </td>
                <td>
                    <i class="ph ph-phone"></i> ${paciente.telefono}<br>
                    <small>${paciente.email}</small>
                </td>
                <td>${paciente.fechaRegistro}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn-secondary" onclick="PacientesManager.verHistorial('${paciente.id}', '${paciente.nombre}')">
                            <i class="ph ph-file-text"></i> Historial
                        </button>
                        <button class="btn-secondary" onclick="PacientesManager.editar('${paciente.id}')">
                            <i class="ph ph-pencil"></i> Editar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    static filtrar() {
        const input = document.getElementById('search-pacientes');
        const filter = input.value.toLowerCase();
        const table = document.getElementById('tabla-pacientes');
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;
            
            for (let j = 0; j < cells.length; j++) {
                if (cells[j]) {
                    if (cells[j].textContent.toLowerCase().includes(filter)) {
                        found = true;
                        break;
                    }
                }
            }
            
            rows[i].style.display = found ? '' : 'none';
        }
    }

    static async verHistorial(id, nombre) {
        try {
            const response = await PacientesService.getHistorial(id);
            const historial = response.data || [];
            
            let html = `
                <div class="table-container" style="border:none; box-shadow:none">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Doctor</th>
                                <th>Motivo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            if (historial.length === 0) {
                html += `<tr><td colspan="5" align="center">Sin historial de citas</td></tr>`;
            } else {
                historial.forEach(cita => {
                    html += `
                        <tr>
                            <td>${cita.fecha}</td>
                            <td>${cita.hora}</td>
                            <td>${cita.doctorId}</td>
                            <td>${cita.motivo}</td>
                            <td><span class="status-badge status-${cita.estado}">${cita.estado}</span></td>
                        </tr>
                    `;
                });
            }
            
            html += `</tbody></table></div>`;
            
            abrirModal(`Historial: ${nombre}`, html);
            
        } catch (error) {
            mostrarError('Error al cargar el historial');
            console.error(error);
        }
    }

    static abrirFormulario(paciente = null) {
        const esEdicion = paciente !== null;
        const titulo = esEdicion ? 'Editar Paciente' : 'Nuevo Paciente';
        
        const html = `
            <form id="form-paciente" onsubmit="PacientesManager.guardar(event, ${esEdicion ? `'${paciente.id}'` : 'null'})">
                <div class="form-group">
                    <label for="nombre">Nombre completo</label>
                    <input type="text" id="nombre" value="${esEdicion ? paciente.nombre : ''}" required>
                </div>
                
                <div style="display:flex; gap:10px">
                    <div class="form-group" style="flex:1">
                        <label for="edad">Edad</label>
                        <input type="number" id="edad" min="1" value="${esEdicion ? paciente.edad : ''}" required>
                    </div>
                    <div class="form-group" style="flex:1">
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" value="${esEdicion ? paciente.telefono : ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${esEdicion ? paciente.email : ''}" required>
                </div>
                
                <button type="submit" class="btn-primary" style="width:100%">
                    ${esEdicion ? 'Actualizar' : 'Guardar'} Paciente
                </button>
            </form>
        `;

        abrirModal(titulo, html);
    }

    static async editar(id) {
        try {
            const response = await PacientesService.getById(id);
            this.abrirFormulario(response.data);
        } catch (error) {
            mostrarError('Error al cargar datos del paciente');
            console.error(error);
        }
    }

    static async guardar(event, id = null) {
        event.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            edad: parseInt(document.getElementById('edad').value),
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value
        };

        // Validaciones del cliente
        if (!this.validarFormulario(formData)) {
            return;
        }

        try {
            let response;
            if (id) {
                response = await PacientesService.update(id, formData);
            } else {
                response = await PacientesService.create(formData);
            }

            if (response.success) {
                cerrarModal();
                this.cargar();
                mostrarExito(id ? 'Paciente actualizado correctamente' : 'Paciente registrado correctamente');
            } else {
                mostrarError(response.message || 'Error al guardar paciente');
            }
        } catch (error) {
            mostrarError('Error al guardar paciente');
            console.error(error);
        }
    }

    static validarFormulario(data) {
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            mostrarError('Por favor ingresa un email válido');
            return false;
        }

        // Validar teléfono (mínimo 10 dígitos)
        const telefonoRegex = /^\d{10,}$/;
        if (!telefonoRegex.test(data.telefono.replace(/\D/g, ''))) {
            mostrarError('El teléfono debe tener al menos 10 dígitos');
            return false;
        }

        // Validar edad
        if (data.edad < 1 || data.edad > 120) {
            mostrarError('La edad debe estar entre 1 y 120 años');
            return false;
        }

        return true;
    }
}