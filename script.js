

/* ==========================================
   STUDYMATE - STUDENT ACADEMIC ORGANIZER
   HTML + CSS + JAVASCRIPT
   ========================================== */


/* ==========================================
   1. TASK CLASS - JAVASCRIPT OOP
   ========================================== */

class StudyTask {
    constructor(title, subject, date, priority, type, notes = "") {
        this.id = Date.now().toString() + Math.random().toString(16).slice(2);
        this.title = title;
        this.subject = subject;
        this.date = date;
        this.priority = priority;
        this.type = type;
        this.notes = notes;
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }
}


/* ==========================================
   2. STUDYMATE ORGANIZER CLASS
   ========================================== */

class StudyMateOrganizer {

    constructor() {
        this.tasks = this.loadTasks();
        this.editingTaskId = null;

        this.initialize();
    }

    initialize() {
        this.setupNavigation();
        this.setupModal();
        this.setupTaskForm();
        this.setupTaskButtons();
        this.setupFilters();
        this.setupSearch();

        this.renderAll();
        this.updateDate();
    }


    /* ======================================
       LOCAL STORAGE
       ====================================== */

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem("studyMateTasks");
            return savedTasks ? JSON.parse(savedTasks) : [];
        } catch (error) {
            console.error("Unable to load tasks:", error);
            return [];
        }
    }

    saveTasks() {
        localStorage.setItem(
            "studyMateTasks",
            JSON.stringify(this.tasks)
        );
    }


    /* ======================================
       NAVIGATION BUTTONS
       ====================================== */

    setupNavigation() {
        const navButtons = document.querySelectorAll(".nav-btn");

        navButtons.forEach(button => {
            button.addEventListener("click", () => {
                const viewName = button.dataset.view;
                this.showView(viewName);
            });
        });
    }

    showView(viewName) {
        document.querySelectorAll(".view").forEach(view => {
            view.classList.remove("active");
        });

        const selectedView = document.getElementById(viewName);

        if (selectedView) {
            selectedView.classList.add("active");
        }

        document.querySelectorAll(".nav-btn").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        });

        const pageTitle = document.getElementById("pageTitle");

        if (pageTitle) {
            const titles = {
                dashboard: "Dashboard",
                tasks: "My Tasks",
                deadlines: "Deadlines"
            };

            pageTitle.textContent = titles[viewName] || "StudyMate";
        }

        this.renderAll();
    }


    /* ======================================
       MODAL FUNCTIONS
       ====================================== */

    setupModal() {
        const addButton = document.getElementById("addTaskBtn");
        const heroAddButton = document.getElementById("heroAddTask");
        const cancelButton = document.getElementById("cancelBtn");
        const modal = document.getElementById("taskModal");

        if (addButton) {
            addButton.addEventListener("click", () => {
                this.openModal();
            });
        }

        if (heroAddButton) {
            heroAddButton.addEventListener("click", () => {
                this.openModal();
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener("click", () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener("click", event => {
                if (event.target === modal) {
                    this.closeModal();
                }
            });
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.closeModal();
            }
        });
    }

    openModal(task = null) {
        const modal = document.getElementById("taskModal");
        const form = document.getElementById("taskForm");
        const modalTitle = document.getElementById("modalTitle");

        if (!modal || !form) return;

        form.reset();

        this.editingTaskId = task ? task.id : null;

        if (task) {
            if (modalTitle) {
                modalTitle.textContent = "Edit Task";
            }

            document.getElementById("taskTitle").value = task.title;
            document.getElementById("taskSubject").value = task.subject;
            document.getElementById("taskDate").value = task.date;
            document.getElementById("taskPriority").value = task.priority;
            document.getElementById("taskType").value = task.type;
            document.getElementById("taskNotes").value = task.notes || "";

        } else {
            if (modalTitle) {
                modalTitle.textContent = "Add New Task";
            }

            const dateInput = document.getElementById("taskDate");

            if (dateInput) {
                dateInput.value = this.getLocalDate();
            }
        }

        modal.classList.add("active");
    }

    closeModal() {
        const modal = document.getElementById("taskModal");

        if (modal) {
            modal.classList.remove("active");
        }

        this.editingTaskId = null;
    }


    /* ======================================
       ADD AND EDIT TASKS
       ====================================== */

    setupTaskForm() {
        const form = document.getElementById("taskForm");

        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const title = document.getElementById("taskTitle").value.trim();
            const subject = document.getElementById("taskSubject").value.trim();
            const date = document.getElementById("taskDate").value;
            const priority = document.getElementById("taskPriority").value;
            const type = document.getElementById("taskType").value;
            const notes = document.getElementById("taskNotes").value.trim();

            if (!title || !subject || !date) {
                this.showToast("Please complete the required fields.", "error");
                return;
            }

            if (this.editingTaskId) {
                this.updateTask(
                    this.editingTaskId,
                    title,
                    subject,
                    date,
                    priority,
                    type,
                    notes
                );
            } else {
                const newTask = new StudyTask(
                    title,
                    subject,
                    date,
                    priority,
                    type,
                    notes
                );

                this.tasks.push(newTask);
                this.showToast("Task added successfully!", "success");
            }

            this.saveTasks();
            this.renderAll();
            this.closeModal();
            form.reset();
        });
    }

    updateTask(id, title, subject, date, priority, type, notes) {
        const task = this.tasks.find(task => task.id === id);

        if (!task) return;

        task.title = title;
        task.subject = subject;
        task.date = date;
        task.priority = priority;
        task.type = type;
        task.notes = notes;

        this.showToast("Task updated successfully!", "success");
    }


    /* ======================================
       TASK ACTION BUTTONS
       ====================================== */

    setupTaskButtons() {
        document.addEventListener("click", event => {

            const completeButton = event.target.closest("[data-action='complete']");
            const editButton = event.target.closest("[data-action='edit']");
            const deleteButton = event.target.closest("[data-action='delete']");

            if (completeButton) {
                this.toggleTask(completeButton.dataset.id);
            }

            if (editButton) {
                const task = this.tasks.find(
                    item => item.id === editButton.dataset.id
                );

                if (task) {
                    this.openModal(task);
                }
            }

            if (deleteButton) {
                this.deleteTask(deleteButton.dataset.id);
            }
        });
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);

        if (!task) return;

        task.completed = !task.completed;

        this.saveTasks();
        this.renderAll();

        this.showToast(
            task.completed ? "Task completed!" : "Task marked as pending.",
            "success"
        );
    }

    deleteTask(id) {
        const task = this.tasks.find(item => item.id === id);

        if (!task) return;

        const confirmed = confirm(
            `Are you sure you want to delete "${task.title}"?`
        );

        if (!confirmed) return;

        this.tasks = this.tasks.filter(task => task.id !== id);

        this.saveTasks();
        this.renderAll();

        this.showToast("Task deleted successfully.", "success");
    }


    /* ======================================
       SEARCH AND FILTER
       ====================================== */

    setupSearch() {
        const searchInput = document.getElementById("searchInput");

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                this.renderTasks();
            });
        }
    }

    setupFilters() {
        const statusFilter = document.getElementById("statusFilter");
        const priorityFilter = document.getElementById("priorityFilter");

        if (statusFilter) {
            statusFilter.addEventListener("change", () => {
                this.renderTasks();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener("change", () => {
                this.renderTasks();
            });
        }
    }

    getFilteredTasks() {
        const searchInput = document.getElementById("searchInput");
        const statusFilter = document.getElementById("statusFilter");
        const priorityFilter = document.getElementById("priorityFilter");

        const search = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const status = statusFilter ? statusFilter.value : "all";
        const priority = priorityFilter ? priorityFilter.value : "all";

        return this.tasks.filter(task => {

            const matchesSearch =
                task.title.toLowerCase().includes(search) ||
                task.subject.toLowerCase().includes(search) ||
                task.type.toLowerCase().includes(search);

            const matchesStatus =
                status === "all" ||
                (status === "pending" && !task.completed) ||
                (status === "completed" && task.completed);

            const matchesPriority =
                priority === "all" ||
                task.priority.toLowerCase() === priority.toLowerCase();

            return matchesSearch && matchesStatus && matchesPriority;

        }).sort((a, b) => a.date.localeCompare(b.date));
    }


    /* ======================================
       RENDER ALL SECTIONS
       ====================================== */

    renderAll() {
        this.updateStatistics();
        this.renderDashboard();
        this.renderTasks();
        this.renderDeadlines();
        this.updateProgress();
    }

    updateStatistics() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        const today = this.getLocalDate();

        const dueSoon = this.tasks.filter(task => {
            return !task.completed &&
                task.date >= today &&
                task.date <= this.addDays(today, 7);
        }).length;

        this.setText("totalTasks", total);
        this.setText("pendingTasks", pending);
        this.setText("completedTasks", completed);
        this.setText("dueSoon", dueSoon);
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;

        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        const progressBar = document.getElementById("progressBar");
        const progressText = document.getElementById("progressText");
        const progressPercent = document.getElementById("progressPercent");

        if (progressBar) {
            progressBar.style.width = percentage + "%";
        }

        if (progressText) {
            progressText.textContent = percentage + "% completed";
        }

        if (progressPercent) {
            progressPercent.textContent = percentage + "%";
        }

        const circle = document.querySelector(".progress-circle");

        if (circle) {
            circle.style.background =
                `conic-gradient(#16865b ${percentage * 3.6}deg, #e4eee8 ${percentage * 3.6}deg)`;
        }
    }


    /* ======================================
       DASHBOARD TASKS
       ====================================== */

    renderDashboard() {
        const container = document.getElementById("dashboardTasks");

        if (!container) return;

        const pendingTasks = this.tasks
            .filter(task => !task.completed)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5);

        if (pendingTasks.length === 0) {
            container.innerHTML = this.emptyMessage(
                "You're all caught up!",
                "Add a task to start organizing your studies."
            );
            return;
        }

        container.innerHTML = pendingTasks
            .map(task => this.createTaskHTML(task))
            .join("");
    }


    /* ======================================
       ALL TASKS
       ====================================== */

    renderTasks() {
        const container = document.getElementById("allTasks");

        if (!container) return;

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = this.emptyMessage(
                "No tasks found",
                "Try changing your search or filters, or add a new task."
            );
            return;
        }

        container.innerHTML = filteredTasks
            .map(task => this.createTaskHTML(task))
            .join("");
    }


    /* ======================================
       DEADLINES
       ====================================== */

    renderDeadlines() {
        const container = document.getElementById("deadlineTasks");

        if (!container) return;

        const today = this.getLocalDate();

        const upcomingTasks = this.tasks
            .filter(task => !task.completed && task.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date));

        if (upcomingTasks.length === 0) {
            container.innerHTML = this.emptyMessage(
                "No upcoming deadlines",
                "Your upcoming deadlines will appear here."
            );
            return;
        }

        container.innerHTML = upcomingTasks
            .map(task => this.createTaskHTML(task))
            .join("");
    }


    /* ======================================
       TASK HTML TEMPLATE
       ====================================== */

    createTaskHTML(task) {
        const priority = this.escapeHTML(task.priority || "Medium");
        const title = this.escapeHTML(task.title);
        const subject = this.escapeHTML(task.subject);
        const type = this.escapeHTML(task.type || "Task");
        const notes = this.escapeHTML(task.notes || "");

        const today = this.getLocalDate();
        const overdue = !task.completed && task.date < today;

        const dateLabel = overdue
            ? "Overdue"
            : this.formatDate(task.date);

        return `
            <div class="task-item ${task.completed ? "completed" : ""}">

                <div class="task-main">

                    <button
                        class="task-check"
                        data-action="complete"
                        data-id="${task.id}"
                        aria-label="${task.completed ? "Mark as pending" : "Complete task"}"
                        title="${task.completed ? "Mark as pending" : "Complete task"}">
                        ${task.completed ? "✓" : ""}
                    </button>

                    <div class="task-content">

                        <h4>${title}</h4>

                        <div class="task-meta">
                            <span>${subject}</span>
                            <span>${type}</span>
                            <span class="${overdue ? "overdue" : ""}">
                                ${dateLabel}
                            </span>
                        </div>

                        ${notes ? `<p class="task-notes">${notes}</p>` : ""}

                        <span class="priority-badge ${priority.toLowerCase()}">
                            ${priority} Priority
                        </span>

                    </div>

                </div>

                <div class="task-actions">

                    <button
                        class="icon-btn"
                        data-action="edit"
                        data-id="${task.id}"
                        title="Edit task"
                        aria-label="Edit task">
                        ✎
                    </button>

                    <button
                        class="icon-btn delete-btn"
                        data-action="delete"
                        data-id="${task.id}"
                        title="Delete task"
                        aria-label="Delete task">
                        🗑
                    </button>

                </div>

            </div>
        `;
    }


    /* ======================================
       EMPTY STATE
       ====================================== */

    emptyMessage(title, message) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }


    /* ======================================
       DATE FUNCTIONS
       ====================================== */

    getLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    addDays(dateString, days) {
        const date = new Date(dateString + "T12:00:00");
        date.setDate(date.getDate() + days);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    formatDate(dateString) {
        if (!dateString) return "No date";

        const date = new Date(dateString + "T12:00:00");

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    updateDate() {
        const dateElement = document.getElementById("currentDate");

        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );
        }
    }


    /* ======================================
       TOAST NOTIFICATIONS
       ====================================== */

    showToast(message, type = "success") {
        const toast = document.getElementById("toast");

        if (!toast) {
            console.log(message);
            return;
        }

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        clearTimeout(this.toastTimer);

        this.toastTimer = setTimeout(() => {
            toast.className = "toast";
        }, 3000);
    }


    /* ======================================
       HELPER FUNCTIONS
       ====================================== */

    setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

}


/* ==========================================
   3. START STUDYMATE
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    window.studyMate = new StudyMateOrganizer();

    console.log("StudyMate is ready!");

});
