// pacientes.js - Control de pacientes (CRUD)

class PacientesManager {
    
    // Carga la lista de pacientes desde el servidor
    static async cargar() {
        // actualiza el menú y título si existen las funciones
        if (typeof activarMenu === 'function') activarMenu('pacientes');
        if (typeof actualizarTitulo === 'function') actualizarTitulo('Directorio de Pacientes');
        
        mostrarLoader('Cargando pacientes...');
        
        try {
            const response = await PacientesService.getAll();
            const pacientes = response.data || [];
            
            // armar el html de la tabla
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
                                <th>Edad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-pacientes">
                            ${pacientes.length > 0 ? 
                                pacientes.map(p => this.crearFilaPaciente(p)).join('') : 
                                '<tr><td colspan="4" class="empty-state">No hay pacientes registrados</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            `;
            
            document.getElementById('app-content').innerHTML = html;
            ocultarLoader();

        } catch (error) {
            console.error(error);
            ocultarLoader();
            mostrarError('No se pudo cargar la lista');
        }
    }

    // genera el html de cada fila
    static crearFilaPaciente(p) {
        return `
            <tr class="paciente-row">
                <td data-label="Paciente">
                    <div style="font-weight:600; color:var(--text-main);">${p.nombre}</div>
                    <small style="color:var(--text-muted)">ID: ${p.id ? p.id.substring(0,6) : 'N/A'}</small>
                </td>
                <td data-label="Contacto">
                    <div style="display:flex; flex-direction:column;">
                        <span><i class="ph ph-envelope" style="color:var(--primary)"></i> ${p.email}</span>
                        <small><i class="ph ph-phone" style="color:var(--success)"></i> ${p.telefono}</small>
                    </div>
                </td>
                <td data-label="Edad">${p.edad} años</td>
                <td data-label="Acciones">
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn-secondary" onclick="PacientesManager.abrirFormulario('${p.id}')" title="Editar">
                            <i class="ph ph-pencil"></i>
                        </button>
                        <button class="btn-danger" onclick="PacientesManager.eliminar('${p.id}')" title="Eliminar">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    // buscador simple en cliente
    static filtrar() {
        const texto = document.getElementById('search-pacientes').value.toLowerCase();
        const filas = document.querySelectorAll('.paciente-row');
        
        filas.forEach(fila => {
            const nombre = fila.querySelector('td[data-label="Paciente"]').innerText.toLowerCase();
            const email = fila.querySelector('td[data-label="Contacto"]').innerText.toLowerCase();
            
            // mostrar u ocultar según coincidencia
            if (nombre.includes(texto) || email.includes(texto)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    }

    // abre el modal (sirve para crear o editar si trae id)
    static async abrirFormulario(id = null) {
        mostrarLoader('Cargando...');
        try {
            let paciente = {};
            
            // si es edicion, traigo los datos antes
            if (id) {
                const response = await PacientesService.getById(id);
                if (response.success) {
                    paciente = response.data;
                } else {
                    throw new Error(response.message);
                }
            }
            
            ocultarLoader();

            const html = `
                <form id="form-paciente" onsubmit="event.preventDefault(); PacientesManager.guardar('${id || ''}')">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" name="nombre" value="${paciente.nombre || ''}" required placeholder="Ej: Juan Pérez">
                    </div>
                    
                    <div class="dashboard-sections" style="gap:1rem; margin-bottom:0;">
                        <div class="form-group">
                            <label>Edad *</label>
                            <input type="number" name="edad" value="${paciente.edad || ''}" required min="1" max="120">
                        </div>
                        <div class="form-group">
                            <label>Teléfono *</label>
                            <input type="tel" name="telefono" value="${paciente.telefono || ''}" required pattern="[0-9]{10}" placeholder="10 dígitos">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value="${paciente.email || ''}" required placeholder="correo@ejemplo.com">
                    </div>

                    <div class="modal-footer">
                        <button type="submit" class="btn-primary" style="width:100%">
                            ${id ? 'Actualizar Paciente' : 'Registrar Paciente'}
                        </button>
                    </div>
                </form>
            `;
            
            abrirModal(id ? 'Editar Paciente' : 'Nuevo Paciente', html);

        } catch (error) {
            console.error(error);
            ocultarLoader();
            mostrarError('Error al abrir formulario');
        }
    }

    // envia los datos al backend
    static async guardar(id) {
        const form = document.getElementById('form-paciente');
        
        // obtengo los valores
        const nombre = form.querySelector('[name="nombre"]').value;
        const edadTexto = form.querySelector('[name="edad"]').value;
        const telefono = form.querySelector('[name="telefono"]').value;
        const email = form.querySelector('[name="email"]').value;

        // validaciones basicas
        if (!nombre || !email || !telefono) {
            return mostrarError('Faltan campos obligatorios');
        }
        if (telefono.length < 10) {
            return mostrarError('El teléfono debe tener 10 dígitos');
        }

        // --- CORRECCIÓN EDAD ---
        const edadNum = parseInt(edadTexto);
        if (edadNum <= 0 || isNaN(edadNum)) {
            return mostrarError('La edad debe ser mayor a 0');
        }

        const formData = {
            nombre: nombre,
            edad: edadNum,
            telefono: telefono,
            email: email
        };

        try {
            mostrarLoader('Guardando...');
            
            let response;
            if (id) {
                response = await PacientesService.update(id, formData);
            } else {
                response = await PacientesService.create(formData);
            }

            ocultarLoader();

            if (response.success) {
                cerrarModal();
                this.cargar(); // recargar tabla
                mostrarExito(id ? 'Datos actualizados' : 'Paciente registrado');
            } else {
                mostrarError(response.message || 'Error al guardar');
            }
        } catch (error) {
            console.error(error);
            ocultarLoader();
            mostrarError('Error de conexión');
        }
    }

    // borrar paciente
    static async eliminar(id) {
        if (confirm('¿Seguro que quieres eliminar este paciente?')) {
            try {
                mostrarLoader('Eliminando...');
                // uso request directo si no tengo el metodo en el servicio
                const response = await ApiService.request(`/pacientes/${id}`, { method: 'DELETE' });
                
                ocultarLoader();

                if (response.success) {
                    this.cargar();
                    mostrarExito('Paciente eliminado');
                } else {
                    mostrarError(response.message || 'No se pudo eliminar');
                }
            } catch (error) {
                console.error(error);
                ocultarLoader();
                mostrarError('Ocurrió un error al eliminar');
            }
        }
    }
}
