import './upcoming.css';
import { addDays, format, parseISO, isSameDay, startOfDay } from 'date-fns';

let selectedCalendarDate = startOfDay(new Date());

export function initUpcoming() {
  console.log("🔍 initUpcoming() event listener registered!");

  const upcomingBtn = document.querySelector('#btn-upcoming');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  if (upcomingBtn && !upcomingBtn.querySelector('.side-icon')) {
    const text = upcomingBtn.textContent.trim();
    upcomingBtn.innerHTML = `
      <span class="side-icon">📅</span>
      <span class="side-text">${text}</span>
    `;
  }

  const renderUpcomingView = () => {
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
    
    // 1. Generate the 28-day timeline calendar strip arrays 🎯
    const calendarStripDays = [];
    const baseToday = startOfDay(new Date());
    for (let i = 0; i < 28; i++) {
      calendarStripDays.push(addDays(baseToday, i));
    }

    // 2. Filter tasks matching the currently highlighted day on the strip
    const displayedTasks = savedTasks.filter(task => {
      if (!task.date) return false;
      return isSameDay(parseISO(task.date), selectedCalendarDate);
    });

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (upcomingBtn) upcomingBtn.classList.add('active');

    contentArea.innerHTML = `
      <div class="view-header">
        <h1>📅 Week-by-Week Tracker</h1>
      </div>

      <!-- Scrollable Horizontal Calendar Strip Track Wrapper 🎯 -->
      <div class="calendar-strip-container">
        <div class="calendar-strip-track">
          ${calendarStripDays.map(day => {
            const isSelected = isSameDay(day, selectedCalendarDate);
            const hasTasks = savedTasks.some(t => t.date && isSameDay(parseISO(t.date), day));
            
            return `
              <div class="calendar-strip-node ${isSelected ? 'selected' : ''} ${hasTasks ? 'has-events' : ''}" data-date="${day.toISOString()}">
                <span class="strip-node-month">${format(day, 'MMM')}</span>
                <span class="strip-node-day-num">${format(day, 'd')}</span>
                <span class="strip-node-day-name">${format(day, 'eee')}</span>
                ${hasTasks ? '<div class="event-indicator-dot"></div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Focused Daily Target Tasks Display Panel Container -->
      <div class="upcoming-focus-panel">
        <div class="focus-panel-header">
          <h3>Tasks for ${format(selectedCalendarDate, 'EEEE, MMMM d, yyyy')}</h3>
        </div>

        <div class="upcoming-focus-feed">
          ${displayedTasks.map(task => `
            <div class="upcoming-task-item priority-${task.priority}">
              <div class="upcoming-item-details">
                <span class="upcoming-item-category">${task.category}</span>
                <h4>${task.name}</h4>
                ${task.note ? `<p class="upcoming-item-note">${task.note}</p>` : ''}
              </div>
            </div>
          `).join('')}

          ${displayedTasks.length === 0 ? `
            <p class="empty-state-text">No tasks or milestone operations are scheduled for this calendar date node.</p>
          ` : ''}
        </div>
      </div>
    `;

    setupCalendarStripListeners(contentArea, renderUpcomingView);
  };

  if (upcomingBtn) {
    upcomingBtn.addEventListener('click', () => {
      selectedCalendarDate = startOfDay(new Date());
      renderUpcomingView();
    });
  }
}

function setupCalendarStripListeners(contentArea, renderUpcomingView) {
  const stripTrack = contentArea.querySelector('.calendar-strip-track');
  if (stripTrack) {
    stripTrack.addEventListener('click', (e) => {
      const node = e.target.closest('.calendar-strip-node');
      if (!node) return;

      const dateString = node.getAttribute('data-date');
      selectedCalendarDate = startOfDay(new Date(dateString));
      renderUpcomingView();
    });
  }
}
