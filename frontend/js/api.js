// Servicios API para comunicación con el backend
const API_BASE = '';

class ApiService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error en la petición:', error);
            return {
                success: false,
                message: 'Error de conexión con el servidor'
            };
        }
    }
}

class PacientesService {
    static async getAll() {
        return await ApiService.request('/pacientes');
    }
    
    static async getById(id) {
        return await ApiService.request(`/pacientes/${id}`);
    }
    
    static async create(paciente) {
        return await ApiService.request('/pacientes', {
            method: 'POST',
            body: JSON.stringify(paciente)
        });
    }
    
    static async update(id, paciente) {
        return await ApiService.request(`/pacientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(paciente)
        });
    }
    
    static async getHistorial(id) {
        return await ApiService.request(`/pacientes/${id}/historial`);
    }
}

class DoctoresService {
    static async getAll() {
        return await ApiService.request('/doctores');
    }
    
    static async getById(id) {
        return await ApiService.request(`/doctores/${id}`);
    }
    
    static async create(doctor) {
        return await ApiService.request('/doctores', {
            method: 'POST',
            body: JSON.stringify(doctor)
        });
    }
    
    static async update(id, doctor) {
        return await ApiService.request(`/doctores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(doctor)
        });
    }
    
    static async getAgenda(id) {
        return await ApiService.request(`/citas/doctor/${id}`);
    }
}

class CitasService {
    static async getAll() {
        return await ApiService.request('/citas');
    }
    
    static async getById(id) {
        return await ApiService.request(`/citas/${id}`);
    }
    
    static async create(cita) {
        return await ApiService.request('/citas', {
            method: 'POST',
            body: JSON.stringify(cita)
        });
    }
    
    static async cancelar(id) {
        return await ApiService.request(`/citas/${id}/cancelar`, {
            method: 'PUT'
        });
    }
}

class EstadisticasService {
    static async getDoctores() {
        return await ApiService.request('/estadisticas/doctores');
    }
    
    static async getEspecialidades() {
        return await ApiService.request('/estadisticas/especialidades');
    }
}