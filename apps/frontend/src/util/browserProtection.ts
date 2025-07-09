/**
 * Utility to prevent right-click and inspect element access in production mode
 */

export const enableBrowserProtection = (): void => {
  // Only apply in production mode
  if (import.meta.env.PROD) {
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common keyboard shortcuts for developer tools
    document.addEventListener('keydown', (e) => {
      // Prevent F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+C / Cmd+Option+C (Select Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        return false;
      }
      
      return true;
    });

    // Detect DevTools opening
    const devToolsDetection = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = '';
      }
    };

    window.addEventListener('resize', devToolsDetection);
    setInterval(devToolsDetection, 1000);
  }
}; 