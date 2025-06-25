document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            navLinks.classList.toggle("active");

            if (navLinks.classList.contains("active")) {
                navLinks.style.transform = "translateX(0)";
                navLinks.style.opacity = "1";
            } else {
                navLinks.style.transform = "translateX(-100%)";
                navLinks.style.opacity = "0";
            }
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove("active");
                    navLinks.style.transform = "translateX(-100%)";
                    navLinks.style.opacity = "0";
                }
            });
        });
    } else {
        console.error("❌ No se encontró el menú hamburguesa o los enlaces de navegación.");
    }
});