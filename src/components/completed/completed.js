import './completed.css';
import { format, parseISO } from 'date-fns';

export function initCompleted() {
  console.log("🔍 initCompleted() event listener registered!");

  const completedBtn = document.querySelector('#btn-completed');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  if (completedBtn && !completedBtn.querySelector('.side-icon')) {
    const text = completedBtn.textContent.trim();
    completedBtn.innerHTML = `
      <span class="side-icon">✅</span>
      <span class="side-text">${text}</span>
    `;
  }

  const renderCompletedView = () => {
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    const completedTasks = savedTasks.filter(task => task.category === 'completed');

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (completedBtn) completedBtn.classList.add('active');

    contentArea.innerHTML = `
      <div class="view-header completed-header-split">
        <div>
          <h1>✅ Completed Log</h1>
          <p class="current-date-subtitle">Archive history of resolved action items</p>
        </div>
        ${completedTasks.length > 0 ? `
          <button type="button" id="clear-archive-btn" class="clear-archive-btn">🗑️ Clear Archive</button>
        ` : ''}
      </div>
      
      <div class="completed-container-panel">
        <div class="completed-cards-feed">
          ${completedTasks.map(task => {
            let resolutionDate = task.completedAt 
              ? format(parseISO(task.completedAt), 'MMM d, yyyy • h:mm a') 
              : 'Recently resolved';

            return `
              <div class="completed-task-card">
                <div class="completed-card-main">
                  <span class="checkmark-circle">✓</span>
                  <div class="completed-details">
                    <h4>${task.name}</h4>
                    <p class="resolution-timestamp">Completed on: ${resolutionDate}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          ${completedTasks.length === 0 ? `
            <div class="completed-empty-card">
              <span class="empty-completed-icon">💎</span>
              <h4>No resolved history found</h4>
              <p>Items you check off across your workspace dashboards will automatically archive down here.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  if (completedBtn) {
    completedBtn.addEventListener('click', () => {
      renderCompletedView();
    });
  }

  contentArea.addEventListener('click', (e) => {
    if (e.target.id === 'clear-archive-btn') {
      if (confirm("Are you sure you want to permanently delete all completed log entries? This action cannot be undone.")) {
        const currentTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];

        const freshTasks = currentTasks.filter(task => task.category !== 'completed');
        
        localStorage.setItem('app_tasks', JSON.stringify(freshTasks));
        renderCompletedView();
      }
    }
  });
}
