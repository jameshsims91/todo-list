import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameDay, addMonths, subMonths, parseISO 
} from 'date-fns';

let currentViewMonth = new Date();

/**
 * Builds and renders the custom grid dropdown popup.
 * @param {HTMLElement} anchorBtn - The trigger button element
 * @param {string} currentSelectedDate - Existing ISO date string or blank
 * @param {Function} onDateSelect - Callback function when a date is selected
 */
export function toggleCalendarDropdown(anchorBtn, currentSelectedDate, onDateSelect) {
  // 1. Remove any existing popups to prevent duplicates
  const existingDropdown = document.getElementById('custom-calendar-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
    return;
  }

  // 2. Create the dropdown wrapper element
  const dropdown = document.createElement('div');
  dropdown.id = 'custom-calendar-dropdown';
  dropdown.className = 'custom-calendar-dropdown';

  // Parse existing date safely if present
  const activeSelectedDate = currentSelectedDate ? parseISO(currentSelectedDate) : null;

  // 3. Main rendering function for the calendar view state
  const renderCalendarMarkup = () => {
    const monthStart = startOfMonth(currentViewMonth);
    const monthEnd = endOfMonth(currentViewMonth);
    
    // Pad the grid to start cleanly on the first day of the week (Sunday)
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    
    const allGridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    dropdown.innerHTML = `
      <div class="calendar-dropdown-header">
        <button type="button" id="pomo-prev-month" class="cal-nav-btn">◀</button>
        <span class="cal-month-title">${format(currentViewMonth, 'MMMM yyyy')}</span>
        <button type="button" id="pomo-next-month" class="cal-nav-btn">▶</button>
      </div>
      
      <div class="calendar-dropdown-weekdays">
        ${weekDays.map(day => `<span>${day}</span>`).join('')}
      </div>
      
      <div class="calendar-dropdown-grid">
        ${allGridDays.map(day => {
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          const isSelected = activeSelectedDate && isSameDay(day, activeSelectedDate);
          const isTodayDate = isSameDay(day, new Date());
          
          return `
            <button type="button" 
              class="cal-grid-cell ${!isCurrentMonth ? 'outside-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'is-today' : ''}" 
              data-date="${format(day, 'yyyy-MM-dd')}">
              ${format(day, 'd')}
            </button>
          `;
        }).join('')}
      </div>
      
      <div class="calendar-dropdown-footer">
        <button type="button" id="cal-clear-date-btn" class="cal-clear-btn">Clear Deadline</button>
      </div>
    `;

    // 4. Attach event listeners inside the freshly rendered dropdown menu
    setupDropdownListeners(dropdown, onDateSelect);
  };

  // Keep the picker inside the viewport (fixed, so #content scrolling cannot clip it)
  const rect = anchorBtn.getBoundingClientRect();
  const gutter = 8;
  const dropdownWidth = Math.min(280, window.innerWidth - gutter * 2);
  const estimatedHeight = 340;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

  let left = rect.left;
  const maxLeft = window.innerWidth - dropdownWidth - gutter;
  left = Math.max(gutter, Math.min(left, maxLeft));

  dropdown.style.position = "fixed";
  dropdown.style.width = `${dropdownWidth}px`;
  dropdown.style.left = `${left}px`;
  dropdown.style.top = openUpward
    ? `${Math.max(gutter, rect.top - estimatedHeight - 6)}px`
    : `${rect.bottom + 6}px`;

  document.body.appendChild(dropdown);
  renderCalendarMarkup();

  // Helper handler for navigational shifts
  function setupDropdownListeners(container, callback) {
    container.querySelector('#pomo-prev-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentViewMonth = subMonths(currentViewMonth, 1);
      renderCalendarMarkup();
    });

    container.querySelector('#pomo-next-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentViewMonth = addMonths(currentViewMonth, 1);
      renderCalendarMarkup();
    });

    container.querySelector('.calendar-dropdown-grid').addEventListener('click', (e) => {
      const cell = e.target.closest('.cal-grid-cell');
      if (!cell) return;
      e.stopPropagation();
      
      const chosenDateStr = cell.getAttribute('data-date');
      callback(chosenDateStr); 
      container.remove(); 
    });

    container.querySelector('#cal-clear-date-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      callback(''); 
      container.remove();
    });
  }

  // Dismiss dropdown menu automatically if user clicks completely outside its bounding box
  const dismissHandler = (e) => {
    if (!dropdown.contains(e.target) && e.target !== anchorBtn) {
      dropdown.remove();
      document.removeEventListener('click', dismissHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', dismissHandler), 10);
}
