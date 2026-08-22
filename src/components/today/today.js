import './today.css';
import { format, parseISO, isToday } from 'date-fns';

export function initToday() {
  console.log("🔍 initToday() event listener registered!");

  const todayBtn = document.querySelector('#btn-today');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  if (todayBtn && !todayBtn.querySelector('.side-icon')) {
    const text = todayBtn.textContent.trim();
    todayBtn.innerHTML = `
      <span class="side-icon">☀️</span>
      <span class="side-text">${text}</span>
    `;
  }

  const renderTodayView = () => {
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    
    // Filter tasks whose explicit due date matches today's calendar date
    const todayTasks = savedTasks.filter(task => {
      if (!task.date) return false;
      try {
        return isToday(parseISO(task.date));
      } catch (err) {
        return false;
      }
    });

    // Toggle navigation highlight states
    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (todayBtn) todayBtn.classList.add('active');

    contentArea.innerHTML = `
      <div class="view-header">
        <h1>☀️ Today's Agenda</h1>
        <p class="current-date-subtitle">${format(new Date(), 'eeee, MMMM d, yyyy')}</p>
      </div>
      
      <div class="today-container-panel">
        <div class="today-feed-header">
          <h3>Daily Focus Items</h3>
          <span class="today-count-pill">${todayTasks.length} Assigned</span>
        </div>

        <div id="today-cards-feed" class="today-cards-feed">
          ${todayTasks.map(task => {
            // Render the parent card, and then place the checklist entirely outside/beneath it 🎯
            const subTasksHTML = task.todos && task.todos.length > 0 
              ? `
                <div class="today-detached-subtasks-wrapper">
                  <ul class="today-detached-list">
                    ${task.todos.map((todo, idx) => {
                      const todoText = typeof todo === 'object' ? todo.text : todo;
                      return `
                        <li class="today-detached-item-row" data-parent-id="${task.id}" data-todo-index="${idx}">
                          <label class="today-detached-label">
                            <input type="checkbox" class="today-purge-subtodo-checkbox" 
                              data-parent-id="${task.id}" 
                              data-todo-index="${idx}">
                            <span class="checkbox-custom-visual"></span>
                            <span class="todo-text-display">${todoText}</span>
                          </label>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              ` : '';

            return `
              <!-- Main Parent Card Container Box -->
              <div class="today-task-card priority-${task.priority}" data-task-id="${task.id}">
                <div class="today-card-left">
                  <input type="checkbox" class="task-complete-checkbox" data-task-id="${task.id}">
                  <div class="today-card-details">
                    <h4>${task.name}</h4>
                    ${task.note ? `<p class="today-task-note">${task.note}</p>` : ''}
                    <span class="category-tag-pill">${task.category}</span>
                  </div>
                </div>
              </div>

              <!-- Detached Sub-tasks List Elements Injected Entirely Beneath Container 🎯 -->
              ${subTasksHTML}
            `;
          }).join('')}

          ${todayTasks.length === 0 ? `
            <div class="today-empty-card">
              <span class="empty-today-icon">🍃</span>
              <h4>You're all caught up for today!</h4>
              <p>No milestones or deadlines are scheduled for this date profile.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      renderTodayView();
    });
  }

  // Handle checking off events via global event delegation
  contentArea.addEventListener('change', (e) => {
    
    // A. Handle checking off the primary main parent task (Moves it to completed)
    if (e.target.classList.contains('task-complete-checkbox')) {
      const targetId = e.target.getAttribute('data-task-id');
      const card = e.target.closest('.today-task-card');
      
      card.style.opacity = '0.4';
      card.style.transform = 'translateX(10px)';
      card.style.transition = 'all 0.25s ease';

      setTimeout(() => {
        const currentTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
        const taskToMove = currentTasks.find(t => t.id === targetId);
        
        if (taskToMove) {
          taskToMove.category = 'completed';
          taskToMove.completedAt = new Date().toISOString(); 
          localStorage.setItem('app_tasks', JSON.stringify(currentTasks));
        }
        
        renderTodayView();
        
        const syncEvent = new CustomEvent('syncSidebar');
        document.dispatchEvent(syncEvent);
      }, 250);
    }

    // B. Handle checking off sub-todos (Permanently deletes them from everywhere) 🎯
    if (e.target.classList.contains('today-purge-subtodo-checkbox')) {
      const parentId = e.target.getAttribute('data-parent-id');
      const todoIdx = parseInt(e.target.getAttribute('data-todo-index'), 10);
      const rowItem = e.target.closest('.today-detached-item-row');

      // Instant tactile visual slide-out animation exit
      if (rowItem) {
        rowItem.style.opacity = '0';
        rowItem.style.transform = 'translateX(-20px)';
        rowItem.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      setTimeout(() => {
        const currentTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
        const taskIndex = currentTasks.find(t => t.id === parentId);

        if (taskIndex !== -1 && currentTasks[taskIndex].todos) {
          const targetTask = currentTasks[taskIndex];
          console.log(`🧹 Purging sub-task at index ${todoIdx} from parent: "${parentTask.name}"`);
          
          // Permanently slice the element out of the database array 🎯
          targetTask.todos.splice(todoIdx, 1);
          currentTasks[taskIndex] = targetTask;
          
          // Save changes back to localStorage
          localStorage.setItem('app_tasks', JSON.stringify(currentTasks));
        }

        // Live repaint updates columns and progress lines everywhere instantly
        renderTodayView();
      }, 250);
    }
  });
}
