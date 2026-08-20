export function initProjects() {
  const projectsBtn = document.querySelector('#btn-projects');

  if (projectsBtn) {
    const text = projectsBtn.textContent.trim();
    projectsBtn.innerHTML = `
      <span class="side-icon">📁</span>
      <span class="side-text">${text}</span>
    `;
    
    projectsBtn.addEventListener('click', () => {
      console.log('Projects Clicked inside addEventListener!');
    });
  } else {
    console.error("Could not find button element: #btn-projects");
  }
}
