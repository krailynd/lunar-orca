import type { Layout, Point } from './types'

export class OfficeRouter {
  constructor(public getLayout: () => Layout | null) {}

  scaleAt(y: number): number {
    const layout = this.getLayout()
    const h = layout?.height ?? 940
    return (3.3 + (y / h) * 1.9) * (h / 940)
  }

  lanes(): { hLanes: number[]; vLanes: number[] } {
    const layout = this.getLayout()
    if (!layout) {
      return { hLanes: [], vLanes: [] }
    }
    const seats = layout.seats ?? []
    const rows: number[] = []
    for (const s of [...seats].sort((a, b) => a.y - b.y)) {
      if (!rows.some((r) => Math.abs(r - s.y) < 70)) {
        rows.push(s.y)
      }
    }
    const hLanes = rows.map((y) => y + 21 * this.scaleAt(y))
    const xs: number[] = []
    for (const s of [...seats].sort((a, b) => a.x - b.x)) {
      if (!xs.some((x) => Math.abs(x - s.x) < 90)) {
        xs.push(s.x)
      }
    }
    const vLanes: number[] = []
    for (let i = 0; i < xs.length - 1; i++) {
      vLanes.push((xs[i] + xs[i + 1]) / 2)
    }
    if (xs.length > 0) {
      vLanes.push(Math.max(40, xs[0] - 190))
      vLanes.push(Math.min(layout.width - 40, (xs.at(-1) ?? 0) + 190))
    }
    return { hLanes, vLanes }
  }

  route(from: Point, to: Point): Point[] {
    const { hLanes, vLanes } = this.lanes()
    if (!hLanes.length) {
      return [to]
    }
    const near = (y: number) =>
      hLanes.reduce((b, l) => (Math.abs(l - y) < Math.abs(b - y) ? l : b), hLanes[0])
    const la = near(from.y)
    const lb = near(to.y)
    const pts: Point[] = [{ x: from.x, y: la }]
    if (Math.abs(la - lb) > 1 && vLanes.length > 0) {
      const v = vLanes.reduce(
        (b, l) =>
          Math.abs(l - to.x) + Math.abs(l - from.x) < Math.abs(b - to.x) + Math.abs(b - from.x)
            ? l
            : b,
        vLanes[0]
      )
      pts.push({ x: v, y: la }, { x: v, y: lb })
    }
    pts.push({ x: to.x, y: lb }, to)
    return pts
  }
}
