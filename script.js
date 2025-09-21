document.addEventListener('DOMContentLoaded', () => {

    // Lógica para a navegação da sidebar
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const contentAreas = document.querySelectorAll('.main-content .content-area');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');

            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            contentAreas.forEach(area => {
                area.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';
        });
    });


    // Lógica para o Kanban (Drag and Drop)
    const columns = document.querySelectorAll('.kanban-column');
    const addLeadBtn = document.getElementById('add-lead-btn');
    const leadTitleInput = document.getElementById('lead-title');
    const kanbanCardsList = document.querySelector('.kanban-column[data-status="novo"] .kanban-cards-list');

    // Adiciona um novo card
    addLeadBtn.addEventListener('click', () => {
        const title = leadTitleInput.value.trim();
        if (title) {
            const newCard = document.createElement('div');
            newCard.classList.add('kanban-card');
            newCard.draggable = true;
            newCard.textContent = title;
            kanbanCardsList.appendChild(newCard);
            leadTitleInput.value = '';
        }
    });

    let draggedItem = null;

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 0);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.style.display = 'block';
            draggedItem = null;
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const list = column.querySelector('.kanban-cards-list');
            if (draggedItem) {
                list.appendChild(draggedItem);
            }
        });
    });
});
