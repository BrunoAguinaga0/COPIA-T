
// ===== CONFIGURACIÓN GLOBAL =====
const COPIA_T = {
    // Datos del usuario (simulados - en producción vendrían del servidor)
    usuario: {
        id: 'cliente001',
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '+57 300 123 4567',
        fechaRegistro: '2024-01-15',
        totalPedidos: 12,
        totalGastado: 245850,
        ultimoPedido: '2024-12-20'
    },

    // Historial de pedidos (simulado)
    pedidos: [
        {
            id: 'PED001',
            fecha: '2024-12-20',
            archivos: ['documento.pdf', 'presentacion.pptx'],
            estado: 'Entregado',
            total: 15000,
            detalles: {
                hojas: 25,
                color: false,
                dobleCaraa: true,
                calidad: 'Alta'
            }
        },
        {
            id: 'PED002',
            fecha: '2024-12-15',
            archivos: ['informe.docx'],
            estado: 'Entregado',
            total: 8500,
            detalles: {
                hojas: 15,
                color: true,
                dobleCaraa: false,
                calidad: 'Media'
            }
        },
        {
            id: 'PED003',
            fecha: '2024-12-10',
            archivos: ['tesis.pdf'],
            estado: 'Entregado',
            total: 45000,
            detalles: {
                hojas: 120,
                color: false,
                dobleCaraa: true,
                calidad: 'Alta'
            }
        }
    ]
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Panel Cliente inicializado');
    inicializarPanel();
    configurarEventos();
    cargarDatosUsuario();
    cargarEstadisticas();
});

// ===== FUNCIONES PRINCIPALES =====

/**
 * Inicializa el panel del cliente
 */
function inicializarPanel() {
    // Verificar sesión del usuario
    verificarSesion();
    
    // Mostrar nombre del usuario
    mostrarNombreUsuario();
    
    // Configurar eventos de cierre de modal al hacer clic fuera
    configurarCierreModalPorClick();
}

/**
 * Configura los eventos del panel
 */
function configurarEventos() {
    // Evento para cerrar modales con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosLosModales();
        }
    });

    // Eventos para formularios
    document.getElementById('form-perfil').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarPerfil();
    });

    document.getElementById('form-password').addEventListener('submit', function(e) {
        e.preventDefault();
        cambiarPassword();
    });
}

/**
 * Verifica si el usuario tiene sesión activa
 */
function verificarSesion() {
    // En un entorno real, esto verificaría el token de sesión
    const sesionActiva = localStorage.getItem('copia_t_sesion');
      if (!sesionActiva) {
        console.log('No hay sesión activa, redirigiendo al login');
        window.location.href = '../auth/login.html';
        return false;
    }
    
    return true;
}

/**
 * Muestra el nombre del usuario en la página
 */
function mostrarNombreUsuario() {
    const nombreElement = document.getElementById('usuario-nombre');
    if (nombreElement) {
        nombreElement.textContent = COPIA_T.usuario.nombre;
    }
}

/**
 * Carga los datos del usuario en el formulario de perfil
 */
function cargarDatosUsuario() {
    document.getElementById('edit-nombre').value = COPIA_T.usuario.nombre;
    document.getElementById('edit-email').value = COPIA_T.usuario.email;
    document.getElementById('edit-telefono').value = COPIA_T.usuario.telefono;
}

/**
 * Carga las estadísticas del usuario
 */
function cargarEstadisticas() {
    document.getElementById('total-pedidos').textContent = COPIA_T.usuario.totalPedidos;
    document.getElementById('total-gastado').textContent = `$${COPIA_T.usuario.totalGastado.toLocaleString('es-CO')}`;
    
    const fechaUltimoPedido = new Date(COPIA_T.usuario.ultimoPedido);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('ultimo-pedido').textContent = fechaUltimoPedido.toLocaleDateString('es-ES', opciones);
}

// ===== GESTIÓN DE MODALES =====

/**
 * Muestra un modal específico
 */
function mostrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Foco en el primer input del modal
        setTimeout(() => {
            const primerInput = modal.querySelector('input, button');
            if (primerInput) {
                primerInput.focus();
            }
        }, 100);
    }
}

/**
 * Cierra un modal específico
 */
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Limpiar formularios si existen
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Cierra todos los modales abiertos
 */
function cerrarTodosLosModales() {
    const modales = document.querySelectorAll('.modal-overlay.show');
    modales.forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

/**
 * Configura el cierre de modales al hacer clic fuera
 */
function configurarCierreModalPorClick() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModal(this.id);
            }
        });
    });
}

// ===== FUNCIONES DE PERFIL =====

/**
 * Muestra el modal de editar perfil
 */
function mostrarEditarPerfil() {
    cargarDatosUsuario();
    mostrarModal('modal-perfil');
}

/**
 * Guarda los cambios del perfil
 */
function guardarPerfil() {
    const form = document.getElementById('form-perfil');
    const formData = new FormData(form);
    
    // Validaciones
    const nombre = formData.get('nombre').trim();
    const email = formData.get('email').trim();
    const telefono = formData.get('telefono').trim();
    
    if (!nombre || !email) {
        mostrarNotificacion('❌ Error', 'El nombre y email son obligatorios', 'error');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarNotificacion('❌ Error', 'El formato del email no es válido', 'error');
        return;
    }
    
    // Simular guardado (en producción sería una llamada al servidor)
    setTimeout(() => {
        // Actualizar datos locales
        COPIA_T.usuario.nombre = nombre;
        COPIA_T.usuario.email = email;
        COPIA_T.usuario.telefono = telefono;
        
        // Actualizar visualización
        mostrarNombreUsuario();
        
        // Cerrar modal y mostrar confirmación
        cerrarModal('modal-perfil');
        mostrarNotificacion('✅ Éxito', 'Perfil actualizado correctamente', 'success');
        
        console.log('Perfil actualizado:', COPIA_T.usuario);
    }, 1000);
}

// ===== FUNCIONES DE CONTRASEÑA =====

/**
 * Muestra el modal de cambiar contraseña
 */
function mostrarCambiarPassword() {
    mostrarModal('modal-password');
}

/**
 * Cambia la contraseña del usuario
 */
function cambiarPassword() {
    const form = document.getElementById('form-password');
    const formData = new FormData(form);
    
    const passwordActual = formData.get('passwordActual').trim();
    const passwordNueva = formData.get('passwordNueva').trim();
    const passwordConfirmar = formData.get('passwordConfirmar').trim();
    
    // Validaciones
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        mostrarNotificacion('❌ Error', 'Todos los campos son obligatorios', 'error');
        return;
    }
    
    if (passwordNueva.length < 6) {
        mostrarNotificacion('❌ Error', 'La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (passwordNueva !== passwordConfirmar) {
        mostrarNotificacion('❌ Error', 'Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Simular validación de contraseña actual (en producción sería validada en el servidor)
    if (passwordActual !== 'password123') { // Contraseña demo
        mostrarNotificacion('❌ Error', 'La contraseña actual es incorrecta', 'error');
        return;
    }
    
    // Simular cambio de contraseña
    setTimeout(() => {
        cerrarModal('modal-password');
        mostrarNotificacion('✅ Éxito', 'Contraseña cambiada correctamente', 'success');
        console.log('Contraseña cambiada para usuario:', COPIA_T.usuario.id);
    }, 1000);
}

// ===== FUNCIONES DE HISTORIAL =====

/**
 * Muestra el modal de historial de pedidos
 */
function mostrarHistorial() {
    cargarHistorialPedidos();
    mostrarModal('modal-historial');
}

/**
 * Carga y muestra el historial de pedidos
 */
function cargarHistorialPedidos() {
    const contenedor = document.getElementById('historial-contenido');
    
    if (COPIA_T.pedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="historial-vacio">
                <div class="historial-icon">📋</div>
                <h4>No tienes pedidos aún</h4>
                <p>Cuando realices tu primer pedido, aparecerá aquí.</p>
                <a href="../orders/crearPedido.html" class="btn btn-primary">Crear mi primer pedido</a>
            </div>
        `;
        return;
    }
    
    let historialHTML = `
        <div class="historial-header">
            <h4>Tienes ${COPIA_T.pedidos.length} pedidos realizados</h4>
        </div>
        <div class="historial-lista">
    `;
    
    COPIA_T.pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const estadoClass = pedido.estado.toLowerCase().replace(' ', '-');
        const archivosTexto = pedido.archivos.length === 1 
            ? pedido.archivos[0] 
            : `${pedido.archivos.length} archivos`;
        
        historialHTML += `
            <div class="historial-item">
                <div class="historial-info">
                    <div class="historial-titulo">
                        <h5>Pedido ${pedido.id}</h5>
                        <span class="estado-badge estado-${estadoClass}">${pedido.estado}</span>
                    </div>
                    <div class="historial-detalles">
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                        <p><strong>Archivos:</strong> ${archivosTexto}</p>
                        <p><strong>Hojas:</strong> ${pedido.detalles.hojas} • <strong>Color:</strong> ${pedido.detalles.color ? 'Sí' : 'No'} • <strong>Doble cara:</strong> ${pedido.detalles.dobleCaraa ? 'Sí' : 'No'}</p>
                    </div>
                </div>
                <div class="historial-precio">
                    <span class="precio">$${pedido.total.toLocaleString('es-CO')}</span>
                </div>
            </div>
        `;
    });
    
    historialHTML += `
        </div>
        <div class="historial-resumen">
            <div class="resumen-item">
                <strong>Total de pedidos:</strong> ${COPIA_T.pedidos.length}
            </div>
            <div class="resumen-item">
                <strong>Total gastado:</strong> $${COPIA_T.usuario.totalGastado.toLocaleString('es-CO')}
            </div>
        </div>
    `;
    
    contenedor.innerHTML = historialHTML;
}

// ===== FUNCIONES DE SESIÓN =====

/**
 * Inicia el proceso de cerrar sesión
 */
function cerrarSesion() {
    mostrarModal('modal-logout');
}

/**
 * Confirma y ejecuta el cierre de sesión
 */
function confirmarCerrarSesion() {
    // Limpiar datos de sesión
    localStorage.removeItem('copia_t_sesion');
    localStorage.removeItem('copia_t_usuario');
    
    // Mostrar notificación de despedida
    mostrarNotificacion('👋 Hasta luego', 'Sesión cerrada correctamente', 'info');
      // Redirigir al login después de un breve delay
    setTimeout(() => {
        window.location.href = '../auth/login.html';
    }, 1500);
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Muestra una notificación modal
 */
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    const modal = document.getElementById('modal-notificacion');
    const tituloElement = document.getElementById('notif-title');
    const iconoElement = document.getElementById('notif-icon');
    const mensajeElement = document.getElementById('notif-message');
    
    tituloElement.textContent = titulo;
    mensajeElement.textContent = mensaje;
    
    // Configurar icono según el tipo
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    iconoElement.textContent = iconos[tipo] || iconos.info;
    iconoElement.className = `modal-icon ${tipo}`;
    
    mostrarModal('modal-notificacion');
    
    // Auto-cerrar después de 3 segundos para notificaciones de éxito
    if (tipo === 'success') {
        setTimeout(() => {
            cerrarModal('modal-notificacion');
        }, 3000);
    }
}

/**
 * Valida el formato de un email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Formatea números como moneda colombiana
 */
function formatearMoneda(cantidad) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(cantidad);
}

/**
 * Maneja errores de la aplicación
 */
function manejarError(error, contexto = 'Operación') {
    console.error(`Error en ${contexto}:`, error);
    mostrarNotificacion('❌ Error', `Ha ocurrido un error en ${contexto.toLowerCase()}. Por favor, inténtalo de nuevo.`, 'error');
}

// ===== FUNCIONES ADICIONALES =====

/**
 * Actualiza las estadísticas del usuario
 */
function actualizarEstadisticas() {
    // Recalcular estadísticas basadas en los pedidos
    COPIA_T.usuario.totalPedidos = COPIA_T.pedidos.length;
    COPIA_T.usuario.totalGastado = COPIA_T.pedidos.reduce((total, pedido) => total + pedido.total, 0);
    
    if (COPIA_T.pedidos.length > 0) {
        const fechas = COPIA_T.pedidos.map(p => new Date(p.fecha));
        const fechaMasReciente = new Date(Math.max(...fechas));
        COPIA_T.usuario.ultimoPedido = fechaMasReciente.toISOString().split('T')[0];
    }
    
    cargarEstadisticas();
}

/**
 * Simula la carga de datos desde el servidor
 */
function simularCargaServidor(callback, delay = 1000) {
    setTimeout(() => {
        callback();
    }, delay);
}

// ===== EXPORTAR FUNCIONES GLOBALES =====
// Estas funciones necesitan estar en el scope global para ser llamadas desde el HTML

window.mostrarEditarPerfil = mostrarEditarPerfil;
window.mostrarCambiarPassword = mostrarCambiarPassword;
window.mostrarHistorial = mostrarHistorial;
window.cerrarSesion = cerrarSesion;
window.confirmarCerrarSesion = confirmarCerrarSesion;
window.cerrarModal = cerrarModal;
window.guardarPerfil = guardarPerfil;
window.cambiarPassword = cambiarPassword;

// ===== LOG DE INICIALIZACIÓN =====
console.log('Panel Cliente JS cargado correctamente');
console.log('Usuario actual:', COPIA_T.usuario);
console.log('Pedidos disponibles:', COPIA_T.pedidos.length);
