import * as THREE from 'three'
import type { Character } from './engine'
import type { ScreenView } from './three-lights-props'
import { plane } from './three-scene-setup'

export function createScreenForSeat(
  screens: Map<string, ScreenView>,
  seatIdx: number,
  c: Character,
  scaleAt: (y: number) => number,
  seatOf: (agent: Character['agent']) => { x: number; y: number },
  softTex: THREE.Texture,
  scene: THREE.Scene
): ScreenView {
  const key = String(seatIdx)
  const existing = screens.get(key)
  if (existing) {
    return existing
  }
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 52
  const tex = new THREE.CanvasTexture(canvas)
  tex.magFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0
    })
  )
  const glow = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({
      map: softTex,
      color: '#7fb4ff',
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      opacity: 0
    })
  )
  const sc = scaleAt(c.y)
  const seat = seatOf(c.agent)
  const w = 25 * sc
  const h = 13 * sc
  mesh.scale.set(w, h, 1)
  mesh.position.set(seat.x, -(seat.y - 38 * sc + h / 2), 0)
  glow.scale.set(w * 2.6, h * 3.4, 1)
  glow.position.copy(mesh.position)
  mesh.renderOrder = 2
  glow.renderOrder = 3
  scene.add(mesh, glow)
  const s: ScreenView = { canvas, tex, mesh, glow, level: 0, line: 0 }
  screens.set(key, s)
  return s
}

export function paintScreen(s: ScreenView, t: number): void {
  const g = s.canvas.getContext('2d')
  if (!g) {
    return
  }
  const W = s.canvas.width
  const H = s.canvas.height
  g.fillStyle = '#0a1020'
  g.fillRect(0, 0, W, H)
  const colors = ['#7be08a', '#5fc9e8', '#f2c14e', '#e86fa8', '#c8c8d8', '#9b7bf2']
  const lh = 5
  const scroll = t * 22
  const first = Math.floor(scroll / lh)
  for (let i = 0; i < H / lh + 2; i++) {
    const n = first + i
    const y = H - ((scroll % lh) + i * lh)
    const seed = Math.abs(Math.sin(n * 91.7) * 1000) % 1
    const indent = (Math.abs(n) % 4) * 6
    g.fillStyle = colors[Math.abs(n) % colors.length]
    g.fillRect(4 + indent, y, (W - 12 - indent) * (0.25 + seed * 0.7), 3)
  }
  if (Math.floor(t * 2) % 2 === 0) {
    g.fillStyle = '#ffffff'
    g.fillRect(4, H - 7, 4, 4)
  }
  s.tex.needsUpdate = true
}
