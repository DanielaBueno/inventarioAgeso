/**
 * CONFIGURACIÓN GLOBAL DEL SISTEMA
 * Centraliza todas las configuraciones y constantes del sistema de inventario
 */

// ========================================
// CONFIGURACIÓN PRINCIPAL
// ========================================

/**
 * Configuración principal del sistema
 * Modifique estos valores según sus necesidades
 */
const CONFIGURACION_SISTEMA = {
  // Información de la organización
  NOMBRE_ORGANIZACION: 'AGE - Asociación de Gastroenterología',
  DOMINIO_PERMITIDO: '@tuips.com',
  
  // Configuración de hojas de cálculo
  HOJAS: {
    INVENTARIO: 'Inventario',
    TRASLADOS: 'Traslados',
    LOG_EVENTOS: 'Log_Eventos',
    LOG_ERRORES: 'Log_Errores',
    CONFIGURACIONES: 'Configuraciones',
    USUARIOS: 'Usuarios'
  },
  
  // Configuración de archivos y carpetas
  CARPETAS: {
    FOTOS: 'Inventario_Fotos',
    REPORTES: 'Inventario_Reportes',
    RESPALDOS: 'Inventario_Respaldos'
  },
  
  // Límites del sistema
  LIMITES: {
    MAX_FOTOS_POR_OBJETO: 3,
    MAX_TAMAÑO_ARCHIVO: 5 * 1024 * 1024, // 5MB
    MAX_OBJETOS_POR_PAGINA: 50,
    MAX_RESULTADOS_BUSQUEDA: 100,
    DIAS_ALERTA_CALIBRACION: 30
  },
  
  // Configuración de notificaciones
  NOTIFICACIONES: {
    ADMIN_EMAIL: 'admin@tuips.com',
    HORA_REVISION_DIARIA: 8, // 8 AM
    ENVIAR_ALERTAS_CALIBRACION: true,
    ENVIAR_CONFIRMACIONES_TRASLADO: true,
    FRECUENCIA_RESPALDO: 'SEMANAL' // DIARIA, SEMANAL, MENSUAL
  },
  
  // Estados permitidos para objetos
  ESTADOS_OBJETO: [
    'Disponible',
    'En uso',
    'En reparación',
    'Dado de baja'
  ],
  
  // Estados de calibración
  ESTADOS_CALIBRACION: [
    'No aplica',
    'Calibrado',
    'Vencido',
    'Pendiente'
  ],
  
  // Ubicaciones predefinidas
  UBICACIONES_PREDEFINIDAS: [
    'Bodega',
    'Consultorio 1',
    'Consultorio 2', 
    'Consultorio 3',
    'Laboratorio',
    'Recepción',
    'Sala de Espera',
    'Área Administrativa'
  ],
  
  // Tipos de equipos y nomenclatura
  TIPOS_EQUIPO: [
    {
      codigo: 'EM-AGE',
      nombre: 'Equipos Médicos',
      descripcion: 'Equipos para diagnóstico y tratamiento médico',
      cantidadStickers: 500,
      requiereSerial: true,
      requiereCalibracion: true
    },
    {
      codigo: 'EO-AGE',
      nombre: 'Equipos de Oficina',
      descripcion: 'Equipos informáticos y de oficina',
      cantidadStickers: 500,
      requiereSerial: true,
      requiereCalibracion: false
    },
    {
      codigo: 'A-AGE',
      nombre: 'Accesorios',
      descripcion: 'Accesorios y complementos',
      cantidadStickers: 500,
      requiereSerial: false,
      requiereCalibracion: false
    },
    {
      codigo: 'EQUI-AGE',
      nombre: 'Equipos de Emergencia',
      descripcion: 'Equipos para situaciones de emergencia',
      cantidadStickers: 200,
      requiereSerial: true,
      requiereCalibracion: true
    },
    {
      codigo: 'CAF-AGE',
      nombre: 'Cafetería',
      descripcion: 'Equipos y utensilios de cafetería',
      cantidadStickers: 100,
      requiereSerial: false,
      requiereCalibracion: false
    },
    {
      codigo: 'HERR-AGE',
      nombre: 'Herramientas',
      descripcion: 'Herramientas de mantenimiento y reparación',
      cantidadStickers: 200,
      requiereSerial: false,
      requiereCalibracion: false
    },
    {
      codigo: 'ARCH-AGE',
      nombre: 'Archivo',
      descripcion: 'Equipos y mobiliario de archivo',
      cantidadStickers: 100,
      requiereSerial: false,
      requiereCalibracion: false
    }
  ],
  
  // Configuración de roles y permisos
  ROLES_USUARIO: {
    ADMINISTRADOR: {
      nombre: 'Administrador',
      permisos: ['crear', 'leer', 'actualizar', 'eliminar', 'configurar', 'reportes'],
      descripcion: 'Acceso completo al sistema'
    },
    COORDINADOR: {
      nombre: 'Coordinador',
      permisos: ['crear', 'leer', 'actualizar', 'reportes'],
      descripcion: 'Gestión de inventario y reportes'
    },
    USUARIO: {
      nombre: 'Usuario',
      permisos: ['crear', 'leer', 'actualizar'],
      descripcion: 'Uso básico del sistema'
    },
    CONSULTA: {
      nombre: 'Solo Consulta',
      permisos: ['leer'],
      descripcion: 'Solo visualización de datos'
    }
  },
  
  // Configuración de interfaz
  INTERFAZ: {
    TEMA_PRINCIPAL: 'azul-gradiente',
    MOSTRAR_AYUDA_CONTEXTUAL: true,
    ANIMACIONES_HABILITADAS: true,
    MODO_COMPACTO: false,
    IDIOMA: 'es-CO'
  },
  
  // Configuración de exportación
  EXPORTACION: {
    FORMATOS_PERMITIDOS: ['xlsx', 'pdf', 'csv'],
    INCLUIR_FOTOS_PDF: true,
    MARCA_AGUA: true,
    TEXTO_MARCA_AGUA: 'AGE - Sistema de Inventario'
  }
};

// ========================================
// FUNCIONES DE INICIALIZACIÓN
// ========================================

/**
 * Inicializa la configuración del sistema
 * Ejecutar una sola vez al instalar el sistema
 */
function inicializarConfiguracionCompleta() {
  try {
    Logger.log('Iniciando configuración completa del sistema...');
    
    // Crear estructura de hojas
    crearEstructuraCompletaHojas();
    
    // Crear carpetas de Drive
    crearEstructuraCarpetas();
    
    // Configurar propiedades del sistema
    configurarPropiedadesSistema();
    
    // Configurar triggers automáticos
    configurarTriggersAutomaticos();
    
    // Crear usuarios iniciales
    crearUsuariosIniciales();
    
    Logger.log('Configuración completa finalizada exitosamente');
    
    return {
      exito: true,
      mensaje: 'Sistema configurado correctamente'
    };
    
  } catch (error) {
    Logger.log('Error en inicialización: ' + error.message);
    return manejarError(error, 'Inicialización Sistema', true);
  }
}

/**
 * Crea toda la estructura de hojas necesarias
 */
function crearEstructuraCompletaHojas() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  
  // Crear hoja de inventario
  crearHojaInventario();
  
  // Crear hoja de traslados
  crearHojaTraslados();
  
  // Crear hoja de log de eventos
  crearHojaLogEventos();
  
  // Crear hoja de log de errores  
  crearHojaLogErrores();
  
  // Crear hoja de configuraciones
  crearHojaConfiguraciones();
  
  // Crear hoja de usuarios
  crearHojaUsuarios();
  
  Logger.log('Estructura de hojas creada correctamente');
}

/**
 * Crea hoja de log de eventos
 */
function crearHojaLogEventos() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION_SISTEMA.HOJAS.LOG_EVENTOS);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION_SISTEMA.HOJAS.LOG_EVENTOS);
    
    const encabezados = [
      'Timestamp',
      'Tipo Evento',
      'Objeto ID',
      'Código Objeto',
      'Acción',
      'Usuario',
      'Detalles'
    ];
    
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    hoja.getRange(1, 1, 1, encabezados.length).setBackground('#34495e');
    hoja.getRange(1, 1, 1, encabezados.length).setFontColor('#ffffff');
    
    // Formatear columnas
    hoja.setColumnWidth(1, 150); // Timestamp
    hoja.setColumnWidth(2, 120); // Tipo Evento
    hoja.setColumnWidth(3, 150); // Objeto ID
    hoja.setColumnWidth(4, 150); // Código Objeto
    hoja.setColumnWidth(5, 120); // Acción
    hoja.setColumnWidth(6, 200); // Usuario
    hoja.setColumnWidth(7, 300); // Detalles
    
    // Proteger encabezados
    const rangoProtegido = hoja.getRange(1, 1, 1, encabezados.length);
    const proteccion = rangoProtegido.protect();
    proteccion.setDescription('Encabezados del log de eventos');
  }
  
  return hoja;
}

/**
 * Crea hoja de log de errores
 */
function crearHojaLogErrores() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION_SISTEMA.HOJAS.LOG_ERRORES);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION_SISTEMA.HOJAS.LOG_ERRORES);
    
    const encabezados = [
      'Timestamp',
      'Contexto',
      'Mensaje Error',
      'Usuario',
      'Stack Trace'
    ];
    
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    hoja.getRange(1, 1, 1, encabezados.length).setBackground('#e74c3c');
    hoja.getRange(1, 1, 1, encabezados.length).setFontColor('#ffffff');
    
    // Formatear columnas
    hoja.setColumnWidth(1, 150);
    hoja.setColumnWidth(2, 150);
    hoja.setColumnWidth(3, 300);
    hoja.setColumnWidth(4, 200);
    hoja.setColumnWidth(5, 400);
  }
  
  return hoja;
}

/**
 * Crea hoja de configuraciones del sistema
 */
function crearHojaConfiguraciones() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION_SISTEMA.HOJAS.CONFIGURACIONES);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION_SISTEMA.HOJAS.CONFIGURACIONES);
    
    const encabezados = ['Clave', 'Valor', 'Descripción', 'Fecha Modificación'];
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    hoja.getRange(1, 1, 1, encabezados.length).setBackground('#3498db');
    hoja.getRange(1, 1, 1, encabezados.length).setFontColor('#ffffff');
    
    // Agregar configuraciones iniciales
    const configuracionesIniciales = [
      ['SISTEMA_ACTIVO', 'true', 'Sistema activo y funcionando', new Date()],
      ['VERSION_SISTEMA', '1.0.0', 'Versión actual del sistema', new Date()],
      ['ULTIMO_RESPALDO', '', 'Fecha del último respaldo', ''],
      ['CONTADOR_OBJETOS', '0', 'Contador global de objetos', new Date()],
      ['MODO_MANTENIMIENTO', 'false', 'Sistema en modo mantenimiento', new Date()]
    ];
    
    hoja.getRange(2, 1, configuracionesIniciales.length, 4)
         .setValues(configuracionesIniciales);
  }
  
  return hoja;
}

/**
 * Crea hoja de usuarios del sistema
 */
function crearHojaUsuarios() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION_SISTEMA.HOJAS.USUARIOS);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION_SISTEMA.HOJAS.USUARIOS);
    
    const encabezados = [
      'Email',
      'Nombre',
      'Rol',
      'Estado',
      'Fecha Registro',
      'Último Acceso',
      'Permisos Adicionales'
    ];
    
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
    hoja.getRange(1, 1, 1, encabezados.length).setBackground('#27ae60');
    hoja.getRange(1, 1, 1, encabezados.length).setFontColor('#ffffff');
    
    // Formatear columnas
    hoja.setColumnWidth(1, 200); // Email
    hoja.setColumnWidth(2, 150); // Nombre
    hoja.setColumnWidth(3, 120); // Rol
    hoja.setColumnWidth(4, 100); // Estado
    hoja.setColumnWidth(5, 120); // Fecha Registro
    hoja.setColumnWidth(6, 120); // Último Acceso
    hoja.setColumnWidth(7, 200); // Permisos Adicionales
  }
  
  return hoja;
}

/**
 * Crea estructura de carpetas en Google Drive
 */
function crearEstructuraCarpetas() {
  const carpetaRaiz = crearCarpetaSiNoExiste('Sistema_Inventario_AGE');
  
  // Crear subcarpetas
  Object.values(CONFIGURACION_SISTEMA.CARPETAS).forEach(nombreCarpeta => {
    crearCarpetaSiNoExiste(nombreCarpeta, carpetaRaiz);
  });
  
  Logger.log('Estructura de carpetas creada correctamente');
}

/**
 * Crea una carpeta si no existe
 */
function crearCarpetaSiNoExiste(nombreCarpeta, carpetaPadre = null) {
  let carpetas;
  
  if (carpetaPadre) {
    carpetas = carpetaPadre.getFoldersByName(nombreCarpeta);
  } else {
    carpetas = DriveApp.getFoldersByName(nombreCarpeta);
  }
  
  if (carpetas.hasNext()) {
    return carpetas.next();
  } else {
    return carpetaPadre ? 
      carpetaPadre.createFolder(nombreCarpeta) : 
      DriveApp.createFolder(nombreCarpeta);
  }
}

/**
 * Configura las propiedades del sistema
 */
function configurarPropiedadesSistema() {
  const propiedades = PropertiesService.getScriptProperties();
  
  const configuracionesPorDefecto = {
    'SISTEMA_INSTALADO': 'true',
    'FECHA_INSTALACION': new Date().toISOString(),
    'VERSION': '1.0.0',
    'ADMIN_EMAIL': CONFIGURACION_SISTEMA.NOTIFICACIONES.ADMIN_EMAIL,
    'DOMINIO_PERMITIDO': CONFIGURACION_SISTEMA.DOMINIO_PERMITIDO,
    'ALERTAS_ACTIVAS': 'true',
    'DEBUG_MODE': 'false'
  };
  
  propiedades.setProperties(configuracionesPorDefecto);
  Logger.log('Propiedades del sistema configuradas');
}

/**
 * Configura triggers automáticos del sistema
 */
function configurarTriggersAutomaticos() {
  // Eliminar triggers existentes para evitar duplicados
  const triggersExistentes = ScriptApp.getProjectTriggers();
  triggersExistentes.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Trigger diario para verificar calibraciones
  ScriptApp.newTrigger('verificarCalibracionesDiaria')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIGURACION_SISTEMA.NOTIFICACIONES.HORA_REVISION_DIARIA)
    .create();
  
  // Trigger semanal para respaldo automático
  ScriptApp.newTrigger('realizarRespaldoAutomatico')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2) // 2 AM los domingos
    .create();
  
  Logger.log('Triggers automáticos configurados');
}

/**
 * Crea usuarios iniciales del sistema
 */
function crearUsuariosIniciales() {
  const usuarioActual = Session.getActiveUser().getEmail();
  
  const usuariosIniciales = [
    {
      email: usuarioActual,
      nombre: 'Administrador Principal',
      rol: 'ADMINISTRADOR',
      estado: 'Activo',
      fechaRegistro: new Date(),
      ultimoAcceso: new Date(),
      permisosAdicionales: 'Instalación del sistema'
    }
  ];
  
  const hoja = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(CONFIGURACION_SISTEMA.HOJAS.USUARIOS);
  
  if (hoja) {
    usuariosIniciales.forEach(usuario => {
      hoja.appendRow([
        usuario.email,
        usuario.nombre,
        usuario.rol,
        usuario.estado,
        usuario.fechaRegistro,
        usuario.ultimoAcceso,
        usuario.permisosAdicionales
      ]);
    });
  }
  
  Logger.log('Usuarios iniciales creados');
}

// ========================================
// FUNCIONES DE VERIFICACIÓN AUTOMÁTICA
// ========================================

/**
 * Verifica calibraciones diariamente (llamada por trigger)
 */
function verificarCalibracionesDiaria() {
  try {
    if (!obtenerConfiguracion('ALERTAS_ACTIVAS', 'true')) {
      return; // Alertas desactivadas
    }
    
    const objetos = obtenerTodosLosObjetos();
    const objetosProblematicos = objetos.filter(obj => {
      return obj.requiereCalibracion && 
        (obj.estadoCalibracion === 'Vencido' || 
         estaProximoAVencer(obj.fechaProximaCalibracion));
    });
    
    if (objetosProblematicos.length > 0) {
      const mensaje = generarMensajeCalibracion(objetosProblematicos);
      const adminEmail = obtenerConfiguracion('ADMIN_EMAIL');
      
      enviarNotificacionCorreo(
        adminEmail,
        '🔧 Alerta Diaria: Calibraciones Pendientes',
        mensaje,
        true
      );
      
      registrarEvento('SISTEMA', null, 'ALERTA_CALIBRACION_ENVIADA', 'SISTEMA', {
        objetosAfectados: objetosProblematicos.length
      });
    }
    
  } catch (error) {
    manejarError(error, 'Verificación Calibraciones Diaria', true);
  }
}

/**
 * Realiza respaldo automático (llamada por trigger)
 */
function realizarRespaldoAutomatico() {
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const carpetaRespaldos = DriveApp.getFoldersByName(
      CONFIGURACION_SISTEMA.CARPETAS.RESPALDOS
    ).next();
    
    const fechaActual = formatearFecha(new Date(), 'corto').replace(/\//g, '-');
    const nombreRespaldo = `Respaldo_Inventario_${fechaActual}`;
    
    // Crear copia del archivo
    const respaldo = libro.copy(nombreRespaldo);
    carpetaRespaldos.addFile(respaldo);
    DriveApp.getRootFolder().removeFile(respaldo);
    
    // Actualizar fecha de último respaldo
    establecerConfiguracion('ULTIMO_RESPALDO', new Date().toISOString());
    
    registrarEvento('SISTEMA', null, 'RESPALDO_AUTOMATICO', 'SISTEMA', {
      archivoRespaldo: respaldo.getId()
    });
    
    Logger.log('Respaldo automático completado: ' + nombreRespaldo);
    
  } catch (error) {
    manejarError(error, 'Respaldo Automático', true);
  }
}

// ========================================
// FUNCIONES DE GESTIÓN DE CONFIGURACIÓN
// ========================================

/**
 * Obtiene toda la configuración del sistema
 */
function obtenerConfiguracionCompleta() {
  return {
    sistema: CONFIGURACION_SISTEMA,
    propiedades: obtenerConfiguraciones(),
    version: obtenerConfiguracion('VERSION', '1.0.0'),
    fechaInstalacion: obtenerConfiguracion('FECHA_INSTALACION'),
    estadoSistema: obtenerEstadoSistema()
  };
}

/**
 * Obtiene el estado actual del sistema
 */
function obtenerEstadoSistema() {
  try {
    const objetos = obtenerTodosLosObjetos();
    const traslados = obtenerUltimosTraslados(10);
    
    return {
      totalObjetos: objetos.length,
      objetosActivos: objetos.filter(obj => obj.estado !== 'Dado de baja').length,
      calibracionesVencidas: objetos.filter(obj => obj.estadoCalibracion === 'Vencido').length,
      ultimosTraslados: traslados.length,
      sistemaActivo: obtenerConfiguracion('SISTEMA_ACTIVO', 'true') === 'true',
      ultimoRespaldo: obtenerConfiguracion('ULTIMO_RESPALDO', 'Nunca'),
      timestamp: new Date()
    };
    
  } catch (error) {
    return manejarError(error, 'Estado del Sistema');
  }
}

/**
 * Actualiza configuración del sistema
 */
function actualizarConfiguracionSistema(nuevaConfiguracion) {
  try {
    Object.keys(nuevaConfiguracion).forEach(clave => {
      establecerConfiguracion(clave, nuevaConfiguracion[clave]);
    });
    
    registrarEvento('SISTEMA', null, 'CONFIGURACION_ACTUALIZADA', 
      Session.getActiveUser().getEmail(), nuevaConfiguracion);
    
    return { exito: true, mensaje: 'Configuración actualizada correctamente' };
    
  } catch (error) {
    return manejarError(error, 'Actualización Configuración');
  }
}

// ========================================
// FUNCIONES DE MANTENIMIENTO
// ========================================

/**
 * Limpia logs antiguos para mantener rendimiento
 */
function limpiarLogsAntiguos(diasAntiguedad = 90) {
  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
    
    // Limpiar log de eventos
    limpiarHojaLogAntiguo(CONFIGURACION_SISTEMA.HOJAS.LOG_EVENTOS, fechaLimite);
    
    // Limpiar log de errores (mantener más tiempo)
    limpiarHojaLogAntiguo(CONFIGURACION_SISTEMA.HOJAS.LOG_ERRORES, 
      new Date(fechaLimite.getTime() - (30 * 24 * 60 * 60 * 1000)));
    
    registrarEvento('SISTEMA', null, 'LIMPIEZA_LOGS', 'SISTEMA', {
      diasAntiguedad: diasAntiguedad,
      fechaLimite: fechaLimite
    });
    
    return { exito: true, mensaje: 'Logs antiguos limpiados correctamente' };
    
  } catch (error) {
    return manejarError(error, 'Limpieza de Logs');
  }
}

/**
 * Limpia una hoja de log específica
 */
function limpiarHojaLogAntiguo(nombreHoja, fechaLimite) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  if (!hoja) return;
  
  const datos = hoja.getDataRange().getValues();
  const filasAMantener = [];
  
  // Mantener encabezado
  filasAMantener.push(datos[0]);
  
  // Filtrar filas por fecha
  for (let i = 1; i < datos.length; i++) {
    const fechaFila = new Date(datos[i][0]);
    if (fechaFila >= fechaLimite) {
      filasAMantener.push(datos[i]);
    }
  }
  
  // Limpiar hoja y escribir datos filtrados
  hoja.clear();
  if (filasAMantener.length > 0) {
    hoja.getRange(1, 1, filasAMantener.length, filasAMantener[0].length)
         .setValues(filasAMantener);
  }
}

/**
 * Verifica integridad del sistema
 */
function verificarIntegridadSistema() {
  const problemas = [];
  
  try {
    // Verificar hojas requeridas
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    Object.values(CONFIGURACION_SISTEMA.HOJAS).forEach(nombreHoja => {
      if (!libro.getSheetByName(nombreHoja)) {
        problemas.push(`Hoja faltante: ${nombreHoja}`);
      }
    });
    
    // Verificar carpetas requeridas
    Object.values(CONFIGURACION_SISTEMA.CARPETAS).forEach(nombreCarpeta => {
      const carpetas = DriveApp.getFoldersByName(nombreCarpeta);
      if (!carpetas.hasNext()) {
        problemas.push(`Carpeta faltante: ${nombreCarpeta}`);
      }
    });
    
    // Verificar configuraciones críticas
    const configuracionesCriticas = [
      'SISTEMA_ACTIVO',
      'VERSION',
      'ADMIN_EMAIL'
    ];
    
    configuracionesCriticas.forEach(config => {
      if (!obtenerConfiguracion(config)) {
        problemas.push(`Configuración faltante: ${config}`);
      }
    });
    
    return {
      exito: problemas.length === 0,
      problemas: problemas,
      mensaje: problemas.length === 0 ? 
        'Sistema íntegro' : 
        `${problemas.length} problemas encontrados`
    };
    
  } catch (error) {
    return manejarError(error, 'Verificación de Integridad');
  }
}