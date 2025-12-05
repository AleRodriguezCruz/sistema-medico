🏥 MediGest | Sistema de Gestión de Citas Médicas

![Imagen del Sistema de Gestión de Citas Médicas en acción]

✨ Badges

Estado del Proyecto

Versión

Licencia

✅ Completo

v1.0

MIT

🎓 Información del Proyecto

Instituto Tecnológico de Ensenada

Ingeniería en Sistemas Computacionales

Desarrollo de APIs

PROYECTO FINAL

Alejandra Rodríguez de la Cruz

Docente: Xenia Padilla Madrid

Fecha: 4 de Diciembre de 2025

📋 Descripción General

Este proyecto implementa una API RESTful robusta para la gestión completa de un consultorio médico.

Utiliza persistencia de datos en archivos JSON (simulando una base de datos) y ofrece validaciones exhaustivas para garantizar la integridad de los datos en el registro de:

Pacientes: Registro completo con datos de contacto.

Doctores: Manejo de especialidades, horarios y días disponibles.

Citas: Agendamiento con validación de disponibilidad de doctor y horario.

⚙️ Tecnologías Utilizadas

Tecnología

Descripción

Node.js

Entorno de ejecución de JavaScript.

Express

Framework para el desarrollo del backend (API REST).

JSON

Formato de persistencia de datos (simulación de BD).

cURL

Herramienta de línea de comandos para pruebas de endpoints.

🚀 Instalación y Ejecución Rápida

Para poner en marcha el servidor de la API, sigue estos sencillos pasos:

# 1. Instalar todas las dependencias del proyecto
npm install

# 2. Iniciar el servidor en modo desarrollo (usualmente en puerto 3000)
npm run dev

# 3. La API estará disponible en: http://localhost:3000/


📚 Endpoints Principales (API REST)

Aquí están todos los recursos disponibles para interactuar con la gestión médica.

👥 Recursos de Pacientes (/pacientes)

Método

Endpoint

Descripción

POST

/pacientes

Registrar un nuevo paciente.

GET

/pacientes

Listar todos los pacientes registrados.

GET

/pacientes/:id

Obtener el detalle de un paciente por su ID.

PUT

/pacientes/:id

Actualizar los datos de un paciente existente.

DELETE

/pacientes/:id

Eliminar un paciente.

GET

/pacientes/:id/historial

Ver el historial de citas de un paciente.

🩺 Recursos de Doctores (/doctores)

Método

Endpoint

Descripción

POST

/doctores

Registrar un nuevo doctor.

GET

/doctores

Listar todos los doctores disponibles.

GET

/doctores/:id

Obtener el detalle de un doctor por su ID.

PUT

/doctores/:id

Actualizar información del doctor.

GET

/doctores/especialidad/:especialidad

Buscar doctores por especialidad.

📅 Recursos de Citas (/citas)

Método

Endpoint

Descripción

POST

/citas

Agendar una nueva cita (incluye validaciones de horario).

GET

/citas

Listar todas las citas (con posible filtrado).

GET

/citas/:id

Obtener el detalle de una cita específica.

PUT

/citas/:id

Actualizar una cita (ej. marcar como completada).

PUT

/citas/:id/cancelar

Cancelar una cita.

GET

/citas/doctor/:doctorId

Ver la agenda completa de un doctor.

📊 Estadísticas (/estadisticas)

Método

Endpoint

Descripción

GET

/estadisticas/doctores

Ver el doctor con más citas agendadas.

GET

/estadisticas/especialidades

Ver la especialidad más solicitada.

🧪 Ejemplos de Uso (cURL)

A continuación, se muestran ejemplos de cómo interactuar con los endpoints de la API utilizando cURL en la terminal.

➕ Crear un Paciente

curl -X POST http://localhost:3000/pacientes \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Juan Sebastian\",\"edad\":25,\"telefono\":\"646-TEST\",\"email\":\"al22760045@ite.edu.com\"}"

# Respuesta Exitosa:
# {"success":true,"message":"Paciente registrado exitosamente","data":{...}}


🗓️ Agendar una Cita

curl -X POST http://localhost:3000/citas \
-H "Content-Type: application/json" \
-d "{\"pacienteId\":\"P001\",\"doctorId\":\"D002\",\"fecha\":\"2025-12-11\",\"hora\":\"14:00\",\"motivo\":\"Caso diagnóstico complejo\"}"

# Respuesta Exitosa:
# {"success":true,"message":"Cita agendada exitosamente","data":{...}}


❌ Validación: Email Duplicado

Muestra la respuesta detallada de la validación del servidor:

curl -X POST http://localhost:3000/pacientes \
-H "Content-Type: application/json" \
-d "{\"nombre\":\"Juan Duplicado\",\"edad\":30,\"telefono\":\"555-9999\",\"email\":\"ana.lopez@email.com\"}"

# Respuesta de Error:
# {"success":false,"message":"Ya existe un paciente con este email"}


🗓️ Ver Agenda de un Doctor

curl http://localhost:3000/citas/doctor/D003

# Respuesta Exitosa:
# {"success":true,"data":[...lista de citas del Dr. D003...]}
