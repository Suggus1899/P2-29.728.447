document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", (event) => {
        const email = document.getElementById("email").value.trim();
        const name = document.getElementById("name").value.trim();
        const lastname = document.getElementById("lastname").value.trim();
        const comment = document.getElementById("comment").value.trim();

        let errors = [];

        if (!email.includes("@")) errors.push("El correo no es válido.");
        if (name.length < 2) errors.push("El nombre debe tener al menos 2 caracteres.");
        if (lastname.length < 2) errors.push("El apellido debe tener al menos 2 caracteres.");
        if (comment.length < 20) errors.push("El mensaje debe tener al menos 10 caracteres.");

        if (errors.length > 0) {
            event.preventDefault();
            alert(errors.join("\n")); // Muestra errores en un `alert()`
        }
    });
});