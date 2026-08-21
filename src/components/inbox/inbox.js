import './inbox.css';

export function initInbox() {
  console.log("🔍 initInbox() event listener registered!");

  const inboxBtn = document.querySelector('#btn-inbox');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  if (inboxBtn && !inboxBtn.querySelector('.side-icon')) {
    const text = inboxBtn.textContent.trim();
    inboxBtn.innerHTML = `
      <span class="side-icon">📥</span>
      <span class="side-text">${text}</span>
    `;
  }

  const renderInboxView = () => {

    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];

    const activeAlerts = [];
    savedTasks.forEach(task => {
      if (task.notifications && task.notifications.length > 0) {
        task.notifications.forEach(message => {
          activeAlerts.push({
            taskId: task.id,
            taskName: task.name,
            dueDate: task.date,
            priority: task.priority,
            alertMessage: message
          });
        });
      }
    });

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (inboxBtn) inboxBtn.classList.add('active');

    contentArea.innerHTML = `
      <div class="view-header">
        <h1>📥 System Inbox</h1>
      </div>
      
      <div class="inbox-container-panel">
        <div class="inbox-feed-header">
          <h3>Activity Notifications</h3>
          <span class="inbox-count-pill">${activeAlerts.length} Unread Alerts</span>
        </div>

        <div id="inbox-cards-feed" class="inbox-cards-feed">
          ${activeAlerts.map(alert => `
            <div class="inbox-card-component priority-${alert.priority}" data-task-id="${alert.taskId}" data-alert-text="${alert.alertMessage}">
              <div class="inbox-card-glow-edge"></div>
              
              <div class="inbox-card-main-content">
                <div class="inbox-card-meta-row">
                  <span class="inbox-meta-tag category-urgency">⚠️ OVERDUE CRITICAL</span>
                  <span class="inbox-meta-time">Due Date: ${alert.dueDate || 'N/A'}</span>
                </div>
                
                <h4 class="inbox-card-title">${alert.taskName}</h4>
                <p class="inbox-card-desc">${alert.alertMessage}</p>
              </div>

              <div class="inbox-card-actions">
                <button type="button" class="dismiss-alert-btn" title="Dismiss item">✕ Clear Alert</button>
              </div>
            </div>
          `).join('')}

          ${activeAlerts.length === 0 ? `
            <div class="inbox-empty-card">
              <span class="empty-inbox-icon">🎉</span>
              <h4>Your Inbox is clean!</h4>
              <p>No past-due task milestones or system alerts require your attention right now.</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  if (inboxBtn) {
    inboxBtn.addEventListener('click', () => {
      console.log("🎯 Inbox component viewed!");
      renderInboxView();
    });
  }

  contentArea.addEventListener('click', (e) => {
    const dismissBtn = e.target.closest('.dismiss-alert-btn');
    if (!dismissBtn) return;

    const card = dismissBtn.closest('.inbox-card-component');
    const targetTaskId = card.getAttribute('data-task-id');
    const targetAlertText = card.getAttribute('data-alert-text');

    card.style.opacity = '0';
    card.style.transform = 'scale(0.98)';
    card.style.transition = 'all 0.25s ease';

    setTimeout(() => {

      const currentTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
      const updatedTasks = currentTasks.map(task => {
        if (task.id === targetTaskId && task.notifications) {

          task.notifications = task.notifications.filter(msg => msg !== targetAlertText);
        }
        return task;
      });

      localStorage.setItem('app_tasks', JSON.stringify(updatedTasks));
      
      renderInboxView();
    }, 250);
  });
}