/**
 * SERVICIOS AUXILIARES - UTILIDADES Y FUNCIONES HELPER
 * Funciones de apoyo para el sistema de inventario
 */

// ========================================
// UTILIDADES DE FECHA Y TIEMPO
// ========================================

/**
 * Formatea una fecha para mostrar en interfaz
 */
function formatearFecha(fecha, formato = 'completo') {
  if (!fecha) return 'No especificada';
  
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
  
  const opciones = {
    'completo': { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    'corto': { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    },
    'relativo': null // Se calcula aparte
  };
  
  if (formato === 'relativo') {
    return calcularTiempoRelativo(fechaObj);
  }
  
  return fechaObj.toLocaleDateString('es-CO', opciones[formato] || opciones['completo']);
}

/**
 * Calcula el tiempo relativo (hace 2 días, hace 1 hora, etc.)
 */
function calcularTiempoRelativo(fecha) {
  const ahora = new Date();
  const diferencia = ahora - fecha;
  
  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const semanas = Math.floor(dias / 7);
  const meses = Math.floor(dias / 30);
  
  if (minutos < 1) return 'Ahora mismo';
  if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  if (dias < 7) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  if (semanas < 4) return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  if (meses < 12) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  
  const años = Math.floor(meses / 12);
  return `Hace ${años} ${años === 1 ? 'año' : 'años'}`;
}

/**
 * Verifica si una fecha está próxima a vencer
 */
function estaProximoAVencer(fechaVencimiento, diasAviso = 30) {
  if (!fechaVencimiento) return false;
  
  const fecha = fechaVencimiento instanceof Date ? fechaVencimiento : new Date(fechaVencimiento);
  const hoy = new Date();
  const fechaLimite = new Date(hoy.getTime() + (diasAviso * 24 * 60 * 60 * 1000));
  
  return fecha <= fechaLimite && fecha >= hoy;
}

/**
 * Calcula días entre dos fechas
 */
function calcularDiasEntreFechas(fechaInicio, fechaFin) {
  const inicio = fechaInicio instanceof Date ? fechaInicio : new Date(fechaInicio);
  const fin = fechaFin instanceof Date ? fechaFin : new Date(fechaFin);
  
  const diferencia = fin - inicio;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

// ========================================
// VALIDACIONES Y SANITIZACIÓN
// ========================================

/**
 * Valida formato de correo electrónico
 */
function validarCorreoElectronico(correo) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(correo);
}

/**
 * Valida y sanitiza texto de entrada
 */
function sanitizarTexto(texto, maxLongitud = 500) {
  if (!texto || typeof texto !== 'string') return '';
  
  return texto
    .trim()
    .substring(0, maxLongitud)
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .replace(/[<>&"']/g, function(match) { // Escapar caracteres especiales
      const escape = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escape[match];
    });
}

/**
 * Valida código de inventario
 */
function validarCodigoInventario(codigo) {
  if (!codigo || typeof codigo !== 'string') {
    return { valido: false, mensaje: 'Código es requerido' };
  }
  
  const codigoLimpio = codigo.trim().toUpperCase();
  const patron = /^[A-Z]+-AGE-\d{3}-\d{4}$/;
  
  if (!patron.test(codigoLimpio)) {
    return { 
      valido: false, 
      mensaje: 'Formato incorrecto. Use: TIPO-AGE-NNN-MMAA' 
    };
  }
  
  return { valido: true, codigoLimpio: codigoLimpio };
}

/**
 * Valida número serial
 */
function validarNumeroSerial(serial) {
  if (!serial) return { valido: true }; // Es opcional
  
  const serialLimpio = sanitizarTexto(serial, 50);
  
  if (serialLimpio.length < 3) {
    return { 
      valido: false, 
      mensaje: 'Número serial debe tener al menos 3 caracteres' 
    };
  }
  
  return { valido: true, serialLimpio: serialLimpio };
}

// ========================================
// MANEJO DE ARCHIVOS Y FOTOS
// ========================================

/**
 * Valida archivo de imagen
 */
function validarArchivoImagen(archivo) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
  const tamañoMaximo = 5 * 1024 * 1024; // 5MB
  
  if (!tiposPermitidos.includes(archivo.getContentType())) {
    return { 
      valido: false, 
      mensaje: 'Tipo de archivo no permitido. Use JPG, PNG o GIF' 
    };
  }
  
  if (archivo.getSize() > tamañoMaximo) {
    return { 
      valido: false, 
      mensaje: 'Archivo muy grande. Máximo 5MB' 
    };
  }
  
  return { valido: true };
}

/**
 * Redimensiona imagen si es necesario
 */
function redimensionarImagen(blob, anchoMaximo = 800, altoMaximo = 600) {
  try {
    // Google Apps Script no tiene redimensionamiento nativo
    // Esta función se puede expandir con servicios externos si se necesita
    return blob;
  } catch (error) {
    Logger.log('Error al redimensionar imagen: ' + error.message);
    return blob;
  }
}

/**
 * Genera nombre único para archivo
 */
function generarNombreArchivoUnico(nombreOriginal, objetoId) {
  const timestamp = new Date().getTime();
  const extension = nombreOriginal.split('.').pop();
  const nombreBase = sanitizarTexto(nombreOriginal.replace(/\.[^/.]+$/, ""), 50);
  
  return `${objetoId}_${nombreBase}_${timestamp}.${extension}`;
}

// ========================================
// UTILIDADES DE DATOS
// ========================================

/**
 * Convierte array de Google Sheets a objeto
 */
function arrayAObjeto(array, encabezados) {
  const objeto = {};
  encabezados.forEach((encabezado, indice) => {
    objeto[encabezado] = array[indice];
  });
  return objeto;
}

/**
 * Aplica filtros a una lista de objetos
 */
function aplicarFiltros(objetos, filtros) {
  return objetos.filter(objeto => {
    return Object.keys(filtros).every(campo => {
      const valorFiltro = filtros[campo];
      const valorObjeto = objeto[campo];
      
      if (!valorFiltro || valorFiltro === 'Todos' || valorFiltro === 'Todas') {
        return true;
      }
      
      if (typeof valorObjeto === 'string') {
        return valorObjeto.toLowerCase().includes(valorFiltro.toLowerCase());
      }
      
      return valorObjeto === valorFiltro;
    });
  });
}

/**
 * Ordena array de objetos por campo específico
 */
function ordenarObjetosPor(objetos, campo, direccion = 'asc') {
  return objetos.sort((a, b) => {
    let valorA = a[campo];
    let valorB = b[campo];
    
    // Manejar fechas
    if (valorA instanceof Date || typeof valorA === 'string' && !isNaN(Date.parse(valorA))) {
      valorA = new Date(valorA);
      valorB = new Date(valorB);
    }
    
    // Manejar strings
    if (typeof valorA === 'string') {
      valorA = valorA.toLowerCase();
      valorB = valorB.toLowerCase();
    }
    
    if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
    if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Pagina un array de elementos
 */
function paginarArray(array, paginaActual = 1, elementosPorPagina = 10) {
  const inicio = (paginaActual - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;
  
  return {
    elementos: array.slice(inicio, fin),
    paginaActual: paginaActual,
    totalPaginas: Math.ceil(array.length / elementosPorPagina),
    totalElementos: array.length,
    tienePaginaAnterior: paginaActual > 1,
    tienePaginaSiguiente: paginaActual < Math.ceil(array.length / elementosPorPagina)
  };
}

// ========================================
// NOTIFICACIONES Y COMUNICACIONES
// ========================================

/**
 * Envía notificación por correo
 */
function enviarNotificacionCorreo(destinatario, asunto, mensaje, esHtml = false) {
  try {
    const opciones = {
      htmlBody: esHtml ? mensaje : null,
      name: 'Sistema de Inventario AGE'
    };
    
    GmailApp.sendEmail(destinatario, asunto, esHtml ? '' : mensaje, opciones);
    return { exito: true };
    
  } catch (error) {
    Logger.log('Error al enviar correo: ' + error.message);
    return { exito: false, mensaje: error.message };
  }
}

/**
 * Genera mensaje de notificación de calibración
 */
function generarMensajeCalibracion(objetos) {
  let mensaje = '<h2>🔧 Alerta de Calibraciones</h2>';
  
  const vencidos = objetos.filter(obj => obj.estadoCalibracion === 'Vencido');
  const proximos = objetos.filter(obj => estaProximoAVencer(obj.fechaProximaCalibracion));
  
  if (vencidos.length > 0) {
    mensaje += '<h3 style="color: #e74c3c;">⚠️ Calibraciones Vencidas:</h3><ul>';
    vencidos.forEach(obj => {
      mensaje += `<li><strong>${obj.nombre}</strong> (${obj.codigoInventario}) - Ubicación: ${obj.ubicacionActual}</li>`;
    });
    mensaje += '</ul>';
  }
  
  if (proximos.length > 0) {
    mensaje += '<h3 style="color: #f39c12;">⏰ Calibraciones Próximas a Vencer:</h3><ul>';
    proximos.forEach(obj => {
      const diasRestantes = calcularDiasEntreFechas(new Date(), obj.fechaProximaCalibracion);
      mensaje += `<li><strong>${obj.nombre}</strong> (${obj.codigoInventario}) - Vence en ${diasRestantes} días</li>`;
    });
    mensaje += '</ul>';
  }
  
  mensaje += '<br><p>Por favor, programe las calibraciones correspondientes.</p>';
  mensaje += '<p><em>Sistema de Inventario AGE</em></p>';
  
  return mensaje;
}

// ========================================
// UTILIDADES DE SISTEMA
// ========================================

/**
 * Genera ID único
 */
function generarIdUnico(prefijo = 'ID') {
  const timestamp = new Date().getTime();
  const aleatorio = Math.random().toString(36).substr(2, 5);
  return `${prefijo}_${timestamp}_${aleatorio}`.toUpperCase();
}

/**
 * Log estructurado de eventos
 */
function registrarEvento(tipo, objeto, accion, usuario, detalles = {}) {
  try {
    const evento = {
      timestamp: new Date(),
      tipo: tipo,
      objetoId: objeto?.id || 'N/A',
      objetoCodigo: objeto?.codigoInventario || 'N/A',
      accion: accion,
      usuario: usuario || Session.getActiveUser().getEmail(),
      detalles: JSON.stringify(detalles)
    };
    
    // Escribir a hoja de log si existe
    const hojaLog = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log_Eventos');
    if (hojaLog) {
      hojaLog.appendRow([
        evento.timestamp,
        evento.tipo,
        evento.objetoId,
        evento.objetoCodigo,
        evento.accion,
        evento.usuario,
        evento.detalles
      ]);
    } else {
      // Fallback a console log
      Logger.log(`${evento.tipo} | ${evento.accion} | ${evento.objetoCodigo} | ${evento.usuario}`);
    }
    
  } catch (error) {
    Logger.log('Error al registrar evento: ' + error.message);
  }
}

/**
 * Maneja errores de manera consistente
 */
function manejarError(error, contexto = 'Sistema', notificarAdmin = false) {
  const mensajeError = {
    timestamp: new Date(),
    contexto: contexto,
    mensaje: error.message || error,
    stack: error.stack || 'No disponible',
    usuario: Session.getActiveUser().getEmail()
  };
  
  // Log del error
  Logger.log(`ERROR en ${contexto}: ${mensajeError.mensaje}`);
  
  // Registrar en hoja de errores si existe
  try {
    const hojaErrores = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log_Errores');
    if (hojaErrores) {
      hojaErrores.appendRow([
        mensajeError.timestamp,
        mensajeError.contexto,
        mensajeError.mensaje,
        mensajeError.usuario,
        mensajeError.stack
      ]);
    }
  } catch (e) {
    Logger.log('Error al registrar error: ' + e.message);
  }
  
  // Notificar admin si es crítico
  if (notificarAdmin) {
    enviarNotificacionError(mensajeError);
  }
  
  return {
    exito: false,
    mensaje: 'Ha ocurrido un error en el sistema. Por favor intente nuevamente.',
    codigoError: generarIdUnico('ERR'),
    timestamp: mensajeError.timestamp
  };
}

/**
 * Envía notificación de error crítico
 */
function enviarNotificacionError(detalleError) {
  try {
    const adminEmail = obtenerConfiguracion('ADMIN_EMAIL', 'admin@tuips.com');
    const asunto = '🚨 Error Crítico - Sistema de Inventario';
    
    const mensaje = `
      <h2>Error Crítico en Sistema de Inventario</h2>
      <p><strong>Contexto:</strong> ${detalleError.contexto}</p>
      <p><strong>Mensaje:</strong> ${detalleError.mensaje}</p>
      <p><strong>Usuario:</strong> ${detalleError.usuario}</p>
      <p><strong>Timestamp:</strong> ${detalleError.timestamp}</p>
      <hr>
      <p><strong>Stack:</strong></p>
      <pre>${detalleError.stack}</pre>
    `;
    
    enviarNotificacionCorreo(adminEmail, asunto, mensaje, true);
  } catch (error) {
    Logger.log('Error al notificar error crítico: ' + error.message);
  }
}

// ========================================
// FUNCIONES DE CONFIGURACIÓN
// ========================================

/**
 * Obtiene valor de configuración
 */
function obtenerConfiguracion(clave, valorPorDefecto = null) {
  try {
    const propiedades = PropertiesService.getScriptProperties();
    return propiedades.getProperty(clave) || valorPorDefecto;
  } catch (error) {
    Logger.log('Error al obtener configuración: ' + error.message);
    return valorPorDefecto;
  }
}

/**
 * Establece valor de configuración
 */
function establecerConfiguracion(clave, valor) {
  try {
    const propiedades = PropertiesService.getScriptProperties();
    propiedades.setProperty(clave, valor);
    return true;
  } catch (error) {
    Logger.log('Error al establecer configuración: ' + error.message);
    return false;
  }
}

/**
 * Obtiene configuraciones múltiples
 */
function obtenerConfiguraciones(claves) {
  try {
    const propiedades = PropertiesService.getScriptProperties();
    return propiedades.getProperties();
  } catch (error) {
    Logger.log('Error al obtener configuraciones: ' + error.message);
    return {};
  }
}