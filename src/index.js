import "./styles.css";
import { initAddTask, renderProjectsSidebar } from "./components/add_task/add_task.js";
import { initSearch } from "./components/search/search.js";
import { initInbox } from "./inbox.js";
import { initToday } from "./today.js";
import { initUpcoming } from "./upcoming.js";
import { initAnytime } from "./anytime.js";
import { initCompleted } from "./completed.js";
import { initProjects } from "./components/projects/projects.js";
import { initPersonal } from "./components/personal/personal.js";

console.log("Webpack bundle successfully parsed!");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM is completely ready!");
  
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

  const todayBtn = document.querySelector('#btn-today');
  if (todayBtn) {
    todayBtn.click();
  }
});

console.log("App is running!");
