const input = document.getElementById("new-task-input");
const addButton = document.getElementById("add-btn");
const list = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const sortSelect = document.getElementById("sort-select");
const themeToggler = document.getElementById("theme-toggler");
const dueDateInput = document.getElementById("due-date");
const prioritySelect = document.getElementById("priority-select");
const taskDescriptionInput = document.getElementById("task-description");

// Theme toggle functionality
themeToggler.addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    themeToggler.innerHTML = document.body.dataset.theme === "dark" ?
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", document.body.dataset.theme);
});

// saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.body.dataset.theme = savedTheme;
themeToggler.innerHTML = savedTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Add task 
addButton.addEventListener("click", () => {
    addTask();
});

document.addEventListener("keydown", (event) => {
    if (event.code === "Enter") {
        addTask();
    }
});

// Search and filter functionality
searchInput.addEventListener("input", filterTasks);
filterSelect.addEventListener("change", filterTasks);
sortSelect.addEventListener("change", filterTasks);

function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = filterSelect.value;
    const sortValue = sortSelect.value;
    const tasks = Array.from(list.children);

    // Filter tasks
    tasks.forEach(task => {
        const taskText = task.querySelector(".task").textContent.toLowerCase();
        const taskDescription = task.querySelector(".task-description-text")?.textContent.toLowerCase() || '';
        const isCompleted = task.classList.contains("completed");
        const priority = task.dataset.priority;

        let showTask = true;

        // Apply search filter
        if (searchTerm) {
            const matchesSearch = taskText.includes(searchTerm) || taskDescription.includes(searchTerm);
            if (!matchesSearch) {
                showTask = false;
            }
        }

        // Apply status filter
        if (filterValue === "active" && isCompleted) {
            showTask = false;
        } else if (filterValue === "completed" && !isCompleted) {
            showTask = false;
        } else if (["high", "medium", "low"].includes(filterValue)) {
            showTask = priority === filterValue;
        }

        task.style.display = showTask ? "flex" : "none";
    });

    // Sort tasks
    const visibleTasks = tasks.filter(task => task.style.display !== "none");
    const sortedTasks = visibleTasks.sort((a, b) => {
        if (sortValue === "name") {
            return a.querySelector(".task").textContent.localeCompare(b.querySelector(".task").textContent);
        } else if (sortValue === "priority") {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.dataset.priority] - priorityOrder[b.dataset.priority];
        } else if (sortValue === "date") {
            const dateA = new Date(a.dataset.dueDate);
            const dateB = new Date(b.dataset.dueDate);
            return dateA - dateB;
        }
        return 0;
    });

    // Reorder tasks in DOM
    sortedTasks.forEach((task) => list.appendChild(task));
    updateTaskStats();
}

function updateTaskStats() {
    const totalTasks = list.children.length;
    const completedTasks = list.querySelectorAll(".completed").length;
    const activeTasks = totalTasks - completedTasks;

    document.getElementById("total-count").textContent = totalTasks;
    document.getElementById("active-count").textContent = activeTasks;
    document.getElementById("completed-count").textContent = completedTasks;
}

function syncTasks() {
    const tasks = Array.from(list.children).map(task => {
        return {
            taskName: task.querySelector(".task").textContent,
            description: task.querySelector(".task-description-text")?.textContent || '',
            completionStatus: task.classList.contains("completed"),
            dueDate: task.dataset.dueDate,
            priority: task.dataset.priority
        };
    });

    localStorage.setItem("todo-task", JSON.stringify(tasks));
}

function addTaskToList(taskText, dueDate, priority, description = '') {
    // Set today's date if no date is provided by user
    if (!dueDate) {
        dueDate = new Date().toLocaleDateString('en-CA');
    }

    const li = document.createElement('li');
    li.className = `priority-${priority}`;
    li.dataset.priority = priority;
    li.dataset.dueDate = dueDate;

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';

    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';

    const priorityLabel = document.createElement('span');
    priorityLabel.className = `priority-label priority-${priority}`;
    priorityLabel.innerHTML = `<i class="fas fa-circle"></i> ${priority.charAt(0).toUpperCase() + priority.slice(1)}`;

    const task = document.createElement('span');
    task.className = 'task';
    task.textContent = taskText;

    const taskDate = document.createElement('span');
    taskDate.className = 'task-date';
    taskDate.innerHTML = `<i class="far fa-calendar"></i> ${new Date(dueDate).toLocaleDateString()}`;

    taskHeader.appendChild(priorityLabel);
    taskDetails.appendChild(taskHeader);
    taskDetails.appendChild(task);
    taskDetails.appendChild(taskDate);

    if (description) {
        const taskDescription = document.createElement('p');
        taskDescription.className = 'task-description-text';
        taskDescription.textContent = description;
        taskDetails.appendChild(taskDescription);
    }

    const status = document.createElement('div');
    status.className = 'status';

    const checkButton = document.createElement('button');
    checkButton.className = 'todo-check';
    checkButton.innerHTML = '<i class="far fa-circle"></i>';
    checkButton.onclick = function () {
        const isCompleted = li.classList.toggle('completed');
        checkButton.innerHTML = isCompleted ? '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
        task.style.textDecoration = isCompleted ? 'line-through' : 'none';
        task.style.color = isCompleted ? 'var(--completed-color)' : 'var(--text-color)';
        updateTaskStats();
        syncTasks();
    };

    const removeButton = document.createElement('button');
    removeButton.className = 'todo-remove';
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.onclick = function () {
        li.remove();
        updateTaskStats();
        syncTasks();
    };

    status.appendChild(checkButton);
    status.appendChild(removeButton);

    li.appendChild(taskDetails);
    li.appendChild(status);

    document.getElementById('task-list').appendChild(li);
    updateTaskStats();
    syncTasks();
    filterTasks();
}

function addTask() {
    const taskText = input.value.trim();
    const isDuplicate = Array.from(list.children).some(task =>
        task.querySelector('.task').textContent.toLowerCase() === taskText.toLowerCase()
    );
    if (isDuplicate) {
        alert("Task already exists!");
        input.value = "";
        dueDateInput.value = "";
        prioritySelect.value = "low";
        taskDescriptionInput.value = "";
        return;
    }

    if (taskText) {
        const dueDate = dueDateInput.value || new Date().toLocaleDateString('en-CA');
        addTaskToList(taskText, dueDate, prioritySelect.value, taskDescriptionInput.value);
        input.value = "";
        dueDateInput.value = "";
        prioritySelect.value = "low";
        taskDescriptionInput.value = "";
    }
    
}

// Load tasks from local storage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("todo-task")) || [];
    savedTasks.forEach(task => {
        addTaskToList(
            task.taskName,
            task.dueDate,
            task.priority,
            task.description
        );

        // completion status if task was completed
        if (task.completionStatus) {
            const lastTask = list.lastElementChild; // recently added task
            if (lastTask) {
                lastTask.classList.add('completed');
                const checkButton = lastTask.querySelector('.todo-check');
                const taskText = lastTask.querySelector('.task');
                if (checkButton && taskText) {
                    checkButton.innerHTML = '<i class="fas fa-check-circle"></i>';
                    taskText.style.textDecoration = 'line-through';
                    taskText.style.color = 'var(--completed-color)';
                }
            }
        }
    });
    updateTaskStats();
}

// Add clear search functionality
const clearSearchButton = document.querySelector('.clear-search');
if (clearSearchButton) {
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        filterTasks();
    });
}


// Load previous tasks from local storage on page load
window.addEventListener("DOMContentLoaded", loadTasks);