import { isPast, parseISO, startOfDay } from 'date-fns';

export function checkOverdueTasks() {
  console.log("⏰ Checking for overdue tasks...");

  const savedTasks = JSON.parse(localStorage.getItem('app_tasks')) || [];
  let stateChanged = false;

  const today = startOfDay(new Date());

  const updatedTasks = savedTasks.map(task => {
    if(!task.date || task.priority === 'high') return task;

    const taskDueDate = startOfDay(parseISO(task.date));
    if (isPast(taskDueDate) && taskDueDate < today) {
      console.log(`🚨 Task "${task.name}" is overdue! Elevating priority.`);
      task.priority = 'high';
      stateChanged = true;

      if (!task.notifications) task.notifications = [];

      const alertMessage = `Overdue Alert: "${task.name}" was due on ${task.date}!`;
      if (!task.notifications.includes(alertMessage)) {
        task.notifications.push(alertMessage);
      }
    }
    return task;
  });

  if (stateChanged) {
    localStorage.setItem('app_tasks', JSON.stringify(updatedTasks));
  }
  return stateChanged;
}
