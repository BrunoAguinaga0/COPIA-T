// JavaScript para el formulario de registro
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('register-form');
            const inputs = {
                name: document.getElementById('name'),
                surname: document.getElementById('surname'),
                phone: document.getElementById('phone'),
                dni: document.getElementById('dni'),
                email: document.getElementById('email'),
                password: document.getElementById('password'),
                terms: document.getElementById('terms')
            };
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
                    default:
                        modalIcon.textContent = 'ℹ️';
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
            
            // Funciones de validación
            function validateName(name) {
                return name.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
            }
            
            function validatePhone(phone) {
                return /^[\d\s\-\+\(\)]{8,15}$/.test(phone);
            }
            
            function validateDNI(dni) {
                return /^\d{7,8}$/.test(dni);
            }
            
            function validateEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }
            
            function validatePassword(password) {
                return password.length >= 6;
            }
            
            // Agregar validación en tiempo real para cada campo
            inputs.name.addEventListener('blur', function() {
                validateField(this, validateName(this.value), 'El nombre debe tener al menos 2 caracteres y solo letras');
            });
            
            inputs.surname.addEventListener('blur', function() {
                validateField(this, validateName(this.value), 'El apellido debe tener al menos 2 caracteres y solo letras');
            });
            
            inputs.phone.addEventListener('blur', function() {
                validateField(this, validatePhone(this.value), 'Ingresa un número de teléfono válido');
            });
            
            inputs.dni.addEventListener('blur', function() {
                validateField(this, validateDNI(this.value), 'El DNI debe tener 7 u 8 dígitos');
            });
            
            inputs.email.addEventListener('blur', function() {
                validateField(this, validateEmail(this.value), 'Ingresa un email válido');
            });
            
            inputs.password.addEventListener('blur', function() {
                validateField(this, validatePassword(this.value), 'La contraseña debe tener al menos 6 caracteres');
            });
            
            // Función para validar campo individual
            function validateField(input, isValid, errorMessage) {
                if (!input.value) {
                    input.classList.remove('input-error', 'input-success');
                    return;
                }
                
                if (isValid) {
                    input.classList.add('input-success');
                    input.classList.remove('input-error');
                } else {
                    input.classList.add('input-error');
                    input.classList.remove('input-success');
                }
            }
            
            // Manejar envío del formulario
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Obtener valores
                const values = {
                    name: inputs.name.value.trim(),
                    surname: inputs.surname.value.trim(),
                    phone: inputs.phone.value.trim(),
                    dni: inputs.dni.value.trim(),
                    email: inputs.email.value.trim(),
                    password: inputs.password.value.trim(),
                    terms: inputs.terms.checked
                };
                
                // Validar todos los campos
                let isFormValid = true;
                let firstErrorField = null;
                
                if (!validateName(values.name)) {
                    inputs.name.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.name;
                }
                
                if (!validateName(values.surname)) {
                    inputs.surname.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.surname;
                }
                
                if (!validatePhone(values.phone)) {
                    inputs.phone.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.phone;
                }
                
                if (!validateDNI(values.dni)) {
                    inputs.dni.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.dni;
                }
                
                if (!validateEmail(values.email)) {
                    inputs.email.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.email;
                }
                
                if (!validatePassword(values.password)) {
                    inputs.password.classList.add('input-error');
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.password;
                }
                  if (!values.terms) {
                    showModal(
                        'Términos y Condiciones',
                        'Debes aceptar los términos y condiciones para continuar con el registro.',
                        'warning'
                    );
                    isFormValid = false;
                    if (!firstErrorField) firstErrorField = inputs.terms;
                }
                
                // Si hay errores, enfocar el primer campo con error
                if (!isFormValid) {
                    if (firstErrorField) firstErrorField.focus();
                    return;
                }
                
                // Mostrar estado de carga
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                  // Simular registro (aquí iría la lógica real)
                setTimeout(() => {
                    // Guardar datos del usuario registrado
                    const userData = {
                        name: values.name,
                        surname: values.surname,
                        phone: values.phone,
                        dni: values.dni,
                        email: values.email,
                        fechaRegistro: new Date().toISOString(),
                        tipo: 'cliente'
                    };
                    
                    localStorage.setItem('usuarioRegistrado', JSON.stringify(userData));
                    
                    showModal(
                        '¡Registro Exitoso!',
                        `¡Bienvenido ${values.name}! Tu cuenta ha sido creada exitosamente. Serás redirigido al login para iniciar sesión.`,
                        'success',                        () => {
                            window.location.href = 'login.html';
                        }
                    );
                    
                    // Remover estado de carga
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }, 2000);
            });
            
            // Permitir solo números en DNI
            inputs.dni.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d]/g, '');
            });
              // Formatear teléfono mientras se escribe
            inputs.phone.addEventListener('input', function() {
                // Permitir solo números, espacios, guiones, paréntesis y +
                this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '');
            });
        });

        // ===== FUNCIÓN GLOBAL PARA CERRAR MODAL =====
        function closeModal() {
            const overlay = document.getElementById('modal-overlay');
            overlay.classList.remove('show');
        }