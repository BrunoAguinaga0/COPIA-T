// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión de administrador?')) {
        localStorage.removeItem('adminLogueado');
        localStorage.removeItem('usuarioLogueado');
        window.location.href = '../auth/login.html';
    }
}// Verificar si hay admin logueado
document.addEventListener('DOMContentLoaded', () => {
    const adminLogueado = localStorage.getItem('adminLogueado');
    if (!adminLogueado) {
        alert('⚠️ Acceso restringido. Redirigiendo al login...');
        window.location.href = '../auth/login.html';
        return;
    }

    // Mostrar información del admin logueado
    const adminData = JSON.parse(adminLogueado);
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText && adminData.nombre) {
        welcomeText.innerHTML = `Bienvenido <strong>${adminData.nombre}</strong>. Gestiona todas las configuraciones y opciones de COPIA-T desde este panel centralizado.`;
    }
    // Animaciones de entrada
    const cards = document.querySelectorAll('.admin-card, .stat-card, .info-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
});

// Simular datos en tiempo real para estadísticas
function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent);
        if (Math.random() > 0.7) {
            const change = Math.floor(Math.random() * 3) - 1;
            if (stat.textContent.includes('%')) {
                stat.textContent = Math.max(95, Math.min(100, currentValue + change)) + '%';
            } else {
                stat.textContent = Math.max(0, currentValue + change);
            }
        }
    });
}

// Actualizar estadísticas cada 30 segundos
setInterval(updateStats, 30000);