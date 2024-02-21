export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...funcArgs: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeoutId = undefined;
      func(...args);
    };

    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(later, wait);
  };
}
