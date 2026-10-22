import * as THREE from 'three'
import type { OfficeEffect } from './types'
import { plane } from './three-scene-setup'

export type Particle = {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  vx: number
  vy: number
  life: number
  max: number
  spin: number
  tx?: number
  ty?: number
  sx?: number
  sy?: number
}

export function spawnParticleEffect(
  scene: THREE.Scene,
  softTex: THREE.Texture,
  particles: Particle[],
  fx: OfficeEffect
): void {
  const mk = (color: string, size: number, blend = true) => {
    const m = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({
        map: softTex,
        color,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: blend ? THREE.AdditiveBlending : THREE.NormalBlending
      })
    )
    m.scale.set(size, size, 1)
    m.renderOrder = 6000
    scene.add(m)
    return m
  }

  if (fx.kind === 'sparkle') {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2
      const sp = 60 + Math.random() * 120
      const m = mk(i % 3 === 0 ? '#fff3c4' : fx.color, 6 + Math.random() * 8)
      m.position.set(fx.x, -fx.y, 0)
      particles.push({
        mesh: m,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp + 80,
        life: 0,
        max: 0.9 + Math.random() * 0.5,
        spin: 0
      })
    }
  } else if (fx.kind === 'paper' && fx.tx !== undefined && fx.ty !== undefined) {
    const c = document.createElement('canvas')
    c.width = 10
    c.height = 12
    const g = c.getContext('2d')
    if (g) {
      g.fillStyle = '#1a1320'
      g.fillRect(0, 0, 10, 12)
      g.fillStyle = '#fffaf0'
      g.fillRect(1, 1, 8, 10)
      g.fillStyle = '#9b93ad'
      for (let y = 3; y < 10; y += 2) {
        g.fillRect(2, y, 6, 1)
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    const m = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({
        map: t,
        transparent: true,
        depthTest: false,
        depthWrite: false
      })
    )
    m.scale.set(30, 36, 1)
    m.renderOrder = 6001
    m.position.set(fx.x, -fx.y, 0)
    scene.add(m)
    particles.push({
      mesh: m,
      vx: 0,
      vy: 0,
      life: 0,
      max: 0.75,
      spin: 6,
      sx: fx.x,
      sy: fx.y,
      tx: fx.tx,
      ty: fx.ty
    })
  }
}

export function updateParticles(scene: THREE.Scene, particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life += dt
    const k = p.life / p.max
    if (p.tx !== undefined && p.ty !== undefined && p.sx !== undefined && p.sy !== undefined) {
      const e = 1 - (1 - Math.min(1, k)) ** 3
      const x = p.sx + (p.tx - p.sx) * e
      const y = p.sy + (p.ty - p.sy) * e - Math.sin(Math.min(1, k) * Math.PI) * 70
      p.mesh.position.set(x, -y, 0)
      p.mesh.rotation.z = Math.sin(k * p.spin) * 0.4
      p.mesh.material.opacity = k > 0.85 ? (1 - k) / 0.15 : 1
    } else {
      p.vy -= 260 * dt
      p.mesh.position.x += p.vx * dt
      p.mesh.position.y += p.vy * dt
      p.mesh.material.opacity = Math.max(0, 1 - k)
    }
    if (k >= 1) {
      scene.remove(p.mesh)
      p.mesh.material.map?.dispose()
      p.mesh.material.dispose()
      particles.splice(i, 1)
    }
  }
}

export function updateOfficeDust(
  dust: THREE.Points,
  dustSeed: Float32Array,
  width: number,
  height: number,
  t: number,
  canvasWidth: number
): void {
  const pos = dust.geometry.attributes.position
  if (!pos || !(pos instanceof THREE.BufferAttribute)) {
    return
  }
  for (let i = 0; i < pos.count; i++) {
    const a = dustSeed[i * 3]
    const b = dustSeed[i * 3 + 1]
    const sp = dustSeed[i * 3 + 2]
    const u = (a + t * 0.01 * (0.5 + sp)) % 1
    const along = u * height * 0.85
    const x = width * 0.04 + along * 0.62 + b * width * 0.22 + Math.sin(t * 0.6 + a * 20) * 10
    const y = height * 0.08 + along + Math.cos(t * 0.5 + b * 30) * 8
    pos.setXYZ(i, x, -y, 0)
  }
  pos.needsUpdate = true
  if (dust.material instanceof THREE.PointsMaterial) {
    dust.material.size = Math.max(2, (canvasWidth / width) * 3.2)
  }
}
