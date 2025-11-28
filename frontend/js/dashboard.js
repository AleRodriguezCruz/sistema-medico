// dashboard.js - Dashboard del Sistema de Gestión de Citas Médicas
// Muestra resumen general y estadísticas del sistema

class Dashboard {
    static async cargar() {
        activarMenu('dashboard');
        actualizarTitulo('Resumen General');
        
        mostrarLoader();
        
        try {
            const [estadisticasDoctores, estadisticasEspecialidades, citasResponse, pacientesResponse, doctoresResponse] = await Promise.all([
                EstadisticasService.getDoctores(),
                EstadisticasService.getEspecialidades(),
                CitasService.getAll(),
                PacientesService.getAll(),
                DoctoresService.getAll()
            ]);

            const citas = citasResponse.data || [];
            const pacientes = pacientesResponse.data || [];
            const doctores = doctoresResponse.data || [];

            const citasPendientes = citas.filter(c => c.estado === 'programada').length;
            const totalPacientes = pacientes.length;
            const totalDoctores = doctores.length;
            
            // Obtener citas de hoy
            const hoy = new Date().toISOString().split('T')[0];
            const citasHoy = citas.filter(c => c.fecha === hoy).length;

            // Obtener citas próximas 24 horas
            const citasProximas24h = this.obtenerCitasProximas24Horas(citas);

            // Enriquecer citas con nombres reales
            const citasConNombres = this.enriquecerCitasConNombres(citas, pacientes, doctores);

            const html = `
                <div class="card-grid">
                    <div class="stat-card">
                        <i class="ph ph-calendar-check icon-bg"></i>
                        <h3>Citas Pendientes</h3>
                        <div class="value">${citasPendientes}</div>
                        <small style="color:#94a3b8">Para atención inmediata</small>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-users icon-bg" style="color:#10b981"></i>
                        <h3>Pacientes Registrados</h3>
                        <div class="value">${totalPacientes}</div>
                        <small style="color:#94a3b8">Total en el sistema</small>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-user-focus icon-bg" style="color:#8b5cf6"></i>
                        <h3>Doctores Activos</h3>
                        <div class="value">${totalDoctores}</div>
                        <small style="color:#94a3b8">Equipo médico</small>
                    </div>
                    <div class="stat-card">
                        <i class="ph ph-clock icon-bg" style="color:#f59e0b"></i>
                        <h3>Próximas 24h</h3>
                        <div class="value">${citasProximas24h}</div>
                        <small style="color:#94a3b8">Citas próximas</small>
                    </div>
                </div>
                
                <div class="dashboard-sections">
                    <div class="table-container">
                        <h3 style="margin-bottom:1rem; color:#e2e8f0">
                            <i class="ph ph-clock-counter-clockwise"></i> Actividad Reciente
                        </h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Paciente</th>
                                    <th>Doctor</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tabla-resumen"></tbody>
                        </table>
                    </div>
                    
                    <div class="stats-cards-mini">
                        <div class="stat-mini-card specialty-card">
                            <div class="stat-mini-icon">
                                <i class="ph ph-heartbeat"></i>
                            </div>
                            <div class="stat-mini-content">
                                <h4>Especialidad Top</h4>
                                <div class="stat-mini-value">${estadisticasEspecialidades.data.especialidad || 'N/A'}</div>
                                <div class="stat-mini-label">${estadisticasEspecialidades.data.totalCitas || 0} visitas programadas</div>
                            </div>
                            <div class="stat-mini-badge">🔥 Popular</div>
                        </div>
                        
                        <div class="stat-mini-card doctor-card">
                            <div class="stat-mini-icon">
                                <i class="ph ph-star"></i>
                            </div>
                            <div class="stat-mini-content">
                                <h4>Doctor Estrella</h4>
                                <div class="stat-mini-value">${estadisticasDoctores.data.doctor || 'N/A'}</div>
                                <div class="stat-mini-label">${estadisticasDoctores.data.totalCitas || 0} citas activas</div>
                            </div>
                            <div class="stat-mini-badge">⭐ Top</div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('app-content').innerHTML = html;
            
            // Llenar tabla resumen con nombres reales
            const ultimas = citasConNombres.slice().reverse().slice(0, 5);
            const tbody = document.getElementById('tabla-resumen');
            tbody.innerHTML = '';
            
            ultimas.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>${c.fecha} <small style="color:#64748b">${c.hora}</small></td>
                        <td>${c.pacienteNombre}</td>
                        <td>${c.doctorNombre}</td>
                        <td><span class="status-badge status-${c.estado}">${c.estado}</span></td>
                    </tr>
                `;
            });

        } catch (error) {
            mostrarError('Error al cargar el dashboard');
            console.error(error);
        }
    }

    /**
     * Obtiene el número de citas en las próximas 24 horas
     */
    static obtenerCitasProximas24Horas(citas) {
        const ahora = new Date();
        const en24Horas = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
        const hoy = ahora.toISOString().split('T')[0];
        
        const citasProximas = citas.filter(cita => {
            if (cita.estado !== 'programada') return false;
            
            // Si la cita es hoy, verificar que la hora sea futura
            if (cita.fecha === hoy) {
                const [horas, minutos] = cita.hora.split(':');
                const horaCita = new Date();
                horaCita.setHours(parseInt(horas), parseInt(minutos), 0, 0);
                return horaCita > ahora;
            }
            
            // Si la cita es mañana, incluirla
            const manana = new Date(ahora);
            manana.setDate(manana.getDate() + 1);
            const mananaStr = manana.toISOString().split('T')[0];
            
            return cita.fecha === mananaStr;
        });
        
        return citasProximas.length;
    }

    /**
     * Enriquece las citas con nombres reales de pacientes y doctores
     */
    static enriquecerCitasConNombres(citas, pacientes, doctores) {
        return citas.map(cita => {
            const paciente = pacientes.find(p => p.id === cita.pacienteId);
            const doctor = doctores.find(d => d.id === cita.doctorId);
            
            return {
                ...cita,
                pacienteNombre: paciente ? paciente.nombre : cita.pacienteId,
                doctorNombre: doctor ? doctor.nombre : cita.doctorId
            };
        });
    }
}