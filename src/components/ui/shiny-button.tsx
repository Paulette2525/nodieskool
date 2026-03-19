"use client"

import type React from "react"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ShinyButton({ children, onClick, className = "" }: ShinyButtonProps) {
  return (
    <>
      <style>{`
        .shiny-cta {
          --shiny-cta-bg: hsl(235 56% 30%);
          --shiny-cta-bg-subtle: hsl(235 56% 38%);
          --shiny-cta-fg: #ffffff;
          --shiny-cta-highlight: hsl(235 56% 52%);
          --shiny-cta-highlight-subtle: hsl(235 56% 68%);
          --duration: 3s;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          
          isolation: isolate;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          padding: 1.1rem 2.25rem;
          font-family: "Inter", sans-serif;
          font-size: 0.95rem;
          line-height: 1.2;
          font-weight: 500;
          border: 1px solid var(--shiny-cta-bg-subtle);
          border-radius: 360px;
          color: var(--shiny-cta-fg);
          background: var(--shiny-cta-bg);
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
          transition: var(--transition);
        }

        .shiny-cta::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            var(--shiny-cta-highlight) 5%,
            white 10%,
            var(--shiny-cta-highlight) 15%,
            transparent 20%,
            transparent 100%
          );
          animation: shiny-rotate var(--duration) linear infinite;
          z-index: -1;
        }

        .shiny-cta::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 360px;
          background: var(--shiny-cta-bg);
          z-index: -1;
        }

        .shiny-cta:active {
          translate: 0 1px;
        }

        .shiny-cta span {
          z-index: 1;
          position: relative;
        }

        .shiny-cta:is(:hover, :focus-visible) {
          background: var(--shiny-cta-bg-subtle);
        }

        .shiny-cta:is(:hover, :focus-visible)::after {
          background: var(--shiny-cta-bg-subtle);
        }

        @keyframes shiny-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <button className={`shiny-cta ${className}`} onClick={onClick}>
        <span>{children}</span>
      </button>
    </>
  )
}
