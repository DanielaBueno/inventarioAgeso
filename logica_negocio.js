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
        realizadoPor: datos