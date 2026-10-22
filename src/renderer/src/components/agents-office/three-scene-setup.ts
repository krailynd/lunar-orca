import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GradeShader, radialTexture, rayTexture } from './three-textures'

export const plane = new THREE.PlaneGeometry(1, 1)

export class ThreeOfficeScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.OrthographicCamera
  composer: EffectComposer
  bloom: UnrealBloomPass
  grade: ShaderPass
  bgMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  dust: THREE.Points
  dustSeed: Float32Array
  glowTex = radialTexture([
    [0, 'rgba(255,210,130,1)'],
    [0.25, 'rgba(255,170,80,0.45)'],
    [1, 'rgba(255,150,60,0)']
  ])
  softTex = radialTexture(
    [
      [0, 'rgba(255,255,255,1)'],
      [0.5, 'rgba(255,255,255,0.35)'],
      [1, 'rgba(255,255,255,0)']
    ],
    64
  )
  shadowTex = radialTexture(
    [
      [0, 'rgba(20,10,8,0.55)'],
      [0.6, 'rgba(20,10,8,0.25)'],
      [1, 'rgba(20,10,8,0)']
    ],
    64
  )
  ringTex = radialTexture(
    [
      [0, 'rgba(255,255,255,0)'],
      [0.62, 'rgba(255,255,255,0)'],
      [0.78, 'rgba(255,255,255,0.9)'],
      [1, 'rgba(255,255,255,0)']
    ],
    128
  )
  rayTex = rayTexture()

  constructor(public canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.scene.background = new THREE.Color('#140d0a')
    this.camera = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10)
    this.bgMesh = new THREE.Mesh(
      plane,
      new THREE.MeshBasicMaterial({ color: 0x1a1a24, depthTest: false, depthWrite: false })
    )
    this.bgMesh.renderOrder = 0
    this.scene.add(this.bgMesh)

    const n = 140
    const pos = new Float32Array(n * 3)
    this.dustSeed = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      this.dustSeed[i * 3] = Math.random()
      this.dustSeed[i * 3 + 1] = Math.random()
      this.dustSeed[i * 3 + 2] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.dust = new THREE.Points(
      g,
      new THREE.PointsMaterial({
        size: 3,
        map: this.softTex,
        color: '#ffe2a8',
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        sizeAttenuation: false
      })
    )
    this.dust.renderOrder = 5000
    this.scene.add(this.dust)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.55, 0.55, 0.78)
    this.composer.addPass(this.bloom)
    this.grade = new ShaderPass(GradeShader)
    this.composer.addPass(this.grade)
    this.composer.addPass(new OutputPass())
  }
}
