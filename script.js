document.addEventListener('DOMContentLoaded', () => {

    const leads = [];
    let nextLeadId = 0;

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

            if (targetId === 'crm-list-section') {
                renderLeadsTable();
            }
        });
    });

    // Lógica para o Kanban (Drag and Drop)
    const kanbanBoard = document.getElementById('kanban-board');
    let draggedItem = null;

    kanbanBoard.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedItem = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', e.target.getAttribute('data-id'));
            setTimeout(() => {
                e.target.style.display = 'none';
            }, 0);
        }
    });

    kanbanBoard.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.style.display = 'block';
            draggedItem = null;
        }
    });

    kanbanBoard.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(e.target, e.clientY);
        const column = e.target.closest('.kanban-column');
        if (column) {
            const list = column.querySelector('.kanban-cards-list');
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        }
    });

    kanbanBoard.addEventListener('drop', (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.querySelector(`.kanban-card[data-id="${cardId}"]`);
        const newStatus = e.target.closest('.kanban-column').getAttribute('data-status');

        if (card && newStatus) {
            const lead = leads.find(l => l.id == cardId);
            if (lead) {
                lead.status = newStatus;
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

    // Funções de Renderização
    function renderKanbanCards() {
        document.querySelectorAll('.kanban-cards-list').forEach(list => list.innerHTML = '');

        leads.forEach(lead => {
            const newCard = createKanbanCard(lead);
            const targetColumn = document.querySelector(`.kanban-column[data-status="${lead.status}"] .kanban-cards-list`);
            if (targetColumn) {
                targetColumn.appendChild(newCard);
            }
        });
    }

    function renderLeadsTable() {
        const tableBody = document.querySelector('#leads-table tbody');
        tableBody.innerHTML = '';
        
        leads.forEach(lead => {
            const newRow = createLeadTableRow(lead);
            tableBody.appendChild(newRow);
        });
    }

    function createKanbanCard(lead) {
        const newCard = document.createElement('div');
        newCard.classList.add('kanban-card');
        newCard.draggable = true;
        newCard.setAttribute('data-id', lead.id);

        newCard.innerHTML = `
            <strong>${lead.nome || ''}</strong><br>
            <small>WhatsApp: ${lead.whatsapp || ''}</small><br>
            <small>Origem: ${lead.origem || ''}</small><br>
            <small>Qualificação: ${lead.qualificacao || ''}</small>
        `;

        return newCard;
    }

    function createLeadTableRow(lead) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', lead.id);

        row.innerHTML = `
            <td>${lead.nome || ''}</td>
            <td>${lead.whatsapp || ''}</td>
            <td>${lead.origem || ''}</td>
            <td>${lead.qualificacao || ''}</td>
            <td>${lead.status || ''}</td>
            <td>
                <button class="btn-edit-table"><i class="ph-fill ph-note-pencil"></i></button>
                <button class="btn-delete-table"><i class="ph-fill ph-trash"></i></button>
            </td>
        `;

        return row;
    }

    // Lógica para o formulário de novo lead
    const leadForm = document.getElementById('lead-form');
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newLead = {
            id: nextLeadId++,
            nome: document.getElementById('lead-name').value,
            email: document.getElementById('lead-email').value,
            whatsapp: document.getElementById('lead-whatsapp').value,
            atendente: document.getElementById('lead-attendant').value,
            origem: document.getElementById('lead-origin').value,
            data: document.getElementById('lead-date').value,
            qualificacao: document.getElementById('lead-qualification').value,
            notas: document.getElementById('lead-notes').value,
            status: 'novo'
        };

        leads.push(newLead);
        renderKanbanCards();
        renderLeadsTable();
        leadForm.reset();
    });

    // Lógica para o Modal de Edição
    const editModal = document.getElementById('edit-lead-modal');
    const editForm = document.getElementById('edit-lead-form');
    const deleteLeadBtn = document.getElementById('delete-lead-btn');
    let currentLeadId = null;

    document.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-table');
        const deleteButton = e.target.closest('.btn-delete-table');

        if (editButton) {
            const row = editButton.closest('tr');
            currentLeadId = row.getAttribute('data-id');
            const lead = leads.find(l => l.id == currentLeadId);
            
            if (lead) {
                document.getElementById('edit-lead-name').value = lead.nome || '';
                document.getElementById('edit-lead-email').value = lead.email || '';
                document.getElementById('edit-lead-whatsapp').value = lead.whatsapp || '';
                document.getElementById('edit-lead-status').value = lead.status || '';
                document.getElementById('edit-lead-attendant').value = lead.atendente || '';
                document.getElementById('edit-lead-origem').value = lead.origem || '';
                document.getElementById('edit-lead-date').value = lead.data || '';
                document.getElementById('edit-lead-qualification').value = lead.qualificacao || '';
                document.getElementById('edit-lead-notes').value = lead.notas || '';
                
                editModal.style.display = 'flex';
            }
        }
        
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const leadId = row.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este lead?')) {
                const leadIndex = leads.findIndex(l => l.id == leadId);
                if (leadIndex > -1) {
                    leads.splice(leadIndex, 1);
                    renderKanbanCards();
                    renderLeadsTable();
                }
            }
        }
    });

    deleteLeadBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            const leadIndex = leads.findIndex(l => l.id == currentLeadId);
            if (leadIndex > -1) {
                leads.splice(leadIndex, 1);
                renderKanbanCards();
                renderLeadsTable();
            }
            editModal.style.display = 'none';
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const lead = leads.find(l => l.id == currentLeadId);
        
        if (lead) {
            lead.nome = document.getElementById('edit-lead-name').value;
            lead.email = document.getElementById('edit-lead-email').value;
            lead.whatsapp = document.getElementById('edit-lead-whatsapp').value;
            lead.status = document.getElementById('edit-lead-status').value;
            lead.atendente = document.getElementById('edit-lead-attendant').value;
            lead.origem = document.getElementById('edit-lead-origem').value;
            lead.data = document.getElementById('edit-lead-date').value;
            lead.qualificacao = document.getElementById('edit-lead-qualification').value;
            lead.notas = document.getElementById('edit-lead-notes').value;

            renderKanbanCards();
            renderLeadsTable();
            editModal.style.display = 'none';
        }
    });
});
