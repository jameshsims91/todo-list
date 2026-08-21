import './personal.css';
import { format, parseISO } from 'date-fns';
import { sortTasksByDueDate } from '../../utils/task_sorter.js';
import { generateCountdownBannerHTML, generatePriorityPillHTML, generateProgressBarHTML } from '../../utils/tasks_helpers.js';
import { toggleCalendarDropdown } from '../../utils/calendar_dropdown.js';
import { attachSwipeGestures } from '../../utils/touch_gestures.js';

let activePersonalId = null;

export function initPersonal() {
  console.log("🔍 initPersonal() event delegate listener registered!");

  const renderPersonalDashboard = (contentArea, personalBtn) => {
    console.log("🚀 renderPersonalDashboard() engine firing into #content canvas!");
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    const personalTasksRaw = savedTasks.filter(task => task.category === 'personal');
    const personalTasks = sortTasksByDueDate(personalTasksRaw);

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (personalBtn) personalBtn.classList.add('active');

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
                <div class="priority-dot-indicator status-${personal.priority}"></div>
                
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
      attachSwipeGestures(
        masterList,
        (swipeDuplicatedId) => {
          // 👉 CALLBACK: Handle Fast Swipe-Right Duplication Loop
          const targetTask = anytimeTasks.find(t => t.id === swipeDuplicatedId);
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
          const targetTask = anytimeTasks.find(t => t.id === swipeDeletedId);
          if (targetTask && confirm(`Permanently delete "${targetTask.name}"?`)) {
            const freshArray = savedTasks.filter(t => t.id !== swipeDeletedId);
            localStorage.setItem('app_tasks', JSON.stringify(freshArray));
            activeAnytimeId = null; // Clear view references
            renderDashboardView(); // Instant layout repaint!
          }
        }
      );
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

  document.addEventListener('click', (e) => {
    const personalBtn = e.target.closest('#btn-personal');
    if (!personalBtn) return;

    console.log("🎯 Personal sidebar button found and intercepted at runtime!");
    const contentArea = document.getElementById('content');

    if (!contentArea) {
      console.error("❌ CRITICAL ERROR: Could not find <div id='content'> in your HTML structure!");
      return;
    }

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

function renderPersonalDetails(task, allTasks, refreshParentDashboard) {
  const detailPanel = document.getElementById('personal-detail-panel');
  if (!detailPanel) return;

  const displayDate = task.date ? format(parseISO(task.date), 'MMMM d, yyyy') : 'No due date set';

  detailPanel.innerHTML = `
    <div id="personal-view-mode">
      ${generateCountdownBannerHTML(task.date)}

      <div class="detail-header-row" style="margin-top: 1rem;">
        <h2>${task.name}</h2>
        <div class="detail-header-actions-cluster">
          ${task.todos && task.todos.some(t => t.completed) ? `<button type="button" id="clear-finished-subtodos-btn" class="clear-finished-btn" title="Purge resolved sub-todos">🧹 Clear Checked</button>
          ` : ''}
          <button type="button" id="duplicate-personal-btn" class="duplicate-task-btn" title="Duplicate task pattern">👥 Duplicate</button>
          <button id="edit-personal-meta-btn" class="edit-task-btn">✏️ Edit Details</button>
        </div>
      </div>
      
      <div class="personal-meta-strip">
        ${generatePriorityPillHTML(task.priority)}
        <span class="date-indicator-pill">📅 Due: ${displayDate}</span>
      </div>

      ${generateProgressBarHTML(task.todos)}

      ${task.note ? `<div class="personal-notes-box" style="margin-top: 1.25rem;"><h4>Notes:</h4><p>${task.note}</p></div>` : ''}

      <h3 style="margin-top: 1.5rem;">Personal Checklist Items</h3>
      <ul class="detail-todo-checklist" id="draggable-todo-list">
        ${task.todos && task.todos.length > 0 
          ? task.todos.map((todo, idx) => `
              <li class="todo-draggable-row" draggable="true" data-index="${idx}">
                <label class="checklist-item-wrapper ${todo.completed ? 'checked-item' : ''}">
                  <span class="drag-grip-handle">☰</span>
                  <input type="checkbox" class="todo-complete-checkbox" data-todo-index="${idx}" ${todo.completed ? 'checked' : ''}>
                  <span>${todo.text || todo}</span>
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
        <div class="custom-cal-trigger-wrapper">
          <button type="button" id="edit-p-date-trigger" class="custom-date-trigger-btn" data-raw-date="${task.date || ''}">
            📅 ${task.date ? format(parseISO(task.date), 'MMMM d, yyyy') : 'Set a target deadline...'}
          </button>
        </div>

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
  const duplicateBtn = document.getElementById('duplicate-personal-btn');
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
      task.todos = task.todos.filter(t => !t.completed);

      // Commit changes safely to local disk memory structures
      const mainIndex = allTasks.findIndex(t => t.id === task.id);
      if (mainIndex !== -1) allTasks[mainIndex] = task;
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));

      console.log("🧹 Completed sub-tasks purged from record cache bounds.");
      renderPersonalDetails(task, allTasks, refreshParentDashboard); // Smooth inline screen refresh
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
  
  if (deletePersonalBtn) {
    deletePersonalBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to permanently delete "${task.name}"?`)) {
        const mainIndex = allTasks.findIndex(t => t.id === task.id);
        if (mainIndex !== -1) {
          allTasks.splice(mainIndex, 1);
        }
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

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
      task.date = document.getElementById('edit-p-date-trigger').getAttribute('data-raw-date');
      task.note = document.getElementById('edit-p-note').value.trim();

      commitStateChanges(allTasks, refreshParentDashboard);
    });
  }

  if (duplicateBtn) {
    duplicateBtn.addEventListener('click', () => {
      const duplicatedTask = {
        ...task,
        id: Date.now().toString(),
        name: `${task.name} (Copy)`,
        todos: task.todos ? task.todos.map(t => ({ ...t, completed: false })) : []
      };

      allTasks.push(duplicatedTask);
      localStorage.setItem('app_theme', JSON.stringify(allTasks));
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));
      
      console.log(`👥 Task duplicated successfully: ${duplicatedTask.name}`);
      refreshParentDashboard(); // Re-render lists layout cleanly
    });
  }

  if (checklist) {
    checklist.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-complete-checkbox')) {
        const targetIdx = parseInt(e.target.getAttribute('data-todo-index'), 10);
        
        // 🎯 SAFETY FALLBACK: If the task is an old string, convert it to an object instantly!
        if (typeof task.todos[targetIdx] === 'string') {
          task.todos[targetIdx] = { text: task.todos[targetIdx], completed: false };
        }

        // Now this mutation safe check will NEVER throw an error string notice
        task.todos[targetIdx].completed = e.target.checked;
        
        // Save modified task details array directly back into localStorage cache bounds
        const mainIndex = allTasks.findIndex(t => t.id === task.id);
        if (mainIndex !== -1) allTasks[mainIndex] = task;
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));

        // Re-trigger layout engine paints to slide progress fills smoothly
        // Make sure this matches your local render function name (e.g., renderProjectDetails or renderPersonalDetails)
        if (task.category === 'personal') renderPersonalDetails(task, allTasks, refreshParentDashboard);
      }
    });
  }

  // C. Handle Inline Form Additions
  if (inlineTodoForm) {
    inlineTodoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputField = document.getElementById('new-inline-todo-input');
      const todoValue = inputField.value.trim();

      if (todoValue) {
        if (!task.todos) task.todos = [];
        // Append structured todo mapping object properties
        task.todos.push({ text: todoValue, completed: false });
        
        const mainIndex = allTasks.findIndex(t => t.id === task.id);
        if (mainIndex !== -1) allTasks[mainIndex] = task;
        localStorage.setItem('app_tasks', JSON.stringify(allTasks));
        
        renderPersonalDetails(task, allTasks, refreshParentDashboard);
      }
    });
  }

  if (draggableList && task.todos && task.todos.length > 0) {
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
      const reorderedTodos = [...task.todos];
      const [removedTodo] = reorderedTodos.splice(draggedItemIdx, 1); // Extract dragged row
      reorderedTodos.splice(targetItemIdx, 0, removedTodo);        // Insert at drop destination index

      // Update references back into global localStorage cache bounds
      task.todos = reorderedTodos;
      const mainIndex = allTasks.findIndex(t => t.id === task.id);
      if (mainIndex !== -1) allTasks[mainIndex] = task;
      localStorage.setItem('app_tasks', JSON.stringify(allTasks));

      // Force immediate view update to display the new task sequence instantly
      renderPersonalDetails(task, allTasks, refreshParentDashboard);
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
}
