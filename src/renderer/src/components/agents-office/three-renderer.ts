import * as THREE from 'three'
import type { Layout } from './types'
import type { OfficeEngine } from './engine'
import type { Character } from './engine-types'
import type { Frame } from './characters'
import { updateOfficeLightsAndRays, attachChairTexture } from './three-lights-props'
import { createScreenForSeat, paintScreen } from './three-screens'
import { setupOfficeBoard, paintOfficeBoard, type BoardView } from './three-board'
import type { CharView } from './three-textures'
import {
  type Particle,
  spawnParticleEffect,
  updateParticles,
  updateOfficeDust
} from './three-particles'
import { ThreeOfficeScene, plane } from './three-scene-setup'

export type ScreenView = {
  canvas: HTMLCanvasElement
  tex: THREE.CanvasTexture
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  level: number
  line: number
}

export class ThreeOffice extends ThreeOfficeScene {
  bgTex: THREE.Texture | null = null
  layoutKey = ''
  chars = new Map<string, CharView>()
  screens = new Map<string, ScreenView>()
  lights: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number }[] = []
  rays: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; phase: number }[] = []
  particles: Particle[] = []
  board: BoardView | null = null
  bodyTextures = new Map<string, THREE.CanvasTexture>()
  hovered: string | null = null
  picked: string | null = null
  width = 1672
  height = 940

  constructor(
    canvas: HTMLCanvasElement,
    public engine: OfficeEngine
  ) {
    super(canvas)
  }

  resize(w: number, h: number): void {
    if (w < 2 || h < 2) {
      return
    }
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.composer.setPixelRatio(dpr)
    this.composer.setSize(w, h)
    this.grade.uniforms.aspect.value = w / h
  }

  private setLayout(L: Layout): void {
    const key = JSON.stringify(L)
    if (key === this.layoutKey) {
      return
    }
    let bgChanged = !this.layoutKey || !this.bgTex
    if (this.layoutKey) {
      try {
        bgChanged = JSON.parse(this.layoutKey).background !== L.background
      } catch {
        bgChanged = true
      }
    }
    this.layoutKey = key
    this.width = L.width
    this.height = L.height
    Object.assign(this.camera, { left: 0, right: L.width, top: 0, bottom: -L.height })
    this.camera.updateProjectionMatrix()
    this.bgMesh.scale.set(L.width, L.height, 1)
    this.bgMesh.position.set(L.width / 2, -L.height / 2, 0)

    if (bgChanged) {
      new THREE.TextureLoader().load(L.background, (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 4
        this.bgTex = t
        this.bgMesh.material.map = t
        this.bgMesh.material.needsUpdate = true
        for (const v of this.chars.values()) {
          this.attachChairTexture(v)
        }
      })
    }

    const updated = updateOfficeLightsAndRays(
      this.scene,
      L,
      this.glowTex,
      this.rayTex,
      this.lights,
      this.rays
    )
    this.lights = updated.lights
    this.rays = updated.rays

    for (const s of this.screens.values()) {
      this.scene.remove(s.mesh, s.glow)
    }
    this.screens.clear()

    if (this.board) {
      this.scene.remove(this.board.mesh)
    }
    this.board = setupOfficeBoard(this.scene, L)
  }

  private attachChairTexture(v: CharView): void {
    attachChairTexture(this.bgTex, v)
  }

  private bodyTexture(f: Frame): THREE.CanvasTexture {
    let t = this.bodyTextures.get(f.key)
    if (!t) {
      t = new THREE.CanvasTexture(f.canvas)
      t.magFilter = THREE.NearestFilter
      t.minFilter = THREE.NearestFilter
      t.generateMipmaps = false
      t.colorSpace = THREE.SRGBColorSpace
      if (this.bodyTextures.size > 600) {
        for (const old of this.bodyTextures.values()) {
          old.dispose()
        }
        this.bodyTextures.clear()
      }
      this.bodyTextures.set(f.key, t)
    }
    return t
  }

  private screenFor(seatIdx: number, c: Character): ScreenView {
    return createScreenForSeat(
      this.screens,
      seatIdx,
      c,
      (y) => this.engine.scaleAt(y),
      (ag) => this.engine.seatOf(ag),
      this.softTex,
      this.scene
    )
  }

  private paintScreen(s: ScreenView, t: number): void {
    paintScreen(s, t)
  }

  private view(c: Character): CharView {
    let v = this.chars.get(c.id)
    if (v) {
      return v
    }
    const group = new THREE.Group()
    const mat = (o: THREE.MeshBasicMaterialParameters) =>
      new THREE.MeshBasicMaterial({ transparent: true, depthTest: false, depthWrite: false, ...o })
    const shadow = new THREE.Mesh(plane, mat({ map: this.shadowTex }))
    const ring = new THREE.Mesh(
      plane,
      mat({ map: this.ringTex, blending: THREE.AdditiveBlending, opacity: 0 })
    )
    const body = new THREE.Mesh(plane, mat({ alphaTest: 0.5 }))
    const chair = new THREE.Mesh(plane, mat({}))
    group.add(shadow, ring, body, chair)
    this.scene.add(group)
    v = {
      group,
      body,
      shadow,
      ring,
      chair,
      chairTex: null,
      lastTexKey: '',
      lastTex: null
    }
    this.attachChairTexture(v)
    this.chars.set(c.id, v)
    return v
  }

  render(dt: number): void {
    const E = this.engine
    if (!E.layout) {
      return
    }
    this.setLayout(E.layout)
    const t = E.now

    for (const fx of E.effects.splice(0)) {
      spawnParticleEffect(this.scene, this.softTex, this.particles, fx)
    }

    const alive = new Set<string>()
    for (const c of E.chars.values()) {
      alive.add(c.id)
      const v = this.view(c)
      const r = E.spriteRect(c)
      const base = 100 + c.y
      const tex = this.bodyTexture(r.frame)
      if (r.frame.key !== v.lastTexKey) {
        v.body.material.map = tex
        v.body.material.needsUpdate = true
        v.lastTexKey = r.frame.key
      }
      const hot = this.hovered === c.id || this.picked === c.id
      v.body.material.color.setScalar(hot ? 1.18 : 1)
      v.body.scale.set(r.frame.flip ? -r.w : r.w, r.h, 1)
      v.body.position.set(r.x + r.w / 2, -(r.y + r.h / 2), 0)
      v.body.renderOrder = base + 0.2

      const sw = r.s * (c.seated ? 22 : 13)
      v.shadow.scale.set(sw, sw * 0.32, 1)
      v.shadow.position.set(c.x, -(c.seated ? c.y + 9 * r.s : c.y), 0)
      v.shadow.renderOrder = base
      v.shadow.visible = !c.seated

      const ringW = r.s * (c.seated ? 26 : 16)
      v.ring.scale.set(ringW, ringW * 0.34, 1)
      v.ring.position.set(c.x, -(c.seated ? c.y + 10 * r.s : c.y), 0)
      v.ring.renderOrder = base + 0.1
      v.ring.material.color.set(c.agent.appearance.shirt)
      const ringTarget =
        this.picked === c.id
          ? 0.95
          : this.hovered === c.id
            ? 0.5
            : c.working
              ? 0.35 + 0.2 * Math.sin(t * 5)
              : 0
      v.ring.material.opacity += (ringTarget - v.ring.material.opacity) * Math.min(1, dt * 10)

      v.chair.visible = c.seated && Boolean(v.chairTex)
      if (v.chair.visible && v.chairTex) {
        const cx = c.x - 12 * r.s
        const cy = c.y - 12.4 * r.s
        const cw = 24 * r.s
        const ch = 17.5 * r.s
        v.chairTex.repeat.set(cw / this.width, ch / this.height)
        v.chairTex.offset.set(cx / this.width, 1 - (cy + ch) / this.height)
        v.chair.scale.set(cw, ch, 1)
        v.chair.position.set(cx + cw / 2, -(cy + ch / 2), 0)
        v.chair.renderOrder = base + 0.3
      }

      // PC Monitor screen animation when working
      const seatIdx = c.agent.seat
      const scr = this.screenFor(seatIdx, c)
      const targetLevel = c.seated && c.working ? 1 : 0
      scr.level += (targetLevel - scr.level) * Math.min(1, dt * 6)
      scr.mesh.material.opacity = scr.level
      scr.glow.material.opacity = scr.level * 0.5
      if (scr.level > 0.02) {
        this.paintScreen(scr, t)
      }
    }

    for (const [id, v] of this.chars) {
      if (!alive.has(id)) {
        this.scene.remove(v.group)
        v.chairTex?.dispose()
        this.chars.delete(id)
      }
    }

    paintOfficeBoard(this.board, E.boardTitle, E.boardText)

    updateOfficeDust(
      this.dust,
      this.dustSeed,
      this.width,
      this.height,
      t,
      this.renderer.domElement.width
    )
    updateParticles(this.scene, this.particles, dt)

    this.grade.uniforms.time.value = t
    this.composer.render(dt)
  }

  dispose(): void {
    for (const t of this.bodyTextures.values()) {
      t.dispose()
    }
    this.composer.dispose()
    this.renderer.dispose()
  }
}
