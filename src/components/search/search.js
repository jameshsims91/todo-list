import './search.css';
import { generateCountdownBannerHTML, generatePriorityPillHTML } from '../../utils/tasks_helpers.js';

let currentSearchQuery = '';
let currentPriorityFilter = 'all';

export function initSearch() {
  console.log("🔍 Global search discovery hub mounted!");

  const searchBtn = document.querySelector('#btn-search');
  const contentArea = document.getElementById('content');

  if (!contentArea) return;

  const renderSearchView = () => {
    const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];

    const filteredTasks = savedTasks.filter(task => {
      const matchesKeyword = 
        task.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
        (task.note && task.note.toLowerCase().includes(currentSearchQuery.toLowerCase()));
      
      const matchesPriority = 
        currentPriorityFilter === 'all' || task.priority === currentPriorityFilter;

      return matchesKeyword && matchesPriority;
    });

    document.querySelectorAll('.side-btn, .pro-side-btn, .per-side-btn').forEach(btn => btn.classList.remove('active'));
    if (searchBtn) searchBtn.classList.add('active');

    contentArea.innerHTML = `
      <div class="view-header">
        <h1>🔍 Workspace Search Center</h1>
      </div>

      <div class="search-dashboard-layout">
        <!-- Persistent Left Optimization Control Block Panel -->
        <div class="search-controls-sidebar">
          <div class="control-group">
            <label class="search-panel-label">Keyword Query</label>
            <div class="search-input-wrapper">
              <input type="text" id="global-search-input" value="${currentSearchQuery}" placeholder="Type text characters...">
              ${currentSearchQuery ? '<button id="clear-search-text-btn">✕</button>' : ''}
            </div>
          </div>

          <div class="control-group" style="margin-top: 1.5rem;">
            <label class="search-panel-label">Priority Filter Tags</label>
            <div class="priority-vertical-selectors">
              <button class="filter-p-row ${currentPriorityFilter === 'all' ? 'active' : ''}" data-filter="all"><span class="p-dot all"></span> All Tasks</button>
              <button class="filter-p-row ${currentPriorityFilter === 'high' ? 'active' : ''}" data-filter="high"><span class="p-dot high"></span> Urgent High</button>
              <button class="filter-p-row ${currentPriorityFilter === 'medium' ? 'active' : ''}" data-filter="medium"><span class="p-dot medium"></span> Medium Status</button>
              <button class="filter-p-row ${currentPriorityFilter === 'low' ? 'active' : ''}" data-filter="low"><span class="p-dot low"></span> Low Flow</button>
            </div>
          </div>
        </div>

        <!-- Right Adaptive Search Grid Cards Feed -->
        <div class="search-results-viewport">
          <div class="search-feed-meta">Showing ${filteredTasks.length} corresponding records</div>
          <div class="search-grid-feed">
            ${filteredTasks.map(task => `
              <div class="search-optimized-card priority-${task.priority}">
                ${generateCountdownBannerHTML(task.date)}
                <div class="search-card-body">
                  <div class="search-card-meta-line">
                    <span class="search-badge">${task.category}</span>
                    ${generatePriorityPillHTML(task.priority)}
                  </div>
                  <h4>${task.name}</h4>
                  ${task.note ? `<p class="search-card-note">${task.note}</p>` : ''}
                </div>
              </div>
            `).join('')}
            ${filteredTasks.length === 0 ? '<div class="search-empty-state"><p>No items correspond with your search bounds.</p></div>' : ''}
          </div>
        </div>
      </div>
    `;

    setupSearchListeners(contentArea, renderSearchView);
  };

  document.addEventListener('click', (e) => {
    const targetSearchBtn = e.target.closest('#btn-search');
    if (targetSearchBtn) {
      currentSearchQuery = '';
      currentPriorityFilter = 'all';
      renderSearchView();
    }
  });
}

function setupSearchListeners(contentArea, renderSearchView) {
  const searchInput = contentArea.querySelector('#global-search-input');
  const clearTextBtn = contentArea.querySelector('#clear-search-text-btn');
  const verticalSelectors = contentArea.querySelector('.priority-vertical-selectors');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      renderSearchView();
      const input = document.getElementById('global-search-input');
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  if (clearTextBtn) {
    clearTextBtn.addEventListener('click', () => {
      currentSearchQuery = '';
      renderSearchView();
    });
  }

  if (verticalSelectors) {
    verticalSelectors.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-p-row');
      if (!btn) return;
      currentPriorityFilter = btn.getAttribute('data-filter');
      renderSearchView();
    });
  }
}
