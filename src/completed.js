export function initCompleted() {
  const completedBtn = document.querySelector('#btn-completed');

  if (completedBtn) {
    const text = completedBtn.textContent.trim();
    completedBtn.innerHTML = `
      <span class="side-icon">✅</span>
      <span class="side-text">${text}</span>
    `;

    completedBtn.addEventListener('click', () => {
      console.log('Completed Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-completed");
  }
}
