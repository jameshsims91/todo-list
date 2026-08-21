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

    const todayTasks = savedTasks.filter(task => {
      if (!task.date) return false;
      try {
        return isToday(parseISO(task.date));
      } catch (err) {
        return false;
      }
    });

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
          ${todayTasks.map(task => `
            <div class="today-task-card priority-${task.priority}" data-task-id="${task.id}">
              <div class="today-card-left">
                <input type="checkbox" class="task-complete-checkbox" data-task-id="${task.id}">
                <div class="today-card-details">
                  <h4>${task.name}</h4>
                  ${task.note ? `<p class="today-task-note">${task.note}</p>` : ''}
                  <span class="category-tag-pill">${task.category}</span>
                </div>
              </div>
              
              ${task.todos && task.todos.length > 0 ? `
                <div class="today-sub-checklist-box">
                  <h5>Sub-tasks:</h5>
                  <ul>
                    ${task.todos.map(todo => `<li>🔹 ${todo}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}

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

  contentArea.addEventListener('change', (e) => {
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

        const refreshSidebar = document.querySelector('#btn-add-task');
        if (refreshSidebar) {
          const syncEvent = new CustomEvent('syncSidebar');
          document.dispatchEvent(syncEvent);
        }
      }, 250);
    }
  });
}
