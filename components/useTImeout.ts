export function createTimeout() {
  let timeoutId: any = undefined;
  function set(callback: Function, delay: number) {
    clear();
    timeoutId = setTimeout(() => {
      callback();
      clear()
    }, delay);
  }

  function clear() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  return { set, clear };
}