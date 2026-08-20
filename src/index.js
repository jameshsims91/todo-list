import "./styles.css";
import { initAddTask } from "./add_task.js";
import { initSearch } from "./search.js";
import { initInbox } from "./inbox.js";
import { initToday } from "./today.js";
import { initUpcoming } from "./upcoming.js";
import { initAnytime } from "./anytime.js";
import { initCompleted } from "./completed.js";
import { initProjects } from "./projects.js";
import { initPersonal } from "./personal.js";

console.log("Webpack bundle successfully parsed!");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM is completely ready!");
  
  initAddTask();
  initSearch();
  initInbox();
  initToday();
  initUpcoming();
  initAnytime();
  initCompleted();
  initProjects();
  initPersonal();
});


console.log("App is running!");
