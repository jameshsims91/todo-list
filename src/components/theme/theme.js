import './theme.css';

export function initThemeToggle() {
  console.log("⚙️ Theme tracking engine initialized!");

  const lightBtn = document.getElementById('theme-light');
  const darkBtn = document.getElementById('theme-dark');
  const rootElement = document.documentElement; // Targets <html> tag for global CSS scope

  if (!lightBtn || !darkBtn) return;

  // 1. Fetch current preference state or fallback to browser system settings 🎯
  const getSavedTheme = () => {
    const cached = localStorage.getItem('app_theme');
    if (cached) return cached;
    
    // Fallback indicator evaluating if the user's OS prefers dark layout variations
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // 2. Synchronize active CSS properties and move slider thumb selector panel
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      rootElement.classList.add('dark-mode');
      rootElement.classList.remove('light-mode');
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
    } else {
      rootElement.classList.add('light-mode');
      rootElement.classList.remove('dark-mode');
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
    }
    
    // Commit selection updates safely to disk storage
    localStorage.setItem('app_theme', theme);
  };

  // 3. Attach standard click action event loop handlers 🎯
  lightBtn.addEventListener('click', () => {
    console.log("☀️ Switching workspace views to Light mode...");
    applyTheme('light');
  });

  darkBtn.addEventListener('click', () => {
    console.log("🌙 Switching workspace views to Cyberpunk Dark mode...");
    applyTheme('dark');
  });

  // 4. Initial immediate ignition sync run
  applyTheme(getSavedTheme());
}

/**
 * Prevents a sudden white flash upon page loading if a user prefers dark mode.
 */
export function preventThemeFlash() {
  const cached = localStorage.getItem('app_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (cached === 'dark' || (!cached && prefersDark)) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.add('light-mode');
  }
}
