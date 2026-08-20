export function initUpcoming() {
  const upcomingBtn = document.querySelector('#btn-upcoming');

  if (upcomingBtn) {
    const text = upcomingBtn.textContent.trim();
    upcomingBtn.innerHTML = `
      <span class="side-icon">🔮</span>
      <span class="side-text">${text}</span>
    `;

    upcomingBtn.addEventListener('click', () => {
      console.log('Upcoming Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-upcoming");
  }
}
