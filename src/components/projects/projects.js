import { format, parseISO } from 'date-fns';
import { sortTasksByDueDate } from '../../utils/task_sorter.js';
import { generateCountdownBannerHTML, generatePriorityPillHTML, generateProgressBarHTML } from '../../utils/tasks_helpers.js';
import { toggleCalendarDropdown } from '../../utils/calendar_dropdown.js';
import { attachSwipeGestures } from '../../utils/touch_gestures.js';

let activeProjectId = null;

export function initProjects() {
  console.log("🔍 initProjects() event delegate listener registered!");

  const renderDashboardView = (contentArea, projectsBtn) => {
    console.log("🚀 renderDashboardView() engine firing into #content canvas!");
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    const projectTasksRaw = savedTasks.filter(task => task.category === 'projects');

    const projects = sortTasksByDueDate(projectTasksRaw);

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (projectsBtn) projectsBtn.classList.add('active');

    contentArea.innerHTML = `
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
                <div class="priority-dot-indicator status-${project.priority}"></div>
                
                <div class="project-card-header">
                  <strong>${project.name}</strong>
                  <span class="todo-count-badge">📝 ${project.todos ? project.todos.length : 0} items</span>
                </div>
              </li>
            `).join('')}
            ${projects.length === 0 ? '<p class="empty-state-text">No active project tasks found. Click "Add Task" to get started.</p>' : ''}
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
          renderProjectDetails(targetedProject, savedTasks, () => renderDashboardView(contentArea, projectsBtn));
        }
      });
      attachSwipeGestures(
        masterList,
        (swipeDuplicatedId) => {
          // 👉 CALLBACK: Handle Fast Swipe-Right Duplication Loop
          const targetTask = projectTasks.find(t => t.id === swipeDuplicatedId);
          if (targetTask) {
            const copy = {
              ...targetTask,
              id: Date.now().toString(),
              name: `${targetTask.name} (Copy)`,
              todos: targetTask.todos ? targetTask.todos.map(t => ({ ...t, completed: false })) : []
            };
            savedTasks.push(copy);
            localStorage.setItem('app_tasks', JSON.stringify(savedTasks));
            renderDashboardView(); // Instant layout repaint!
          }
        },
        (swipeDeletedId) => {
          // 👈 CALLBACK: Handle Fast Swipe-Left Destructive Deletion Loop
          const targetTask = projectTasks.find(t => t.id === swipeDeletedId);
          if (targetTask && confirm(`Permanently delete "${targetTask.name}"?`)) {
            const freshArray = savedTasks.filter(t => t.id !== swipeDeletedId);
            localStorage.setItem('app_tasks', JSON.stringify(freshArray));
            activeAnytimeId = null; // Clear view references
            renderDashboardView(); // Instant layout repaint!
          }
        }
      );
    }

    if (activeProjectId) {
      const activeProject = projects.find(p => p.id === activeProjectId);
      if (activeProject) {
        renderProjectDetails(activeProject, savedTasks, () => renderDashboardView(contentArea, projectsBtn));
      } else {
        activeProjectId = null; 
      }
    }
  };

  document.addEventListener('click', (e) => {
    const projectsBtn = e.target.closest('#btn-projects');
    if (!projectsBtn) return; 

    console.log("🎯 Projects sidebar button found and intercepted at runtime!");
    const contentArea = document.getElementById('content');

    if (!contentArea) {
      console.error("❌ CRITICAL ERROR: Could not find <div id='content'> in your HTML structure!");
      return;
    }

    if (!projectsBtn.querySelector('.side-icon')) {
      const text = projectsBtn.textContent.trim();
      projectsBtn.innerHTML = `
        <span class="side-icon">📁</span>
        <span class="side-text">${text}</span>
      `;
    }

    activeProjectId = null; 
    renderDashboardView(contentArea, projectsBtn); 
  });
}

function renderProjectDetails(project, allTasks, refreshParentDashboard) {
  const detailPanel = document.getElementById('project-detail-panel');
  if (!detailPanel) return;

  const displayDate = project.date ? format(parseISO(project.date), 'MMMM d, yyyy') : 'No due date set';

  detailPanel.innerHTML = `
  <!--Read-Only View Panel Frame -->
  <div id="project-view-mode">

    ${generateCountdownBannerHTML(project.date)}
    
    <div class="detail-header-row" style="margin-top: 1rem;">
      <h2>${project.name}</h2>
      <div class="detail-header-actions-cluster">
        ${project.todos && project.todos.some(t => t.completed) ? `<button type="button" id="clear-finished-subtodos-btn" class="clear-finished-btn" title="Purge resolved sub-todos">🧹 Clear Checked</button>
        ` : ''}
        <button type="button" id="duplicate-project-btn" class="duplicate-task-btn" title="Duplicate task pattern">👥 Duplicate</button>
        <button id="edit-project-meta-btn" class="edit-task-btn">✏️ Edit Project Details</button>
      </div>
    </div>
    
    <div class="project-meta-strip">
      ${generatePriorityPillHTML(project.priority)}
      <span class="date-indicator-pill">📅 Due: ${displayDate}</span>
    </div>

    ${generateProgressBarHTML(project.todos)}
    
    ${project.note ? `<div class="project-notes-box" style="margin-top: 1.25rem;"><h4>Notes:</h4><p>${project.note}</p></div>` : ''}
    
    <h3 style="margin-top: 1.5rem;">Project Checklist Items</h3>
    <ul class="detail-todo-checklist" id="draggable-todo-list">
      ${project.todos && project.todos.length > 0
        ? project.todos.map((todo, idx) => `
          <li class="todo-draggable-row" draggable="true" data-index="${idx}">
            <label class="checklist-item-wrapper ${todo.completed ? 'checked-item' : ''}">
              <span class="drag-grip-handle">☰</span>
              <input type="checkbox" class="todo-complete-checkbox" data-todo-index="${idx}" ${todo.completed ? 'checked' : ''}>
              <span>${todo.text || todo}</span>
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
      <div class="custom-cal-trigger-wrapper">
        <button type="button" id="edit-p-date-trigger" class="custom-date-trigger-btn" data-raw-date="${project.date || ''}">
          📅 ${project.date ? format(parseISO(project.date), 'MMMM d, yyyy') : 'Set a target deadline...'}
        </button>
      </div>
      
      <label>Project Notes:</label>
      <textarea id="edit-p-note">${project.note || ''}</textarea>
      
      <div class="edit-mode-actions">
        <button type="submit" class="save-meta-btn">💾 Apply Changes</button>
        <button type="button" id="cancel-p-edit-btn" class="cancel-meta-btn">Cancel</button>
        <button type="button" id="delete-project-btn" class="delete-project-btn">🗑️ Delete Project</button>
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

  const deleteProjectBtn = document.getElementById('delete-project-btn');
  
  const metaEditForm = document.getElementById('project-property-edit-form');
  const duplicateBtn = document.getElementById('duplicate-project-btn');
  const inlineTodoForm = document.getElementById('inline-add-todo-form');
  const checklist = document.querySelector('.detail-todo-checklist');
  const draggableList = document.getElementById('draggable-todo-list');
  const clearFinishedBtn = document.getElementById('clear-finished-subtodos-btn');
  const dateTriggerBtn = document.getElementById('edit-p-date-trigger');

  if (dateTriggerBtn) {
    dateTriggerBtn.addEventListener('click', () => {
      const currentSavedDate = dateTriggerBtn.getAttribute('data-raw-date');
      
      // Launch the core engine slider component panel 🎯
      toggleCalendarDropdown(dateTriggerBtn, currentSavedDate, (newSelectedDateISO) => {
        // 1. Update button attributes and UI display values instantly on select
        dateTriggerBtn.setAttribute('data-raw-date', newSelectedDateISO);
        
        if (newSelectedDateISO) {
          // Quick format using date-fns formatting strings
          const parsed = parseISO(newSelectedDateISO);
          dateTriggerBtn.innerHTML = `📅 ${format(parsed, 'MMM d, yyyy')}`;
        } else {
          dateTriggerBtn.innerHTML = `Set a target deadline...`;
        }
      });
    });
  }

  if (clearFinishedBtn) {
    clearFinishedBtn.addEventListener('click', () => {
      // Keep only the unchecked todo item rows 🧹
      project.todos = project.todos.filter(t => !t.completed);

      // Commit changes safely to local disk memory structures
      const mainIndex = allTasks.findIndex(t => t.id === project.id);
      if (mainIndex !== -1) allTasks[mainIndex] = project;
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));

      console.log("🧹 Completed sub-tasks purged from record cache bounds.");
      renderProjectDetails(project, allTasks, refreshParentDashboard); // Smooth inline screen refresh
    });
  }

  if (duplicateBtn) {
    duplicateBtn.addEventListener('click', () => {
      const duplicatedTask = {
        ...project,
        id: Date.now().toString(),
        name: `${project.name} (Copy)`,
        todos: project.todos ? project.todos.map(t => ({...t, completed: false})) : []
      };

      allTasks.push(duplicatedTask);
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));

      console.log(`👥 Task duplicated successfully: ${duplicatedTask.name}`);
      refreshParentDashboard();
    });
  }

  if (checklist) {
    checklist.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-complete-checkbox')) {
        const targetIdx = parseInt(e.target.getAttribute('data-todo-index'), 10);
        
        // 🎯 SAFETY FALLBACK: If the task is an old string, convert it to an object instantly!
        if (typeof project.todos[targetIdx] === 'string') {
          project.todos[targetIdx] = { text: project.todos[targetIdx], completed: false };
        }

        // Now this mutation safe check will NEVER throw an error string notice
        project.todos[targetIdx].completed = e.target.checked;
        
        // Save modified task details array directly back into localStorage cache bounds
        const mainIndex = allTasks.findIndex(t => t.id === project.id);
        if (mainIndex !== -1) allTasks[mainIndex] = project;
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

        // Re-trigger layout engine paints to slide progress fills smoothly
        // Make sure this matches your local render function name (e.g., renderProjectDetails or renderPersonalDetails)
        if (project.category === 'projects') renderProjectDetails(project, allTasks, refreshParentDashboard);
      }
    });
  }

  if (inlineTodoForm) {
    inlineTodoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputField = document.getElementById('new-inline-todo-input');
      const todoValue = inputField.value.trim();

      if (todoValue) {
        if (!project.todos) project.todos = [];
        project.todos.push({ text: todoValue, completed: false });

        const mainIndex = allTasks.findIndex(t => t.id === project.id);
        if (mainIndex !== -1) allTasks[mainIndex] = project;
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

        renderProjectDetails(project, allTasks, refreshParentDashboard);
      }
    });
  }

  if (deleteProjectBtn) {
    deleteProjectBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to permanently delete "${project.name}"`)) {
        const mainIndex = allTasks.findIndex(t => t.id === project.id);
        if (mainIndex !== -1) {
          allTasks.splice(mainIndex, 1);
        }

        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

        const projectsBtn = document.querySelector('#btn-projects');
        if (projectsBtn) {
          projectsBtn.click();
        }
      }
    });
  }

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
      project.date = document.getElementById('edit-p-date-trigger').getAttribute('data-raw-date');
      project.note = document.getElementById('edit-p-note').value.trim();

      commitStateChanges(allTasks, refreshParentDashboard);
    });
  }

  if (draggableList && project.todos && project.todos.length > 0) {
    let draggedItemIdx = null;

    // 1. Capture the index of the row being dragged
    draggableList.addEventListener('dragstart', (e) => {
      const row = e.target.closest('.todo-draggable-row');
      if (!row) return;
      
      draggedItemIdx = parseInt(row.getAttribute('data-index'), 10);
      row.classList.add('is-dragging');
      
      // Set a clean phantom ghost drag visual effect standard
      e.dataTransfer.effectAllowed = 'move';
    });

    // 2. Track hover states and add a border line above/below adjacent rows
    draggableList.addEventListener('dragover', (e) => {
      e.preventDefault(); // Required to allow a drop event to trigger safely
      const overRow = e.target.closest('.todo-draggable-row');
      if (!overRow) return;

      overRow.classList.add('drag-over-target');
    });

    // 3. Remove border highlights when the dragged item leaves an adjacent row
    draggableList.addEventListener('dragleave', (e) => {
      const overRow = e.target.closest('.todo-draggable-row');
      if (overRow) overRow.classList.remove('drag-over-target');
    });

    // 4. Handle dropping the item and recalculating array indices 🎯
    draggableList.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetRow = e.target.closest('.todo-draggable-row');
      if (!targetRow) return;

      targetRow.classList.remove('drag-over-target');
      const targetItemIdx = parseInt(targetRow.getAttribute('data-index'), 10);

      // If dropped on itself, exit early
      if (draggedItemIdx === targetItemIdx) return;

      // Mutate the internal array sequence layout safely 🎯
      const reorderedTodos = [...project.todos];
      const [removedTodo] = reorderedTodos.splice(draggedItemIdx, 1); // Extract dragged row
      reorderedTodos.splice(targetItemIdx, 0, removedTodo);        // Insert at drop destination index

      // Update references back into global localStorage cache bounds
      project.todos = reorderedTodos;
      const mainIndex = allTasks.findIndex(t => t.id === project.id);
      if (mainIndex !== -1) allTasks[mainIndex] = project;
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));

      // Force immediate view update to display the new task sequence instantly
      renderProjectDetails(project, allTasks, refreshParentDashboard);
    });

    // 5. Clean up shadow opacity classes when finger/mouse releases
    draggableList.addEventListener('dragend', (e) => {
      const row = e.target.closest('.todo-draggable-row');
      if (row) row.classList.remove('is-dragging');
      
      // Safety sweep to clear out accidental styling leakages
      draggableList.querySelectorAll('.todo-draggable-row').forEach(r => {
        r.classList.remove('drag-over-target');
      });
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
