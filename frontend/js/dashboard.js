// dashboard.js - Resumen General con Fotos de Doctores
class Dashboard {
    static async cargar() {
        if (typeof activarMenu === 'function') activarMenu('dashboard');
        if (typeof actualizarTitulo === 'function') actualizarTitulo('Resumen General');
        
        mostrarLoader('Analizando datos...');
        
        try {
            const [citasRes, pacientesRes, doctoresRes] = await Promise.all([
                CitasService.getAll(),
                PacientesService.getAll(),
                DoctoresService.getAll()
            ]);

            const citas = citasRes.data || [];
            const pacientes = pacientesRes.data || [];
            const doctores = doctoresRes.data || [];

            // Cálculos
            const citasPendientes = citas.filter(c => c.estado === 'programada').length;
            const citasProximas24h = this.obtenerCitasProximas24Horas(citas);
            
            // Enriquecer con Nombres y FOTOS
            const citasCompletas = this.enriquecerCitas(citas, pacientes, doctores);

            // Calcular Estadísticas (Top Doctor)
            const stats = this.calcularEstadisticas(citas, doctores);

            // Preparar HTML del Top Doctor (Foto o Ícono)
            let topDoctorIcono = `<i class="ph ph-medal"></i>`;
            let topDoctorEstilo = '';
            
            if (stats.topDoctorFoto) {
                // Si tiene foto, la mostramos
                topDoctorIcono = `<img src="${stats.topDoctorFoto}" alt="${stats.topDoctor}" style="width:100%; height:100%; object-fit:cover;">`;
                topDoctorEstilo = 'padding:0; overflow:hidden; background:transparent; border:1px solid #e2e8f0;';
            }

            const html = `
                <div class="card-grid">
                    <div class="stat-card">
                        <i class="ph ph-calendar-check icon-bg"></i>
                        <h3>Pendientes</h3>
                        <div class="value">${citasPendientes}</div>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-users icon-bg" style="color:var(--success)"></i>
                        <h3>Pacientes</h3>
                        <div class="value">${pacientes.length}</div>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-user-focus icon-bg" style="color:var(--primary)"></i>
                        <h3>Doctores</h3>
                        <div class="value">${doctores.length}</div>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-clock icon-bg" style="color:var(--warning)"></i>
                        <h3>24 Horas</h3>
                        <div class="value">${citasProximas24h}</div>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="table-container">
                        <div class="section-header" style="margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
                            <h3 style="margin:0; font-size: 1.1rem; color: var(--text-main);">
                                <i class="ph ph-clock-counter-clockwise"></i> Actividad Reciente
                            </h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Paciente</th>
                                    <th>Doctor</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-resumen"></tbody>
                        </table>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="section-header" style="margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
                            <h3 style="margin:0; font-size: 1.1rem; color: var(--text-main);">
                                <i class="ph ph-star"></i> Destacados
                            </h3>
                        </div>
                        <div class="stats-cards-mini">
                            <div class="stat-mini-card specialty-card">
                                <div class="stat-mini-icon"><i class="ph ph-heartbeat"></i></div>
                                <div class="stat-mini-content">
                                    <h4>Especialidad Top</h4>
                                    <div class="stat-mini-value">${stats.topEspecialidad}</div>
                                    <div class="stat-mini-label">${stats.citasEspecialidad} visitas</div>
                                </div>
                            </div>
                            
                            <div class="stat-mini-card doctor-card">
                                <div class="stat-mini-icon" style="${topDoctorEstilo}">
                                    ${topDoctorIcono}
                                </div>
                                <div class="stat-mini-content">
                                    <h4>Doctor Estrella</h4>
                                    <div class="stat-mini-value">${stats.topDoctor}</div>
                                    <div class="stat-mini-label">${stats.citasDoctor} citas realizadas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
            // Llenar tabla con mini avatares
            const ultimas = citasCompletas.slice().reverse().slice(0, 5);
            const tbody = document.getElementById('tabla-resumen');
            
            if (ultimas.length > 0) {
                tbody.innerHTML = ultimas.map(c => {
                    // Mini avatar para la tabla
                    let avatarDoc = `<i class="ph ph-user"></i>`;
                    if (c.doctorFoto) {
                        avatarDoc = `<img src="${c.doctorFoto}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; margin-right:8px; vertical-align:middle;">`;
                    } else {
                        // Si no hay foto, usamos la inicial (La "D" que mencionas)
                        // Pero la hacemos pequeña y bonita
                        avatarDoc = `<span style="display:inline-flex; width:24px; height:24px; background:#e0f2fe; color:#0284c7; border-radius:50%; align-items:center; justify-content:center; font-size:0.75rem; font-weight:bold; margin-right:8px;">${c.doctorNombre.charAt(0)}</span>`;
                    }

                    return `
                    <tr>
                        <td data-label="Fecha/Hora">
                            <div style="font-weight:600">${c.fecha}</div>
                            <small style="color:var(--text-muted)">${c.hora}</small>
                        </td>
                        <td data-label="Paciente">${c.pacienteNombre}</td>
                        <td data-label="Doctor">
                            <div style="display:flex; align-items:center;">
                                ${avatarDoc}
                                <span>${c.doctorNombre}</span>
                            </div>
                        </td>
                        <td data-label="Estado"><span class="status-badge status-${c.estado}">${c.estado}</span></td>
                    </tr>
                `}).join('');
            } else {
                tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No hay actividad reciente</td></tr>`;
            }

            ocultarLoader();

        } catch (error) {
            console.error(error);
            ocultarLoader();
            mostrarError('Error al cargar el dashboard');
        }
    }

    // --- FUNCIONES AUXILIARES ---

    static obtenerCitasProximas24Horas(citas) {
        const ahora = new Date();
        const hoy = ahora.toISOString().split('T')[0];
        return citas.filter(cita => {
            if (cita.estado !== 'programada') return false;
            if (cita.fecha === hoy) {
                const [h, m] = cita.hora.split(':');
                const horaCita = new Date();
                horaCita.setHours(h, m, 0, 0);
                return horaCita > ahora;
            }
            const manana = new Date(ahora);
            manana.setDate(manana.getDate() + 1);
            return cita.fecha === manana.toISOString().split('T')[0];
        }).length;
    }

    // AHORA TAMBIÉN TRAE LA FOTO DEL DOCTOR
    static enriquecerCitas(citas, pacientes, doctores) {
        return citas.map(cita => {
            const p = pacientes.find(x => x.id === cita.pacienteId);
            const d = doctores.find(x => x.id === cita.doctorId);
            return {
                ...cita,
                pacienteNombre: p ? p.nombre : 'Desconocido',
                doctorNombre: d ? d.nombre : 'Desconocido',
                doctorFoto: d ? d.fotoUrl : null // <--- ¡AQUÍ ESTÁ LA CLAVE!
            };
        });
    }

    static calcularEstadisticas(citas, doctores) {
        if (citas.length === 0) return { topDoctor: 'N/A', topDoctorFoto: null, topEspecialidad: 'N/A', citasDoctor: 0, citasEspecialidad: 0 };

        // 1. Contar citas por Doctor ID
        const conteoDocs = {};
        citas.forEach(c => { conteoDocs[c.doctorId] = (conteoDocs[c.doctorId] || 0) + 1; });
        
        let topDocId = null;
        let maxCitasDoc = 0;
        Object.entries(conteoDocs).forEach(([id, count]) => {
            if (count > maxCitasDoc) { maxCitasDoc = count; topDocId = id; }
        });
        const doctorObj = doctores.find(d => d.id === topDocId);

        // 2. Contar citas por Especialidad
        const conteoEsp = {};
        citas.forEach(c => {
            const doc = doctores.find(d => d.id === c.doctorId);
            if (doc && doc.especialidad) {
                conteoEsp[doc.especialidad] = (conteoEsp[doc.especialidad] || 0) + 1;
            }
        });

        let topEsp = 'N/A';
        let maxCitasEsp = 0;
        Object.entries(conteoEsp).forEach(([esp, count]) => {
            if (count > maxCitasEsp) { maxCitasEsp = count; topEsp = esp; }
        });

        return {
            topDoctor: doctorObj ? doctorObj.nombre : 'N/A',
            topDoctorFoto: doctorObj ? doctorObj.fotoUrl : null, // <--- FOTO PARA EL DASHBOARD
            citasDoctor: maxCitasDoc,
            topEspecialidad: topEsp,
            citasEspecialidad: maxCitasEsp
        };
    }
}
