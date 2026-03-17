// ===== VARIABLES GLOBALES =====
let archivosSubidos = [];
let indiceActual = 0;
let configuracionesGuardadas = {};

// ===== CONFIGURACIÓN DE PRECIOS =====
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

// ===== FUNCIONES DE CÁLCULO DE PRECIOS =====
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

function calcularPrecioTotal() {
    let total = 0;
    for (let i = 0; i < archivosSubidos.length; i++) {
        const config = configuracionesGuardadas[i];
        if (config) {
            total += calcularPrecioArchivo(config);
        }
    }
    return total;
}

// ===== FUNCIONES DE CONFIGURACIÓN =====
function obtenerConfiguracionActual() {
    const indice = indiceActual;

    try {
        const cantidadInput = document.getElementById(`cantidad_${indice}`);
        const rangoSelect = document.getElementById(`rango_paginas_${indice}`);
        const paginasInput = document.getElementById(`paginas_especificas_${indice}`);
        const tipoPapelChecked = document.querySelector(`input[name="tipo_papel_${indice}"]:checked`);
        const tamañoChecked = document.querySelector(`input[name="tamaño_papel_${indice}"]:checked`);
        const colorChecked = document.querySelector(`input[name="color_${indice}"]:checked`);
        const encuadernacionChecked = document.querySelector(`input[name="encuadernacion_${indice}"]:checked`);
        const tipoFazChecked = document.querySelector(`input[name="tipo_faz_${indice}"]:checked`);

        return {
            cantidad: cantidadInput ? cantidadInput.value : '1',
            rango_paginas: rangoSelect ? rangoSelect.value : 'todas',
            paginas_especificas: paginasInput ? paginasInput.value : '',
            tipo_papel: tipoPapelChecked ? tipoPapelChecked.value : 'normal',
            tamaño_papel: tamañoChecked ? tamañoChecked.value : 'a4',
            color: colorChecked ? colorChecked.value : 'blanco',
            encuadernacion: encuadernacionChecked ? encuadernacionChecked.value : 'sin',
            tipo_faz: tipoFazChecked ? tipoFazChecked.value : 'doble'
        };
    } catch (error) {
        console.error('Error al obtener configuración actual:', error);
        return {
            cantidad: '1',
            rango_paginas: 'todas',
            paginas_especificas: '',
            tipo_papel: 'normal',
            tamaño_papel: 'a4',
            color: 'blanco',
            encuadernacion: 'sin',
            tipo_faz: 'doble'
        };
    }
}

function guardarConfiguracionActual() {
    const config = obtenerConfiguracionActual();
    configuracionesGuardadas[indiceActual] = config;
    console.log(`Configuración guardada para archivo ${indiceActual}:`, config);
}

function cargarConfiguracion(indice) {
    const config = configuracionesGuardadas[indice];
    if (!config) return;

    setTimeout(() => {
        // Cargar valores de inputs
        const cantidadInput = document.getElementById(`cantidad_${indice}`);
        const rangoSelect = document.getElementById(`rango_paginas_${indice}`);
        const paginasInput = document.getElementById(`paginas_especificas_${indice}`);

        if (cantidadInput) cantidadInput.value = config.cantidad;
        if (rangoSelect) rangoSelect.value = config.rango_paginas;
        if (config.paginas_especificas && paginasInput) {
            paginasInput.value = config.paginas_especificas;
        }

        // Configurar radio buttons
        const tipoPapelRadio = document.querySelector(`input[name="tipo_papel_${indice}"][value="${config.tipo_papel}"]`);
        const tamañoRadio = document.querySelector(`input[name="tamaño_papel_${indice}"][value="${config.tamaño_papel}"]`);
        const colorRadio = document.querySelector(`input[name="color_${indice}"][value="${config.color}"]`);
        const encuadernacionRadio = document.querySelector(`input[name="encuadernacion_${indice}"][value="${config.encuadernacion}"]`);
        const tipoFazRadio = document.querySelector(`input[name="tipo_faz_${indice}"][value="${config.tipo_faz}"]`);

        if (tipoPapelRadio) tipoPapelRadio.checked = true;
        if (tamañoRadio) tamañoRadio.checked = true;
        if (colorRadio) colorRadio.checked = true;
        if (encuadernacionRadio) encuadernacionRadio.checked = true;
        if (tipoFazRadio) tipoFazRadio.checked = true;

        // Mostrar rango personalizado si es necesario
        if (config.rango_paginas === 'personalizado') {
            const rangoPersonalizado = document.querySelector(`.rango-personalizado-${indice}`);
            if (rangoPersonalizado) {
                rangoPersonalizado.style.display = 'block';
                if (paginasInput) paginasInput.required = true;
            }
        }
    }, 200);
}

// ===== FUNCIONES DE INTERFAZ =====
function generarConfiguracionArchivo(nombreArchivo, indice) {
    return `
        <div class="archivo-actual-info">
            <h4>📄 ${nombreArchivo}</h4>
        </div>
        
        <div class="configuracion-form">
            <!-- Configuración básica -->
            <details class="seccion-config" open>
                <summary class="config-titulo">
                    <span class="icono-config">⚙️</span>
                    <span>Configuración básica</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <div class="inputs-numericos">
                        <div class="input-group">
                            <label>Cantidad de copias:</label>
                            <input type="number" id="cantidad_${indice}" name="cantidad_${indice}" min="1" value="1" required>
                        </div>
                        <div class="input-group">
                            <label>Páginas a imprimir:</label>
                            <select id="rango_paginas_${indice}" name="rango_paginas_${indice}" class="select-paginas" data-index="${indice}" required>
                                <option value="todas" selected>Todas las páginas</option>
                                <option value="personalizado">Rango personalizado</option>
                            </select>
                        </div>
                        <div class="input-group rango-personalizado-${indice}" style="display: none;">
                            <label>Especificar páginas:</label>
                            <input type="text" id="paginas_especificas_${indice}" name="paginas_especificas_${indice}" 
                                   placeholder="Ej: 1-5, 8, 10-12">
                            <small class="range-info">Formato: páginas individuales (1,3,5) o rangos (1-5,8-10)</small>
                        </div>
                    </div>
                </div>
            </details>

            <!-- Tipo de papel -->
            <details class="seccion-config">
                <summary class="config-titulo">
                    <span class="icono-config">📄</span>
                    <span>Tipo de papel</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <fieldset>
                        <div class="radio-group">
                            <label><input type="radio" name="tipo_papel_${indice}" value="normal" checked required> Normal</label>
                            <label><input type="radio" name="tipo_papel_${indice}" value="reciclado" required> Reciclado (+$2)</label>
                            <label><input type="radio" name="tipo_papel_${indice}" value="fotográfico" required> Fotográfico (+$5)</label>
                        </div>
                    </fieldset>
                </div>
            </details>

            <!-- Tamaño de papel -->
            <details class="seccion-config">
                <summary class="config-titulo">
                    <span class="icono-config">📐</span>
                    <span>Tamaño de papel</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <fieldset>
                        <div class="radio-group">
                            <label><input type="radio" name="tamaño_papel_${indice}" value="a4" checked required> A4 ($10)</label>
                            <label><input type="radio" name="tamaño_papel_${indice}" value="a3" required> A3 ($15)</label>
                            <label><input type="radio" name="tamaño_papel_${indice}" value="a5" required> A5 ($8)</label>
                            <label><input type="radio" name="tamaño_papel_${indice}" value="oficio" required> Oficio ($12)</label>
                        </div>
                    </fieldset>
                </div>
            </details>

            <!-- Opciones de impresión -->
            <details class="seccion-config">
                <summary class="config-titulo">
                    <span class="icono-config">🎨</span>
                    <span>Opciones de impresión</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <fieldset>
                        <legend>Color:</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="color_${indice}" value="blanco" checked required> Blanco y Negro</label>
                            <label><input type="radio" name="color_${indice}" value="color" required> Color (+$10)</label>
                        </div>
                    </fieldset>
                    
                    <fieldset>
                        <legend>Tipo de faz:</legend>
                        <div class="radio-group">
                            <label><input type="radio" name="tipo_faz_${indice}" value="simple" required> Simple Faz</label>
                            <label><input type="radio" name="tipo_faz_${indice}" value="doble" checked required> Doble Faz (+$5)</label>
                        </div>
                    </fieldset>
                </div>
            </details>

            <!-- Encuadernación -->
            <details class="seccion-config">
                <summary class="config-titulo">
                    <span class="icono-config">📚</span>
                    <span>Encuadernación</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <fieldset>
                        <div class="radio-group">
                            <label><input type="radio" name="encuadernacion_${indice}" value="sin" checked required> Sin Encuadernación</label>
                            <label><input type="radio" name="encuadernacion_${indice}" value="anillado_corto" required> Anillado Corto (+$5)</label>
                            <label><input type="radio" name="encuadernacion_${indice}" value="anillado_largo" required> Anillado Largo (+$8)</label>
                        </div>
                    </fieldset>
                </div>
            </details>
            
            <!-- Desglose de precio -->
            <details class="seccion-config precio-section" open>
                <summary class="config-titulo precio-titulo">
                    <span class="icono-config">💰</span>
                    <span>Desglose de precio</span>
                    <span class="flecha">▼</span>
                </summary>
                <div class="config-contenido">
                    <div class="precio-detalle">
                        <div class="precio-linea">
                            <span>Tamaño base:</span>
                            <span id="precio-tamaño-${indice}">$10.00</span>
                        </div>
                        <div class="precio-linea">
                            <span>Tipo de papel:</span>
                            <span id="precio-papel-${indice}">$0.00</span>
                        </div>
                        <div class="precio-linea">
                            <span>Color:</span>
                            <span id="precio-color-${indice}">$0.00</span>
                        </div>
                        <div class="precio-linea">
                            <span>Encuadernación:</span>
                            <span id="precio-encuadernacion-${indice}">$0.00</span>
                        </div>
                        <div class="precio-linea">
                            <span>Tipo de faz:</span>
                            <span id="precio-faz-${indice}">$5.00</span>
                        </div>
                        <hr>
                        <div class="precio-linea total-unitario">
                            <span><strong>Precio unitario:</strong></span>
                            <span id="precio-unitario-${indice}"><strong>$15.00</strong></span>
                        </div>
                        <div class="precio-linea">
                            <span>Cantidad:</span>
                            <span id="cantidad-display-${indice}">1</span>
                        </div>
                        <div class="precio-linea total-archivo">
                            <span><strong>Total archivo:</strong></span>
                            <span id="total-archivo-${indice}"><strong>$15.00</strong></span>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    `;
}

function mostrarArchivoActual() {
    const archivo = archivosSubidos[indiceActual];
    const configuracionHTML = generarConfiguracionArchivo(archivo.name, indiceActual);
    document.getElementById('configuracion-actual').innerHTML = configuracionHTML;

    // Actualizar progreso
    document.getElementById('archivo-actual').textContent = indiceActual + 1;
    const progreso = ((indiceActual + 1) / archivosSubidos.length) * 100;
    document.getElementById('barra-progreso').style.width = progreso + '%';

    // Configurar eventos después de que el HTML se haya insertado
    setTimeout(() => {
        configurarEventosPaginas();
        configurarEventosPrecios();
        configurarEventosDetails();
        cargarConfiguracion(indiceActual);
        
        // Actualizar precios después de cargar configuración
        setTimeout(() => {
            actualizarPreciosDetallados();
            actualizarPreciosGlobales();
        }, 100);
    }, 100);

    // Actualizar botones
    actualizarBotones();
    console.log(`Archivo ${indiceActual + 1} mostrado: ${archivo.name}`);
}

function actualizarBotones() {
    document.getElementById('btn-anterior').disabled = indiceActual === 0;

    if (indiceActual === archivosSubidos.length - 1) {
        document.getElementById('btn-siguiente').style.display = 'none';
        document.getElementById('btn-finalizar').style.display = 'inline-block';
    } else {
        document.getElementById('btn-siguiente').style.display = 'inline-block';
        document.getElementById('btn-finalizar').style.display = 'none';
    }
}

// ===== FUNCIONES DE NAVEGACIÓN =====
function anteriorArchivo() {
    if (indiceActual > 0) {
        guardarConfiguracionActual();
        indiceActual--;
        mostrarArchivoActual();
        setTimeout(() => {
            actualizarPreciosGlobales();
        }, 200);
    }
}

function siguienteArchivo() {
    if (indiceActual < archivosSubidos.length - 1) {
        guardarConfiguracionActual();
        indiceActual++;
        mostrarArchivoActual();
        setTimeout(() => {
            actualizarPreciosGlobales();
        }, 200);
    }
}

// ===== FUNCIONES DE ACTUALIZACIÓN DE PRECIOS =====
function actualizarPreciosGlobales() {
    guardarConfiguracionActual();
    const precioTotal = calcularPrecioTotal();
    const configActual = configuracionesGuardadas[indiceActual] || obtenerConfiguracionActual();
    const precioArchivo = calcularPrecioArchivo(configActual);

    const elementoPrecioArchivo = document.getElementById('precio-archivo');
    const elementoPrecioTotal = document.getElementById('precio-total');

    if (elementoPrecioArchivo) {
        elementoPrecioArchivo.textContent = precioArchivo.toFixed(2);
    }
    if (elementoPrecioTotal) {
        elementoPrecioTotal.textContent = precioTotal.toFixed(2);
    }
}

function actualizarPreciosDetallados() {
    const indice = indiceActual;
    const config = obtenerConfiguracionActual();

    // Calcular precios individuales
    const precioTamaño = precios.tamaño[config.tamaño_papel] || 0;
    const precioPapel = precios.papel[config.tipo_papel] || 0;
    const precioColor = precios.color[config.color] || 0;
    const precioEncuadernacion = precios.encuadernacion[config.encuadernacion] || 0;
    const precioFaz = precios.faz[config.tipo_faz] || 0;
    const cantidad = parseInt(config.cantidad) || 1;

    const precioUnitario = precioTamaño + precioPapel + precioColor + precioEncuadernacion + precioFaz;
    const precioTotal = precioUnitario * cantidad;

    // Actualizar elementos del desglose
    const elementos = {
        [`precio-tamaño-${indice}`]: precioTamaño.toFixed(2),
        [`precio-papel-${indice}`]: precioPapel.toFixed(2),
        [`precio-color-${indice}`]: precioColor.toFixed(2),
        [`precio-encuadernacion-${indice}`]: precioEncuadernacion.toFixed(2),
        [`precio-faz-${indice}`]: precioFaz.toFixed(2),
        [`precio-unitario-${indice}`]: precioUnitario.toFixed(2),
        [`cantidad-display-${indice}`]: cantidad.toString(),
        [`total-archivo-${indice}`]: precioTotal.toFixed(2)
    };

    // Actualizar DOM
    Object.entries(elementos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (id.includes('precio-') || id.includes('total-')) {
                elemento.textContent = `$${valor}`;
            } else {
                elemento.textContent = valor;
            }
        }
    });

    // Actualizar precios globales
    actualizarPreciosGlobales();
}

// ===== FUNCIONES DE CONFIGURACIÓN DE EVENTOS =====
function configurarEventosPaginas() {
    const select = document.querySelector('.select-paginas');
    if (select) {
        select.addEventListener('change', function () {
            const indice = this.dataset.index;
            const rangoPersonalizado = document.querySelector(`.rango-personalizado-${indice}`);
            const inputEspecificas = document.querySelector(`input[name="paginas_especificas_${indice}"]`);

            if (this.value === 'personalizado') {
                rangoPersonalizado.style.display = 'block';
                inputEspecificas.required = true;
            } else {
                rangoPersonalizado.style.display = 'none';
                inputEspecificas.required = false;
                inputEspecificas.value = '';
            }
            actualizarPreciosDetallados();
        });
    }
}

function configurarEventosPrecios() {
    const indice = indiceActual;
    const cantidadInput = document.getElementById(`cantidad_${indice}`);
    const rangoSelect = document.getElementById(`rango_paginas_${indice}`);

    let timeoutCantidad;

    // Eventos para inputs numéricos
    if (cantidadInput) {
        cantidadInput.addEventListener('input', function () {
            clearTimeout(timeoutCantidad);
            timeoutCantidad = setTimeout(() => {
                actualizarPreciosDetallados();
            }, 300);
        });

        cantidadInput.addEventListener('change', actualizarPreciosDetallados);

        cantidadInput.addEventListener('blur', function () {
            if (parseInt(this.value) < 1 || !this.value) {
                this.value = 1;
                actualizarPreciosDetallados();
            }
        });
    }

    // Eventos para select de páginas
    if (rangoSelect) {
        rangoSelect.addEventListener('change', actualizarPreciosDetallados);
    }

    // Eventos para radio buttons
    const radioButtons = document.querySelectorAll(`input[name="tipo_papel_${indice}"], input[name="tamaño_papel_${indice}"], input[name="color_${indice}"], input[name="encuadernacion_${indice}"], input[name="tipo_faz_${indice}"]`);
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            const elemento = document.getElementById(`total-archivo-${indice}`);
            if (elemento) {
                elemento.classList.add('precio-actualizado');
                setTimeout(() => {
                    elemento.classList.remove('precio-actualizado');
                }, 600);
            }
            actualizarPreciosDetallados();
        });
    });
}

function configurarEventosDetails() {
    const details = document.querySelectorAll('.seccion-config');
    
    details.forEach(detail => {
        detail.addEventListener('toggle', function() {
            const seccionNombre = this.querySelector('.config-titulo span:nth-child(2)').textContent;
            console.log(`Sección ${seccionNombre}:`, this.open ? 'abierta' : 'cerrada');
            
            // Guardar estado en localStorage
            localStorage.setItem(`seccion_${seccionNombre}_${indiceActual}`, this.open);
        });
    });
}

// ===== FUNCIONES DE MODAL =====
function showModal(type, title, message, onConfirm = null) {
    const modal = document.getElementById('modal');
    const modalDialog = modal.querySelector('.modal-dialog');
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
    modalMessage.innerHTML = message;

    // Agregar clase especial para modal de resumen
    if (message.includes('resumen-pedido')) {
        modalDialog.classList.add('resumen-modal');
    } else {
        modalDialog.classList.remove('resumen-modal');
    }

    // Configurar botones según el tipo
    if (type === 'confirm') {
        modalActions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="handleConfirm()">Confirmar</button>
        `;
        // Guardar la función de confirmación globalmente
        window.currentConfirmAction = onConfirm;
    } else {
        modalActions.innerHTML = `
            <button class="btn btn-primary" onclick="closeModal()">Aceptar</button>
        `;
    }

    modal.style.display = 'flex';
    
    // Enfocar el primer botón para accesibilidad
    setTimeout(() => {
        const firstButton = modalActions.querySelector('button');
        if (firstButton) firstButton.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalDialog = modal.querySelector('.modal-dialog');
    modal.style.display = 'none';
    modalDialog.classList.remove('resumen-modal');
    window.currentConfirmAction = null;
}

function handleConfirm() {
    if (window.currentConfirmAction) {
        window.currentConfirmAction();
    }
    closeModal();
}

// ===== FUNCIÓN PARA PROCESAR PEDIDO =====
function pagarPedido() {
    guardarConfiguracionActual();

    // Validar que todos los archivos tengan configuración
    let todosProcesados = true;
    for (let i = 0; i < archivosSubidos.length; i++) {
        if (!configuracionesGuardadas[i]) {
            todosProcesados = false;
            break;
        }
    }

    if (!todosProcesados) {
        showModal('warning', 'Configuración Incompleta', 
            'Por favor completa la configuración de todos los archivos antes de continuar.');
        return;
    }    // Preparar datos del pedido
    const datosPedido = {
        archivos: archivosSubidos.map(archivo => archivo.name),
        configuraciones: configuracionesGuardadas,
        precioTotal: calcularPrecioTotal(),
        timestamp: new Date().toISOString()
    };

    // Guardar en localStorage para usar en la página de pago
    localStorage.setItem('pedidoActual', JSON.stringify(datosPedido));
    console.log('Datos del pedido guardados:', datosPedido);    // Enviar datos por POST a la página de pago
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '../payments/pagarPedido.php';
    
    // Agregar campos al formulario
    const inputPrecioTotal = document.createElement('input');
    inputPrecioTotal.type = 'hidden';
    inputPrecioTotal.name = 'precio_total';
    inputPrecioTotal.value = datosPedido.precioTotal;
    form.appendChild(inputPrecioTotal);
    
    const inputDatosPedido = document.createElement('input');
    inputDatosPedido.type = 'hidden';
    inputDatosPedido.name = 'datos_pedido';
    inputDatosPedido.value = JSON.stringify(datosPedido);
    form.appendChild(inputDatosPedido);
    
    // Enviar formulario
    document.body.appendChild(form);
    form.submit();
}

// ===== EVENTOS PRINCIPALES =====
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos de modal
    const modal = document.getElementById('modal');
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });    // Cerrar modal haciendo clic en el overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Función para actualizar la interfaz de upload cuando se seleccionan archivos
    function actualizarInterfazUpload() {
        const archivosInput = document.getElementById('archivos');
        const uploadIcon = document.querySelector('.upload-icon');
        const uploadText = document.querySelector('.upload-text');
        const archivosUpload = document.querySelector('.archivos-upload');
        
        if (archivosInput && archivosInput.files.length > 0) {
            // Cambiar a estado "archivos seleccionados"
            if (archivosUpload) archivosUpload.classList.add('archivos-seleccionados');
            if (uploadIcon) uploadIcon.textContent = '✅';
            if (uploadText) {
                uploadText.innerHTML = `
                    <strong>¡${archivosInput.files.length} archivo(s) seleccionado(s)!</strong>
                    <br>
                    <small>Haz clic para cambiar los archivos</small>
                `;
            }
        } else {
            // Volver al estado inicial
            if (archivosUpload) archivosUpload.classList.remove('archivos-seleccionados');
            if (uploadIcon) uploadIcon.textContent = '📄';            if (uploadText) {
                uploadText.innerHTML = `
                    <strong>Seleccionar archivos</strong>
                    <br>
                    <small>Haz clic aquí o arrastra tus archivos</small>
                `;
            }
        }
    }

    // Configurar drag and drop
    function configurarDragAndDrop() {
        const uploadLabel = document.querySelector('.upload-label');
        const archivosUpload = document.querySelector('.archivos-upload');
        const archivosInput = document.getElementById('archivos');

        if (!uploadLabel || !archivosUpload || !archivosInput) return;

        // Prevenir comportamiento predeterminado para todos los eventos de drag
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Destacar área de drop cuando se arrastra sobre ella
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, () => {
                archivosUpload.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, () => {
                archivosUpload.classList.remove('drag-over');
            }, false);
        });

        // Manejar archivos soltados
        uploadLabel.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            // Asignar archivos al input
            archivosInput.files = files;

            // Disparar evento change
            const event = new Event('change', { bubbles: true });
            archivosInput.dispatchEvent(event);
        }
    }

    // Inicializar drag and drop
    configurarDragAndDrop();

    // Evento para manejar la selección de archivos
    document.getElementById('archivos').addEventListener('change', function (e) {
        const archivos = Array.from(e.target.files);
        archivosSubidos = archivos;
        indiceActual = 0;
        configuracionesGuardadas = {};

        // Actualizar interfaz de upload
        actualizarInterfazUpload();

        console.log('Archivos seleccionados:', archivos.map(f => f.name));

        if (archivos.length > 0) {
            document.getElementById('archivos-detalles').style.display = 'block';
            document.getElementById('total-archivos').textContent = archivos.length;
            mostrarArchivoActual();
            console.log('Sistema paginado inicializado con', archivos.length, 'archivos');
        } else {
            document.getElementById('archivos-detalles').style.display = 'none';
            console.log('No se seleccionaron archivos');
        }
    });

    // Evento para manejar envío del formulario
    document.getElementById('formulario-crear-pedido').addEventListener('submit', function (e) {
        e.preventDefault();
        guardarConfiguracionActual();

        // Validar que todos los archivos tengan configuración
        let todosProcesados = true;
        for (let i = 0; i < archivosSubidos.length; i++) {
            if (!configuracionesGuardadas[i]) {
                todosProcesados = false;
                break;
            }
        }        if (!todosProcesados) {
            showModal('warning', 'Configuración Incompleta', 
                'Por favor completa la configuración de todos los archivos antes de continuar.');
            return;
        }

        // Mostrar resumen antes de procesar
        let resumen = 'Resumen del pedido:\n\n';
        let totalPedido = 0;

        archivosSubidos.forEach((archivo, indice) => {
            const config = configuracionesGuardadas[indice];
            const precioArchivo = calcularPrecioArchivo(config);
            totalPedido += precioArchivo;

            resumen += `📄 ${archivo.name}\n`;
            resumen += `   • ${config.cantidad} copias\n`;
            resumen += `   • ${config.rango_paginas === 'todas' ? 'Todas las páginas' : 'Páginas: ' + config.paginas_especificas}\n`;
            resumen += `   • Papel: ${config.tipo_papel} ${config.tamaño_papel.toUpperCase()}\n`;
            resumen += `   • ${config.color === 'blanco' ? 'Blanco y Negro' : 'Color'}\n`;
            resumen += `   • Encuadernación: ${config.encuadernacion.replace('_', ' ')}\n`;
            resumen += `   • Tipo de faz: ${config.tipo_faz}\n`;
            resumen += `   • Precio: $${precioArchivo.toFixed(2)}\n\n`;
        });

        resumen += `💰 TOTAL DEL PEDIDO: $${totalPedido.toFixed(2)}\n\n`;        console.log('Configuraciones finales:', configuracionesGuardadas);
        console.log('Archivos:', archivosSubidos.map(f => f.name));
        console.log('Total del pedido:', totalPedido);

        // Mostrar modal de confirmación con resumen
        showModal('confirm', 'Confirmar Pedido', 
            `<div class="resumen-pedido">
                <p><strong>Resumen del pedido:</strong></p>
                <div class="resumen-detalle">
                    ${archivosSubidos.map((archivo, indice) => {
                        const config = configuracionesGuardadas[indice];
                        const precioArchivo = calcularPrecioArchivo(config);
                        return `
                            <div class="archivo-resumen">
                                <h4>📄 ${archivo.name}</h4>
                                <ul>
                                    <li><strong>Cantidad:</strong> ${config.cantidad} copias</li>
                                    <li><strong>Páginas:</strong> ${config.rango_paginas === 'todas' ? 'Todas las páginas' : config.paginas_especificas}</li>
                                    <li><strong>Papel:</strong> ${config.tipo_papel} ${config.tamaño_papel.toUpperCase()}</li>
                                    <li><strong>Color:</strong> ${config.color === 'blanco' ? 'Blanco y Negro' : 'Color'}</li>
                                    <li><strong>Encuadernación:</strong> ${config.encuadernacion.replace('_', ' ')}</li>
                                    <li><strong>Tipo de faz:</strong> ${config.tipo_faz}</li>
                                    <li><strong>Precio:</strong> $${precioArchivo.toFixed(2)}</li>
                                </ul>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="total-pedido">
                    <h3>💰 TOTAL DEL PEDIDO: $${totalPedido.toFixed(2)}</h3>
                </div>
            </div>`, 
            () => {
                // Función que se ejecuta al confirmar
                showModal('success', '¡Pedido Creado!', 
                    `¡Tu pedido ha sido creado exitosamente!<br><br>
                     <strong>Total: $${totalPedido.toFixed(2)}</strong><br><br>
                     <small>Pronto te contactaremos para coordinar la entrega.</small>`);
            }
        );
    });
});
