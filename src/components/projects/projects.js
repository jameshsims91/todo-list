import './projects.css';
import { format, parseISO } from 'date-fns';

let activeProjectId = null;

export function initProjects() {
  const contentArea = document.getElementById('content');
  const projectsBtn = document.querySelector('#btn-projects');

  if (!contentArea) return;

  if (projectsBtn && !projectsBtn.querySelector('.side-icon')) {
    const text = projectsBtn.textContent.trim();
    projectsBtn.innerHTML = `
      <span class="side-icon">📁</span>
      <span class="side-text">${text}</span>
    `;
  }

  const renderDashboardView = () => {
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    const projects = savedTasks.filter(task => task.category === 'projects');

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (projectsBtn) projectsBtn.classList.add('active');

    contentArea.innherHTML = `
      <div class="view-header">
        <h1>📁 Projects Dashboard</h1>
      </div>
      <div class="projects-layout-grid">
        <!-- Left Column: Master Explorer List -->
        <div class="projects-master-panel">
          <h3>All Active Projects</h3>
          <ul id="projects-master-list">
            ${projects.map(project => `
              <li class="project-list-card ${activeProjectId === project.id ? 'selected' : ''}" data-project-id="${project.id}">
                <div class="project-card-header">
                  <strong>${project.name}</strong>
                  <span class="todo-count-badge">📝 ${project.todos ? project.todos.length : 0} items</span>
                </div>
              </li>
            `).join('')}
            ${projects.length === 0 ? '<p class="empty-state-text">No active project task found. Click "Add Task" to get started.</p>' : ''}
          </ul>
        </div>
        
        <!-- Right Column: Context Detail Panel Canvas -->
        <div id="project-detail-panel" class="project-detail-panel">
          <div class="panel-placeholder">
            <p>Select a project from the explorer list to manage details, view nested items, or append sub-todos.</p>
          </div>
        </div>
      </div>
    `;

    const masterList = document.getElementById('projects-master-list');
    if (masterList) {
      masterList.addEventListener('click', (e) => {
        const card = e.target.closest('.project-list-card');
        if (!card) return;

        masterList.querySelectorAll('.project-list-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const projectId = card.getAttribute('data-project-id');
        activeProjectId = projectId;

        const targetedProject = projects.find(p => p.id === projectId);
        if (targetedProject) {
          renderProjectDetails(targetedProject, savedTasks, renderDashboardView);
        }
      });
    }

    if (activeProjectId) {
      const activeProject = projects.find(p => p.id === activeProjectId);
      if (activeProject) {
        renderProjectDetails(activeProject, savedTasks, renderDashboardView);
      } else {
        activeProjectId = null;
      }
    }
  };

  if (projectsBtn) {
    projectsBtn.addEventListener('click', () => {
      console.log('Projects Dashboard rendered!');
      activeProjectId = null;
      renderDashboardView();
    });
  }
}

function renderProjectDetails(project, allTasks, refreshParentDashboard) {
  const detailPanel = document.getElementById('project-detail-panel');
  if (!detailPanel) return;

  const displayDate = project.date ? format(parseISO(project.date), 'MMMM d, yyyy') : 'No due date set';

  detailPanel.innerHTML = `
  <!--Read-Only View Panel Frame -->
  <div id="project-view-mode">
    <div class="detail-header-row">
      <h2>${project.name}</h2>
      <button id="edit-project-meta-btn" class="edit-task-btn">✏️ Edit Project Details</button>
    </div>
    
    <div class="project-meta-strip">
      <span class="priority-indicator-pill priority-${project.priority}">Priority: ${project.priority}</span>
      <span class="date-indicator-pill">📅 Due: ${displayDate}</span>
    </div>
    
    ${project.note ? `<div class="project-notes-box"><h4>Notes:</h4><p>${project.note}</p></div>` : ''}
    
    <h3>Project Checklist Items</h3>
    <ul class="detail-todo-checklist">
      ${project.todos && project.todos.length > 0
        ? project.todos.map((todo, idx) => `
          <li>
            <label class="checklist-item-wrapper">
              <input type="checkbox" class="todo-complete-checkbox" data-todo-index="${idx}">
              <span>${todo}</span>
            </label>
          </li>
        `).join('') : '<p class="empty-state-text">No active todos assigned to this project.</p>'
      }
    </ul>
    
    <!-- Inline Add Todo Field Form -->
    <form id="inline-add-todo-form" class="inline-todo-form">
      <input type="text" id="new-inline-todo-input" required placeholder="Add a new item to this checklist...">
      <button type="submit" id="add-inline-todo-btn">➕ Add Item</button>
    </form>
  </div>
  
  <!-- Editable Form Context Frame Block -->
  <div id="project-edit-mode" style="display: none;">
    <h3>✏️ Modify Project Properties</h3>
    <form id="project-property-edit-form" class="property-edit-form">
      <label>Project Name:</label>
      <input type="text" id="edit-p-name" value="${project.name}" required>
      
      <label>Priority:</label>
      <select id="edit-p-priority">
        <option value="low" ${project.priority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${project.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${project.priority === 'high' ? 'selected' : ''}>High</option>
      </select>
      
      <label>Due Date:</label>
      <input type="date" id="edit-p-date" value="${project.date || ''}">
      
      <label>Project Notes:</label>
      <textarea id="edit-p-note">${project.note || ''}</textarea>
      
      <div class="edit-mode-actions">
        <button type="submit" class="save-meta-btn">💾 Apply Changes</button>
        <button type="button" id="cancel-p-edit-btn" class="cancel-meta-btn">Cancel</button>
      </div>
    </form>
  </div>
`;

setupDetailPanelListeners(project, allTasks, refreshParentDashboard);
}

function setupDetailPanelListeners(project, allTasks, refreshParentDashboard) {
  const viewModeDiv = document.getElementById('project-view-mode');
  const editModeDiv = document.getElementById('project-edit-mode');
  
  const editMetaBtn = document.getElementById('edit-project-meta-btn');
  const cancelEditBtn = document.getElementById('cancel-p-edit-btn');
  
  const metaEditForm = document.getElementById('project-property-edit-form');
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

  if (metaEditForm) {
    metaEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
    
      project.name = document.getElementById('edit-p-name').value.trim();
      project.priority = document.getElementById('edit-p-priority').value;
      project.date = document.getElementById('edit-p-date').value;
      project.note = document.getElementById('edit-p-note').value.trim();

      commitStateChanges(allTasks, refreshParentDashboard);
    });
  }

  if (inlineTodoForm) {
    inlineTodoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputField = document.getElementById('new-inline-todo-input');
      const todoValue = inputField.value.trim();

      if (todoValue) {
        if (!project.todos) project.todos = [];
        project.todos.push(todoValue);
      
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
          project.todos.splice(targetIdx, 1);
          commitStateChanges(allTasks, refreshParentDashboard);
        }, 250);
      }
    });
  }
}

function commitStateChanges(allTasks, refreshParentDashboard) {
  localStorage.setItem('app_tasks', JSON.stringify(allTasks));
  refreshParentDashboard();

  const projectSidebarContainer = document.getElementById('projects-list');
  if (projectSidebarContainer) {
    projectSidebarContainer.innerHTML = allTasks
      .filter(t => t.category === "projects")
      .map(task => `
        <li class="task-item reopen-task-btn priority-${task.priority}" data-id="${task.id}">
          <strong>${task.name}</strong>
        </li>
      `).join('');
  }
}
