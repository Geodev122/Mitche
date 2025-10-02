// Performance optimization utilities

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy loading for images
export function lazyLoadImage(img: HTMLImageElement): void {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.classList.remove('lazy');
            observer.unobserve(image);
          }
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  }
}

// Memory cleanup for components
export function cleanupEventListeners(
  element: Element,
  events: string[]
): void {
  events.forEach((event) => {
    element.removeEventListener(event, () => {});
  });
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void): void {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
}