// Performance utilities for lazy loading and prefetching
import { useEffect, useRef } from 'react'

/**
 * Prefetch a route when it enters viewport
 */
export function usePrefetch(href: string) {
  const prefetched = useRef(false)

  useEffect(() => {
    if (prefetched.current) return
    prefetched.current = true

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    link.as = 'document'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [href])
}

/**
 * Measure performance metrics
 */
export function reportWebVitals(metric: any) {
  if (typeof window !== 'undefined') {
    console.log('[Perf]', metric.name, `${metric.value.toFixed(2)}ms`)
  }
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options)
  }

  const id = setTimeout(
    () => callback({ didTimeout: false } as IdleDeadline),
    1
  )
  return id as unknown as number
}

export function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Memoize utility for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
