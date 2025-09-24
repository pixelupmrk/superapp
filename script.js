document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav-item");
  const contentAreas = document.querySelectorAll(".content-area");
  const pageTitle = document.getElementById("page-title");

  // Navegação
  navItems.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      const targetId = item.getAttribute("data-target");
      contentAreas.forEach(area => area.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");

      pageTitle.textContent = item.innerText;
    });
  });

  // Menu Mobile
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Dashboard exemplo com Chart.js
  const ctx = document.getElementById("statusChart");
  if (ctx) {
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Novo", "Progresso", "Fechado"],
        datasets: [{
          data: [3, 5, 2],
          backgroundColor: ["#00f7ff", "#ffc107", "#28a745"]
        }]
      },
      options: { responsive: true }
    });
  }

  // Exemplo de LocalStorage (dados persistentes)
  let leads = JSON.parse(localStorage.getItem("leads")) || [];
  function salvarLeads() {
    localStorage.setItem("leads", JSON.stringify(leads));
  }

  // Exemplo adicionar lead
  leads.push({ nome: "Teste", status: "novo" });
  salvarLeads();
});
