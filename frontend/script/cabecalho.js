function toggleMenu() {
    var dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("active");
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
    }
}


function sair() {
    
    try {
        localStorage.removeItem('empresaLogada');
    } catch (e) {
        console.warn('Erro ao limpar localStorage:', e);
    }
    window.location.href = 'login.html';
}