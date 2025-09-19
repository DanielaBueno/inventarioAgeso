/**
 * SISTEMA DE INVENTARIO - CONTROLADOR PRINCIPAL
 * Implementación del patrón MVC para gestión de inventario
 * @author Tu nombre
 * @version 1.0
 */

// ========================================
// CONFIGURACIÓN GLOBAL
// ========================================

const CONFIGURACION = {
  HOJA_INVENTARIO: 'Inventario',
  HOJA_TRASLADOS: 'Traslados',
  CARPETA_FOTOS: 'Inventario_Fotos',
  DOMINIO_PERMITIDO: '@tuips.com',
  MAX_FOTOS_POR_OBJETO: 3
};

// ========================================
// CONTROLADOR PRINCIPAL
// ========================================

/**
 * Función principal que sirve la interfaz web
 */
function doGet(evento) {
  try {
    // Verificar autenticación del usuario
    const usuarioAutenticado = verificarAutenticacion();
    if (!usuarioAutenticado.autorizado) {
      return crearRespuestaError('Acceso denegado. Debe usar cuenta corporativa.');
    }
    
    // Determinar qué vista mostrar
    const accion = evento.parameter.accion || 'dashboard';
    
    switch (accion) {
      case 'dashboard':
        return mostrarDashboard();
      case 'agregar':
        return mostrarFormularioAgregar();
      case 'editar':
        return mostrarFormularioEditar(evento.parameter.id);
      case 'traslados':
        return mostrarFormularioTraslado();
      case 'nomenclatura':
        return mostrarGuiaNomenclatura();
      default:
        return mostrarDashboard();
    }
    
  } catch (error) {
    console.error('Error en doGet:', error);
    return crearRespuestaError('Error del sistema: ' + error.message);
  }
}

/**
 * Maneja las peticiones POST del formulario
 */
function doPost(evento) {
  try {
    const datosFormulario = JSON.parse(evento.postData.contents);
    const accion = datosFormulario.accion;
    
    switch (accion) {
      case 'agregar_objeto':
        return agregarObjetoInventario(datosFormulario);
      case 'editar_objeto':
        return editarObjetoInventario(datosFormulario);
      case 'eliminar_objeto':
        return eliminarObjetoInventario(datosFormulario.id);
      case 'registrar_traslado':
        return registrarTrasladoObjeto(datosFormulario);
      case 'subir_foto':
        return subirFotoObjeto(datosFormulario);
      default:
        throw new Error('Acción no válida');
    }
    
  } catch (error) {
    console.error('Error en doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: 'Error: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================================
// FUNCIONES DE AUTENTICACIÓN Y SEGURIDAD
// ========================================

/**
 * Verifica si el usuario tiene permisos para acceder al sistema
 */
function verificarAutenticacion() {
  const usuario = Session.getActiveUser();
  const correoElectronico = usuario.getEmail();
  
  return {
    autorizado: correoElectronico.endsWith(CONFIGURACION.DOMINIO_PERMITIDO),
    correoElectronico: correoElectronico,
    nombre: correoElectronico.split('@')[0]
  };
}

/**
 * Crea una respuesta HTML de error
 */
function crearRespuestaError(mensaje) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Error de Acceso</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin-top: 50px;
            color: #d32f2f;
          }
        </style>
      </head>
      <body>
        <h2>🚫 ${mensaje}</h2>
        <p>Contacte al administrador del sistema.</p>
      </body>
    </html>
  `;
  
  return HtmlService.createHtml(html);
}

// ========================================
// FUNCIONES DE VISTA (RENDERIZADO)
// ========================================

/**
 * Muestra el dashboard principal
 */
function mostrarDashboard() {
  const plantilla = HtmlService.createTemplateFromFile('Vista_Dashboard');
  plantilla.datosResumen = obtenerResumenInventario();
  plantilla.objetosRecientes = obtenerObjetosRecientes();
  
  return plantilla.evaluate()
    .setTitle('Sistema de Inventario - Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Muestra el formulario para agregar nuevo objeto
 */
function mostrarFormularioAgregar() {
  const plantilla = HtmlService.createTemplateFromFile('Vista_FormularioAgregar');
  plantilla.ubicaciones = obtenerListaUbicaciones();
  plantilla.tiposEquipo = obtenerTiposEquipo();
  
  return plantilla.evaluate()
    .setTitle('Agregar Objeto - Inventario')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Muestra el formulario de edición de objeto
 */
function mostrarFormularioEditar(idObjeto) {
  if (!idObjeto) {
    return crearRespuestaError('ID de objeto no especificado');
  }
  
  const plantilla = HtmlService.createTemplateFromFile('Vista_FormularioEditar');
  plantilla.objeto = obtenerObjetoPorId(idObjeto);
  plantilla.ubicaciones = obtenerListaUbicaciones();
  plantilla.tiposEquipo = obtenerTiposEquipo();
  
  return plantilla.evaluate()
    .setTitle('Editar Objeto - Inventario')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Muestra el formulario de traslados
 */
function mostrarFormularioTraslado() {
  const plantilla = HtmlService.createTemplateFromFile('Vista_FormularioTraslado');
  plantilla.objetos = obtenerListaObjetos();
  plantilla.ubicaciones = obtenerListaUbicaciones();
  
  return plantilla.evaluate()
    .setTitle('Registrar Traslado - Inventario')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Muestra la guía de nomenclatura
 */
function mostrarGuiaNomenclatura() {
  const plantilla = HtmlService.createTemplateFromFile('Vista_GuiaNomenclatura');
  plantilla.reglasNomenclatura = obtenerReglasNomenclatura();
  
  return plantilla.evaluate()
    .setTitle('Guía de Nomenclatura - Inventario')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ========================================
// FUNCIÓN AUXILIAR PARA INCLUIR ARCHIVOS
// ========================================

/**
 * Incluye archivos HTML/CSS/JS en las plantillas
 */
function incluirArchivo(nombreArchivo) {
  return HtmlService.createHtmlOutputFromFile(nombreArchivo).getContent();
}

// ========================================
// INICIALIZACIÓN DEL SISTEMA
// ========================================

/**
 * Configura las hojas de cálculo necesarias (ejecutar una vez)
 */
function inicializarSistema() {
  try {
    crearEstructuraHojas();
    crearCarpetaFotos();
    Logger.log('Sistema inicializado correctamente');
  } catch (error) {
    Logger.log('Error al inicializar sistema: ' + error.message);
  }
}