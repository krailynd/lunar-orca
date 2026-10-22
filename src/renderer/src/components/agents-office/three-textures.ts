import * as THREE from 'three'

export const GradeShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, aspect: { value: 1.6 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time; uniform float aspect; varying vec2 vUv;
    float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = (vUv - 0.5) * vec2(aspect, 1.0);
      float v = smoothstep(1.15, 0.35, length(d));
      c.rgb *= mix(0.62, 1.0, v);
      c.rgb = mix(c.rgb, c.rgb * vec3(1.06, 0.98, 0.9), 0.5);
      c.rgb += (rand(vUv * 900.0 + time) - 0.5) * 0.025;
      gl_FragColor = c;
    }`
}

export function radialTexture(stops: [number, string][], size = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const g = c.getContext('2d')
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    for (const [o, col] of stops) {
      grad.addColorStop(o, col)
    }
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function rayTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const g = c.getContext('2d')
  if (g) {
    const v = g.createLinearGradient(0, 0, 0, 256)
    v.addColorStop(0, 'rgba(255,226,160,0.9)')
    v.addColorStop(0.7, 'rgba(255,200,120,0.35)')
    v.addColorStop(1, 'rgba(255,190,110,0)')
    g.fillStyle = v
    g.fillRect(0, 0, 64, 256)
    g.globalCompositeOperation = 'destination-in'
    const h = g.createLinearGradient(0, 0, 64, 0)
    h.addColorStop(0, 'rgba(0,0,0,0)')
    h.addColorStop(0.5, 'rgba(0,0,0,1)')
    h.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = h
    g.fillRect(0, 0, 64, 256)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export type CharView = {
  group: THREE.Group
  body: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  ring: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  chair: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  chairTex: THREE.Texture | null
  lastTexKey: string
  lastTex: THREE.Texture | null
}
