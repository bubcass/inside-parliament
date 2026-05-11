type ViewportAutoplayOptions = {
  enabled: boolean;
  threshold?: number;
};

export function autoplayWhileVisible(
  node: HTMLVideoElement,
  options: ViewportAutoplayOptions
) {
  let observer: IntersectionObserver | null = null;
  let current = options;

  const threshold = options.threshold ?? 0.35;

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  function start() {
    stop();

    if (!current.enabled || typeof IntersectionObserver === 'undefined') return;

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          void node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { threshold }
    );

    observer.observe(node);
  }

  start();

  return {
    update(next: ViewportAutoplayOptions) {
      current = next;
      start();
    },
    destroy() {
      stop();
    }
  };
}
