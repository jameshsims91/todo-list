export function initInbox() {
  const inboxBtn = document.querySelector('#btn-inbox');

  if (inboxBtn) {
    const text = inboxBtn.textContent.trim();
    inboxBtn.innerHTML = `
      <span class="side-icon">📥</span>
      <span class="side-text">${text}</span>
    `;

    inboxBtn.addEventListener('click', () => {
      console.log('Inbox Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-inbox");
  }
}
