export function ensureMapLibreStyles() {
  if (typeof document === 'undefined') return
  if (document.querySelector('link[data-maplibre-style="true"]')) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css'
  link.dataset.maplibreStyle = 'true'
  document.head.appendChild(link)
}

export async function loadMapLibre() {
  ensureMapLibreStyles()
  return import('maplibre-gl')
}

export function runWhenBrowserIdle(callback: () => void, timeout = 500) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  type IdleCallbackHandle = number
  type IdleCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
  type IdleRequestOptions = { timeout?: number }

  const win = window as typeof window & {
    requestIdleCallback?: (cb: IdleCallback, options?: IdleRequestOptions) => IdleCallbackHandle
    cancelIdleCallback?: (id: IdleCallbackHandle) => void
  }

  if (typeof win.requestIdleCallback === 'function') {
    const id = win.requestIdleCallback(() => callback(), { timeout })
    return () => {
      if (typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(id)
      }
    }
  }

  const id = window.setTimeout(callback, 150)
  return () => window.clearTimeout(id)
}
