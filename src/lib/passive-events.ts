/**
 * Fix for passive event listener warnings
 * Some third-party libraries (like recharts) add touch event listeners without the passive option
 * This causes browser warnings about scroll performance
 */

if (typeof window !== 'undefined') {
  // Store original addEventListener
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  // Override addEventListener to make touch events passive by default
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // List of events that should be passive for better scroll performance
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
    
    if (passiveEvents.includes(type)) {
      // If options is boolean, convert to object
      const opts = typeof options === 'boolean' ? { capture: options } : { ...options };
      
      // Set passive: true if not explicitly set to false
      if (opts.passive === undefined) {
        opts.passive = true;
      }
      
      return originalAddEventListener.call(this, type, listener, opts);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
}
