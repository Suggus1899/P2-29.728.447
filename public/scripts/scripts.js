document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Activar menú hamburguesa
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

    // 🔹 Validación del formulario de contacto
    const form = document.querySelector("form");
    const errorBox = document.createElement("div");
    errorBox.classList.add("error-box");
    form.prepend(errorBox);

    form.addEventListener("submit", (event) => {
        const email = document.getElementById("email").value.trim();
        const name = document.getElementById("name").value.trim();
        const lastname = document.getElementById("lastname").value.trim();
        const comment = document.getElementById("comment").value.trim();

        let errors = [];

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("❌ El correo no es válido.");
        if (!/^[a-zA-Z]+$/.test(name) || name.length < 2) errors.push("❌ El nombre debe tener al menos 2 caracteres y solo letras.");
        if (!/^[a-zA-Z]+$/.test(lastname) || lastname.length < 2) errors.push("❌ El apellido debe tener al menos 2 caracteres y solo letras.");
        if (comment.length < 20) errors.push("❌ El mensaje debe tener al menos 20 caracteres.");

        if (errors.length > 0) {
            event.preventDefault();
            errorBox.innerHTML = errors.map(err => `<p>${err}</p>`).join("");
            errorBox.style.display = "block";
        } else {
            errorBox.style.display = "none";
        }
    });
});