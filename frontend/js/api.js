// js/api.js - servicios de comunicación con el backend

// url base del servidor (se deja vacía si está en el mismo puerto)
const API_BASE = '';

// === CLASE PRINCIPAL ===
// ayuda a hacer peticiones fetch sin repetir código a cada rato
class ApiService {
    static async request(endpoint, options = {}) {
        try {
            // hace la petición al servidor
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json', // decimos que enviamos datos json
                    ...options.headers
                },
                ...options
            });
            
            // si la respuesta no es ok (ej: 404 o 500), lanzamos error
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // devolvemos los datos limpios en formato json
            return await response.json();
        } catch (error) {
            console.error('falló la petición:', error);
            // devolvemos un objeto de error para que el frontend no se rompa
            return {
                success: false,
                message: 'Error de conexión con el servidor'
            };
        }
    }
}

// === SERVICIO DE PACIENTES ===
class PacientesService {
    // obtener lista completa de pacientes
    static async getAll() {
        return await ApiService.request('/pacientes');
    }
    
    // buscar un paciente por su id
    static async getById(id) {
        return await ApiService.request(`/pacientes/${id}`);
    }
    
    // guardar un nuevo paciente (post)
    static async create(paciente) {
        return await ApiService.request('/pacientes', {
            method: 'POST',
            body: JSON.stringify(paciente)
        });
    }
    
    // editar datos de un paciente (put)
    static async update(id, paciente) {
        return await ApiService.request(`/pacientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(paciente)
        });
    }

    // borrar paciente (delete) - necesario para el botón de basura
    static async delete(id) {
        return await ApiService.request(`/pacientes/${id}`, {
            method: 'DELETE'
        });
    }
}

// === SERVICIO DE DOCTORES ===
class DoctoresService {
    // obtener lista de doctores
    static async getAll() {
        return await ApiService.request('/doctores');
    }
    
    // ver detalle de un doctor
    static async getById(id) {
        return await ApiService.request(`/doctores/${id}`);
    }
    
    // registrar nuevo doctor
    static async create(doctor) {
        return await ApiService.request('/doctores', {
            method: 'POST',
            body: JSON.stringify(doctor)
        });
    }
    
    // modificar info del doctor
    static async update(id, doctor) {
        return await ApiService.request(`/doctores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(doctor)
        });
    }
    
    // obtener solo las citas de este doctor (para la agenda)
    static async getAgenda(id) {
        return await ApiService.request(`/citas/doctor/${id}`);
    }
}

// === SERVICIO DE CITAS ===
class CitasService {
    // ver todas las citas (para el dashboard)
    static async getAll() {
        return await ApiService.request('/citas');
    }
    
    // ver una cita especifica
    static async getById(id) {
        return await ApiService.request(`/citas/${id}`);
    }
    
    // agendar una nueva cita
    static async create(cita) {
        return await ApiService.request('/citas', {
            method: 'POST',
            body: JSON.stringify(cita)
        });
    }

    // actualizar cita (sirve para marcarla como completada)
    static async update(id, datos) {
        return await ApiService.request(`/citas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        });
    }
    
    // cancelar una cita (cambia estado a 'cancelada')
    static async cancelar(id) {
        return await ApiService.request(`/citas/${id}/cancelar`, {
            method: 'PUT'
        });
    }
}

// === SERVICIO DE ESTADÍSTICAS (EXTRAS) ===
class EstadisticasService {
    // obtiene doctor con mas citas
    static async getDoctores() {
        // simulamos respuesta para evitar errores si no existe el endpoint
        return { success: true, data: {} };
    }
    
    // obtiene especialidad mas buscada
    static async getEspecialidades() {
        return { success: true, data: {} };
    }
}
