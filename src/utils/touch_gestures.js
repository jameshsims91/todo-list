/**
 * Attaches fluid hardware-accelerated touch swipe gestures to a list element.
 * Swipe Right = Quick Duplicate | Swipe Left = Trigger Deletion Panel
 * @param {HTMLElement} listContainer - The <ul> element container wrapping rows
 * @param {Function} onSwipeRight - Callback execution mapping duplication loops
 * @param {Function} onSwipeLeft - Callback execution mapping deletion loops
 */
export function attachSwipeGestures(listContainer, onSwipeRight, onSwipeLeft) {
  if (!listContainer) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let activeCard = null;

  // 1. Capture Initial Finger Placement Vectors
  listContainer.addEventListener('touchstart', (e) => {
    activeCard = e.target.closest('.project-list-card, .personal-list-card, .anytime-list-card');
    if (!activeCard) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    activeCard.style.transition = 'none'; // Disable animations during continuous touch drag tracking
  }, { passive: true });

  // 2. Track Continuous Drag Shifts with Real-Time CSS Transform Positioning
  listContainer.addEventListener('touchmove', (e) => {
    if (!activeCard) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = Math.abs(currentY - touchStartY);

    // Prevent vertical scrolling overrides if a structural horizontal swipe path is underway
    if (deltaY > 30) return;

    // Dampen drag resistance beyond a certain point to create a professional elastic stretch effect
    let translateX = deltaX;
    if (deltaX > 80) translateX = 80 + (deltaX - 80) * 0.2;
    if (deltaX < -100) translateX = -100 + (deltaX + 100) * 0.2;

    activeCard.style.transform = `translateX(${translateX}px)`;

    // Color code background hints based on drag directions
    if (deltaX > 20) {
      activeCard.style.backgroundColor = 'var(--bg-hover)'; // Hints duplication utility
    } else if (deltaX < -20) {
      activeCard.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; // Hints deletion warning path
    }
  }, { passive: true });

  // 3. Evaluate Threshold Breakpoints and Trigger Callback Code Loops on Lift
  listContainer.addEventListener('touchend', (e) => {
    if (!activeCard) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const targetId = activeCard.getAttribute('data-project-id') || 
                     activeCard.getAttribute('data-personal-id') || 
                     activeCard.getAttribute('data-anytime-id');

    activeCard.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s';
    activeCard.style.transform = 'translateX(0px)';
    activeCard.style.backgroundColor = ''; // Restore default surface background parameters

    // Threshold Check rules 🎯
    if (deltaX > 110) {
      // Trigger instant action duplication callback loop execution pass
      onSwipeRight(targetId);
    } else if (deltaX < -110) {
      // Trigger instant deletion action confirmation loop execution pass
      onSwipeLeft(targetId);
    }

    activeCard = null;
  }, { passive: true });
}
