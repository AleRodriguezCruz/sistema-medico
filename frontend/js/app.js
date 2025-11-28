// app.js - Sistema de Gestión de Citas Médicas
// Archivo principal que maneja la lógica de la interfaz de usuario

/**
 * Muestra un loader (animación de carga) en el contenido principal
 * Se usa cuando se están cargando datos desde el servidor
 */
function mostrarLoader() {
    document.getElementById('app-content').innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
    `;
}

/**
 * Muestra un mensaje de éxito temporal (toast)
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

/**
 * Muestra un mensaje de error temporal (toast)
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarError(mensaje) {
    mostrarToast(mensaje, 'error');
}

/**
 * Crea y muestra un mensaje temporal (toast) en la interfaz
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo de mensaje: 'success' o 'error'
 */
function mostrarToast(mensaje, tipo = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Elegir icono según el tipo de mensaje
    const icon = tipo === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    
    toast.innerHTML = `
        <i class="ph ${icon}"></i>
        <span>${mensaje}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Eliminar automáticamente después de 5 segundos
    setTimeout(() => toast.remove(), 5000);
}

/**
 * Abre un modal (ventana emergente) con título y contenido
 * @param {string} titulo - Título del modal
 * @param {string} contenido - HTML del contenido del modal
 */
function abrirModal(titulo, contenido) {
    document.getElementById('modal-title').textContent = titulo;
    document.getElementById('modal-body').innerHTML = contenido;
    document.getElementById('modal').style.display = 'flex';
}

/**
 * Cierra el modal activo
 */
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

/**
 * Activa el elemento del menú correspondiente a la sección actual
 * @param {string} seccion - ID de la sección a activar
 */
function activarMenu(seccion) {
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === seccion) {
            item.classList.add('active');
        }
    });
}

/**
 * Actualiza el título de la página actual
 * @param {string} titulo - Nuevo título
 */
function actualizarTitulo(titulo) {
    document.getElementById('page-title').textContent = titulo;
}

/**
 * Configura los event listeners para la navegación del menú
 */
function configurarNavegacion() {
    document.querySelectorAll('.menu li').forEach(item => {
        item.addEventListener('click', function() {
            const seccion = this.getAttribute('data-section');
            navegarA(seccion);
        });
    });
}

/**
 * Navega a una sección específica de la aplicación
 * @param {string} seccion - Sección a la que navegar
 */
function navegarA(seccion) {
    console.log('🔄 Navegando a:', seccion);
    
    // Switch que determina qué sección cargar
    switch(seccion) {
        case 'dashboard':
            if (typeof Dashboard !== 'undefined') {
                Dashboard.cargar();
            } else {
                console.error('Dashboard no está definido');
                mostrarError('Error al cargar el dashboard');
            }
            break;
            
        case 'pacientes':
            if (typeof PacientesManager !== 'undefined') {
                PacientesManager.cargar();
            } else {
                console.error('PacientesManager no está definido');
                mostrarError('Error al cargar pacientes');
            }
            break;
            
        case 'doctores':
            if (typeof DoctoresManager !== 'undefined') {
                DoctoresManager.cargar();
            } else {
                console.error('DoctoresManager no está definido');
                mostrarError('Error al cargar doctores');
            }
            break;
            
        case 'citas':
            if (typeof CitasManager !== 'undefined') {
                CitasManager.cargar();
            } else {
                console.error('CitasManager no está definido');
                mostrarError('Error al cargar citas');
            }
            break;
            
        default:
            console.error('Sección no reconocida:', seccion);
    }
}

/**
 * Función helper para obtener el valor de un elemento del DOM por su ID
 * @param {string} id - ID del elemento
 * @returns {string} Valor del elemento
 */
function val(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

/**
 * Función helper para establecer el valor de un elemento del DOM
 * @param {string} id - ID del elemento
 * @param {string} value - Valor a establecer
 */
function setVal(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

/**
 * Valida un formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida un número de teléfono
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si el teléfono es válido
 */
function validarTelefono(telefono) {
    const telefonoRegex = /^\d{10,}$/;
    return telefonoRegex.test(telefono.replace(/\D/g, ''));
}

/**
 * Formatea una fecha para mostrarla de manera legible
 * @param {string} fechaString - Fecha en formato string
 * @returns {string} Fecha formateada
 */
function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

/**
 * Obtiene el día de la semana a partir de una fecha
 * @param {string} fechaString - Fecha en formato string
 * @returns {string} Nombre del día de la semana
 */
function obtenerDiaSemana(fechaString) {
    const dias = ['Domingo', 'Lunes', 'Martés', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(fechaString);
    return dias[fecha.getDay()];
}

// ===== EVENT LISTENERS GLOBALES =====

/**
 * Inicializa la aplicación cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    
    // Configurar cierre del modal
    document.getElementById('close-modal').addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera del contenido
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            cerrarModal();
        }
    });
    
    // Configurar navegación
    configurarNavegacion();
    
    // Cargar dashboard por defecto
    if (typeof Dashboard !== 'undefined') {
        Dashboard.cargar();
    } else {
        console.error('No se pudo cargar el dashboard inicial');
        document.getElementById('app-content').innerHTML = `
            <div class="error-state">
                <h2>Error de carga</h2>
                <p>No se pudieron cargar los módulos de la aplicación.</p>
                <button onclick="location.reload()" class="btn-primary">Recargar</button>
            </div>
        `;
    }
    
    console.log('✅ Aplicación inicializada correctamente');
});

/**
 * Maneja errores globales no capturados
 */
window.addEventListener('error', function(e) {
    console.error('💥 Error global:', e.error);
    mostrarError('Ha ocurrido un error inesperado');
});

/**
 * Función para exportar datos (ejemplo para estudiantes)
 * @param {Array} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipo - Tipo de exportación: 'json' o 'csv'
 */
function exportarDatos(datos, nombreArchivo, tipo = 'json') {
    let contenido, mimeType, extension;
    
    if (tipo === 'json') {
        contenido = JSON.stringify(datos, null, 2);
        mimeType = 'application/json';
        extension = 'json';
    } else if (tipo === 'csv') {
        // Implementación básica de CSV
        const headers = Object.keys(datos[0] || {});
        const filas = datos.map(fila => 
            headers.map(header => `"${fila[header] || ''}"`).join(',')
        );
        contenido = [headers.join(','), ...filas].join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
    }
    
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreArchivo}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarExito(`Datos exportados como ${tipo.toUpperCase()}`);
}

/**
 * Función para importar datos (ejemplo para estudiantes)
 * @param {File} archivo - Archivo a importar
 * @param {Function} callback - Función a ejecutar con los datos importados
 */
function importarDatos(archivo, callback) {
    const lector = new FileReader();
    
    lector.onload = function(e) {
        try {
            let datos;
            if (archivo.type === 'application/json') {
                datos = JSON.parse(e.target.result);
            } else if (archivo.type === 'text/csv') {
                // Implementación básica de CSV a JSON
                const lineas = e.target.result.split('\n');
                const headers = lineas[0].split(',').map(h => h.replace(/"/g, ''));
                datos = lineas.slice(1).map(linea => {
                    const valores = linea.split(',').map(v => v.replace(/"/g, ''));
                    const objeto = {};
                    headers.forEach((header, index) => {
                        objeto[header] = valores[index];
                    });
                    return objeto;
                });
            }
            
            callback(datos);
            mostrarExito('Datos importados correctamente');
        } catch (error) {
            console.error('Error al importar datos:', error);
            mostrarError('Error al importar el archivo');
        }
    };
    
    lector.readAsText(archivo);
}