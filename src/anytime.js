export function initAnytime() {
  const anytimeBtn = document.querySelector('#btn-anytime');
  
  if (anytimeBtn) {
    const text = anytimeBtn.textContent.trim();
    anytimeBtn.innerHTML = `
      <span class="side-icon">🌍</span>
      <span class="side-text">${text}</span>
    `;

    anytimeBtn.addEventListener('click', () => {
      console.log('Anytime Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-anytime");
  }
}
