import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Layout, PublicOffice, Seat } from './types'
import type { OfficeEngine, Snapshot } from './engine'
import { ThreeOffice } from './three-renderer'

type Props = {
  engine: OfficeEngine
  office: PublicOffice
  target: string | null
  onPick: (id: string | null) => void
  editLayout?: boolean
  onLayout?: (l: Layout) => void
}

export function OfficeCanvas({
  engine,
  office,
  target,
  onPick,
  editLayout = false,
  onLayout
}: Props): React.JSX.Element {
  const canvas = useRef<HTMLCanvasElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [snaps, setSnaps] = useState<Snapshot[]>([])
  const [seats, setSeats] = useState<Seat[]>(office.layout.seats)
  const drag = useRef<number | null>(null)
  const L = office.layout

  useEffect(() => {
    setSeats(office.layout.seats)
  }, [office.layout.seats])

  const three = useRef<ThreeOffice | null>(null)

  useEffect(() => {
    if (!canvas.current || !wrap.current) {
      return
    }
    const view = new ThreeOffice(canvas.current, engine)
    three.current = view
    const ro = new ResizeObserver(() => {
      if (wrap.current && three.current) {
        const rect = wrap.current.getBoundingClientRect()
        if (rect.width > 20 && rect.height > 20) {
          three.current.resize(rect.width, rect.height)
        }
      }
    })
    ro.observe(wrap.current)
    let raf = 0
    let last = performance.now()
    let acc = 0
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      engine.update(dt)
      view.render(dt)
      acc += dt
      if (acc > 1 / 30) {
        acc = 0
        setSnaps(engine.snapshots())
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      view.dispose()
      three.current = null
    }
  }, [engine])

  useEffect(() => {
    if (three.current) {
      three.current.picked = target
    }
  }, [target])

  const toImage = (e: { clientX: number; clientY: number }) => {
    const r = wrap.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 1, height: 1 }
    return {
      x: ((e.clientX - r.left) / r.width) * L.width,
      y: ((e.clientY - r.top) / r.height) * L.height
    }
  }

  const pct = (x: number, y: number) => ({
    left: `${(x / L.width) * 100}%`,
    top: `${(y / L.height) * 100}%`
  })

  return (
    <div
      ref={wrap}
      className={`relative w-full h-full select-none overflow-hidden ${editLayout ? 'cursor-crosshair' : ''}`}
      onPointerDown={(e) => {
        if (editLayout) {
          return
        }
        const p = toImage(e)
        const hit = engine.hit(p.x, p.y)
        onPick(hit)
      }}
      onPointerMove={(e) => {
        if (!three.current) {
          return
        }
        if (drag.current !== null && editLayout) {
          const p = toImage(e)
          const next = seats.map((s, i) =>
            i === drag.current
              ? {
                  x: Math.round(Math.max(40, Math.min(L.width - 40, p.x))),
                  y: Math.round(Math.max(40, Math.min(L.height - 40, p.y)))
                }
              : s
          )
          setSeats(next)
          return
        }
        const p = toImage(e)
        three.current.hovered = engine.hit(p.x, p.y)
      }}
      onPointerUp={() => {
        if (drag.current !== null && onLayout) {
          drag.current = null
          onLayout({ ...L, seats })
        }
      }}
    >
      <canvas ref={canvas} className="block w-full h-full" />
      <div className="absolute inset-0 pointer-events-none">
        {snaps.map((s) => (
          <div
            key={s.id}
            className={`absolute flex flex-col items-center pointer-events-auto cursor-pointer transition-transform ${
              target === s.id ? 'scale-105 z-20' : 'z-10'
            }`}
            style={{ ...pct(s.x, s.top), transform: 'translate(-50%, -100%)' }}
            onClick={(e) => {
              e.stopPropagation()
              onPick(s.id)
            }}
          >
            {s.bubble ? (
              <div
                className={`mb-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg border shadow-lg max-w-[240px] truncate animate-in fade-in zoom-in-95 duration-150 relative ${
                  s.thinking
                    ? 'bg-callout-important/15 text-callout-important border-callout-important/50'
                    : s.working
                      ? 'bg-callout-note/15 text-callout-note border-callout-note/50 animate-pulse'
                      : 'bg-card/95 text-card-foreground border-border'
                }`}
              >
                {s.bubble}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b bg-inherit border-inherit" />
              </div>
            ) : s.thinking ? (
              <div className="mb-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border border-callout-important/50 bg-callout-important/15 text-callout-important shadow-md flex items-center gap-1 relative">
                <span>pensando</span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-callout-important animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-callout-important animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 rounded-full bg-callout-important animate-bounce [animation-delay:0.4s]" />
                </span>
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b bg-inherit border-inherit" />
              </div>
            ) : s.working ? (
              <div className="mb-1.5 px-2.5 py-0.5 text-[10px] font-semibold rounded-lg border border-callout-note/50 bg-callout-note/15 text-callout-note shadow-md flex items-center gap-1 relative animate-pulse">
                <span>escribiendo</span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-callout-note animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-callout-note animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1 h-1 rounded-full bg-callout-note animate-bounce [animation-delay:0.4s]" />
                </span>
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b bg-inherit border-inherit" />
              </div>
            ) : null}
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight shadow-lg transition-colors border ${
                target === s.id
                  ? 'bg-annotation-highlight text-white border-annotation-highlight ring-2 ring-annotation-highlight/40'
                  : 'bg-card/90 text-card-foreground border-border'
              }`}
            >
              <span>{s.name}</span>
              {s.lead ? (
                <span className="ml-1 text-[9px] text-annotation-highlight font-extrabold">★</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
