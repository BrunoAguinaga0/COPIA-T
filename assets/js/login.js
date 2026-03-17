// JavaScript básico para el formulario de login
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('login-form');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const submitButton = form.querySelector('button[type="submit"]');
            
            // ===== FUNCIONES DEL MODAL =====
            function showModal(title, message, type = 'info', onAccept = null) {
                const overlay = document.getElementById('modal-overlay');
                const modalTitle = document.getElementById('modal-title');
                const modalMessage = document.getElementById('modal-message');
                const modalIcon = document.getElementById('modal-icon');
                const primaryBtn = document.getElementById('modal-btn-primary');
                
                modalTitle.textContent = title;
                modalMessage.textContent = message;
                
                // Configurar icon según el tipo
                modalIcon.className = `modal-icon ${type}`;
                switch (type) {
                    case 'success':
                        modalIcon.textContent = '✅';
                        break;
                    case 'error':
                        modalIcon.textContent = '❌';
                        break;
                    case 'warning':
                        modalIcon.textContent = '⚠️';
                        break;
                    case 'admin':
                        modalIcon.textContent = '👑';
                        break;
                    case 'employee':
                        modalIcon.textContent = '👨‍💼';
                        break;
                    default:
                        modalIcon.textContent = '👤';
                }
                
                // Configurar botón
                primaryBtn.onclick = () => {
                    closeModal();
                    if (onAccept) onAccept();
                };
                
                overlay.classList.add('show');
            }
            
            function closeModal() {
                const overlay = document.getElementById('modal-overlay');
                overlay.classList.remove('show');
            }
            
            // Cerrar modal con ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
            
            // Cerrar modal al hacer clic en el overlay
            document.getElementById('modal-overlay').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
            
            // Función de validación simple
            function validateEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }
            
            // Agregar clases de validación en tiempo real
            emailInput.addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    this.classList.add('input-error');
                    this.classList.remove('input-success');
                } else if (this.value && validateEmail(this.value)) {
                    this.classList.add('input-success');
                    this.classList.remove('input-error');
                } else {
                    this.classList.remove('input-error', 'input-success');
                }
            });
            
            passwordInput.addEventListener('blur', function() {
                if (this.value && this.value.length < 6) {
                    this.classList.add('input-error');
                    this.classList.remove('input-success');
                } else if (this.value && this.value.length >= 6) {
                    this.classList.add('input-success');
                    this.classList.remove('input-error');
                } else {
                    this.classList.remove('input-error', 'input-success');
                }
            });
            
            // Manejar envío del formulario
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();
                  // Validación básica
                if (!email || !password) {
                    showModal(
                        'Campos Incompletos',
                        'Por favor, completa todos los campos para continuar.',
                        'warning'
                    );
                    return;
                }
                
                if (!validateEmail(email)) {
                    showModal(
                        'Email Inválido',
                        'Por favor, ingresa una dirección de email válida.',
                        'error'
                    );
                    emailInput.focus();
                    return;
                }
                
                if (password.length < 6) {
                    showModal(
                        'Contraseña Inválida',
                        'La contraseña debe tener al menos 6 caracteres.',
                        'error'
                    );
                    passwordInput.focus();
                    return;
                }
                
                // Mostrar estado de carga
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                  // Simular login (aquí iría la lógica real)
                setTimeout(() => {
                    // Verificar credenciales de administrador
                    if (email === 'admin@copia-t.com' && password === 'adminadmin') {
                        // Guardar estado de admin logueado
                        localStorage.setItem('adminLogueado', JSON.stringify({
                            email: email,
                            nombre: 'Administrador',
                            tipo: 'admin',
                            fechaLogin: new Date().toISOString()
                        }));
                          showModal(
                            '¡Bienvenido Administrador!',
                            'Has iniciado sesión como administrador. Serás redirigido al panel de administración.',
                            'admin',
                            () => {
                                window.location.href = '../admin/panelAdmin.html';
                            }                        );
                        return;
                    }
                    
                    // Verificar credenciales de empleado
                    if (email === 'empleado@copia-t.com' && password === 'empleado123') {
                        // Guardar estado de empleado logueado
                        localStorage.setItem('empleadoLogueado', JSON.stringify({
                            email: email,
                            nombre: 'Empleado',
                            tipo: 'empleado',
                            fechaLogin: new Date().toISOString()
                        }));
                        
                        showModal(
                            '¡Bienvenido Empleado!',
                            'Has iniciado sesión como empleado. Serás redirigido al panel de empleado.',
                            'employee',
                            () => {
                                window.location.href = '../client/panelEmpleado.html';
                            }
                        );
                        return;
                    }
                    
                    // Login normal para usuarios regulares
                    localStorage.setItem('copia_t_sesion', localStorage.getItem('usuarioLogueado') || '[]');
                    localStorage.setItem('usuarioLogueado', JSON.stringify({
                        email: email,
                        nombre: email.split('@')[0],
                        tipo: 'cliente',
                        fechaLogin: new Date().toISOString()
                    }));
                      showModal(
                        '¡Bienvenido!',
                        `Hola ${email.split('@')[0]}! Has iniciado sesión exitosamente. Serás redirigido para crear tu pedido.`,
                        'success',
                        () => {
                            window.location.href = '../client/panelCliente.html';
                        }
                    );
                    
                    // Remover estado de carga
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;                }, 2000);
            });
        });

        // ===== FUNCIÓN GLOBAL PARA CERRAR MODAL =====
        function closeModal() {
            const overlay = document.getElementById('modal-overlay');
            overlay.classList.remove('show');
        }