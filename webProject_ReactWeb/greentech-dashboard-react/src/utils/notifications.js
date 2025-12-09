// Show Notification (Simple notification system)
export const showNotification = (message, type = 'info') => {
  // Get or create notification container
  let container = document.querySelector('[data-notification-container]');
  if (!container) {
    container = document.createElement('div');
    container.setAttribute('data-notification-container', 'true');
    // Remove class to avoid CSS conflicts
    // container.className = 'notification-container';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; background: none !important; border: none !important; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(container);
  }

  // Create notification element
  const notification = document.createElement('div');
  // Remove all classes to avoid CSS conflicts
  // notification.className = `iot-notification iot-notification-${type}`;

  // Apply inline styles to override any CSS
  notification.style.cssText = `
    background: rgba(30, 41, 59, 0.98) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
    padding: 15px 20px 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 400px;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
    position: relative;
    margin-bottom: 10px;
    overflow: hidden;
  `;

  // Determine icon based on type
  const icons = {
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'times-circle',
    info: 'info-circle'
  };

  // Determine progress bar color based on type
  const progressColors = {
    success: '#43e97b',
    warning: '#feca57',
    error: '#ff6b6b',
    info: '#4facfe'
  };

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="fas fa-${icons[type] || 'info-circle'}" style="font-size: 1.3rem; flex-shrink: 0; color: ${progressColors[type] || '#43e97b'};"></i>
      <span style="color: white; font-weight: 500; flex: 1;">${message}</span>
      <button data-close-btn style="background: none; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; padding: 5px; display: flex; align-items: center; justify-content: center;">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div data-progress-container style="width: 100%; height: 3px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden;">
      <div data-progress-bar style="width: 0%; height: 100%; background: ${progressColors[type] || '#43e97b'}; transition: width 5s linear;"></div>
    </div>
  `;

  // Add close button listener
  const closeBtn = notification.querySelector('[data-close-btn]');
  closeBtn.addEventListener('click', () => {
    notification.remove();
    // Remove container if empty
    if (container.children.length === 0) {
      container.remove();
    }
  });

  // Add to container
  container.appendChild(notification);

  // Get progress bar element
  const progressBar = notification.querySelector('[data-progress-bar]');

  // Show notification with animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';

    // Start progress bar animation
    if (progressBar) {
      progressBar.style.width = '100%';
    }
  }, 10);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      notification.remove();
      // Remove container if empty
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 5000);
};
