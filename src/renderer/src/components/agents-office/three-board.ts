import * as THREE from 'three'
import type { Layout } from './types'
import { plane } from './three-scene-setup'

export type BoardView = {
  canvas: HTMLCanvasElement
  tex: THREE.CanvasTexture
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  text: string
}

export function setupOfficeBoard(scene: THREE.Scene, layout: Layout): BoardView | null {
  if (!layout.board) {
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = Math.round((640 * layout.board.h) / layout.board.w)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mesh = new THREE.Mesh(
    plane,
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
  )
  mesh.scale.set(layout.board.w, layout.board.h, 1)
  mesh.position.set(layout.board.x + layout.board.w / 2, -(layout.board.y + layout.board.h / 2), 0)
  mesh.renderOrder = 1
  scene.add(mesh)
  return { canvas, tex, mesh, text: '\0' }
}

export function paintOfficeBoard(board: BoardView | null, title: string, text: string): void {
  if (!board) {
    return
  }
  const composite = `${title}\x01${text}`
  if (composite === board.text) {
    return
  }
  board.text = composite
  const g = board.canvas.getContext('2d')
  if (!g) {
    return
  }
  const W = board.canvas.width
  const H = board.canvas.height
  g.clearRect(0, 0, W, H)

  if (!text && !title) {
    board.tex.needsUpdate = true
    return
  }

  // Header título
  g.fillStyle = '#1e3a8a'
  g.font = `bold ${Math.round(H * 0.16)}px sans-serif`
  g.fillText(title || 'SPRINT / TAREA', W * 0.05, H * 0.22)

  g.fillStyle = '#f59e0b'
  g.fillRect(W * 0.05, H * 0.27, W * 0.25, 4)

  const size = Math.round(H * 0.12)
  g.fillStyle = '#0f172a'
  g.font = `${size}px monospace`

  const lines: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w
    if (g.measureText(next).width > W * 0.9) {
      lines.push(cur)
      cur = w
    } else {
      cur = next
    }
  }
  if (cur) {
    lines.push(cur)
  }

  const max = Math.floor((H * 0.65) / (size * 1.3))
  lines.slice(0, max).forEach((l, i) => {
    const txt = i === max - 1 && lines.length > max ? `${l.slice(0, -2)}…` : l
    g.fillText(txt, W * 0.05, H * 0.44 + i * size * 1.3)
  })

  board.tex.needsUpdate = true
}
