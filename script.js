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

    // Função para criar um card
    function createKanbanCard(lead) {
        const newCard = document.createElement('div');
        newCard.classList.add('kanban-card');
        newCard.draggable = true;

        newCard.setAttribute('data-name', lead.nome);
        newCard.setAttribute('data-whatsapp', lead.whatsapp);
        newCard.setAttribute('data-origem', lead.origem);
        newCard.setAttribute('data-qualificacao', lead.qualificacao);
        newCard.setAttribute('data-email', lead.email);
        newCard.setAttribute('data-atendente', lead.atendente);
        newCard.setAttribute('data-data', lead.data);
        newCard.setAttribute('data-notas', lead.notas);

        newCard.innerHTML = `
            <strong>${lead.nome}</strong><br>
            <small>WhatsApp: ${lead.whatsapp}</small><br>
            <small>Origem: ${lead.origem}</small><br>
            <small>Qualificação: ${lead.qualificacao}</small>
            <div class="card-actions">
                <button class="edit-card-btn"><i class="ph-fill ph-note-pencil"></i></button>
                <button class="delete-card-btn"><i class="ph-fill ph-trash"></i></button>
            </div>
        `;

        return newCard;
    }

    // Lógica para o formulário de novo lead
    const leadForm = document.getElementById('lead-form');
    const kanbanCardsListNovo = document.querySelector('.kanban-column[data-status="novo"] .kanban-cards-list');

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newLead = {
            nome: document.getElementById('lead-name').value,
            email: document.getElementById('lead-email').value,
            whatsapp: document.getElementById('lead-whatsapp').value,
            atendente: document.getElementById('lead-attendant').value,
            origem: document.getElementById('lead-origin').value,
            data: document.getElementById('lead-date').value,
            qualificacao: document.getElementById('lead-qualification').value,
            notas: document.getElementById('lead-notes').value,
        };

        const newCard = createKanbanCard(newLead);
        kanbanCardsListNovo.appendChild(newCard);
        leadForm.reset();
    });

    // Lógica para o Modal de Edição (agora com botões dedicados)
    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    let currentCard = null;

    kanbanBoard.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-card-btn');
        const deleteButton = e.target.closest('.delete-card-btn');
        
        if (editButton) {
            currentCard = editButton.closest('.kanban-card');
            
            document.getElementById('edit-lead-name').value = currentCard.getAttribute('data-name') || '';
            document.getElementById('edit-lead-email').value = currentCard.getAttribute('data-email') || '';
            document.getElementById('edit-lead-whatsapp').value = currentCard.getAttribute('data-whatsapp') || '';
            document.getElementById('edit-lead-status').value = currentCard.parentElement.closest('.kanban-column').getAttribute('data-status');
            document.getElementById('edit-lead-attendant').value = currentCard.getAttribute('data-atendente') || '';
            document.getElementById('edit-lead-origem').value = currentCard.getAttribute('data-origem') || '';
            document.getElementById('edit-lead-date').value = currentCard.getAttribute('data-data') || '';
            document.getElementById('edit-lead-qualification').value = currentCard.getAttribute('data-qualificacao') || '';
            document.getElementById('edit-lead-notes').value = currentCard.getAttribute('data-notas') || '';
            
            editModal.style.display = 'flex';
        }

        if (deleteButton) {
            const cardToDelete = deleteButton.closest('.kanban-card');
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                 cardToDelete.remove();
            }
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedLead = {
            nome: document.getElementById('edit-lead-name').value,
            email: document.getElementById('edit-lead-email').value,
            whatsapp: document.getElementById('edit-lead-whatsapp').value,
            atendente: document.getElementById('edit-lead-attendant').value,
            origem: document.getElementById('edit-lead-origem').value,
            data: document.getElementById('edit-lead-date').value,
            qualificacao: document.getElementById('edit-lead-qualification').value,
            notas: document.getElementById('edit-lead-notes').value,
        };

        // Atualiza os atributos de dados do card
        currentCard.setAttribute('data-name', updatedLead.nome);
        currentCard.setAttribute('data-email', updatedLead.email);
        currentCard.setAttribute('data-whatsapp', updatedLead.whatsapp);
        currentCard.setAttribute('data-atendente', updatedLead.atendente);
        currentCard.setAttribute('data-origem', updatedLead.origem);
        currentCard.setAttribute('data-data', updatedLead.data);
        currentCard.setAttribute('data-qualificacao', updatedLead.qualificacao);
        currentCard.setAttribute('data-notas', updatedLead.notas);

        // Atualiza o HTML visível do card
        currentCard.querySelector('strong').textContent = updatedLead.nome;
        const smallElements = currentCard.querySelectorAll('small');
        smallElements[0].textContent = `WhatsApp: ${updatedLead.whatsapp}`;
        smallElements[1].textContent = `Origem: ${updatedLead.origem}`;
        smallElements[2].textContent = `Qualificação: ${updatedLead.qualificacao}`;

        const newStatus = document.getElementById('edit-lead-status').value;
        const newColumn = document.querySelector(`.kanban-column[data-status="${newStatus}"] .kanban-cards-list`);
        newColumn.appendChild(currentCard);

        editModal.style.display = 'none';
    });
});
