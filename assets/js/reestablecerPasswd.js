 // JavaScript para el formulario de restablecer contraseña
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('reset-password-form');
            const newPasswordInput = document.getElementById('new-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const submitButton = form.querySelector('button[type="submit"]');
            
            // Crear indicador de fortaleza de contraseña
            const strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            strengthIndicator.innerHTML = `
                <div class="strength-indicator">
                    <div class="strength-fill"></div>
                </div>
                <div class="strength-text"></div>
            `;
            newPasswordInput.parentNode.insertBefore(strengthIndicator, newPasswordInput.nextSibling);
            
            // Función para evaluar fortaleza de contraseña
            function evaluatePasswordStrength(password) {
                let score = 0;
                let feedback = '';
                
                if (password.length >= 8) score++;
                if (/[a-z]/.test(password)) score++;
                if (/[A-Z]/.test(password)) score++;
                if (/[0-9]/.test(password)) score++;
                if (/[^A-Za-z0-9]/.test(password)) score++;
                
                strengthIndicator.className = 'password-strength';
                
                if (password.length === 0) {
                    feedback = '';
                } else if (score < 3) {
                    strengthIndicator.classList.add('strength-weak');
                    feedback = 'Contraseña débil';
                } else if (score < 4) {
                    strengthIndicator.classList.add('strength-medium');
                    feedback = 'Contraseña moderada';
                } else {
                    strengthIndicator.classList.add('strength-strong');
                    feedback = 'Contraseña fuerte';
                }
                
                strengthIndicator.querySelector('.strength-text').textContent = feedback;
                return score;
            }
            
            // Función para validar contraseña
            function validatePassword(password) {
                return password.length >= 6;
            }
            
            // Función para validar coincidencia de contraseñas
            function validatePasswordMatch(password, confirmPassword) {
                return password === confirmPassword && password.length > 0;
            }
            
            // Eventos de validación en tiempo real
            newPasswordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = evaluatePasswordStrength(password);
                
                if (password.length > 0) {
                    if (validatePassword(password)) {
                        this.classList.add('input-success');
                        this.classList.remove('input-error');
                    } else {
                        this.classList.add('input-error');
                        this.classList.remove('input-success');
                    }
                } else {
                    this.classList.remove('input-error', 'input-success');
                }
                
                // Revalidar confirmación si ya tiene contenido
                if (confirmPasswordInput.value) {
                    validateConfirmPassword();
                }
            });
            
            function validateConfirmPassword() {
                const password = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (confirmPassword.length > 0) {
                    if (validatePasswordMatch(password, confirmPassword)) {
                        confirmPasswordInput.classList.add('input-success');
                        confirmPasswordInput.classList.remove('input-error');
                    } else {
                        confirmPasswordInput.classList.add('input-error');
                        confirmPasswordInput.classList.remove('input-success');
                    }
                } else {
                    confirmPasswordInput.classList.remove('input-error', 'input-success');
                }
            }
            
            confirmPasswordInput.addEventListener('input', validateConfirmPassword);
            confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
            
            // Manejar envío del formulario
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newPassword = newPasswordInput.value.trim();
                const confirmPassword = confirmPasswordInput.value.trim();
                
                // Validaciones
                let isValid = true;
                let firstErrorField = null;
                
                if (!newPassword) {
                    alert('Por favor, ingresa una nueva contraseña.');
                    newPasswordInput.focus();
                    return;
                }
                
                if (!validatePassword(newPassword)) {
                    alert('La contraseña debe tener al menos 6 caracteres.');
                    newPasswordInput.classList.add('input-error');
                    newPasswordInput.focus();
                    return;
                }
                
                if (!confirmPassword) {
                    alert('Por favor, confirma tu contraseña.');
                    confirmPasswordInput.focus();
                    return;
                }
                
                if (!validatePasswordMatch(newPassword, confirmPassword)) {
                    alert('Las contraseñas no coinciden.');
                    confirmPasswordInput.classList.add('input-error');
                    confirmPasswordInput.focus();
                    return;
                }
                
                // Mostrar estado de carga
                submitButton.classList.add('loading');
                submitButton.disabled = true;
                
                // Simular restablecimiento de contraseña
                setTimeout(() => {
                    // Crear mensaje de éxito
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message show';
                    successMessage.innerHTML = `
                        <strong>¡Contraseña restablecida exitosamente!</strong><br>
                        Tu contraseña ha sido actualizada. Ahora puedes iniciar sesión con tu nueva contraseña.
                    `;
                    
                    // Insertar mensaje antes del formulario
                    form.parentNode.insertBefore(successMessage, form);
                    
                    // Limpiar formulario
                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';
                    newPasswordInput.classList.remove('input-error', 'input-success');
                    confirmPasswordInput.classList.remove('input-error', 'input-success');
                    evaluatePasswordStrength('');
                    
                    // Remover estado de carga
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                    
                    // Redirigir al login después de unos segundos                    setTimeout(() => {
                        alert('Redirigiendo al login...');
                        window.location.href = 'login.html';
                    }, 3000);
                    
                }, 2000);
            });
