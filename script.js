document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const moduleContents = document.querySelectorAll('.module-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove a classe 'active' de todos os itens do menu
            menuItems.forEach(i => i.classList.remove('active'));
            // Adiciona a classe 'active' ao item clicado
            item.classList.add('active');

            const targetId = item.getAttribute('data-content');

            // Oculta todos os conteúdos dos módulos
            moduleContents.forEach(content => content.style.display = 'none');

            // Exibe o conteúdo do módulo correspondente ao item clicado
            document.getElementById(targetId).style.display = 'block';
        });
    });
});
