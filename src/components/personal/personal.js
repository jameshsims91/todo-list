import './personal.css';
import { format, parseISO } from 'date-fns';

let activePersonalId = null;

export function initPersonal() {
  console.log("🔍 initPersonal() event delegate listener registered!");

  const renderPersonalDashboard = (contentArea, personalBtn) => {
    console.log("🚀 renderPersonalDashboard() engine firing into #content canvas!");
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    
    // 🎯 Filter records tracking exclusively under the 'personal' classification
    const personalTasks = savedTasks.filter(task => task.category === 'personal');

    // Manage active state highlights across all navigation components
    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (personalBtn) personalBtn.classList.add('active');

    // Inject Split-Pane Layout Blueprint into <div id="content">
    contentArea.innerHTML = `
      <div class="view-header">
        <h1>👤 Personal Dashboard</h1>
      </div>
      <div class="personal-layout-grid">
        <!-- Left Column: Master Explorer List -->
        <div class="personal-master-panel">
          <h3>Personal Lists</h3>
          <ul id="personal-master-list">
            ${personalTasks.map(task => `
              <li class="personal-list-card ${activePersonalId === task.id ? 'selected' : ''}" data-personal-id="${task.id}">
                <div class="personal-card-header">
                  <strong>${task.name}</strong>
                  <span class="todo-count-badge">📝 ${task.todos ? task.todos.length : 0} items</span>
                </div>
              </li>
            `).join('')}
            ${personalTasks.length === 0 ? '<p class="empty-state-text">No active personal tasks found. Click "Add Task" to get started.</p>' : ''}
          </ul>
        </div>

        <!-- Right Column: Detail Panel Canvas -->
        <div id="personal-detail-panel" class="personal-detail-panel">
          <div class="panel-placeholder">
            <p>Select a personal task item from the explorer list to manage details, view nested items, or append sub-todos.</p>
          </div>
        </div>
      </div>
    `;

    const masterList = document.getElementById('personal-master-list');
    if (masterList) {
      masterList.addEventListener('click', (e) => {
        const card = e.target.closest('.personal-list-card');
        if (!card) return;

        masterList.querySelectorAll('.personal-list-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const taskId = card.getAttribute('data-personal-id');
        activePersonalId = taskId; 
        
        const targetedTask = personalTasks.find(t => t.id === taskId);
        if (targetedTask) {
          renderPersonalDetails(targetedTask, savedTasks, () => renderPersonalDashboard(contentArea, personalBtn));
        }
      });
    }

    if (activePersonalId) {
      const activeTask = personalTasks.find(t => t.id === activePersonalId);
      if (activeTask) {
        renderPersonalDetails(activeTask, savedTasks, () => renderPersonalDashboard(contentArea, personalBtn));
      } else {
        activePersonalId = null; 
      }
    }
  };

  // 🎯 EVENT DELEGATION: Intercepts click elements matching your template button
  document.addEventListener('click', (e) => {
    const personalBtn = e.target.closest('#btn-personal');
    if (!personalBtn) return;

    console.log("🎯 Personal sidebar button found and intercepted at runtime!");
    const contentArea = document.getElementById('content');

    if (!contentArea) {
      console.error("❌ CRITICAL ERROR: Could not find <div id='content'> in your HTML structure!");
      return;
    }

    // Format the sidebar button icon natively if needed
    if (!personalBtn.querySelector('.side-icon')) {
      const text = personalBtn.textContent.trim();
      personalBtn.innerHTML = `
        <span class="side-icon">👤</span>
        <span class="side-text">${text}</span>
      `;
    }

    activePersonalId = null; 
    renderPersonalDashboard(contentArea, personalBtn); 
  });
}

// Detail Panel Window Sub-Renderer
function renderPersonalDetails(task, allTasks, refreshParentDashboard) {
  const detailPanel = document.getElementById('personal-detail-panel');
  if (!detailPanel) return;

  const displayDate = task.date ? format(parseISO(task.date), 'MMMM d, yyyy') : 'No due date set';

  detailPanel.innerHTML = `
    <div id="personal-view-mode">
      <div class="detail-header-row">
        <h2>${task.name}</h2>
        <button id="edit-personal-meta-btn" class="edit-task-btn">✏️ Edit Details</button>
      </div>
      
      <div class="personal-meta-strip">
        <span class="priority-indicator-pill priority-${task.priority}">Priority: ${task.priority}</span>
        <span class="date-indicator-pill">📅 Due: ${displayDate}</span>
      </div>

      ${task.note ? `<div class="personal-notes-box"><h4>Notes:</h4><p>${task.note}</p></div>` : ''}

      <h3>Personal Checklist Items</h3>
      <ul class="detail-todo-checklist">
        ${task.todos && task.todos.length > 0 
          ? task.todos.map((todo, idx) => `
              <li>
                <label class="checklist-item-wrapper">
                  <input type="checkbox" class="todo-complete-checkbox" data-todo-index="${idx}">
                  <span>${todo}</span>
                </label>
              </li>
            `).join('')
          : '<p class="empty-state-text">No active todos assigned to this list item.</p>'
        }
      </ul>

      <form id="inline-add-todo-form" class="inline-todo-form">
        <input type="text" id="new-inline-todo-input" required placeholder="Add a new item to this checklist...">
        <button type="submit" id="add-inline-todo-btn">➕ Add Item</button>
      </form>
    </div>

    <div id="personal-edit-mode" style="display: none;">
      <h3>✏️ Modify Personal Properties</h3>
      <form id="personal-property-edit-form" class="property-edit-form">
        <label>Task Name:</label>
        <input type="text" id="edit-p-name" value="${task.name}" required>

        <label>Priority:</label>
        <select id="edit-p-priority">
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
        </select>

        <label>Due Date:</label>
        <input type="date" id="edit-p-date" value="${task.date || ''}">

        <label>Notes:</label>
        <textarea id="edit-p-note">${task.note || ''}</textarea>

        <div class="edit-mode-actions">
          <button type="submit" class="save-meta-btn">💾 Apply Changes</button>
          <button type="button" id="cancel-p-edit-btn" class="cancel-meta-btn">Cancel</button>
          
          <!-- Destructive Delete Button 🗑️ -->
          <button type="button" id="delete-personal-btn" class="delete-personal-btn">🗑️ Delete Task</button>
        </div>
      </form>
    </div>
  `;

  setupDetailPanelListeners(task, allTasks, refreshParentDashboard);
}

function setupDetailPanelListeners(task, allTasks, refreshParentDashboard) {
  const viewModeDiv = document.getElementById('personal-view-mode');
  const editModeDiv = document.getElementById('personal-edit-mode');
  
  const editMetaBtn = document.getElementById('edit-personal-meta-btn');
  const cancelEditBtn = document.getElementById('cancel-p-edit-btn');
  const deletePersonalBtn = document.getElementById('delete-personal-btn'); 
  
  const metaEditForm = document.getElementById('personal-property-edit-form');
  const inlineTodoForm = document.getElementById('inline-add-todo-form');
  const checklist = document.querySelector('.detail-todo-checklist');

  if (editMetaBtn) {
    editMetaBtn.addEventListener('click', () => {
      viewModeDiv.style.display = 'none';
      editModeDiv.style.display = 'block';
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      editModeDiv.style.display = 'none';
      viewModeDiv.style.display = 'block';
    });
  }

  // Handle Deletion Click Logic 🗑️
  if (deletePersonalBtn) {
    deletePersonalBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to permanently delete "${task.name}"?`)) {
        const mainIndex = allTasks.findIndex(t => t.id === task.id);
        if (mainIndex !== -1) {
          allTasks.splice(mainIndex, 1);
        }
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

        // Programmatically re-click the personal sidebar button to refresh layout cleanly
        const personalBtn = document.querySelector('#btn-personal');
        if (personalBtn) personalBtn.click();
      }
    });
  }

  if (metaEditForm) {
    metaEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      task.name = document.getElementById('edit-p-name').value.trim();
      task.priority = document.getElementById('edit-p-priority').value;
      task.date = document.getElementById('edit-p-date').value;
      task.note = document.getElementById('edit-p-note').value.trim();

      commitStateChanges(allTasks, refreshParentDashboard);
    });
  }

  if (inlineTodoForm) {
    inlineTodoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputField = document.getElementById('new-inline-todo-input');
      const todoValue = inputField.value.trim();

      if (todoValue) {
        if (!task.todos) task.todos = [];
        task.todos.push(todoValue);
        commitStateChanges(allTasks, refreshParentDashboard);
      }
    });
  }

  if (checklist) {
    checklist.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-complete-checkbox')) {
        const targetIdx = parseInt(e.target.getAttribute('data-todo-index'), 10);
        e.target.closest('li').style.opacity = '0.4';
        setTimeout(() => {
          task.todos.splice(targetIdx, 1);
          commitStateChanges(allTasks, refreshParentDashboard);
        }, 250);
      }
    });
  }
}

function commitStateChanges(allTasks, refreshParentDashboard) {
  localStorage.setItem('app_tasks', JSON.stringify(allTasks));
  refreshParentDashboard(); 
}
