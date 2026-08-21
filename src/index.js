import "./styles.css";
import { initAddTask, renderProjectsSidebar } from "./components/add_task/add_task.js";
import { initSearch } from "./components/search/search.js";
import { initInbox } from "./components/inbox/inbox.js";
import { initToday } from "./components/today/today.js";
import { initUpcoming } from "./components/upcoming/upcoming.js";
import { initAnytime } from "./components/anytime/anytime.js";
import { initCompleted } from "./components/completed/completed.js";
import { initProjects } from "./components/projects/projects.js";
import { initPersonal } from "./components/personal/personal.js";
import { checkOverdueTasks } from "./utils/task_automation.js";
import { initThemeToggle, preventThemeFlash } from "./components/theme/theme.js";
preventThemeFlash();
import { initMobileNavbar } from "./utils/mobile_navbar.js";
import { initPomodoroTime, initPomodoroTimer } from "./components/sidebar/pomodoro.js";

console.log("Webpack bundle successfully parsed!");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM is completely ready!");
  checkOverdueTasks();
  
  initAddTask();
  renderProjectsSidebar();
  initSearch();
  initInbox();
  initToday();
  initUpcoming();
  initAnytime();
  initCompleted();
  initProjects();
  initPersonal();
  initThemeToggle();
  initMobileNavbar();
  initPomodoroTimer();

  const todayBtn = document.querySelector('#btn-today');
  if (todayBtn) todayBtn.click();
});

console.log("App is running!");
