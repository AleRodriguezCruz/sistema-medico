// app.js - Sistema de Gestión de Citas Médicas
// Lógica Global, Navegación y Utilidades


// ==========================================
// 1. LOADER TIPO OVERLAY 
// ==========================================

function mostrarLoader(texto = 'Cargando...') {
    const existente = document.querySelector('.loader-overlay');
    if (existente) return;

    // Crear la capa oscura transparente
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    
    // Aquí definimos qué se ve (El corazón o un spinner)
    loader.innerHTML = `
        <div class="heartbeat-container">
            <svg class="ecg-svg" viewBox="0 0 150 50" width="150" height="50">
                <path class="ecg-line" d="M0,25 L30,25 L40,10 L50,40 L60,25 L150,25" />
            </svg>
        </div>
        <p class="loader-text">${texto}</p>
    `;
    
    // Lo agregamos al cuerpo del documento (flotando sobre todo)
    document.body.appendChild(loader);
}

function ocultarLoader() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) {
        // Efecto de desvanecer
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 300);
    }
}
function mostrarExito(mensaje) {
    mostrarToast(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarToast(mensaje, 'error');
}

function mostrarToast(mensaje, tipo) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    // Iconos Phosphor
    const iconClass = tipo === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    
    toast.innerHTML = `
        <i class="ph ${iconClass}" style="font-size:1.2rem"></i>
        <span>${mensaje}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-eliminar a los 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// 2. SISTEMA DE MODALES
// ==========================================

function abrirModal(titulo, html) {
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    if (modal && titleEl && bodyEl) {
        titleEl.textContent = titulo;
        bodyEl.innerHTML = html;
        modal.style.display = 'flex';
    }
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==========================================
// 3. NAVEGACIÓN Y MENÚ MÓVIL
// ==========================================

function navegar(seccion) {
    console.log('Navegando a:', seccion);

    // A. Actualizar clase 'active' en el menú
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Buscar por ID o por atributo data-section (soporta ambos casos)
    const activeItem = document.getElementById(`nav-${seccion}`) || 
                       document.querySelector(`li[data-section="${seccion}"]`);
                       
    if (activeItem) activeItem.classList.add('active');

    // B. Cerrar menú móvil si está abierto (RESPONSIVIDAD)
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }

    // C. Cargar el controlador correspondiente
    try {
        switch(seccion) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.cargar();
                break;
            case 'pacientes':
                if (typeof PacientesManager !== 'undefined') PacientesManager.cargar();
                break;
            case 'doctores':
                if (typeof DoctoresManager !== 'undefined') DoctoresManager.cargar();
                break;
            case 'citas':
                if (typeof CitasManager !== 'undefined') CitasManager.cargar();
                break;
            default:
                console.warn('Sección desconocida:', seccion);
        }
    } catch (error) {
        console.error('Error al navegar:', error);
        mostrarError('Error al cargar la sección ' + seccion);
    }
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// Helpers globales para usar en formularios
function activarMenu(seccion) {
    // Helper visual para mantener consistencia
    const item = document.getElementById(`nav-${seccion}`);
    if (item) item.classList.add('active');
}

function actualizarTitulo(titulo) {
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titulo;
}

// ==========================================
// 4. INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('App inicializada');

    // Listener para cerrar modal con botón X
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) closeBtn.addEventListener('click', cerrarModal);

    // Listener para cerrar modal clicando fuera
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });
    }

    // Listener para links del menú (si usan data-section en vez de onclick)
    document.querySelectorAll('.menu li[data-section]').forEach(item => {
        item.addEventListener('click', function() {
            navegar(this.getAttribute('data-section'));
        });
    });

    // Carga inicial
    if (typeof Dashboard !== 'undefined') {
        Dashboard.cargar();
    } else {
        console.error('Dashboard.js no cargado');
    }
});

// Captura de errores globales para depuración
window.addEventListener('error', function(e) {
    console.error('Error global detectado:', e.message);
    // No mostramos alerta al usuario para no molestar, solo consola
});
