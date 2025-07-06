let tasks = [];
let editingTaskId = null;

function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskDate = document.getElementById('taskDate').value;
    const taskPriority = document.getElementById('taskPriority').value;
    const taskStatus = document.getElementById('taskStatus').value;

    if (!taskName) {
        alert('Por favor, ingresa un nombre para la tarea');
        return;
    }

    if (!taskDate) {
        alert('Por favor, selecciona una fecha límite');
        return;
    }

    const now = new Date();
    const taskData = {
        id: editingTaskId || Date.now(),
        name: taskName,
        date: taskDate,
        priority: taskPriority,
        status: taskStatus,
        createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : now
    };

    if (editingTaskId) {
        const index = tasks.findIndex(t => t.id === editingTaskId);
        tasks[index] = taskData;
        editingTaskId = null;
        document.querySelector('.add-button').textContent = 'Agregar Tarea';
    } else {
        tasks.push(taskData);
    }

    clearForm();
    renderTasks();
}

function clearForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskPriority').value = 'media';
    document.getElementById('taskStatus').value = 'pendiente';
}

function deleteTask(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;

        editingTaskId = id;
        document.querySelector('.add-button').textContent = 'Actualizar Tarea';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');

    taskCount.textContent = tasks.length;

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="no-tasks">No hay tareas agregadas</div>';
        return;
    }

    
    const priorityValue = { alta: 1, media: 2, baja: 3 };
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityDiff = priorityValue[a.priority] - priorityValue[b.priority];
        return priorityDiff !== 0 ? priorityDiff : b.createdAt - a.createdAt;
    });

    taskList.innerHTML = sortedTasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <div>
                    <div class="task-title">${task.name}</div>
                    <div class="date-info">
                        Creado: ${formatDateTime(task.createdAt)}
                    </div>
                </div>
            </div>
            <div class="task-info">
                <div class="task-detail">
                    <strong>Fecha límite:</strong> ${formatDate(task.date)}
                </div>
                <span class="priority-badge priority-${task.priority}">
                    ${task.priority}
                </span>
                <span class="status-badge status-${task.status}">
                    ${task.status.replace('-', ' ')}
                </span>
            </div>
            <div class="task-actions">
                <button class="action-button edit-button" onclick="editTask(${task.id})">
                    Editar
                </button>
                <button class="action-button delete-button" onclick="deleteTask(${task.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', function () {
    renderTasks();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').min = today;

    
    document.getElementById('downloadPDF').addEventListener('click', () => {
        const taskSection = document.querySelector('.tasks-section');
        html2canvas(taskSection).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("Lista_de_Tareas.pdf");
        });
    });
});

document.getElementById('taskName').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('toggleTheme').addEventListener('click', function () {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    this.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
});
