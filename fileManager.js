// fileManager.js - Gestor de archivos para el backend
// Este archivo maneja la lectura y escritura de datos en archivos JSON

const fs = require('fs');
const path = require('path');

class FileManager {
    constructor(filename) {
        // Construye la ruta completa al archivo JSON en la carpeta data
        this.filePath = path.join(__dirname, 'data', filename);
        // Asegura que el archivo exista al crear la instancia
        this.ensureFileExists();
        console.log(`📁 FileManager inicializado para: ${filename}`);
    }

    // Verifica y crea el archivo y directorio si no existen
    ensureFileExists() {
        try {
            const dir = path.dirname(this.filePath);
            
            // Crea el directorio si no existe
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Directorio creado: ${dir}`);
            }
            
            // Crea el archivo con array vacío si no existe
            if (!fs.existsSync(this.filePath)) {
                fs.writeFileSync(this.filePath, '[]', 'utf-8');
                console.log(`✅ Archivo creado: ${this.filePath}`);
            }
        } catch (error) {
            console.error(`❌ Error creando archivo/directorio:`, error);
        }
    }

    // Lee y parsea los datos del archivo JSON
    leerDatos() {
        try {
            // Lee el contenido del archivo como texto
            const data = fs.readFileSync(this.filePath, 'utf-8');
            // Convierte el texto JSON a objeto JavaScript
            const parsedData = JSON.parse(data);
            console.log(`📖 Datos leídos de ${path.basename(this.filePath)}: ${parsedData.length} registros`);
            return parsedData;
        } catch (error) {
            // En caso de error, muestra mensaje y retorna array vacío
            console.error(`❌ Error leyendo ${this.filePath}:`, error.message);
            return [];
        }
    }

    // Escribe datos en el archivo JSON
    escribirDatos(data) {
        try {
            // Convierte el array a JSON con formato legible
            const jsonData = JSON.stringify(data, null, 2);
            // Escribe en el archivo
            fs.writeFileSync(this.filePath, jsonData, 'utf-8');
            console.log(`💾 Datos guardados en ${path.basename(this.filePath)}: ${data.length} registros`);
            return true;
        } catch (error) {
            console.error(`❌ Error escribiendo ${this.filePath}:`, error.message);
            return false;
        }
    }

    // Genera un ID único basado en los IDs existentes
    generarId(prefix, datos) {
        // Si no hay datos, empezar con 001
        if (datos.length === 0) {
            return `${prefix}001`;
        }
        
        // Encuentra el número más alto en los IDs existentes
        const maxId = datos.reduce((max, item) => {
            if (!item.id || typeof item.id !== 'string') return max;
            
            try {
                // Extrae el número del ID (ej: de 'P005' extrae 5)
                const num = parseInt(item.id.replace(prefix, '')) || 0;
                return num > max ? num : max;
            } catch (error) {
                return max;
            }
        }, 0);
        
        // Genera nuevo ID con el siguiente número
        const nuevoNumero = maxId + 1;
        // Formatea el número con ceros a la izquierda
        const idFormateado = nuevoNumero.toString().padStart(3, '0');
        
        return `${prefix}${idFormateado}`;
    }
}

// Exporta la clase para su uso en otros archivos
module.exports = FileManager;