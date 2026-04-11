import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ANIMATIONS = [
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom-in',
  'flip-up',
  'rotate-in',
  'blur-in',
];

/**
 * Automatically observes all [data-scroll] elements and reveals
 * them when they scroll into the viewport. Re-runs on route changes.
 */
export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    // Small delay to let the new page render its DOM
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('[data-scroll]');

      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      elements.forEach((el) => {
        // Reset visibility for elements on new routes
        el.classList.remove('is-visible');
        observer.observe(el);
      });

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
