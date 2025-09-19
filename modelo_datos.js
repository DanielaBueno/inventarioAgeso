/**
 * MODELO DE DATOS - CLASES Y FUNCIONES DE ACCESO A DATOS
 * Maneja la persistencia y lógica de datos del inventario
 */

// ========================================
// CLASE OBJETO INVENTARIO
// ========================================

class ObjetoInventario {
  constructor(datos = {}) {
    this.id = datos.id || this.generarNuevoId();
    this.nombre = datos.nombre || '';
    this.codigoInventario = datos.codigoInventario || '';
    this.numeroSerial = datos.numeroSerial || '';
    this.estado = datos.estado || 'Disponible';
    this.ubicacionActual = datos.ubicacionActual || '';
    this.requiereCalibracion = datos.requiereCalibracion || false;
    this.estadoCalibracion = datos.estadoCalibracion || 'No aplica';
    this.fechaUltimaCalibracion = datos.fechaUltimaCalibracion || null;
    this.fechaProximaCalibracion = datos.fechaProximaCalibracion || null;
    this.observaciones = datos.observaciones || '';
    this.fotosIds = datos.fotosIds || [];
    this.fechaCreacion = datos.fechaCreacion || new Date();
    this.fechaActualizacion = datos.fechaActualizacion || new Date();
    this.creadoPor = datos.creadoPor || Session.getActiveUser().getEmail();
  }

  /**
   * Genera un nuevo ID único para el objeto
   */
  generarNuevoId() {
    return 'OBJ_' + Utilities.getUuid();
  }

  /**
   * Valida que los datos del objeto sean correctos
   */
  validar() {
    const errores = [];

    if (!this.nombre.trim()) {
      errores.push('El nombre del objeto es obligatorio');
    }

    if (!this.codigoInventario.trim()) {
      errores.push('El código de inventario es obligatorio');
    }

    if (!this.ubicacionActual.trim()) {
      errores.push('La ubicación actual es obligatoria');
    }

    if (this.requiereCalibracion && !this.fechaUltimaCalibracion) {
      errores.push('Debe especificar fecha de última calibración');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  /**
   * Convierte el objeto a array para guardar en Google Sheets
   */
  aArray() {
    return [
      this.id,
      this.nombre,
      this.codigoInventario,
      this.numeroSerial,
      this.estado,
      this.ubicacionActual,
      this.requiereCalibracion,
      this.estadoCalibracion,
      this.fechaUltimaCalibracion,
      this.fechaProximaCalibracion,
      this.observaciones,
      this.fotosIds.join(','),
      this.fechaCreacion,
      this.fechaActualizacion,
      this.creadoPor
    ];
  }

  /**
   * Actualiza el estado de calibración basado en fechas
   */
  actualizarEstadoCalibracion() {
    if (!this.requiereCalibracion) {
      this.estadoCalibracion = 'No aplica';
      return;
    }

    const hoy = new Date();
    
    if (!this.fechaProximaCalibracion) {
      this.estadoCalibracion = 'Pendiente';
    } else if (this.fechaProximaCalibracion < hoy) {
      this.estadoCalibracion = 'Vencido';
    } else {
      this.estadoCalibracion = 'Calibrado';
    }
  }
}

// ========================================
// CLASE TRASLADO
// ========================================

class Traslado {
  constructor(datos = {}) {
    this.id = datos.id || this.generarNuevoId();
    this.objetoId = datos.objetoId || '';
    this.ubicacionOrigen = datos.ubicacionOrigen || '';
    this.ubicacionDestino = datos.ubicacionDestino || '';
    this.fechaTraslado = datos.fechaTraslado || new Date();
    this.realizadoPor = datos.realizadoPor || Session.getActiveUser().getEmail();
    this.observaciones = datos.observaciones || '';
  }

  generarNuevoId() {
    return 'TRA_' + Utilities.getUuid();
  }

  validar() {
    const errores = [];

    if (!this.objetoId.trim()) {
      errores.push('Debe especificar el objeto a trasladar');
    }

    if (!this.ubicacionDestino.trim()) {
      errores.push('Debe especificar la ubicación de destino');
    }

    if (this.ubicacionOrigen === this.ubicacionDestino) {
      errores.push('La ubicación de origen y destino no pueden ser iguales');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  }

  aArray() {
    return [
      this.id,
      this.objetoId,
      this.ubicacionOrigen,
      this.ubicacionDestino,
      this.fechaTraslado,
      this.realizadoPor,
      this.observaciones
    ];
  }
}

// ========================================
// FUNCIONES DE ACCESO A DATOS - OBJETOS
// ========================================

/**
 * Obtiene la hoja de inventario, la crea si no existe
 */
function obtenerHojaInventario() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION.HOJA_INVENTARIO);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION.HOJA_INVENTARIO);
    // Crear encabezados
    const encabezados = [
      'ID', 'Nombre', 'Código Inventario', 'Serial', 'Estado', 
      'Ubicación Actual', 'Requiere Calibración', 'Estado Calibración',
      'Fecha Última Calibración', 'Fecha Próxima Calibración',
      'Observaciones', 'Fotos IDs', 'Fecha Creación', 
      'Fecha Actualización', 'Creado Por'
    ];
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
  }
  
  return hoja;
}

/**
 * Guarda un nuevo objeto en el inventario
 */
function guardarObjetoInventario(objetoInventario) {
  const validacion = objetoInventario.validar();
  if (!validacion.valido) {
    throw new Error(validacion.errores.join(', '));
  }

  // Verificar que no exista código duplicado
  if (existeCodigoInventario(objetoInventario.codigoInventario, objetoInventario.id)) {
    throw new Error('Ya existe un objeto con ese código de inventario');
  }

  objetoInventario.actualizarEstadoCalibracion();
  objetoInventario.fechaActualizacion = new Date();

  const hoja = obtenerHojaInventario();
  hoja.appendRow(objetoInventario.aArray());
  
  return objetoInventario.id;
}

/**
 * Actualiza un objeto existente
 */
function actualizarObjetoInventario(objetoInventario) {
  const validacion = objetoInventario.validar();
  if (!validacion.valido) {
    throw new Error(validacion.errores.join(', '));
  }

  const hoja = obtenerHojaInventario();
  const datos = hoja.getDataRange().getValues();
  
  // Buscar la fila del objeto
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === objetoInventario.id) {
      objetoInventario.actualizarEstadoCalibracion();
      objetoInventario.fechaActualizacion = new Date();
      
      hoja.getRange(i + 1, 1, 1, objetoInventario.aArray().length)
           .setValues([objetoInventario.aArray()]);
      return true;
    }
  }
  
  throw new Error('Objeto no encontrado');
}

/**
 * Obtiene un objeto por su ID
 */
function obtenerObjetoPorId(id) {
  const hoja = obtenerHojaInventario();
  const datos = hoja.getDataRange().getValues();
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === id) {
      return crearObjetoDesdeArray(datos[i]);
    }
  }
  
  return null;
}

/**
 * Obtiene todos los objetos del inventario
 */
function obtenerTodosLosObjetos() {
  const hoja = obtenerHojaInventario();
  const datos = hoja.getDataRange().getValues();
  const objetos = [];
  
  for (let i = 1; i < datos.length; i++) {
    objetos.push(crearObjetoDesdeArray(datos[i]));
  }
  
  return objetos;
}

/**
 * Elimina un objeto del inventario
 */
function eliminarObjetoInventario(id) {
  const hoja = obtenerHojaInventario();
  const datos = hoja.getDataRange().getValues();
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === id) {
      hoja.deleteRow(i + 1);
      return true;
    }
  }
  
  throw new Error('Objeto no encontrado');
}

// ========================================
// FUNCIONES DE ACCESO A DATOS - TRASLADOS
// ========================================

/**
 * Obtiene la hoja de traslados, la crea si no existe
 */
function obtenerHojaTraslados() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(CONFIGURACION.HOJA_TRASLADOS);
  
  if (!hoja) {
    hoja = libro.insertSheet(CONFIGURACION.HOJA_TRASLADOS);
    const encabezados = [
      'ID', 'Objeto ID', 'Ubicación Origen', 'Ubicación Destino',
      'Fecha Traslado', 'Realizado Por', 'Observaciones'
    ];
    hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);
    hoja.getRange(1, 1, 1, encabezados.length).setFontWeight('bold');
  }
  
  return hoja;
}

/**
 * Registra un traslado y actualiza la ubicación del objeto
 */
function registrarTraslado(traslado) {
  const validacion = traslado.validar();
  if (!validacion.valido) {
    throw new Error(validacion.errores.join(', '));
  }

  // Obtener objeto y establecer ubicación origen
  const objeto = obtenerObjetoPorId(traslado.objetoId);
  if (!objeto) {
    throw new Error('Objeto no encontrado');
  }
  
  traslado.ubicacionOrigen = objeto.ubicacionActual;
  
  // Guardar el traslado
  const hoja = obtenerHojaTraslados();
  hoja.appendRow(traslado.aArray());
  
  // Actualizar ubicación del objeto
  objeto.ubicacionActual = traslado.ubicacionDestino;
  actualizarObjetoInventario(objeto);
  
  return traslado.id;
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Verifica si existe un código de inventario
 */
function existeCodigoInventario(codigo, excluirId = null) {
  const hoja = obtenerHojaInventario();
  const datos = hoja.getDataRange().getValues();
  
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][2] === codigo && datos[i][0] !== excluirId) {
      return true;
    }
  }
  
  return false;
}

/**
 * Crea un objeto ObjetoInventario desde un array de datos
 */
function crearObjetoDesdeArray(array) {
  return new ObjetoInventario({
    id: array[0],
    nombre: array[1],
    codigoInventario: array[2],
    numeroSerial: array[3],
    estado: array[4],
    ubicacionActual: array[5],
    requiereCalibracion: array[6],
    estadoCalibracion: array[7],
    fechaUltimaCalibracion: array[8],
    fechaProximaCalibracion: array[9],
    observaciones: array[10],
    fotosIds: array[11] ? array[11].split(',') : [],
    fechaCreacion: array[12],
    fechaActualizacion: array[13],
    creadoPor: array[14]
  });
}

/**
 * Crea la estructura inicial de hojas
 */
function crearEstructuraHojas() {
  obtenerHojaInventario();
  obtenerHojaTraslados();
}