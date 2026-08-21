import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';

/**
 * Generates an HTML string for a countdown banner based on the task's due date.
 * @param {string} taskDateString - The ISO date string from the task (YYYY-MM-DD)
 * @returns {string} - Injected HTML markup string for the banner
 */
export function generateCountdownBannerHTML(taskDateString) {
  if (!taskDateString) return '';

  try {
    const targetDate = startOfDay(parseISO(taskDateString));
    const today = startOfDay(new Date());
    const daysDifference = differenceInCalendarDays(targetDate, today);

    if (daysDifference === 0) {
      return `<div class="countdown-banner banner-today">🎯 Deadline is TODAY</div>`;
    } else if (daysDifference === 1) {
      return `<div class="countdown-banner banner-tomorrow">⏳ Due tomorrow</div>`;
    } else if (daysDifference > 1) {
      return `<div class="countdown-banner banner-future">⏳ ${daysDifference} days remaining</div>`;
    } else {
      const overdueAmount = Math.abs(daysDifference);
      return `<div class="countdown-banner banner-overdue">🚨 OVERDUE BY ${overdueAmount} ${overdueAmount === 1 ? 'DAY' : 'DAYS'}</div>`;
    }
  } catch (err) {
    console.error("Error parsing task countdown date:", err);
    return '';
  }
}

export function generatePriorityPillHTML(priority) {
  if (!priority) return '';
  const cleanPriority = priority.toLowerCase();
  return `<span class="priority-indicator-pill priority-${cleanPriority}">Priority: ${priority}</span>`;
}

export function generateProgressBarHTML(todos) {
  if (!todos || todos.length === 0) return '';

  // Calculate matching checked instances
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return `
    <div class="task-progress-wrapper">
      <div class="progress-meta-row">
        <span class="progress-label">Sub-task Progress</span>
        <span class="progress-percentage-text">${percentage}% (${completed}/${total})</span>
      </div>
      <div class="progress-track-bar">
        <div class="progress-fill-thumb" style="width: ${percentage}%;"></div>
      </div>
    </div>
  `;
}
