import { useCallback, useEffect, useRef, useState } from 'react'

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('has-scroll-reveal')
}

export function useScrollReveal() {
  const elementRef = useRef(null)
  const [elementVersion, setElementVersion] = useState(0)
  const ref = useCallback((node) => {
    elementRef.current = node
    if (node) setElementVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      element.dataset.scrollRevealed = 'true'
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.dataset.scrollRevealed = 'true'
        observer.unobserve(element)
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementVersion])

  return ref
}
