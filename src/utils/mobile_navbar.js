export function initMobileNavbar() {
  console.log("📱 Mobile touch gesture & navbar drawer engine mounted!");

  const menuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (!menuToggle || !sidebar || !overlay) return;

  // Touch Tracking Coordinate Variables
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const toggleDrawer = () => {
    sidebar.classList.toggle('drawer-open');
    overlay.classList.toggle('active');
  };

  const openDrawer = () => {
    sidebar.classList.add('drawer-open');
    overlay.classList.add('active');
  };

  const closeDrawer = () => {
    sidebar.classList.remove('drawer-open');
    overlay.classList.remove('active');
  };

  // Base Tap Action Click Handlers
  menuToggle.addEventListener('click', toggleDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Auto-close menu when a navigation item is selected
  sidebar.addEventListener('click', (e) => {
    const isNavigationBtn = e.target.closest('.side-btn, .pro-side-btn, .per-side-btn, .reopen-task-btn, #btn-add-task');
    if (isNavigationBtn) closeDrawer();
  });

  // 🎯 GESTURE ENGINE: Capture starting coordinates of screen interaction
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
  }, { passive: true });

  // 🎯 GESTURE ENGINE: Evaluate swipe trajectory vectors on finger lift
  document.addEventListener('touchend', () => {
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Filter out vertical scrolling actions to prevent false positive drawer swipes
    if (deltaY > 60) return; 

    const isDrawerOpen = sidebar.classList.contains('drawer-open');

    // Case A: User swipes RIGHT from the far-left edge while drawer is closed -> Slide Open ➡️
    if (!isDrawerOpen && deltaX > 80 && touchStartX < 40) {
      console.log("👉 Gesture Swipe Detected: Opening Navigation Menu");
      openDrawer();
    }

    // Case B: User swipes LEFT anywhere on the layout while drawer is open -> Slide Closed ⬅️
    if (isDrawerOpen && deltaX < -60) {
      console.log("👈 Gesture Swipe Detected: Closing Navigation Menu");
      closeDrawer();
    }
  }, { passive: true });
}
