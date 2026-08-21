import { parseISO, compareAsc } from 'date-fns';

/**
 * Sorts an array of task objects chronologically by their due date field.
 * Tasks with no date string are pushed to the absolute bottom of the list array.
 * @param {Array} tasks - Unsorted data array from localStorage
 * @returns {Array} - Chronologically ordered tasks array
 */
export function sortTasksByDueDate(tasks) {
  if (!Array.isArray(tasks)) return [];

  return [...tasks].sort((taskA, taskB) => {
    if (!taskA.date && !taskB.date) return 0; 
    if (!taskA.date) return 1;                
    if (!taskB.date) return -1;               

    const dateA = parseISO(taskA.date);
    const dateB = parseISO(taskB.date);

    return compareAsc(dateA, dateB);
  });
}