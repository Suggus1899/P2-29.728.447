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

    // Filtro dinámico para la tabla de pagos en admin/payments
    if (document.querySelector('.payments-table')) {
      const form = document.getElementById('filtros-form');
      const table = document.querySelector('.payments-table');
      if (form && table) {
        form.addEventListener('input', function () {
          const servicio = form.servicio.value.toLowerCase();
          const email = form.email.value.toLowerCase();
          const estado = form.estado.value;
          const fechaInicio = form.fecha_inicio.value;
          const fechaFin = form.fecha_fin.value;
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length === 0) return; // skip empty rows
            const servicioTd = tds[1].textContent.toLowerCase();
            const emailTd = tds[2].textContent.toLowerCase();
            const fechaTd = tds[7].textContent;
            let visible = true;
            if (servicio && !servicioTd.includes(servicio)) visible = false;
            if (email && !emailTd.includes(email)) visible = false;
            // Estado: solo "completado" existe, si se selecciona fallido ocultar todo
            if (estado === 'fallido') visible = false;
            // Fechas
            if (fechaInicio) {
              const fechaRow = new Date(fechaTd.split('/').reverse().join('-'));
              const inicio = new Date(fechaInicio);
              if (fechaRow < inicio) visible = false;
            }
            if (fechaFin) {
              const fechaRow = new Date(fechaTd.split('/').reverse().join('-'));
              const fin = new Date(fechaFin);
              if (fechaRow > fin) visible = false;
            }
            row.style.display = visible ? '' : 'none';
          });
        });
      }
    }
});