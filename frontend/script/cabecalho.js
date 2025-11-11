function toggleMenu() {
    var dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("active");
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
    }
}

// Logout function available from the header dropdown
function sair() {
    // Remove stored company info and redirect to login
    try {
        localStorage.removeItem('empresaLogada');
    } catch (e) {
        console.warn('Erro ao limpar localStorage:', e);
    }
    window.location.href = 'login.html';
}