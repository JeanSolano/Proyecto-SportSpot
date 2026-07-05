Relaciones entre tablas 

Roles → Usuarios (1:N): Un rol puede ser asignado a múltiples usuarios, pero cada usuario tiene un único rol. Controla los permisos y vistas disponibles en la plataforma. 

Usuarios → OAuth_Providers (1:N): Un usuario puede tener múltiples proveedores de autenticación vinculados (Google, Apple). Cada registro de OAuth pertenece a un único usuario y se elimina en cascada si el usuario es borrado. 

Usuarios → Establecimientos (1:N): Un usuario con rol Dueño puede registrar y administrar uno o varios establecimientos deportivos. Cada establecimiento tiene un único propietario. 

Establecimientos → Establecimiento_Amenidades (1:N): Un establecimiento puede tener múltiples amenidades asociadas. La tabla de unión permite agregar notas específicas por cada amenidad en cada establecimiento. 

Amenidades → Establecimiento_Amenidades (1:N): Una amenidad del catálogo puede estar presente en múltiples establecimientos. Junto con la relación anterior forma el vínculo N:M entre establecimientos y amenidades. 

Establecimientos → Horarios_Operacion (1:N): Un establecimiento define un horario de operación por cada día de la semana. La restricción UNIQUE garantiza que no existan dos registros para el mismo día en el mismo establecimiento. 

Establecimientos → Canchas (1:N): Un establecimiento contiene una o más canchas deportivas. Cada cancha pertenece exclusivamente a un establecimiento y se elimina en cascada si el establecimiento es borrado. 

Tipos_Deporte → Canchas (1:N): Un tipo de deporte clasifica a múltiples canchas. La plantilla spec_schema del tipo de deporte define qué campos pueden almacenarse en el campo JSONB specs de cada cancha. 

Canchas → Cancha_Imagenes (1:N): Una cancha puede tener múltiples imágenes en su galería. Las imágenes se eliminan en cascada si la cancha es borrada. El campo es_principal identifica la imagen destacada. 

Usuarios → Reservas (1:N): Un usuario puede realizar múltiples reservas a lo largo del tiempo. Cada reserva está ligada a un único usuario solicitante. 

Canchas → Reservas (1:N): Una cancha puede recibir múltiples reservas en diferentes fechas y horarios. Cada reserva referencia a una única cancha. 

Reservas → Log_Pagos (1:N): Una reserva puede generar múltiples registros de pago (abono inicial, pago del saldo restante, reembolso). Esto permite rastrear el historial financiero completo de cada reserva. 

Reservas → No_Shows (1:1): Una reserva puede originar a lo sumo un registro de no-show. La restricción UNIQUE en id_reserva garantiza esta relación unívoca. 

Usuarios → No_Shows (1:N): Un usuario puede acumular múltiples registros de no-show a lo largo del tiempo. El historial permite al administrador aplicar restricciones a clientes reincidentes. 

Establecimientos → No_Shows (1:N): Un establecimiento puede registrar múltiples no-shows. Permite a cada negocio llevar su propio historial de inasistencias por cliente. 

Usuarios → Creditos_Favor (1:N): Un usuario puede acumular créditos a favor en diferentes establecimientos. Cada registro de crédito pertenece a un único usuario y a un único establecimiento. 

Establecimientos → Creditos_Favor (1:N): Un establecimiento puede emitir múltiples créditos a diferentes clientes. Los créditos solo son válidos en el establecimiento que los emitió. 

Reservas → Creditos_Favor (1:N, nullable): Una reserva cancelada por contingencia puede originar uno o más créditos a favor. El campo id_reserva_origen es nullable para permitir créditos registrados manualmente sin reserva asociada. 

Usuarios → Reseñas (1:N): Un usuario puede escribir múltiples reseñas, una por cada reserva completada. La restricción UNIQUE en (id_usuario, id_reserva) evita reseñas duplicadas. 

Canchas → Reseñas (1:N): Una cancha puede recibir múltiples reseñas de distintos usuarios. Las reseñas alimentan la calificación promedio visible en el mapa y el detalle de la cancha. 

Reservas → Reseñas (1:N, nullable): Una reserva completada puede ser reseñada. El vínculo garantiza que solo usuarios con experiencia real en la cancha puedan publicar una reseña. 

Diseño para la base de datos NoSQL  
Para el desarrollo del sistema SportSpot, se ha optado por un enfoque de persistencia híbrido. Mientras que la integridad transaccional y los registros históricos permanentes se gestionan a través del motor relacional PostgreSQL, las necesidades de alta velocidad, concurrencia masiva y sincronización en tiempo real se resuelven mediante el uso de la base de datos NoSQL Redis, la cual opera bajo un modelo de estructura de datos en memoria (Llave-Valor). 

Identificacion de colecciones 

Al tratarse de un modelo basado en Redis, la organización de los datos no se define mediante colecciones documentales tradicionales (como en MongoDB), sino a través de estructuras indexadas por llaves jerárquicas con tiempos de expiración automáticos (TTL) para optimizar el rendimiento de la API: 

Estructura de Bloqueo Temporal (lock:cancha): Diseñada para congelar un horario específico mientras el usuario procesa su pago. 

Estructura de Disponibilidad Caché (availability:cancha): Diseñada para almacenar de forma indexada los bloques de horas ocupados de un día específico, acelerando las búsquedas cartográficas y las consultas de los deportistas. 

Estructura de Documentos 

Esquemas lógicos en formato JSON que toma el valor de cada estructura dentro del servidor de caché: 

Documento de Bloqueo Temporal: 

Llave en el sistema: lock:cancha:{id_cancha}:fecha:{fecha}:hora:{hora_inicio} 

Estructura del Valor (JSON): 

1. JSON 

2. { 

3.   "id_usuario": "usr_9902399", 

5.   "estado": "en_proceso_pago", 

6.   "tiempo_limite_segundos": 600 

7. } 

8.   

 

 

Documento de Disponibilidad Diaria 

Llave en el sistema: availability:cancha:{id_cancha}:date:{fecha} 

Estructura del Valor (Set / Arreglo indexado): 

JSON 

 1. { 

 2.   "id_cancha": "cancha_01", 

 3.   "fecha_consulta": "2026-06-15", 

 4.   "bloques_ocupados": [ 

 5.     "08:00-09:00", 

 6.     "09:00-10:00", 

 7.     "17:00-18:00", 

 8.     "18:00-19:00" 

 9.   ] 

10. } 

11.   

Justificación del Modelo de Datos 

La integración de este componente NoSQL dentro de la arquitectura de SportSpot se justifica técnicamente por tres razones críticas de rendimiento y experiencia de usuario: 

Prevención Definitiva de Colisiones: La problemática detectada en las entrevistas reflejó desorganización en los cruces de horarios al usar WhatsApp. Al utilizar los bloqueos temporales de Redis con un TTL (Time-To-Live) estricto de 10 minutos, el backend NestJS puede asegurar un horario a un deportista mientras este abre la aplicación de Yappy para realizar su abono. Si el pago no se completa en el tiempo límite, la llave expira y el horario se libera automáticamente sin afectar ni realizar escrituras lentas en PostgreSQL. 

Mitigación de Carga en Consultas: El requisito funcional RF-05 exige que la aplicación móvil renderice un mapa interactivo con múltiples establecimientos y verifique la disponibilidad de turnos en milisegundos. Consultar directamente la base de datos relacional con múltiples uniones (JOINs) de tablas bajo alta demanda degradaría el rendimiento del servidor. Redis almacena estos bloques en memoria RAM, respondiendo a la capa de presentación de forma casi instantánea. 

Soporte Eficiente para WebSockets: La persistencia NoSQL de llave-valor se acopla de forma nativa con los eventos de WebSockets configurados en el backend. Cada vez que una llave cambia de estado o expira en memoria, el sistema propaga la actualización de disponibilidad a todos los clientes conectados en tiempo real, garantizando una interfaz reactiva y confiable. 



Diccionario de datos 

 

Tabla roles 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_rol 

SERIAL 

PK, NOT NULL 

Identificador numérico secuencial del rol. 

nombre_rol 

VARCHAR(30) 

NOT NULL, UNIQUE 

Nombre del rol: Cliente, Dueño, Gerente, Contador, Marketing, Admin. 

descripcion 

VARCHAR(100) 

 

Descripción opcional del rol y sus permisos. 

 

 

Tabla usuarios 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_usuario 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único universal del usuario. 

nombre 

VARCHAR(100) 

NOT NULL 

Nombre completo del usuario. 

correo 

VARCHAR(150) 

UNIQUE 

Correo electrónico. Puede ser NULL en usuarios que solo usan OAuth. 

contrasena 

VARCHAR(255) 

nullable 

Hash cifrado de la contraseña. NULL para usuarios OAuth sin contraseña propia. 

telefono 

VARCHAR(20) 

 

Número de teléfono móvil para notificaciones. 

avatar_url 

VARCHAR(500) 

 

URL de la imagen de perfil del usuario. 

id_rol 

INTEGER 

FK → roles, NOT NULL 

Rol asignado al usuario dentro de la plataforma. 

activo 

BOOLEAN 

NOT NULL, DEFAULT TRUE 

Indica si la cuenta está habilitada. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha y hora de creación de la cuenta. 

updated_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha y hora de la última actualización. 

 

 

Tabla oauth_providers 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_oauth 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único del registro OAuth. 

id_usuario 

UUID 

FK → usuarios, NOT NULL, ON DELETE CASCADE 

Usuario propietario de este proveedor OAuth. 

provider 

VARCHAR(30) 

NOT NULL 

Nombre del proveedor: google, apple. 

provider_user_id 

VARCHAR(255) 

NOT NULL 

Identificador del usuario en el sistema del proveedor. 

access_token 

TEXT 

 

Token de acceso devuelto por el proveedor. Puede ser NULL. 

refresh_token 

TEXT 

 

Token de refresco para renovar el acceso. Puede ser NULL. 

expires_at 

TIMESTAMP 

 

Fecha de expiración del access_token. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de vinculación del proveedor. 

UNIQUE 

 

(provider, provider_user_id) 

Garantiza que un mismo ID de proveedor no se repita. 

 

 

Tabla tipos_deporte 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_tipo 

SERIAL 

PK, NOT NULL 

Identificador numérico del tipo de deporte. 

nombre 

VARCHAR(50) 

NOT NULL, UNIQUE 

Nombre del deporte: Fútbol 5, Fútbol 7, Basketball, Tenis, Voleibol, Pádel. 

icono 

VARCHAR(50) 

 

Clave o emoji del ícono representativo del deporte. 

spec_schema 

JSONB 

 

Plantilla JSON con los campos de especificaciones válidos para este deporte. 

 

Tabla amenidades 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_amenidad 

SERIAL 

PK, NOT NULL 

Identificador numérico de la amenidad. 

nombre 

VARCHAR(80) 

NOT NULL, UNIQUE 

Nombre de la amenidad: Estacionamiento, Duchas, WiFi, Cafetería, etc. 

icono 

VARCHAR(50) 

 

Clave o emoji del ícono representativo. 

categoria 

VARCHAR(50) 

 

Categoría de la amenidad: servicios, instalaciones, equipamiento. 

 

 

Tabla establecimientos 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_establecimiento 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único del complejo deportivo. 

id_dueno 

UUID 

FK → usuarios, NOT NULL 

Usuario propietario que administra el establecimiento. 

nombre 

VARCHAR(150) 

NOT NULL 

Nombre comercial del establecimiento. 

descripcion 

TEXT 

 

Descripción general del establecimiento y sus servicios. 

direccion 

TEXT 

NOT NULL 

Dirección física del establecimiento. 

ubicacion_lat 

DECIMAL(10,7) 

NOT NULL 

Latitud geográfica para visualización en el mapa interactivo. 

ubicacion_lng 

DECIMAL(10,7) 

NOT NULL 

Longitud geográfica para visualización en el mapa interactivo. 

telefono 

VARCHAR(20) 

 

Número de contacto del establecimiento. 

correo 

VARCHAR(150) 

 

Correo electrónico de contacto del establecimiento. 

estado 

VARCHAR(20) 

NOT NULL, DEFAULT pendiente 

Estado operativo: activo, inactivo, pendiente. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de registro del establecimiento. 

updated_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de la última actualización. 

 

 

Tabla establecimiento_amenidades 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_establecimiento 

UUID 

PK, FK → establecimientos, ON DELETE CASCADE 

Referencia al establecimiento que posee la amenidad. 

id_amenidad 

INTEGER 

PK, FK → amenidades 

Referencia a la amenidad del catálogo. 

notas 

VARCHAR(200) 

 

Nota descriptiva sobre la amenidad en ese establecimiento (ej. 5 canchas iluminadas). 

 

Tabla horarios_operacion 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_horario 

SERIAL 

PK, NOT NULL 

Identificador del registro de horario. 

id_establecimiento 

UUID 

FK → establecimientos, NOT NULL, ON DELETE CASCADE 

Establecimiento al que pertenece este horario. 

dia_semana 

SMALLINT 

NOT NULL, CHECK 0-6 

Día de la semana: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado. 

hora_apertura 

TIME 

NOT NULL 

Hora de apertura del establecimiento ese día. 

hora_cierre 

TIME 

NOT NULL 

Hora de cierre del establecimiento ese día. 

UNIQUE 

 

(id_establecimiento, dia_semana) 

Un establecimiento no puede tener más de un horario por día. 

 

 

Tabla canchas 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_cancha 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único de la cancha. 

id_establecimiento 

UUID 

FK → establecimientos, NOT NULL, ON DELETE CASCADE 

Establecimiento al que pertenece la cancha. 

id_tipo_deporte 

INTEGER 

FK → tipos_deporte, NOT NULL 

Tipo de deporte para el que está habilitada la cancha. 

nombre 

VARCHAR(100) 

NOT NULL 

Nombre o número de la cancha (ej. Cancha 1, Cancha Principal). 

descripcion 

TEXT 

 

Descripción adicional de la cancha. 

precio_hora 

DECIMAL(8,2) 

NOT NULL, CHECK > 0 

Tarifa base por hora de alquiler. 

capacidad_jugadores 

INTEGER 

CHECK > 0 

Número máximo de jugadores permitidos. Puede ser NULL. 

estado 

VARCHAR(20) 

NOT NULL, DEFAULT activa 

Estado de la cancha: activa, mantenimiento, inactiva. 

specs 

JSONB 

 

Especificaciones deportivas según la plantilla de tipos_deporte.spec_schema. Varía por deporte. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de registro de la cancha. 

 

 

Tabla cancha_imagenes 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_imagen 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único de la imagen. 

id_cancha 

UUID 

FK → canchas, NOT NULL, ON DELETE CASCADE 

Cancha a la que pertenece la imagen. 

url 

VARCHAR(500) 

NOT NULL 

URL de acceso a la imagen almacenada. 

es_principal 

BOOLEAN 

NOT NULL, DEFAULT FALSE 

Indica si esta es la imagen principal de la cancha. 

orden 

INTEGER 

NOT NULL, DEFAULT 0 

Orden de aparición de la imagen en la galería. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de carga de la imagen. 

 

 

Tabla reservas 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_reserva 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único de la reserva. 

id_usuario 

UUID 

FK → usuarios, NOT NULL 

Usuario que realizó la reserva. 

id_cancha 

UUID 

FK → canchas, NOT NULL 

Cancha reservada. 

fecha_reserva 

DATE 

NOT NULL 

Fecha agendada para el uso de la cancha. 

hora_inicio 

TIME 

NOT NULL 

Hora de inicio del bloque reservado. 

hora_fin 

TIME 

NOT NULL, CHECK > hora_inicio 

Hora de finalización del bloque reservado. 

precio_total 

DECIMAL(8,2) 

NOT NULL, CHECK > 0 

Monto total de la reserva. 

monto_abono 

DECIMAL(8,2) 

NOT NULL, DEFAULT 0, CHECK >= 0 

Monto abonado para retener la reserva. 

estado 

VARCHAR(30) 

NOT NULL, DEFAULT pendiente_pago 

Estado de la reserva: pendiente_pago, confirmada, cancelada, completada, no_show. 

cancelada_por 

VARCHAR(20) 

nullable 

Quién realizó la cancelación: usuario, establecimiento, sistema. 

motivo_cancelacion 

TEXT 

nullable 

Motivo registrado para la cancelación o contingencia. 

cancelado_en 

TIMESTAMP 

nullable 

Fecha y hora exacta en que se canceló la reserva. 

veces_reagendada 

SMALLINT 

NOT NULL, DEFAULT 0, CHECK >= 0 

Contador de cuántas veces fue reagendada esta reserva. 

reagendada_en 

TIMESTAMP 

nullable 

Fecha y hora del último reagendamiento. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de creación de la reserva. 

updated_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de la última modificación. 

 

 

Tabla log_pagos 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_pago 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único de la transacción. 

id_reserva 

UUID 

FK → reservas, NOT NULL 

Reserva a la que pertenece este pago. 

monto 

DECIMAL(8,2) 

NOT NULL, CHECK > 0 

Monto de la transacción. 

tipo 

VARCHAR(20) 

NOT NULL 

Tipo de pago: abono, pago_completo, reembolso. 

metodo_pago 

VARCHAR(30) 

NOT NULL 

Pasarela utilizada: yappy, tarjeta_credito, tarjeta_debito. 

referencia_externa 

VARCHAR(100) 

nullable 

Código de referencia devuelto por la pasarela de pago. 

estado 

VARCHAR(20) 

NOT NULL 

Estado de la transacción: pendiente, aprobado, fallido, reembolsado. 

metadata 

JSONB 

nullable 

Respuesta completa del gateway de pago para trazabilidad. 

fecha_pago 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha y hora en que se procesó la transacción. 

 

 

Tabla no_shows 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_no_show 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único del registro de no-show. 

id_reserva 

UUID 

FK → reservas, NOT NULL, UNIQUE 

Reserva que originó el no-show. Relación 1:1. 

id_usuario 

UUID 

FK → usuarios, NOT NULL 

Usuario que incurrió en el no-show. 

id_establecimiento 

UUID 

FK → establecimientos, NOT NULL 

Establecimiento afectado por el no-show. 

fecha 

DATE 

NOT NULL 

Fecha en que ocurrió el no-show. 

penalidad_aplicada 

BOOLEAN 

NOT NULL, DEFAULT FALSE 

Indica si se aplicó alguna penalidad al cliente. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de registro del no-show en el sistema. 

 

 

Tabla creditos_favor 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_credito 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único del crédito. 

id_usuario 

UUID 

FK → usuarios, NOT NULL 

Cliente beneficiario del crédito. 

id_establecimiento 

UUID 

FK → establecimientos, NOT NULL 

Establecimiento donde es válido el crédito. 

horas_disponibles 

DECIMAL(4,2) 

NOT NULL, CHECK >= 0 

Horas acreditadas a favor del cliente en este establecimiento. 

motivo 

TEXT 

nullable 

Descripción de la razón del crédito: cancelación, contingencia u otro. 

id_reserva_origen 

UUID 

FK → reservas, nullable 

Reserva que originó el crédito. NULL si fue registrado manualmente. 

expira_en 

DATE 

nullable 

Fecha de vencimiento del crédito. NULL si no expira. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de creación del crédito. 

updated_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de la última actualización del saldo. 

 

 

Tabla resenas 

Campo 

Tipo de Datos 

Restricciones 

Descripción 

id_resena 

UUID 

PK, NOT NULL, DEFAULT gen_random_uuid() 

Identificador único de la reseña. 

id_usuario 

UUID 

FK → usuarios, NOT NULL 

Usuario autor de la reseña. 

id_cancha 

UUID 

FK → canchas, NOT NULL 

Cancha que recibe la reseña. 

id_reserva 

UUID 

FK → reservas, nullable 

Reserva completada que vincula la reseña. Garantiza que solo reservas completadas puedan ser reseñadas. 

calificacion 

SMALLINT 

NOT NULL, CHECK 1-5 

Calificación de 1 a 5 estrellas. 

comentario 

TEXT 

nullable 

Texto descriptivo de la experiencia del usuario. 

created_at 

TIMESTAMP 

NOT NULL, DEFAULT NOW() 

Fecha de publicación de la reseña. 

UNIQUE 

 

(id_usuario, id_reserva) 

Un usuario no puede reseñar la misma reserva más de una vez. 

