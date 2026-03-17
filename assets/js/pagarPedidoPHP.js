
// ===== VARIABLES GLOBALES =====
let archivoComprobante = null;
let datosPedido = null;
let totalPedido = 0;
let totalOriginal = 0;
const COMISION_MERCADOPAGO = 0.0629; // 6.29%

// ===== CONFIGURACIÓN DE PRECIOS (sincronizada con crearPedido) =====
const precios = {
    papel: {
        normal: 0,
        reciclado: 2,
        fotográfico: 5
    },
    tamaño: {
        a4: 10,
        a3: 15,
        a5: 8,
        oficio: 12
    },
    color: {
        blanco: 0,
        color: 10
    },
    encuadernacion: {
        sin: 0,
        anillado_corto: 5,
        anillado_largo: 8
    },
    faz: {
        simple: 0,
        doble: 5
    }
};

// ===== FUNCIONES DE UTILIDADES =====
function mostrarMensaje(mensaje, tipo = 'error') {
    const tipos = {
        error: { icon: '❌', color: '#ef4444' },
        success: { icon: '✅', color: '#10b981' },
        warning: { icon: '⚠️', color: '#f59e0b' },
        info: { icon: 'ℹ️', color: '#3b82f6' }
    };
    
    const config = tipos[tipo] || tipos.error;
    
    // Crear toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid ${config.color};
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 400px;
        font-family: 'Segoe UI', sans-serif;
        animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 18px;">${config.icon}</span>
            <span style="color: #1e293b; font-weight: 500;">${mensaje}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove después de 4 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ===== GESTIÓN DE ARCHIVOS DE COMPROBANTE =====
function configurarEventosComprobante() {
    const fileInput = document.getElementById('comprobante-file');
    const fileStatus = document.getElementById('file-status');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const uploadLabel = document.querySelector('.upload-label');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (file) {
                // Validar tipo de archivo
                if (file.type !== 'application/pdf') {
                    mostrarMensaje('Solo se permiten archivos PDF.', 'error');
                    fileInput.value = '';
                    return;
                }

                // Validar tamaño (10MB máximo)
                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    mostrarMensaje('El archivo es demasiado grande. Máximo 10MB.', 'error');
                    fileInput.value = '';
                    return;
                }

                // Archivo válido
                archivoComprobante = file;

                // Mostrar información del archivo
                if (fileName) fileName.textContent = file.name;
                if (fileSize) fileSize.textContent = formatearTamaño(file.size);

                // Cambiar visualización
                if (uploadLabel) uploadLabel.style.display = 'none';
                if (fileStatus) fileStatus.style.display = 'flex';

                mostrarMensaje('Comprobante cargado correctamente', 'success');
                console.log('Comprobante cargado:', file.name, formatearTamaño(file.size));
            }
        });
    }
}

function removerComprobante() {
    const fileInput = document.getElementById('comprobante-file');
    const fileStatus = document.getElementById('file-status');
    const uploadLabel = document.querySelector('.upload-label');

    // Limpiar archivo
    if (fileInput) fileInput.value = '';
    archivoComprobante = null;

    // Cambiar visualización
    if (uploadLabel) uploadLabel.style.display = 'flex';
    if (fileStatus) fileStatus.style.display = 'none';

    console.log('Comprobante removido');
}

// ===== FUNCIONES DE CÁLCULO =====
function calcularPrecioArchivo(config) {
    if (!config) return 0;

    const cantidad = parseInt(config.cantidad) || 1;
    const precioBase = precios.tamaño[config.tamaño_papel] || 0;
    const precioPapel = precios.papel[config.tipo_papel] || 0;
    const precioColor = precios.color[config.color] || 0;
    const precioEncuadernacion = precios.encuadernacion[config.encuadernacion] || 0;
    const precioFaz = precios.faz[config.tipo_faz] || 0;

    const precioUnitario = precioBase + precioPapel + precioColor + precioEncuadernacion + precioFaz;
    return precioUnitario * cantidad;
}

// ===== GESTIÓN DE DATOS DEL PEDIDO =====
function cargarDatosPedido() {
    const pedidoGuardado = localStorage.getItem('pedidoActual');    if (!pedidoGuardado) {
        mostrarMensaje('No se encontraron datos del pedido. Redirigiendo...', 'error');
        setTimeout(() => {
            window.location.href = '../orders/crearPedido.html';
        }, 2000);
        return;
    }

    try {
        datosPedido = JSON.parse(pedidoGuardado);
        console.log('Datos del pedido cargados:', datosPedido);

        // Usar el precio total enviado por PHP si está disponible
        if (window.precioTotalPHP && window.precioTotalPHP > 0) {
            totalPedido = window.precioTotalPHP;
            totalOriginal = window.precioTotalPHP;
            console.log('Usando precio total de PHP:', totalPedido);
        } else if (datosPedido.precioTotal) {
            totalPedido = datosPedido.precioTotal;
            totalOriginal = datosPedido.precioTotal;
            console.log('Usando precio total de localStorage:', totalPedido);
        }

        mostrarResumenPedido();    } catch (error) {
        console.error('Error al cargar datos del pedido:', error);
        mostrarMensaje('Error al cargar el pedido. Redirigiendo...', 'error');
        setTimeout(() => {
            window.location.href = '../orders/crearPedido.html';
        }, 2000);
    }
}

function mostrarResumenPedido() {
    const detallePedido = document.getElementById('detalle-pedido');
    if (!detallePedido) {
        console.error('Elemento detalle-pedido no encontrado');
        return;
    }    let htmlResumen = '';
    let totalCalculado = 0; // Usamos una variable temporal para el cálculo de archivos individuales

    datosPedido.archivos.forEach((nombreArchivo, indice) => {
        const config = datosPedido.configuraciones[indice];
        const precioArchivo = calcularPrecioArchivo(config);
        totalCalculado += precioArchivo;

        htmlResumen += `
            <details class="archivo-resumen" open>
                <summary class="archivo-header">
                    <div class="archivo-info">
                        <span class="icono-archivo">📄</span>
                        <h4>${nombreArchivo}</h4>
                    </div>
                    <span class="precio-archivo">$${precioArchivo.toFixed(2)}</span>
                    <span class="flecha-archivo">▼</span>
                </summary>
                <div class="archivo-detalles">
                    <div class="detalle-grid">
                        <div class="detalle-seccion">
                            <h5>📊 Configuración básica</h5>
                            <div class="detalle-linea">
                                <span>Cantidad:</span>
                                <span>${config.cantidad} ${config.cantidad == 1 ? 'copia' : 'copias'}</span>
                            </div>
                            <div class="detalle-linea">
                                <span>Páginas:</span>
                                <span>${config.rango_paginas === 'todas' ? 'Todas las páginas' : config.paginas_especificas}</span>
                            </div>
                        </div>
                        
                        <div class="detalle-seccion">
                            <h5>📄 Papel</h5>
                            <div class="detalle-linea">
                                <span>Tipo:</span>
                                <span>${config.tipo_papel.charAt(0).toUpperCase() + config.tipo_papel.slice(1)}</span>
                            </div>
                            <div class="detalle-linea">
                                <span>Tamaño:</span>
                                <span>${config.tamaño_papel.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        <div class="detalle-seccion">
                            <h5>🎨 Impresión</h5>
                            <div class="detalle-linea">
                                <span>Color:</span>
                                <span>${config.color === 'blanco' ? 'Blanco y Negro' : 'Color'}</span>
                            </div>
                            <div class="detalle-linea">
                                <span>Tipo de faz:</span>
                                <span>${config.tipo_faz.charAt(0).toUpperCase() + config.tipo_faz.slice(1)}</span>
                            </div>
                        </div>
                        
                        <div class="detalle-seccion">
                            <h5>📚 Encuadernación</h5>
                            <div class="detalle-linea">
                                <span>Tipo:</span>
                                <span>${config.encuadernacion.replace('_', ' ').replace('sin', 'Sin encuadernación')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="precio-desglose-individual">
                        <h5>💰 Desglose de precio</h5>
                        <div class="precio-grid">
                            <div class="precio-item">
                                <span>Tamaño base:</span>
                                <span>$${(precios.tamaño[config.tamaño_papel] || 0).toFixed(2)}</span>
                            </div>
                            <div class="precio-item">
                                <span>Papel:</span>
                                <span>$${(precios.papel[config.tipo_papel] || 0).toFixed(2)}</span>
                            </div>
                            <div class="precio-item">
                                <span>Color:</span>
                                <span>$${(precios.color[config.color] || 0).toFixed(2)}</span>
                            </div>
                            <div class="precio-item">
                                <span>Encuadernación:</span>
                                <span>$${(precios.encuadernacion[config.encuadernacion] || 0).toFixed(2)}</span>
                            </div>
                            <div class="precio-item">
                                <span>Tipo de faz:</span>
                                <span>$${(precios.faz[config.tipo_faz] || 0).toFixed(2)}</span>
                            </div>
                            <div class="precio-item unitario">
                                <span><strong>Precio unitario:</strong></span>
                                <span><strong>$${((precios.tamaño[config.tamaño_papel] || 0) + (precios.papel[config.tipo_papel] || 0) + (precios.color[config.color] || 0) + (precios.encuadernacion[config.encuadernacion] || 0) + (precios.faz[config.tipo_faz] || 0)).toFixed(2)}</strong></span>
                            </div>
                            <div class="precio-item cantidad">
                                <span>Cantidad:</span>
                                <span>× ${config.cantidad}</span>
                            </div>
                            <div class="precio-item total">
                                <span><strong>Total archivo:</strong></span>
                                <span><strong>$${precioArchivo.toFixed(2)}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </details>
        `;
    });    detallePedido.innerHTML = htmlResumen;

    // Establecer el total original (sin comisiones)
    totalOriginal = totalPedido;

    // Actualizar totales iniciales
    actualizarTotales('transferencia');

    // Actualizar el texto del summary con el número de archivos
    const textoResumen = document.querySelector('.texto-resumen');
    if (textoResumen) {
        textoResumen.textContent = `Ver detalles del pedido (${datosPedido.archivos.length} ${datosPedido.archivos.length === 1 ? 'archivo' : 'archivos'})`;
    }

    // Configurar eventos para los details después de crearlos
    setTimeout(() => {
        const archivosDetails = document.querySelectorAll('.archivo-resumen');
        archivosDetails.forEach((detail, index) => {
            detail.addEventListener('toggle', function() {
                console.log(`Archivo ${index + 1}:`, this.open ? 'expandido' : 'colapsado');
                localStorage.setItem(`pago_archivo_${index}_expandido`, this.open);
            });
            
            // Restaurar estado previo
            const estadoPrevio = localStorage.getItem(`pago_archivo_${index}_expandido`);
            if (estadoPrevio === 'false') {
                detail.open = false;
            }
        });
    }, 100);
}

// ===== FUNCIONES DE CÁLCULO DE TOTALES =====
function calcularTotalConComision(metodoPago) {
    if (metodoPago === 'mercadopago') {
        return totalOriginal * (1 + COMISION_MERCADOPAGO);
    }
    return totalOriginal;
}

function actualizarTotales(metodoPago = null) {
    const metodoPagoSeleccionado = metodoPago || document.querySelector('input[name="metodo_pago"]:checked')?.value || 'transferencia';
    const totalFinal = calcularTotalConComision(metodoPagoSeleccionado);
    
    // Actualizar elementos del DOM
    const totalFinalElement = document.getElementById('total-final');
    const montoBotonElement = document.getElementById('monto-boton');
    
    if (totalFinalElement) {
        totalFinalElement.textContent = totalFinal.toFixed(2);
    }
    if (montoBotonElement) {
        montoBotonElement.textContent = totalFinal.toFixed(2);
    }
    
    // Actualizar clase visual si es MercadoPago
    const totalPedidoDiv = document.querySelector('.total-pedido');
    if (totalPedidoDiv) {
        if (metodoPagoSeleccionado === 'mercadopago') {
            totalPedidoDiv.classList.add('con-comision');
        } else {
            totalPedidoDiv.classList.remove('con-comision');
        }
    }
}

// ===== GESTIÓN DE MÉTODOS DE PAGO =====
function configurarEventosMetodoPago() {
    const radioTransferencia = document.getElementById('transferencia');
    const radioMercadoPago = document.getElementById('mercadopago');
    const detallesTransferencia = document.getElementById('detalles-transferencia');
    const btnProcesarPago = document.getElementById('btn-procesar-pago');
    const walletContainer = document.getElementById('wallet_container');
    const accionesPago = document.querySelector('.acciones-pago');    if (radioTransferencia) {
        radioTransferencia.addEventListener('change', function() {
            if (this.checked) {
                if (detallesTransferencia) detallesTransferencia.style.display = 'block';
                if (btnProcesarPago) btnProcesarPago.style.display = 'block';
                if (walletContainer) walletContainer.style.display = 'none';
                if (accionesPago) {
                    accionesPago.classList.add('show');
                    accionesPago.classList.remove('wallet-active');
                }
                actualizarTotales('transferencia');
            }
        });
    }    if (radioMercadoPago) {
        radioMercadoPago.addEventListener('change', function() {
            if (this.checked) {
                if (detallesTransferencia) detallesTransferencia.style.display = 'none';
                if (btnProcesarPago) btnProcesarPago.style.display = 'none';
                if (walletContainer) {
                    walletContainer.style.display = 'flex';
                    walletContainer.style.flexDirection = 'column';
                    walletContainer.style.justifyContent = 'center';
                }
                if (accionesPago) {
                    accionesPago.classList.add('show');
                    accionesPago.classList.add('wallet-active');
                }
                
                actualizarTotales('mercadopago');
            }
        });
    }
}

// ===== FUNCIONES DE MODAL =====
function showModal(type, title, message, onConfirm = null) {
    const modal = document.getElementById('modal');
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalActions = document.getElementById('modal-actions');

    // Configurar iconos según el tipo
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        confirm: '❓'
    };

    modalIcon.textContent = icons[type] || icons.info;
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;    // Configurar botones según el tipo
    if (type === 'confirm') {
        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="handleConfirm()">Confirmar</button>
        `;
        // Guardar la función de confirmación globalmente
        window.currentConfirmAction = onConfirm;
    } else if (onConfirm) {
        // Si hay una función de confirmación, cambiar el texto del botón
        modalActions.innerHTML = `
            <button class="btn btn-primary" onclick="handleConfirm()">Entendido, ir al inicio</button>
        `;
        window.currentConfirmAction = onConfirm;
    } else {
        modalActions.innerHTML = `
            <button class="btn btn-primary" onclick="closeModal()">Aceptar</button>
        `;
    }

    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Enfocar el primer botón para accesibilidad
    setTimeout(() => {
        const firstButton = modalActions.querySelector('button');
        if (firstButton) firstButton.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    window.currentConfirmAction = null;
}

function handleConfirm() {
    if (window.currentConfirmAction) {
        window.currentConfirmAction();
    }
    closeModal();
}

function volverACrearPedido() {
    showModal('confirm', 'Volver a Editar Pedido', 
        '¿Estás seguro de que quieres volver a editar el pedido?<br><br><strong>Los datos de pago se perderán.</strong>', 
        () => {
            window.location.href = '../orders/crearPedido.html';
        }
    );
}

// ===== PROCESAMIENTO DE PAGO =====
function procesarPago(event) {
    event.preventDefault();

    const metodoPago = document.querySelector('input[name="metodo_pago"]:checked');

    if (!metodoPago) {
        mostrarMensaje('Por favor selecciona un método de pago.', 'error');
        return;
    }

    // Validación específica para transferencia
    if (metodoPago.value === 'transferencia') {
        if (!archivoComprobante) {
            mostrarMensaje('Debes subir el comprobante de transferencia en formato PDF.', 'error');
            return;
        }
    }

    // Preparar datos para envío
    const datosCompletos = {
        ...datosPedido,
        metodoPago: metodoPago.value,
        total: totalPedido,
        numeroPedido: 'CP-' + Date.now(),
        comprobante: archivoComprobante ? {
            nombre: archivoComprobante.name,
            tamaño: archivoComprobante.size,
            tipo: archivoComprobante.type
        } : null
    };

    // Guardar en localStorage
    localStorage.setItem('pagoCompleto', JSON.stringify(datosCompletos));

    console.log('Procesando pago:', datosCompletos);    if (metodoPago.value === 'transferencia') {
        // Mostrar modal de confirmación para transferencia usando el sistema existente
        showModal('success', '⏳ Pago Pendiente de Revisión', 
            `<div style="text-align: left;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3 style="color: #059669; margin: 0;">¡Tu pedido ha sido registrado!</h3>
                </div>
                
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
                    <div style="margin-bottom: 8px;">
                        <strong>📋 Número de pedido:</strong> ${datosCompletos.numeroPedido}
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong>💰 Total:</strong> $${totalPedido.toFixed(2)}
                    </div>
                    <div>
                        <strong>📎 Comprobante:</strong> ${archivoComprobante ? archivoComprobante.name : 'Sin comprobante'}
                    </div>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
                    <div style="margin-bottom: 8px; color: #92400e;">
                        <strong>📋 Estado:</strong> Pendiente de revisión
                    </div>
                    <p style="margin: 8px 0; color: #92400e;">
                        Hemos recibido tu comprobante de transferencia. Nuestro equipo lo revisará en un plazo de <strong>24-48 horas</strong>.
                    </p>
                    <p style="margin: 8px 0; color: #92400e;">
                        📧 Te enviaremos una confirmación por email cuando procesemos tu pago.
                    </p>
                </div>

                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h5 style="color: #1e40af; margin: 0 0 12px 0;">📝 Próximos pasos:</h5>
                    <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                        <li style="margin-bottom: 4px;">✓ Comprobante recibido y guardado</li>
                        <li style="margin-bottom: 4px;">⏳ Verificación del pago (24-48h)</li>
                        <li style="margin-bottom: 4px;">📧 Confirmación por email</li>
                        <li style="margin-bottom: 4px;">🖨️ Procesamiento de impresión</li>
                        <li style="margin-bottom: 4px;">📦 Notificación de pedido listo</li>
                    </ul>
                </div>
            </div>`,            () => {
                // Función que se ejecuta al hacer clic en "Aceptar"
                window.location.href = '../../index.html';
            }
        );

    } else if (metodoPago.value === 'mercadopago') {
        // Simular redirección a MercadoPago
        mostrarMensaje('Redirigiendo a MercadoPago...', 'info');

        // Por ahora simulamos éxito
        setTimeout(() => {
            mostrarMensaje('¡Pago procesado exitosamente!', 'success');        setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1000);}, 2000);
    }
}

// ===== EVENTOS PARA DETALLES =====
function configurarEventosDetalles() {
    const detallesPedido = document.querySelector('.detalles-pedido');

    if (detallesPedido) {
        detallesPedido.addEventListener('toggle', function() {
            // Guardar el estado del desplegable en localStorage
            localStorage.setItem('detallesPedidoAbierto', this.open);
            console.log('Detalles del pedido:', this.open ? 'abierto' : 'cerrado');
        });

        // Restaurar estado previo si existe
        const estadoPrevio = localStorage.getItem('detallesPedidoAbierto');
        if (estadoPrevio === 'false') {
            detallesPedido.open = false;
        }
    }

    // Configurar eventos para desplegables individuales de archivos
    setTimeout(() => {
        const archivosDetails = document.querySelectorAll('.archivo-resumen');
        archivosDetails.forEach((detail, index) => {
            detail.addEventListener('toggle', function() {
                console.log(`Archivo ${index + 1}:`, this.open ? 'expandido' : 'colapsado');
                localStorage.setItem(`archivo_${index}_expandido`, this.open);
            });
        });
    }, 500);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando página de pago...');
    
    // Configurar eventos del modal
    const modal = document.getElementById('modal');
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Cerrar modal al hacer clic en el overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    cargarDatosPedido();
    configurarEventosMetodoPago();
    configurarEventosDetalles();
    configurarEventosComprobante();

    // Configurar evento de envío del formulario
    const formularioPago = document.getElementById('formulario-pago');
    if (formularioPago) {
        formularioPago.addEventListener('submit', procesarPago);
    }
    
    console.log('Página de pago inicializada correctamente');
});