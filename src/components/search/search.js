export function initSearch() {
  const searchBtn = document.querySelector('#btn-search');

  if (searchBtn) {
    const text = searchBtn.textContent.trim();
    searchBtn.innerHTML = `
      <span class="side-icon">🔍</span>
      <span class="side-text">${text}</span>
    `;

    searchBtn.addEventListener('click', () => {
      console.log('Search Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-search");
  }
}
