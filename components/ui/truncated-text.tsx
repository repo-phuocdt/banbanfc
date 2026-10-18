'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  text: string
  className?: string
}

/**
 * Single-line text cut with "…"; hovering shows the full text in a tooltip, but only
 * when it is actually cut. The tooltip is portalled with fixed positioning so scrollable
 * tables cannot clip it.
 */
export function TruncatedText({ text, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null)

  // Coordinates are runtime values Tailwind classes cannot express, so set them on the node.
  useLayoutEffect(() => {
    if (!anchor || !tipRef.current) return
    tipRef.current.style.left = `${anchor.left}px`
    tipRef.current.style.top = `${anchor.top}px`
  }, [anchor])

  const show = () => {
    const el = ref.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const rect = el.getBoundingClientRect()
    setAnchor({ left: rect.left, top: rect.bottom + 6 })
  }

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setAnchor(null)}
        className={`truncate ${className}`}
      >
        {text}
      </div>
      {anchor &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            className="pointer-events-none fixed z-[60] max-w-sm whitespace-normal break-words rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  )
}
