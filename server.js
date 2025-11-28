// server.js - Servidor del Sistema de Gestión de Citas Médicas
// Implementación del backend para la aplicación de gestión médica

// Dependencias requeridas
const express = require('express');
const cors = require('cors');
const path = require('path');
const FileManager = require('./fileManager');

// Configuración inicial de la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Inicialización de gestores de datos
const pacientesManager = new FileManager('pacientes.json');
const doctoresManager = new FileManager('doctores.json');
const citasManager = new FileManager('citas.json');

// Funciones de utilidad para el sistema

/**
 * Determina el día de la semana a partir de una fecha
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Nombre del día de la semana
 */
function obtenerDiaSemana(fecha) {
    try {
        const [anio, mes, dia] = fecha.split('-').map(Number);
        const fechaObj = new Date(anio, mes - 1, dia, 12, 0, 0);
        
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = dias[fechaObj.getDay()];
        
        return diaSemana;
    } catch (error) {
        console.error('Error al obtener día de la semana:', error);
        return 'Desconocido';
    }
}

// ==================== RUTAS PARA GESTIÓN DE PACIENTES ====================

// Obtener todos los pacientes registrados
app.get('/pacientes', (req, res) => {
    try {
        const pacientes = pacientesManager.leerDatos();
        res.json({
            success: true,
            data: pacientes,
            message: 'Pacientes obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener pacientes'
        });
    }
});

// Obtener un paciente específico por ID
app.get('/pacientes/:id', (req, res) => {
    try {
        const pacientes = pacientesManager.leerDatos();
        const paciente = pacientes.find(p => p.id === req.params.id);
        
        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: paciente,
            message: 'Paciente obtenido correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener paciente'
        });
    }
});

// Registrar nuevo paciente en el sistema
app.post('/pacientes', (req, res) => {
    try {
        const { nombre, edad, telefono, email } = req.body;
        
        // Validación de campos requeridos
        if (!nombre || !edad || !telefono || !email) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        // Validación de rango de edad
        if (edad < 1 || edad > 120) {
            return res.status(400).json({
                success: false,
                message: 'La edad debe estar entre 1 y 120 años'
            });
        }
        
        const pacientes = pacientesManager.leerDatos();
        
        // Verificar duplicidad de email
        const emailExiste = pacientes.some(p => p.email === email);
        if (emailExiste) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }
        
        // Crear nuevo registro de paciente
        const nuevoPaciente = {
            id: pacientesManager.generarId('P', pacientes),
            nombre,
            edad: parseInt(edad),
            telefono,
            email,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };
        
        pacientes.push(nuevoPaciente);
        pacientesManager.escribirDatos(pacientes);
        
        res.status(201).json({
            success: true,
            data: nuevoPaciente,
            message: 'Paciente creado correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear paciente'
        });
    }
});

// Actualizar información de paciente existente
app.put('/pacientes/:id', (req, res) => {
    try {
        const { nombre, edad, telefono, email } = req.body;
        const pacientes = pacientesManager.leerDatos();
        const pacienteIndex = pacientes.findIndex(p => p.id === req.params.id);
        
        if (pacienteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }
        
        // Validaciones de integridad de datos
        if (!nombre || !edad || !telefono || !email) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        // Verificar que el email no esté en uso por otro paciente
        const emailExiste = pacientes.some(p => p.email === email && p.id !== req.params.id);
        if (emailExiste) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado por otro paciente'
            });
        }
        
        // Actualizar datos del paciente
        pacientes[pacienteIndex] = {
            ...pacientes[pacienteIndex],
            nombre,
            edad: parseInt(edad),
            telefono,
            email
        };
        
        pacientesManager.escribirDatos(pacientes);
        
        res.json({
            success: true,
            data: pacientes[pacienteIndex],
            message: 'Paciente actualizado correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar paciente'
        });
    }
});

// Obtener historial de citas de un paciente
app.get('/pacientes/:id/historial', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const historial = citas.filter(c => c.pacienteId === req.params.id);
        
        res.json({
            success: true,
            data: historial,
            message: 'Historial obtenido correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial'
        });
    }
});

// ==================== RUTAS PARA GESTIÓN DE DOCTORES ====================

// Obtener todos los doctores del sistema
app.get('/doctores', (req, res) => {
    try {
        const doctores = doctoresManager.leerDatos();
        res.json({
            success: true,
            data: doctores,
            message: 'Doctores obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener doctores'
        });
    }
});

// Obtener información de un doctor específico
app.get('/doctores/:id', (req, res) => {
    try {
        const doctores = doctoresManager.leerDatos();
        const doctor = doctores.find(d => d.id === req.params.id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: doctor,
            message: 'Doctor obtenido correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener doctor'
        });
    }
});

// Registrar nuevo doctor en el sistema
app.post('/doctores', (req, res) => {
    try {
        const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;
        
        // Validaciones de campos obligatorios
        if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        // Validación de horarios lógicos
        if (horarioInicio >= horarioFin) {
            return res.status(400).json({
                success: false,
                message: 'El horario de inicio debe ser anterior al horario de fin'
            });
        }
        
        // Validación de días de trabajo
        if (!Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar al menos un día disponible'
            });
        }
        
        const doctores = doctoresManager.leerDatos();
        
        // Verificar duplicidad de doctor
        const doctorExiste = doctores.some(d => 
            d.nombre === nombre && d.especialidad === especialidad
        );
        
        if (doctorExiste) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un doctor con el mismo nombre y especialidad'
            });
        }
        
        // Crear nuevo registro de doctor
        const nuevoDoctor = {
            id: doctoresManager.generarId('D', doctores),
            nombre,
            especialidad,
            horarioInicio,
            horarioFin,
            diasDisponibles
        };
        
        doctores.push(nuevoDoctor);
        doctoresManager.escribirDatos(doctores);
        
        res.status(201).json({
            success: true,
            data: nuevoDoctor,
            message: 'Doctor creado correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear doctor'
        });
    }
});

// Actualizar información de doctor existente
app.put('/doctores/:id', (req, res) => {
    try {
        const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;
        const doctores = doctoresManager.leerDatos();
        const doctorIndex = doctores.findIndex(d => d.id === req.params.id);
        
        if (doctorIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Doctor no encontrado'
            });
        }
        
        // Validaciones de integridad de datos
        if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        if (horarioInicio >= horarioFin) {
            return res.status(400).json({
                success: false,
                message: 'El horario de inicio debe ser anterior al horario de fin'
            });
        }
        
        if (!Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar al menos un día disponible'
            });
        }
        
        // Actualizar datos del doctor
        doctores[doctorIndex] = {
            ...doctores[doctorIndex],
            nombre,
            especialidad,
            horarioInicio,
            horarioFin,
            diasDisponibles
        };
        
        doctoresManager.escribirDatos(doctores);
        
        res.json({
            success: true,
            data: doctores[doctorIndex],
            message: 'Doctor actualizado correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar doctor'
        });
    }
});

// ==================== RUTAS PARA GESTIÓN DE CITAS ====================

// Obtener todas las citas con filtros opcionales
app.get('/citas', (req, res) => {
    try {
        let citas = citasManager.leerDatos();
        
        // Aplicar filtros si están presentes en la consulta
        if (req.query.fecha) {
            citas = citas.filter(c => c.fecha === req.query.fecha);
        }
        
        if (req.query.estado) {
            citas = citas.filter(c => c.estado === req.query.estado);
        }
        
        res.json({
            success: true,
            data: citas,
            message: 'Citas obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas'
        });
    }
});

// Obtener información de una cita específica
app.get('/citas/:id', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const cita = citas.find(c => c.id === req.params.id);
        
        if (!cita) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: cita,
            message: 'Cita obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener cita'
        });
    }
});

// Agendar nueva cita en el sistema
app.post('/citas', (req, res) => {
    try {
        const { pacienteId, doctorId, fecha, hora, motivo } = req.body;

        // Validación de campos requeridos
        if (!pacienteId || !doctorId || !fecha || !hora || !motivo) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validación de formato de fecha
        const fechaCita = new Date(fecha + 'T00:00:00');
        if (isNaN(fechaCita.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido'
            });
        }

        // Validación de fecha futura
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaCita < hoy) {
            return res.status(400).json({
                success: false,
                message: 'No se pueden agendar citas en fechas pasadas'
            });
        }

        // Validación de límite de anticipación (3 meses)
        const maxFecha = new Date();
        maxFecha.setMonth(maxFecha.getMonth() + 3);
        maxFecha.setHours(23, 59, 59, 999);
        if (fechaCita > maxFecha) {
            return res.status(400).json({
                success: false,
                message: 'No se pueden agendar citas con más de 3 meses de anticipación'
            });
        }
        
        // Verificar existencia del paciente
        const pacientes = pacientesManager.leerDatos();
        const paciente = pacientes.find(p => p.id === pacienteId);
        if (!paciente) {
            return res.status(404).json({
                success: false,
                message: 'Paciente no encontrado'
            });
        }
        
        // Verificar existencia del doctor
        const doctores = doctoresManager.leerDatos();
        const doctor = doctores.find(d => d.id === doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor no encontrado'
            });
        }
        
        // Validar disponibilidad del doctor en la fecha seleccionada
        const diaSemana = obtenerDiaSemana(fecha);
        
        if (!doctor.diasDisponibles.includes(diaSemana)) {
            return res.status(400).json({
                success: false,
                message: `El doctor ${doctor.nombre} no trabaja los ${diaSemana}s. Días disponibles: ${doctor.diasDisponibles.join(', ')}`
            });
        }
        
        // Validar horario dentro del rango del doctor
        if (hora < doctor.horarioInicio || hora > doctor.horarioFin) {
            return res.status(400).json({
                success: false,
                message: `La hora ${hora} está fuera del horario del doctor. Horario disponible: ${doctor.horarioInicio} a ${doctor.horarioFin}`
            });
        }

        // Validar que no sea una cita en horario pasado
        const ahora = new Date();
        const hoyString = ahora.toISOString().split('T')[0];
        
        if (fecha === hoyString) {
            const horaActual = ahora.toTimeString().slice(0, 5);
            if (hora <= horaActual) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pueden agendar citas en horarios pasados'
                });
            }
        }
        
        // Verificar disponibilidad del doctor en la hora seleccionada
        const citas = citasManager.leerDatos();
        const citaExistente = citas.find(c => 
            c.doctorId === doctorId && 
            c.fecha === fecha && 
            c.hora === hora &&
            c.estado === 'programada'
        );
        
        if (citaExistente) {
            return res.status(400).json({
                success: false,
                message: 'El doctor ya tiene una cita programada a esa hora'
            });
        }
        
        // Crear nuevo registro de cita
        const nuevaCita = {
            id: citasManager.generarId('C', citas),
            pacienteId,
            doctorId,
            fecha,
            hora,
            motivo,
            estado: 'programada',
            fechaCreacion: new Date().toISOString()
        };
        
        citas.push(nuevaCita);
        const guardadoExitoso = citasManager.escribirDatos(citas);
        
        if (!guardadoExitoso) {
            return res.status(500).json({
                success: false,
                message: 'Error al guardar la cita en el sistema'
            });
        }
        
        res.status(201).json({
            success: true,
            data: nuevaCita,
            message: 'Cita agendada correctamente'
        });
        
    } catch (error) {
        console.error('Error en agendamiento de cita:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al agendar cita'
        });
    }
});

// Cancelar una cita existente
app.put('/citas/:id/cancelar', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const citaIndex = citas.findIndex(c => c.id === req.params.id);
        
        if (citaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Cita no encontrada'
            });
        }
        
        // Solo se pueden cancelar citas programadas
        if (citas[citaIndex].estado !== 'programada') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden cancelar citas programadas'
            });
        }
        
        // Marcar cita como cancelada
        citas[citaIndex].estado = 'cancelada';
        citas[citaIndex].fechaCancelacion = new Date().toISOString();
        
        citasManager.escribirDatos(citas);
        
        res.json({
            success: true,
            data: citas[citaIndex],
            message: 'Cita cancelada correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar cita'
        });
    }
});

// Obtener agenda de un doctor específico
app.get('/citas/doctor/:doctorId', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const agenda = citas.filter(c => c.doctorId === req.params.doctorId);
        
        res.json({
            success: true,
            data: agenda,
            message: 'Agenda obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener agenda'
        });
    }
});

// ==================== RUTAS PARA ESTADÍSTICAS ====================

// Obtener estadísticas de doctores más solicitados
app.get('/estadisticas/doctores', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const doctores = doctoresManager.leerDatos();
        
        // Conteo de citas por doctor
        const conteoDoctores = {};
        citas.forEach(cita => {
            if (cita.estado === 'programada') {
                conteoDoctores[cita.doctorId] = (conteoDoctores[cita.doctorId] || 0) + 1;
            }
        });
        
        // Identificar doctor con más citas
        let doctorTop = null;
        let maxCitas = 0;
        
        Object.keys(conteoDoctores).forEach(doctorId => {
            if (conteoDoctores[doctorId] > maxCitas) {
                maxCitas = conteoDoctores[doctorId];
                const doctor = doctores.find(d => d.id === doctorId);
                doctorTop = doctor ? doctor.nombre : doctorId;
            }
        });
        
        res.json({
            success: true,
            data: {
                doctor: doctorTop || 'N/A',
                totalCitas: maxCitas
            },
            message: 'Estadística obtenida correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// Obtener estadísticas de especialidades más demandadas
app.get('/estadisticas/especialidades', (req, res) => {
    try {
        const citas = citasManager.leerDatos();
        const doctores = doctoresManager.leerDatos();
        
        // Conteo de citas por especialidad
        const conteoEspecialidades = {};
        citas.forEach(cita => {
            if (cita.estado === 'programada') {
                const doctor = doctores.find(d => d.id === cita.doctorId);
                if (doctor) {
                    conteoEspecialidades[doctor.especialidad] = (conteoEspecialidades[doctor.especialidad] || 0) + 1;
                }
            }
        });
        
        // Identificar especialidad más popular
        let especialidadTop = null;
        let maxCitas = 0;
        
        Object.keys(conteoEspecialidades).forEach(especialidad => {
            if (conteoEspecialidades[especialidad] > maxCitas) {
                maxCitas = conteoEspecialidades[especialidad];
                especialidadTop = especialidad;
            }
        });
        
        res.json({
            success: true,
            data: {
                especialidad: especialidadTop || 'N/A',
                totalCitas: maxCitas
            },
            message: 'Estadística obtenida correctamente'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// ==================== RUTAS GENERALES ====================

// Endpoint de diagnóstico del sistema
app.get('/diagnostico', (req, res) => {
    try {
        const pacientes = pacientesManager.leerDatos();
        const doctores = doctoresManager.leerDatos();
        const citas = citasManager.leerDatos();
        
        res.json({
            success: true,
            data: {
                totalPacientes: pacientes.length,
                totalDoctores: doctores.length,
                totalCitas: citas.length,
                doctores: doctores.map(d => ({
                    id: d.id,
                    nombre: d.nombre,
                    diasDisponibles: d.diasDisponibles,
                    horario: `${d.horarioInicio} - ${d.horarioFin}`
                })),
                ultimasCitas: citas.slice(-5)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en diagnóstico'
        });
    }
});

// Ruta principal - Sirve la aplicación web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Archivos estáticos servidos desde: ${path.join(__dirname, 'frontend')}`);
    console.log(`Datos guardados en: ${path.join(__dirname, 'data')}`);
    console.log(`Hora de inicio: ${new Date().toLocaleString()}`);
    console.log(`Ruta de diagnóstico: http://localhost:${PORT}/diagnostico`);
});