export function initPersonal() {
  const personalBtn = document.querySelector('#btn-personal');

  if (personalBtn) {
    const text = personalBtn.textContent.trim();
    personalBtn.innerHTML = `
      <span class="side-icon">👤</span>
      <span class="side-text">${text}</span>
    `;

    personalBtn.addEventListener('click', () => {
      console.log('Personal Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-personal");
  }
}
