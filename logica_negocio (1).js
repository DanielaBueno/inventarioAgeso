/**
 * LÓGICA DE NEGOCIO - FUNCIONES DE PROCESAMIENTO Y REGLAS
 * Contiene la lógica específica del dominio del inventario
 */

// ========================================
// GESTIÓN DE OBJETOS DE INVENTARIO
// ========================================

/**
 * Procesa la creación de un nuevo objeto de inventario
 */
function agregarObjetoInventario(datosFormulario) {
  try {
    // Crear objeto con los datos del formulario
    const objetoNuevo = new ObjetoInventario({
      nombre: datosFormulario.nombre,
      codigoInventario: datosFormulario.codigoInventario,
      numeroSerial: datosFormulario.numeroSerial || '',
      estado: datosFormulario.estado || 'Disponible',
      ubicacionActual: datosFormulario.ubicacionActual,
      requiereCalibracion: datosFormulario.requiereCalibracion === 'true',
      fechaUltimaCalibracion: datosFormulario.fechaUltimaCalibracion ? 
        new Date(datosFormulario.fechaUltimaCalibracion) : null,
      fechaProximaCalibracion: datosFormulario.fechaProximaCalibracion ? 
        new Date(datosFormulario.fechaProximaCalibracion) : null,
      observaciones: datosFormulario.observaciones || ''
    });

    // Validar y guardar
    const idGenerado = guardarObjetoInventario(objetoNuevo);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: true,
        mensaje: 'Objeto agregado exitosamente',
        objetoId: idGenerado
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Procesa la edición de un objeto existente
 */
function editarObjetoInventario(datosFormulario) {
  try {
    // Obtener objeto existente
    const objetoExistente = obtenerObjetoPorId(datosFormulario.id);
    if (!objetoExistente) {
      throw new Error('Objeto no encontrado');
    }

    // Actualizar propiedades
    objetoExistente.nombre = datosFormulario.nombre;
    objetoExistente.codigoInventario = datosFormulario.codigoInventario;
    objetoExistente.numeroSerial = datosFormulario.numeroSerial || '';
    objetoExistente.estado = datosFormulario.estado;
    objetoExistente.ubicacionActual = datosFormulario.ubicacionActual;
    objetoExistente.requiereCalibracion = datosFormulario.requiereCalibracion === 'true';
    objetoExistente.fechaUltimaCalibracion = datosFormulario.fechaUltimaCalibracion ? 
      new Date(datosFormulario.fechaUltimaCalibracion) : null;
    objetoExistente.fechaProximaCalibracion = datosFormulario.fechaProximaCalibracion ? 
      new Date(datosFormulario.fechaProximaCalibracion) : null;
    objetoExistente.observaciones = datosFormulario.observaciones || '';

    // Guardar cambios
    actualizarObjetoInventario(objetoExistente);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: true,
        mensaje: 'Objeto actualizado exitosamente'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Procesa la eliminación de un objeto
 */
function eliminarObjetoInventario(objetoId) {
  try {
    eliminarObjetoInventario(objetoId);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: true,
        mensaje: 'Objeto eliminado exitosamente'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// GESTIÓN DE TRASLADOS
// ========================================

/**
 * Procesa el registro de un traslado de objeto
 */
function registrarTrasladoObjeto(datosFormulario) {
  try {
    // Crear traslado
    const trasladoNuevo = new Traslado({
      objetoId: datosFormulario.objetoId,
      ubicacionDestino: datosFormulario.ubicacionDestino,
      observaciones: datosFormulario.observaciones || ''
    });

    // Registrar traslado (también actualiza el objeto)
    const trasladoId = registrarTraslado(trasladoNuevo);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: true,
        mensaje: 'Traslado registrado exitosamente',
        trasladoId: trasladoId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene el histórico de traslados de un objeto
 */
function obtenerHistoricoTraslados(objetoId) {
  const hoja = obtenerHojaTraslados();
  const datos = hoja.getDataRange().getValues();
  const traslados = [];
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][1] === objetoId) {
      traslados.push({
        id: datos[i][0],
        ubicacionOrigen: datos[i][2],
        ubicacionDestino: datos[i][3],
        fechaTraslado: datos[i][4],
        realizadoPor: datos[i][5],
        observaciones: datos[i][6]
      });
    }
  }
  
  // Ordenar por fecha (más recientes primero)
  return traslados.sort((a, b) => new Date(b.fechaTraslado) - new Date(a.fechaTraslado));
}

// ========================================
// GESTIÓN DE FOTOGRAFÍAS
// ========================================

/**
 * Sube una fotografía y la asocia a un objeto
 */
function subirFotoObjeto(datosFormulario) {
  try {
    const objeto = obtenerObjetoPorId(datosFormulario.objetoId);
    if (!objeto) {
      throw new Error('Objeto no encontrado');
    }

    if (objeto.fotosIds.length >= CONFIGURACION.MAX_FOTOS_POR_OBJETO) {
      throw new Error(`Máximo ${CONFIGURACION.MAX_FOTOS_POR_OBJETO} fotos por objeto`);
    }

    // Crear/obtener carpeta de fotos
    const carpetaFotos = obtenerCarpetaFotos();
    
    // Decodificar imagen base64
    const datosImagen = Utilities.base64Decode(datosFormulario.imagenBase64);
    const blob = Utilities.newBlob(datosImagen, datosFormulario.tipoMime, 
                                   `${objeto.codigoInventario}_${Date.now()}.jpg`);
    
    // Guardar archivo en Drive
    const archivo = carpetaFotos.createFile(blob);
    objeto.fotosIds.push(archivo.getId());
    
    // Actualizar objeto
    actualizarObjetoInventario(objeto);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: true,
        mensaje: 'Foto subida exitosamente',
        fotoId: archivo.getId()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene o crea la carpeta para almacenar fotos
 */
function obtenerCarpetaFotos() {
  const carpetas = DriveApp.getFoldersByName(CONFIGURACION.CARPETA_FOTOS);
  if (carpetas.hasNext()) {
    return carpetas.next();
  } else {
    return DriveApp.createFolder(CONFIGURACION.CARPETA_FOTOS);
  }
}

/**
 * Elimina una foto de un objeto
 */
function eliminarFotoObjeto(objetoId, fotoId) {
  try {
    const objeto = obtenerObjetoPorId(objetoId);
    if (!objeto) {
      throw new Error('Objeto no encontrado');
    }

    // Remover foto del array
    objeto.fotosIds = objeto.fotosIds.filter(id => id !== fotoId);
    
    // Actualizar objeto
    actualizarObjetoInventario(objeto);
    
    // Eliminar archivo de Drive
    try {
      DriveApp.getFileById(fotoId).setTrashed(true);
    } catch (e) {
      Logger.log('No se pudo eliminar el archivo: ' + e.message);
    }
    
    return true;
  } catch (error) {
    throw new Error('Error al eliminar foto: ' + error.message);
  }
}

// ========================================
// FUNCIONES DE CONSULTA Y REPORTES
// ========================================

/**
 * Obtiene resumen estadístico del inventario
 */
function obtenerResumenInventario() {
  const objetos = obtenerTodosLosObjetos();
  
  const resumen = {
    totalObjetos: objetos.length,
    porEstado: {},
    porUbicacion: {},
    calibracionVencida: 0,
    calibracionProxima: 0,
    ultimosTraslados: obtenerUltimosTraslados(5)
  };
  
  const hoy = new Date();
  const proximoMes = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  objetos.forEach(objeto => {
    // Contar por estado
    resumen.porEstado[objeto.estado] = (resumen.porEstado[objeto.estado] || 0) + 1;
    
    // Contar por ubicación
    resumen.porUbicacion[objeto.ubicacionActual] = 
      (resumen.porUbicacion[objeto.ubicacionActual] || 0) + 1;
    
    // Verificar calibraciones
    if (objeto.requiereCalibracion) {
      if (objeto.estadoCalibracion === 'Vencido') {
        resumen.calibracionVencida++;
      } else if (objeto.fechaProximaCalibracion && 
                 objeto.fechaProximaCalibracion <= proximoMes) {
        resumen.calibracionProxima++;
      }
    }
  });
  
  return resumen;
}

/**
 * Obtiene los últimos traslados realizados
 */
function obtenerUltimosTraslados(limite = 10) {
  const hoja = obtenerHojaTraslados();
  const datos = hoja.getDataRange().getValues();
  const traslados = [];
  
  for (let i = 1; i < datos.length; i++) {
    const objeto = obtenerObjetoPorId(datos[i][1]);
    traslados.push({
      id: datos[i][0],
      objetoNombre: objeto ? objeto.nombre : 'Desconocido',
      objetoCodigo: objeto ? objeto.codigoInventario : 'N/A',
      ubicacionOrigen: datos[i][2],
      ubicacionDestino: datos[i][3],
      fechaTraslado: datos[i][4],
      realizadoPor: datos[i][5],
      observaciones: datos[i][6]
    });
  }
  
  // Ordenar por fecha y limitar resultados
  return traslados
    .sort((a, b) => new Date(b.fechaTraslado) - new Date(a.fechaTraslado))
    .slice(0, limite);
}

/**
 * Obtiene objetos recientes (últimos agregados/modificados)
 */
function obtenerObjetosRecientes(limite = 10) {
  const objetos = obtenerTodosLosObjetos();
  
  return objetos
    .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))
    .slice(0, limite)
    .map(objeto => ({
      id: objeto.id,
      nombre: objeto.nombre,
      codigoInventario: objeto.codigoInventario,
      estado: objeto.estado,
      ubicacionActual: objeto.ubicacionActual,
      estadoCalibracion: objeto.estadoCalibracion,
      fechaActualizacion: objeto.fechaActualizacion
    }));
}

/**
 * Busca objetos por criterios
 */
function buscarObjetos(criterios) {
  const objetos = obtenerTodosLosObjetos();
  let resultados = objetos;
  
  // Filtrar por texto (nombre, código, serial)
  if (criterios.texto && criterios.texto.trim()) {
    const texto = criterios.texto.toLowerCase();
    resultados = resultados.filter(objeto => 
      objeto.nombre.toLowerCase().includes(texto) ||
      objeto.codigoInventario.toLowerCase().includes(texto) ||
      objeto.numeroSerial.toLowerCase().includes(texto)
    );
  }
  
  // Filtrar por estado
  if (criterios.estado && criterios.estado !== 'Todos') {
    resultados = resultados.filter(objeto => objeto.estado === criterios.estado);
  }
  
  // Filtrar por ubicación
  if (criterios.ubicacion && criterios.ubicacion !== 'Todas') {
    resultados = resultados.filter(objeto => objeto.ubicacionActual === criterios.ubicacion);
  }
  
  // Filtrar por estado de calibración
  if (criterios.calibracion && criterios.calibracion !== 'Todos') {
    if (criterios.calibracion === 'RequiereCalibracion') {
      resultados = resultados.filter(objeto => objeto.requiereCalibracion);
    } else {
      resultados = resultados.filter(objeto => objeto.estadoCalibracion === criterios.calibracion);
    }
  }
  
  return resultados;
}

// ========================================
// FUNCIONES DE CONFIGURACIÓN Y LISTAS
// ========================================

/**
 * Obtiene lista de ubicaciones únicas
 */
function obtenerListaUbicaciones() {
  const ubicaciones = new Set(['Bodega', 'Consultorio 1', 'Consultorio 2', 'Consultorio 3', 'Laboratorio']);
  
  // Agregar ubicaciones existentes en el inventario
  const objetos = obtenerTodosLosObjetos();
  objetos.forEach(objeto => ubicaciones.add(objeto.ubicacionActual));
  
  return Array.from(ubicaciones).sort();
}

/**
 * Obtiene lista de objetos para selección
 */
function obtenerListaObjetos() {
  return obtenerTodosLosObjetos().map(objeto => ({
    id: objeto.id,
    nombre: objeto.nombre,
    codigo: objeto.codigoInventario,
    ubicacion: objeto.ubicacionActual
  }));
}

/**
 * Obtiene tipos de equipo para nomenclatura
 */
function obtenerTiposEquipo() {
  return [
    { codigo: 'EM-AGE', nombre: 'Equipos Médicos', cantidad: 500 },
    { codigo: 'EO-AGE', nombre: 'Equipos de Oficina', cantidad: 500 },
    { codigo: 'A-AGE', nombre: 'Accesorios', cantidad: 500 },
    { codigo: 'EQUI-AGE', nombre: 'Equipos de Emergencia', cantidad: 200 },
    { codigo: 'CAF-AGE', nombre: 'Cafetería', cantidad: 100 },
    { codigo: 'HERR-AGE', nombre: 'Herramientas', cantidad: 200 },
    { codigo: 'ARCH-AGE', nombre: 'Archivo', cantidad: 100 }
  ];
}

/**
 * Obtiene reglas de nomenclatura
 */
function obtenerReglasNomenclatura() {
  return {
    tiposEquipo: obtenerTiposEquipo(),
    formato: '{CODIGO}-{NUMERO_SECUENCIAL}-{MES}{AÑO}',
    ejemplos: [
      'EM-AGE-001-0821 (Equipo Médico #1, Agosto 2021)',
      'EO-AGE-025-1223 (Equipo Oficina #25, Diciembre 2023)',
      'A-AGE-150-0324 (Accesorio #150, Marzo 2024)'
    ],
    notas: [
      'Usar siempre mayúsculas',
      'Número secuencial con 3 dígitos (001, 002, etc.)',
      'Mes con 2 dígitos (01-12)',
      'Año con 2 dígitos (21, 22, 23, etc.)'
    ]
  };
}

// ========================================
// FUNCIONES DE INICIALIZACIÓN
// ========================================

/**
 * Crea la carpeta de fotos si no existe
 */
function crearCarpetaFotos() {
  obtenerCarpetaFotos();
}