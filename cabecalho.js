function toggleMenu() {
    var dropdown = document.getElementById("dropdown");
    if (dropdown.style.display === "flex") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "flex";
    }
}