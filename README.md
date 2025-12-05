🏥 MediGest - Sistema de Gestión de Citas Médicas
<table border="0" cellspacing="0" cellpadding="10"> <tr> <td width="33%" align="center"> <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"> </td> <td width="33%" align="center"> <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express.js"> </td> <td width="33%" align="center"> <img src="https://img.shields.io/badge/REST%20API-FF6C37?style=flat-square&logo=postman&logoColor=white" alt="REST API"> </td> </tr> <tr> <td align="center"><strong>✅ Estado</strong><br>Desarrollo</td> <td align="center"><strong>📦 Versión</strong><br>v1.0.0</td> <td align="center"><strong>⚖️ Licencia</strong><br>MIT</td> </tr> </table>
📋 Descripción del Proyecto

MediGest es una API REST desarrollada en Node.js con Express que permite la gestión integral de un sistema de citas médicas. La aplicación incluye:

    👥 Gestión de Pacientes: Registro, consulta y actualización de información de pacientes

    🩺 Gestión de Doctores: Administración de médicos por especialidad y horarios

    📅 Sistema de Citas: Agendamiento inteligente con validaciones de disponibilidad

    📊 Estadísticas: Reportes y análisis de consultas por doctor y especialidad

🎓 Información Académica
Campo	Detalle
🏫 Instituto Tecnológico de Ensenada
🎓 Ingeniería en Sistemas Computacionales
📚 Desarrollo Web
📝 Proyecto Final
👩‍🎓 Alejandra Rodríguez de la Cruz
👩‍🏫 Docente	Xenia Padilla Madrid
📅 Fecha	4 de Diciembre de 2025
🚀 Inicio Rápido
bash

# 1. Clonar el repositorio
git clone https://github.com/AleRodriguezCruz/sistema-medico.git

# 2. Navegar al directorio del proyecto
cd sistema-medico

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor en modo desarrollo
npm run dev

# 5. El servidor estará disponible en:
#    http://localhost:3000

📚 Endpoints de la API
👥 Pacientes (/pacientes)
Método	Endpoint	Descripción	Estado
POST	/pacientes	Registrar nuevo paciente	✅
GET	/pacientes	Listar todos los pacientes	✅
GET	/pacientes/:id	Obtener paciente por ID	✅
PUT	/pacientes/:id	Actualizar datos del paciente	✅
GET	/pacientes/:id/historial	Ver historial de citas	✅
🩺 Doctores (/doctores)
Método	Endpoint	Descripción	Estado
POST	/doctores	Registrar nuevo doctor	✅
GET	/doctores	Listar todos los doctores	✅
GET	/doctores/:id	Obtener doctor por ID	✅
GET	/doctores/especialidad/:especialidad	Buscar por especialidad	✅
📅 Citas (/citas)
Método	Endpoint	Descripción	Estado
POST	/citas	Agendar nueva cita	✅
GET	/citas	Listar todas las citas	✅
GET	/citas/:id	Obtener cita específica	✅
PUT	/citas/:id/cancelar	Cancelar cita	✅
GET	/citas/doctor/:doctorId	Ver agenda del doctor	✅
📊 Estadísticas (/estadisticas)
Método	Endpoint	Descripción	Estado
GET	/estadisticas/doctores	Citas por doctor	✅
GET	/estadisticas/especialidades	Citas por especialidad	✅
🧪 Ejemplos de Uso con cURL
📝 Registrar un Paciente
bash

curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Sebastian",
    "edad": 25,
    "telefono": "646-123-4567",
    "email": "juan.sebastian@email.com"
  }'

Respuesta Exitosa:
json

{
  "success": true,
  "message": "Paciente registrado exitosamente",
  "data": {
    "id": "P003",
    "nombre": "Juan Sebastian",
    "edad": 25,
    "telefono": "646-123-4567",
    "email": "juan.sebastian@email.com",
    "fechaRegistro": "2025-11-11"
  }
}

🗓️ Agendar una Cita Médica
bash

curl -X POST http://localhost:3000/citas \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteId": "P001",
    "doctorId": "D002",
    "fecha": "2025-12-15",
    "hora": "10:30",
    "motivo": "Consulta de seguimiento"
  }'

🔍 Consultar Historial Médico
bash

curl http://localhost:3000/pacientes/P001/historial

🩺 Buscar Doctores por Especialidad
bash

curl http://localhost:3000/doctores/especialidad/Cardiología

⚠️ Validaciones Implementadas
❌ Email Duplicado
bash

curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana Duplicado",
    "edad": 30,
    "telefono": "555-9999",
    "email": "ana.lopez@email.com"
  }'

Respuesta de Error:
json

{
  "success": false,
  "message": "Ya existe un paciente con este email"
}

⏰ Horario no Disponible

Validaciones incluidas:

    ✅ Doctor disponible en fecha específica

    ✅ Horario dentro del rango laboral

    ✅ Cita no duplicada en mismo horario

    

📅 Días no Laborales
json

{
  "success": false,
  "message": "El doctor no trabaja los Jueves"
}




🛠️ Tecnologías Utilizadas
<div align="center">
Tecnología	Versión	Propósito
https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white	18.x+	Entorno de ejecución
https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white	4.x	Framework web
https://img.shields.io/badge/-JSON-000000?logo=json&logoColor=white	-	Persistencia de datos
https://img.shields.io/badge/-cURL-073551?logo=curl&logoColor=white	-	Pruebas de API
</div>
📊 Estadísticas del Sistema
Consultar Estadísticas por Doctor:
bash

curl http://localhost:3000/estadisticas/doctores

Consultar Estadísticas por Especialidad:
bash

curl http://localhost:3000/estadisticas/especialidades

Respuesta Ejemplo:
json

{
  "success": true,
  "data": {
    "doctor": "Dr. James Wilson",
    "especialidad": "Oncología",
    "totalCitas": 5
  }
}



<div align="center">
📞 Contacto y Soporte

👩‍💻 Desarrolladora: Alejandra Rodríguez de la Cruz
📧 Email: al22760045@ite.edu.mx
🏫 Institución: Instituto Tecnológico de Ensenada
</div><div align="center">


© 2025 - MediGest Sistema de Citas Médicas
</div>
