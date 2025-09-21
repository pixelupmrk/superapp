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
    const kanbanBoard = document.getElementById('kanban-board');
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

    kanbanBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(e.target, e.clientY);
        const column = e.target.closest('.kanban-column');
        if (draggedItem && column) {
            const list = column.querySelector('.kanban-cards-list');
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Lógica para o formulário de novo lead e sua integração com o Kanban
    const leadForm = document.getElementById('lead-form');
    const kanbanCardsListNovo = document.querySelector('.kanban-column[data-status="novo"] .kanban-cards-list');

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newLead = {
            nome: document.getElementById('lead-name').value,
            whatsapp: document.getElementById('lead-whatsapp').value,
            origem: document.getElementById('lead-origin').value,
            qualificacao: document.getElementById('lead-qualification').value,
        };

        const newCard = document.createElement('div');
        newCard.classList.add('kanban-card');
        newCard.draggable = true;
        
        // Salvando os dados no próprio HTML do card (data attributes)
        newCard.setAttribute('data-name', newLead.nome);
        newCard.setAttribute('data-whatsapp', newLead.whatsapp);
        newCard.setAttribute('data-origem', newLead.origem);
        newCard.setAttribute('data-qualificacao', newLead.qualificacao);

        newCard.innerHTML = `
            <strong>${newLead.nome}</strong><br>
            <small>WhatsApp: ${newLead.whatsapp}</small><br>
            <small>Origem: ${newLead.origem}</small><br>
            <small>Qualificação: ${newLead.qualificacao}</small>
        `;

        kanbanCardsListNovo.appendChild(newCard);
        leadForm.reset();
    });

    // Lógica para o Modal de Edição
    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let currentCard = null;

    kanbanBoard.addEventListener('click', (e) => {
        const card = e.target.closest('.kanban-card');
        if (card) {
            currentCard = card;
            // Preenche o formulário com os dados do card
            document.getElementById('edit-lead-name').value = card.getAttribute('data-name');
            document.getElementById('edit-lead-whatsapp').value = card.getAttribute('data-whatsapp');
            document.getElementById('edit-lead-origem').value = card.getAttribute('data-origem');
            document.getElementById('edit-lead-qualification').value = card.getAttribute('data-qualificacao');
            
            // Exibe o modal
            editModal.style.display = 'flex';
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Atualiza os dados do card
        currentCard.setAttribute('data-name', document.getElementById('edit-lead-name').value);
        currentCard.setAttribute('data-whatsapp', document.getElementById('edit-lead-whatsapp').value);
        currentCard.setAttribute('data-origem', document.getElementById('edit-lead-origem').value);
        currentCard.setAttribute('data-qualificacao', document.getElementById('edit-lead-qualification').value);
        
        // Atualiza o HTML visível do card
        currentCard.innerHTML = `
            <strong>${document.getElementById('edit-lead-name').value}</strong><br>
            <small>WhatsApp: ${document.getElementById('edit-lead-whatsapp').value}</small><br>
            <small>Origem: ${document.getElementById('edit-lead-origem').value}</small><br>
            <small>Qualificação: ${document.getElementById('edit-lead-qualification').value}</small>
        `;

        editModal.style.display = 'none';
    });
});
