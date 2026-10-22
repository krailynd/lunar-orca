import * as THREE from 'three'
import type { Layout } from './types'
import { plane } from './three-scene-setup'
import type { CharView } from './three-textures'

export type ScreenView = {
  canvas: HTMLCanvasElement
  tex: THREE.CanvasTexture
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  level: number
  line: number
}

export function updateOfficeLightsAndRays(
  scene: THREE.Scene,
  layout: Layout,
  glowTex: THREE.Texture,
  rayTex: THREE.Texture,
  currentLights: {
    mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
    phase: number
  }[],
  currentRays: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number }[]
): {
  lights: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number }[]
  rays: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number }[]
} {
  for (const l of currentLights) {
    scene.remove(l.mesh)
  }
  const lights = (layout.lights ?? []).map((p, i) => {
    const r = layout.height * 0.36
    const m = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        opacity: 0.55
      })
    )
    m.scale.set(r, r, 1)
    m.position.set(p.x, -p.y, 0)
    m.renderOrder = 4000
    scene.add(m)
    return { mesh: m, phase: i * 1.7 }
  })

  for (const r of currentRays) {
    scene.remove(r.mesh)
  }
  const rays = [0, 1, 2, 3].map((i) => {
    const m = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        opacity: 0.18
      })
    )
    const h = layout.height * 0.78
    m.scale.set(layout.width * (0.05 + i * 0.012), h, 1)
    m.rotation.z = 0.78 + i * 0.05
    m.position.set(layout.width * (0.12 + i * 0.045), -layout.height * (0.42 + i * 0.03), 0)
    m.renderOrder = 4100
    scene.add(m)
    return { mesh: m, phase: i * 2.1 }
  })

  return { lights, rays }
}

export function attachChairTexture(bgTex: THREE.Texture | null, v: CharView): void {
  if (!bgTex) {
    return
  }
  v.chairTex?.dispose()
  const t = bgTex.clone()
  t.needsUpdate = true
  v.chairTex = t
  v.chair.material.map = t
  v.chair.material.needsUpdate = true
}
