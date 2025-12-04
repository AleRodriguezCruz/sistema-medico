// fileManager.js - Gestor de archivos
const fs = require('fs');
const path = require('path');

class FileManager {
    constructor(filename) {
        this.filePath = path.join(__dirname, 'data', filename);
        this.ensureFileExists();
    }

    ensureFileExists() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (!fs.existsSync(this.filePath)) {
                fs.writeFileSync(this.filePath, '[]', 'utf-8');
            }
        } catch (error) {
            console.error(`❌ Error al crear archivo: ${error}`);
        }
    }

    leerDatos() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Error al leer: ${error}`);
            return [];
        }
    }

    escribirDatos(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error(`❌ Error al escribir: ${error}`);
            return false;
        }
    }

    generarId(prefix, datos) {
        if (!datos || datos.length === 0) return `${prefix}001`;
        
        const maxId = datos.reduce((max, item) => {
            if (!item.id) return max;
            const num = parseInt(item.id.replace(prefix, '')) || 0;
            return num > max ? num : max;
        }, 0);
        
        return `${prefix}${(maxId + 1).toString().padStart(3, '0')}`;
    }
}


module.exports = FileManager;
