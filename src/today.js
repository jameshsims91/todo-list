export function initToday() {
  const todayBtn = document.querySelector('#btn-today');

  if (todayBtn) {
    const text = todayBtn.textContent.trim();
    todayBtn.innerHTML = `
      <span class="side-icon">📅</span>
      <span class="side-text">${text}</span>
    `;

    todayBtn.addEventListener('click', () => {
      console.log('Today Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-today");
  }
}
