// ==============================================================
// 🎓 PROYECTO FINAL: SISTEMA DE GESTIÓN MÉDICA
// 🖥️ BACKEND (Server.js)
// AUTOR:ALEJANDRA RODRIGUEZ DE LA CRUZ
// 📝 Descripción: Servidor API RESTful hecho con Express
// ==============================================================

// --- 1. IMPORTACIÓN DE LIBRERÍAS ---
const express = require('express'); // El framework para crear el servidor web
const cors = require('cors');       // Importante: Permite que el Frontend se conecte sin errores de seguridad
const path = require('path');       // Utilidad nativa de Node para manejar rutas de carpetas
const FileManager = require('./fileManager'); // Mi clase personalizada para leer/escribir en los JSON

// --- 2. CONFIGURACIÓN DEL SERVIDOR ---
const app = express(); // Inicializo la aplicación
const PORT = process.env.PORT || 3000; // El puerto donde va a vivir mi API

// --- 3. MIDDLEWARES (Configuraciones previas) ---
app.use(cors()); // Habilito conexiones desde cualquier origen
app.use(express.json()); // ¡CRUCIAL! Esto permite que el servidor entienda los JSON que me envía el frontend en el body
app.use(express.static('frontend')); // Le digo a Express dónde están mis archivos HTML/CSS/JS para mostrarlos

// --- 4. INICIALIZACIÓN DE "BASES DE DATOS" ---
// Uso mi clase FileManager para conectar con cada archivo JSON
const pacientesManager = new FileManager('pacientes.json');
const doctoresManager = new FileManager('doctores.json');
const citasManager = new FileManager('citas.json');


// ==============================================================
// 🚑 RUTAS DE PACIENTES (CRUD Completo)
// ==============================================================

// GET: Para leer y mostrar la lista completa
app.get('/pacientes', (req, res) => {
    const data = pacientesManager.leerDatos(); // Leo el archivo
    res.json({ success: true, data: data });   // Respondo con un JSON estandarizado
});

// GET (por ID): Para buscar un paciente específico
app.get('/pacientes/:id', (req, res) => {
    const data = pacientesManager.leerDatos();
    // Uso .find() para buscar el que coincida con el ID de la URL
    const item = data.find(i => i.id === req.params.id);
    
    if (item) {
        res.json({ success: true, data: item });
    } else {
        res.status(404).json({ success: false, message: 'Paciente no encontrado' });
    }
});

// POST: Para registrar un nuevo paciente
app.post('/pacientes', (req, res) => {
    const data = pacientesManager.leerDatos();
    
    // Creo el objeto nuevo combinando:
    // 1. Un ID automático (P001, P002...)
    // 2. Los datos que vienen del formulario (req.body)
    // 3. La fecha de hoy automática
    const nuevo = { 
        id: pacientesManager.generarId('P', data), 
        ...req.body, 
        fechaRegistro: new Date().toISOString().split('T')[0] 
    };
    
    data.push(nuevo); // Lo agrego a la lista en memoria
    
    // Intento guardar en el archivo físico
    if (pacientesManager.escribirDatos(data)) {
        res.json({ success: true, data: nuevo });
    } else {
        res.status(500).json({ success: false, message: 'Error al escribir en disco' });
    }
});

// PUT: Para editar un paciente existente
app.put('/pacientes/:id', (req, res) => {
    const data = pacientesManager.leerDatos();
    // Busco la posición en el arreglo
    const index = data.findIndex(i => i.id === req.params.id);
    
    if (index !== -1) {
        // Actualizo mezclando los datos viejos con los nuevos
        data[index] = { ...data[index], ...req.body };
        pacientesManager.escribirDatos(data) ? res.json({ success: true, data: data[index] }) : res.status(500).json({ success: false });
    } else {
        res.status(404).json({ success: false, message: 'No encontrado' });
    }
});

// DELETE: Para eliminar un paciente 
app.delete('/pacientes/:id', (req, res) => {
    const data = pacientesManager.leerDatos();
    // Creo una nueva lista filtrando al paciente que quiero borrar
    const newData = data.filter(i => i.id !== req.params.id);
    
    if (pacientesManager.escribirDatos(newData)) {
        res.json({ success: true, message: 'Eliminado correctamente' });
    } else {
        res.status(500).json({ success: false, message: 'Error al borrar' });
    }
});


// ==============================================================
// 👨‍⚕️ RUTAS DE DOCTORES
// ==============================================================

// GET: Ver todos los doctores
app.get('/doctores', (req, res) => {
    const data = doctoresManager.leerDatos();
    res.json({ success: true, data: data });
});

// GET: Ver un doctor
app.get('/doctores/:id', (req, res) => {
    const data = doctoresManager.leerDatos();
    const item = data.find(i => i.id === req.params.id);
    item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false });
});

// POST: Contratar (crear) doctor
app.post('/doctores', (req, res) => {
    const data = doctoresManager.leerDatos();
    // Genero ID con prefijo 'D' (ej: D005)
    const nuevo = { id: doctoresManager.generarId('D', data), ...req.body };
    data.push(nuevo);
    doctoresManager.escribirDatos(data) ? res.json({ success: true, data: nuevo }) : res.status(500).json({ success: false });
});

// PUT: Modificar datos del doctor
app.put('/doctores/:id', (req, res) => {
    const data = doctoresManager.leerDatos();
    const index = data.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        doctoresManager.escribirDatos(data) ? res.json({ success: true, data: data[index] }) : res.status(500).json({ success: false });
    } else {
        res.status(404).json({ success: false });
    }
});


// ==============================================================
// 📅 RUTAS DE CITAS (Lo más complejo)
// ==============================================================

// GET: Ver todas las citas
app.get('/citas', (req, res) => {
    const data = citasManager.leerDatos();
    res.json({ success: true, data: data });
});

// GET (Filtro): Obtener la agenda de un doctor específico
app.get('/citas/doctor/:id', (req, res) => {
    const data = citasManager.leerDatos();
    // Filtro solo las citas que pertenecen a este doctor
    const agenda = data.filter(c => c.doctorId === req.params.id);
    res.json({ success: true, data: agenda });
});

// GET: Una cita por ID
app.get('/citas/:id', (req, res) => {
    const data = citasManager.leerDatos();
    const item = data.find(i => i.id === req.params.id);
    item ? res.json({ success: true, data: item }) : res.status(404).json({ success: false });
});

// POST: Agendar nueva cita
app.post('/citas', (req, res) => {
    const data = citasManager.leerDatos();
    const nueva = { 
        id: citasManager.generarId('C', data), 
        ...req.body, 
        estado: 'programada' // Estado inicial obligatorio
    };
    data.push(nueva);
    citasManager.escribirDatos(data) ? res.json({ success: true, data: nueva }) : res.status(500).json({ success: false });
});

// PUT: Actualizar cita 
app.put('/citas/:id', (req, res) => {
    const data = citasManager.leerDatos();
    const index = data.findIndex(i => i.id === req.params.id);
    
    if (index !== -1) {
        // Actualizamos los campos que vengan (ej: estado: 'completada')
        data[index] = { ...data[index], ...req.body };
        citasManager.escribirDatos(data) ? res.json({ success: true, data: data[index] }) : res.status(500).json({ success: false });
    } else {
        res.status(404).json({ success: false });
    }
});

// PUT: Endpoint específico para cancelar (Cambia estado a 'cancelada')
app.put('/citas/:id/cancelar', (req, res) => {
    const data = citasManager.leerDatos();
    const index = data.findIndex(i => i.id === req.params.id);
    
    if (index !== -1) {
        data[index].estado = 'cancelada'; // Cambio lógico, no borro el registro
        citasManager.escribirDatos(data) ? res.json({ success: true, data: data[index] }) : res.status(500).json({ success: false });
    } else {
        res.status(404).json({ success: false });
    }
});


// ==============================================================
// 📊 EXTRAS (Estadísticas para el Dashboard)
// ==============================================================

app.get('/estadisticas/doctores', (req, res) => {
    // Calculo básico simulado para que el frontend no falle
    res.json({ success: true, data: { doctor: 'Calculando...', totalCitas: 0 } });
});

app.get('/estadisticas/especialidades', (req, res) => {
    res.json({ success: true, data: { especialidad: 'Calculando...', totalCitas: 0 } });
});


// ==============================================================
// 🚀 ARRANQUE
// ==============================================================

// Ruta comodín: Si piden algo que no existe, devuelvo el index.html (Para Single Page Apps)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Ponemos el servidor a escuchar
app.listen(PORT, () => {
    console.log(`✅ Servidor Médico listo en http://localhost:${PORT}`);
    console.log('📝 Presiona Ctrl+C para detenerlo');
});

