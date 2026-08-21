import './add_task.css';
import { format, parseISO } from 'date-fns';

let savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
let activeEditingId = null;

function saveToLocatlStorage() {
  localStorage.setItem('app_tasks', JSON.stringify(savedTasks));
}

export function initAddTask(existingTask = null) {
  const add_taskBtn = document.querySelector('#btn-add-task');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  if (add_taskBtn && !add_taskBtn.querySelector('.side-icon')) {
    const text = add_taskBtn.textContent.trim();
    add_taskBtn.innerHTML = `
      <span class="side-icon">➕</span>
      <span class="side-text">${text}</span>
    `;
  }

  const injectFormView = (taskToEdit = null) => {
    if (taskToEdit) {
      activeEditingId = taskToEdit.id;
    } else {
      activeEditingId = null;
    }

    const isEditing = !!activeEditingId;
    const task = taskToEdit || { category: 'projects', name: '', priority: 'medium', note:'', date:'', todos: [] };

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (add_taskBtn) add_taskBtn.classList.add('active');

    let todosHTML = '';
    task.todos.forEach(todo => {
      todosHTML += `
        <div class="todo-input-group">
          <input type="text" class="todo-item-input" value="${todo}" required>
          <button type="button" class="remove-todo-btn">❌</button>
        </div>`;
    });

    contentArea.innerHTML = `
      <div class="view-header">
        <h1>${isEditing ? '✏️ Edit Task' : 'Add New Task'}</h1>
        <button type="button" id="cancel-task-btn" class="cancel-icon-btn" title="Cancel creation">✕</button>
      </div>
      
      <form id="dynamic-task-form" class="task-form">
        <label>Category:</label>
        <select id="task-category" required>
          <option value="projects" ${task.category === 'projects' ? 'selected' : ''}>Projects</option>
          <option value="personal" ${task.category === 'personal' ? 'selected' : ''}>Personal</option>
          <option value="anytime" ${task.category === 'anytime' ? 'selected' : ''}>Anytime</option>
        </select>
        
        <label>Task Name:</label>
        <input type="text" id="task-name" value="${task.name}" required placeholder="Task title...">

        <label>Due Date:</label>
        <input type="date" id="task-date" value="${task.date || ''}">
        
        <label>Priority:</label>
        <select id="task-priority">
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
        </select>
        
        <label>Brief Note:</label>
        <textarea id="task-note" placeholder="Add extra details here...">${task.note}</textarea>
        
        <label>To-Dos:</label>
        <div id="todos-container">
          ${todosHTML}
        </div>
        <button type="button" id="add-todo-field-btn">+ Add To-Do Item</button>
        
        <div class="form-actions">
          <button type="submit" id="save-task-btn">💾 Save Task</button>
        </div>
      </form>
    `;

    setupFormLogic(contentArea);
  };

  if (add_taskBtn) {
    add_taskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Add Task Clicked inside addEventListener!');
      injectFormView();
    });
  }

  if (existingTask) {
    injectFormView(existingTask);
  }
}

function setupFormLogic(contentArea) {
  const form = contentArea.querySelector('#dynamic-task-form');
  const todosContainer = contentArea.querySelector('#todos-container');
  const addTodoFieldBtn = contentArea.querySelector('#add-todo-field-btn');

  const cancelBtn = contentArea.querySelector('#cancel-task-btn');

  addTodoFieldBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'todo-input-group';
    div.innerHTML = `
      <input type="text" class="todo-item-input" placeholder="To-do item details" required>
      <button type="button" class="remove-todo-btn">❌</button>
    `;
    todosContainer.appendChild(div);
  });

  todosContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-todo-btn')) {
      e.target.parentElement.remove();
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      activeEditingId = null;

      contentArea.innerHTML = '';

      document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const todoInputs = contentArea.querySelectorAll('.todo-item-input');
    const todosArray = Array.from(todoInputs).map(input => input.value.trim());

    const taskData = {
      id: activeEditingId || Date.now().toString(),
      category: contentArea.querySelector('#task-category').value,
      name: contentArea.querySelector('#task-name').value.trim(),
      date: contentArea.querySelector('#task-date').value,
      priority: contentArea.querySelector('#task-priority').value,
      note: contentArea.querySelector('#task-note').value.trim(),
      todos: todosArray
    };

    if (activeEditingId) {
      const index = savedTasks.findIndex(t => t.id === activeEditingId);
      if (index !== -1) savedTasks[index] = taskData;
    } else {
      savedTasks.push(taskData);
    }

    saveToLocatlStorage();

    activeEditingId = null;
    contentArea.innerHTML = `<div class="view-header"><h1>Task Saved!</h1></div>`;

    renderProjectsSidebar();
  });
}

export function renderProjectsSidebar() {
  const projectsListUI = document.getElementById('projects');
  const personalListUI = document.getElementById('personal');

  const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];

  const projectTasks = savedTasks.filter(t => t.category === 'projects');
  const personalTasks = savedTasks.filter(t => t.category === 'personal');
  
  if (projectsListUI) {
    projectsListUI.innerHTML = projectTasks.map(task => `
      <li class="task-item reopen-task-btn priority-${task.priority}" data-id="${task.id}">
        <strong>${task.name}</strong>
      </li>
    `).join('');
  }

  if (personalListUI) {
    personalListUI.innerHTML = personalTasks.map(task => `
      <li class="task-item reopen-task-btn priority-${task.priority}" data-id="${task.id}">
        <strong>${task.name}</strong>
      </li>
    `).join('');
  }
}

document.addEventListener('click', (e) => {
    const button = e.target.closest('reopen-task-btn');
    if (button) {
    const taskId = e.target.getAttribute('data-id');
    const targetedTask = savedTasks.find(t => t.id === taskId);
    if (targetedTask) {
      initAddTask(targetedTask);
    }
  }
});
