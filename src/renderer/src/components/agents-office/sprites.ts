export type Dir = 'down' | 'up' | 'left' | 'right'

export type Pose =
  | { kind: 'stand'; dir: Dir; step?: number; blink?: boolean }
  | { kind: 'walk'; dir: Dir; step: number; blink?: boolean }
  | { kind: 'sit'; typing?: number; blink?: boolean }

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = Number.parseInt(
    h.length === 3
      ? h
          .split('')
          .map((x) => x + x)
          .join('')
      : h,
    16
  )
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function shade(c: string, amt: number): string {
  const [r, g, b] = hexToRgb(c)
  const f = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)))
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function tintRgb(
  r: number,
  g: number,
  b: number,
  target: [number, number, number],
  weight: number
): [number, number, number] {
  return [
    Math.round(r * (1 - weight) + target[0] * weight),
    Math.round(g * (1 - weight) + target[1] * weight),
    Math.round(b * (1 - weight) + target[2] * weight)
  ]
}
