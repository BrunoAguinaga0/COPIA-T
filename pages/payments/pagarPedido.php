<?php

use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;
use MercadoPago\Exceptions\MPApiException; // Importante añadir esto

require '../../vendor/autoload.php';

// Es MUY recomendable usar tus credenciales de PRUEBA (TEST) durante el desarrollo.
// Las de producción (APP_USR) solo para cuando tu sitio esté en vivo.
// Busca tus credenciales de prueba en el panel de desarrolladores de Mercado Pago.
MercadoPagoConfig::setAccessToken(""); // EJ: TEST-2221971343936744...

$client = new PreferenceClient();
$preference = null; // Inicializamos la variable a null

// Obtener datos del pedido enviados por POST
$precioTotal = 1.0; // Valor por defecto
$datosPedido = null;

if (isset($_POST['precio_total']) && is_numeric($_POST['precio_total'])) {
    $precioTotal = floatval($_POST['precio_total']);
}

if (isset($_POST['datos_pedido'])) {
    $datosPedido = json_decode($_POST['datos_pedido'], true);
}

// Si el precio es 0 o negativo, usar valor mínimo
if ($precioTotal <= 0) {
    $precioTotal = 1.0;
}

// Calcular precio con comisión de MercadoPago (6.29%)
$comisionMercadoPago = 0.0629; // 6.29%
$precioConComision = $precioTotal * (1 + $comisionMercadoPago);

try {
    $preference = $client->create([
        "items" => [
            [ 
                "id" => "PEDIDO_COPIA_T",
                "title" => "Servicio de Impresión COPIA-T",
                "quantity" => 1,
                "unit_price" => $precioConComision
            ]
        ],
        "statement_descriptor" => "COPIA-T",
        "external_reference" => "CDP_" . date('YmdHis')
    ]);
} catch (MPApiException $e) {
    // Si la API de Mercado Pago devuelve un error, lo capturamos aquí
    echo "<h3>Error de la API de Mercado Pago:</h3>";
    echo "<pre>";
    // $e->getApiResponse()->getContent() nos da el error detallado que envió Mercado Pago
    print_r($e->getApiResponse()->getContent());
    echo "</pre>";
    die(); // Detenemos la ejecución para no mostrar una página rota
} catch (Exception $e) {
    // Para cualquier otro tipo de error
    echo "<h3>Ocurrió un error:</h3>";
    echo $e->getMessage();
    die();
}

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagar Pedido - COPIA-T</title>    <link rel="stylesheet" href="../../assets/css/pagarPedidoPHP.css">
    <link rel="icon" href="../../assets/images/printer-print-svgrepo-com.svg" type="image/svg+xml">
    <script src="https://sdk.mercadopago.com/js/v2"></script>
</head>

<body>
    <section>
        <article class="pagar-pedido">
            <img src="../../assets/images/printer-print-svgrepo-com.svg" alt="COPIA-T Logo" class="logo">
            <h1>💳 Pagar Pedido - PHP</h1>
            <!-- Resumen del pedido -->
            <div class="resumen-pedido">
                <div class="total-pedido">
                    <h3>💰 Total a pagar: $<span id="total-final">0.00</span></h3>
                </div>

                <details class="detalles-pedido" open>
                    <summary class="resumen-titulo">
                        <span class="icono-resumen">📋</span>
                        <span class="texto-resumen">Ver detalles del pedido</span>
                        <span class="indicador-flecha">▼</span>
                    </summary>
                    <div class="contenido-detalles">
                        <div id="detalle-pedido">
                            <!-- Se carga dinámicamente con JavaScript -->
                        </div>
                    </div>
                </details>
            </div>

            <!-- Métodos de pago -->
            <div class="metodos-pago">
                <h2>🏦 Selecciona tu método de pago</h2>

                <form id="formulario-pago" action="" method="post">
                    <input type="hidden" id="datos-pedido" name="datos-pedido">
                    <div class="opciones-pago">
                        <!-- Transferencia Bancaria -->
                        <div class="metodo-pago transferencia">
                            <input type="radio" id="transferencia" name="metodo_pago" value="transferencia" required>
                            <label for="transferencia" class="metodo-card">
                                <div class="metodo-header">
                                    <span class="icono">🏦</span>
                                    <h3>Transferencia Bancaria</h3>
                                </div>
                                <div class="metodo-descripcion">
                                    <p>Transfiere directamente a nuestra cuenta bancaria</p>

                                    <div class="ventajas-section">
                                        <h5>✅ Ventajas:</h5>
                                        <ul class="ventajas-lista">
                                            <li>💰 Sin comisiones adicionales</li>
                                            <li>🎯 El precio es exactamente el pactado</li>
                                            <li>📧 Comprobante por email</li>
                                        </ul>
                                    </div>

                                    <div class="desventajas-section">
                                        <h5>⚠️ Consideraciones:</h5>
                                        <ul class="desventajas-lista">
                                            <li>⏱️ Inicio del pedido en 24-48 horas</li>
                                            <li>🔍 Requiere revisión manual del comprobante</li>
                                            <li>⏳ Verificación de pago en cuenta bancaria</li>
                                        </ul>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <!-- MercadoPago -->
                        <div class="metodo-pago mercadopago">
                            <input type="radio" id="mercadopago" name="metodo_pago" value="mercadopago" required>
                            <label for="mercadopago" class="metodo-card">
                                <div class="metodo-header">
                                    <span class="icono">💳</span>
                                    <h3>MercadoPago</h3>
                                </div>
                                <div class="metodo-descripcion">
                                    <p>Paga con tarjeta de crédito, débito o efectivo</p>

                                    <div class="ventajas-section">
                                        <h5>✅ Ventajas:</h5>
                                        <ul class="ventajas-lista">
                                            <li>⚡ Inicio inmediato del pedido</li>
                                            <li>🔒 Pago 100% seguro y automático</li>
                                            <li>💳 Hasta 12 cuotas sin interés</li>
                                            <li>🛡️ Protección al comprador</li>
                                        </ul>
                                    </div>
                                    <div class="desventajas-section">
                                        <h5>⚠️ Consideraciones:</h5>
                                        <ul class="desventajas-lista">
                                        </ul>
                                    </div>

                                    <div class="comision-info">
                                        <small><strong>⚠️ Incluye comisión del 6.29%</strong></small>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div><!-- Detalles del método seleccionado -->
                    <div id="detalles-transferencia" class="detalles-pago" style="display: none;">
                        <div class="info-transferencia">
                            <h4>📄 Datos para transferencia:</h4>
                            <div class="datos-bancarios">
                                <div class="dato-banco">
                                    <strong>Banco:</strong> Banco Ejemplo
                                </div>
                                <div class="dato-banco">
                                    <strong>Titular:</strong> COPIA-T S.A.
                                </div>
                                <div class="dato-banco">
                                    <strong>CBU:</strong> 0123456789012345678901
                                </div>
                                <div class="dato-banco">
                                    <strong>Alias:</strong> COPIA.T.PAGOS
                                </div>
                                <div class="dato-banco">
                                    <strong>CUIT:</strong> 30-12345678-9
                                </div>
                            </div>
                            <div class="instrucciones-transferencia">
                                <h5>📝 Instrucciones:</h5>
                                <ol>
                                    <li>Realiza la transferencia por el monto exacto</li>
                                    <li>Usa como referencia tu número de pedido</li>
                                    <li>Sube el comprobante de transferencia abajo</li>
                                    <li>Procesaremos tu pedido en 24-48 horas</li>
                                </ol>
                            </div>

                            <!-- Sección para subir comprobante -->
                            <div class="subir-comprobante">
                                <h5>📎 Subir comprobante de transferencia:</h5>
                                <div class="comprobante-upload">
                                    <label for="comprobante-file" class="upload-label">
                                        <span class="upload-icon">📄</span>
                                        <span class="upload-text">
                                            <strong>Seleccionar archivo PDF</strong>
                                            <br>
                                            <small>Tamaño máximo: 10MB</small>
                                        </span>
                                    </label>
                                    <input type="file" id="comprobante-file" name="comprobante" accept=".pdf"
                                        class="file-input">
                                    <div class="file-status" id="file-status" style="display: none;">
                                        <span class="file-name" id="file-name"></span>
                                        <span class="file-size" id="file-size"></span>
                                        <button type="button" class="btn-remove-file"
                                            onclick="removerComprobante()">✕</button>
                                    </div>
                                    <div class="upload-requirements">
                                        <small>
                                            <strong>Requisitos:</strong>
                                            <br>• Solo archivos PDF
                                            <br>• Máximo 10MB
                                            <br>• El comprobante debe mostrar claramente el monto y referencia
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> <!-- Botones de acción -->
                    <div class="acciones-pago">
                        <button type="button" class="btn-volver" onclick="volverACrearPedido()">
                            ← Volver a editar pedido
                        </button>
                        <button type="submit" class="btn-pagar" id="btn-procesar-pago">
                            <span class="texto-btn">Procesar Pago</span>
                            <span class="monto-btn">$<span id="monto-boton">0.00</span></span>
                        </button>

                        <!-- Contenedor para el Wallet de MercadoPago -->
                        <div id="wallet_container" style="display: none;"></div>
                    </div>
                </form>
            </div>
        </article>
    </section>
    <footer>
        <p>&copy; 2023 COPIA-T. Todos los derechos reservados.</p>
        <p><a href="terms.html">Términos y condiciones</a></p>
    </footer>

    <!-- Modal Dialog -->
    <div id="modal" class="modal-overlay">
        <div class="modal-dialog">
            <div class="modal-header">
                <h3 id="modal-title">Título</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div id="modal-icon" class="modal-icon"></div>
                <p id="modal-message">Mensaje</p>
            </div>
            <div class="modal-footer" id="modal-actions">
                <button class="btn btn-primary" onclick="closeModal()">Aceptar</button>
            </div>
        </div>
    </div>    <script>
        // Pasar datos de PHP a JavaScript
        window.precioTotalPHP = <?php echo json_encode($precioTotal); ?>;
        window.precioConComisionPHP = <?php echo json_encode($precioConComision); ?>;
        window.datosPedidoPHP = <?php echo json_encode($datosPedido); ?>;
        
        // La Public Key debe ser la de PRUEBA si estás usando el Access Token de PRUEBA
        const mp = new MercadoPago("", {
            locale: "es-AR"
        });

        <?php
        if ($preference) : ?>
            mp.bricks().create("wallet", "wallet_container", {
                initialization: {
                    preferenceId: "<?php echo $preference->id; ?>",
                },
                customization: {
                    theme: "dark",
                    customStyle: {
                        hideValueProp: true,
                    }
                }
            });
        <?php endif; ?>
    </script>

    <script src="../../assets/js/pagarPedidoPHP.js"></script>
</body>

</html>
