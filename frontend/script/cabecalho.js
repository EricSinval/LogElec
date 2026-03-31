function toggleMenu() {
    var dropdown = document.getElementById("dropdown");
    if (!dropdown) return;

    var shouldOpen = !dropdown.classList.contains("active");
    dropdown.classList.toggle("active", shouldOpen);
    dropdown.style.display = shouldOpen ? "flex" : "none";
}


function sair() {
    
    try {
        localStorage.removeItem('empresaLogada');
    } catch (e) {
        console.warn('Erro ao limpar localStorage:', e);
    }
    window.location.href = 'login.html';
}

document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('dropdown');
    if (!dropdown || !dropdown.classList.contains('active')) return;

    var menuIcon = document.querySelector('.menu-icon');
    var clickedInsideDropdown = dropdown.contains(event.target);
    var clickedMenuIcon = menuIcon && menuIcon.contains(event.target);

    if (!clickedInsideDropdown && !clickedMenuIcon) {
        dropdown.classList.remove('active');
        dropdown.style.display = 'none';
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key !== 'Escape') return;

    var dropdown = document.getElementById('dropdown');
    if (!dropdown || !dropdown.classList.contains('active')) return;

    dropdown.classList.remove('active');
    dropdown.style.display = 'none';
});