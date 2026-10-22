import type { RenderedEntity } from './office-simulation'
import {
  DEFAULT_DESK_SEATS,
  DEFAULT_LOUNGE_SEATS,
  DEFAULT_OFFICE_HEIGHT,
  DEFAULT_OFFICE_WIDTH
} from './office-constants'

export function drawOffice(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement | null,
  entities: RenderedEntity[],
  selectedId: string | null
): void {
  ctx.clearRect(0, 0, DEFAULT_OFFICE_WIDTH, DEFAULT_OFFICE_HEIGHT)

  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, DEFAULT_OFFICE_WIDTH, DEFAULT_OFFICE_HEIGHT)
  } else {
    drawFallbackOffice(ctx)
  }

  for (const entity of entities) {
    drawAgentEntity(ctx, entity, entity.agent.id === selectedId)
  }
}

function drawFallbackOffice(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, DEFAULT_OFFICE_WIDTH, DEFAULT_OFFICE_HEIGHT)

  ctx.fillStyle = '#252538'
  for (let x = 0; x < DEFAULT_OFFICE_WIDTH; x += 32) {
    for (let y = 0; y < DEFAULT_OFFICE_HEIGHT; y += 32) {
      if ((x / 32 + y / 32) % 2 === 0) {
        ctx.fillRect(x, y, 32, 32)
      }
    }
  }

  // Work area rug
  ctx.fillStyle = '#2a2b42'
  ctx.fillRect(150, 120, 660, 260)

  // Lounge rug
  ctx.fillStyle = '#312c40'
  ctx.fillRect(100, 430, 260, 90)

  // Meeting rug
  ctx.fillStyle = '#2c3940'
  ctx.fillRect(720, 430, 180, 90)

  ctx.fillStyle = '#4c3f35'
  for (const s of DEFAULT_DESK_SEATS) {
    ctx.fillRect(s.x - 24, s.y - 12, 48, 24)
    ctx.fillStyle = '#11111b'
    ctx.fillRect(s.x - 10, s.y - 20, 20, 12)
    ctx.fillStyle = '#4c3f35'
  }

  ctx.fillStyle = '#5c4d60'
  for (const s of DEFAULT_LOUNGE_SEATS) {
    ctx.fillRect(s.x - 16, s.y - 16, 32, 32)
  }
}

function drawAgentEntity(
  ctx: CanvasRenderingContext2D,
  entity: RenderedEntity,
  isSelected: boolean
): void {
  const { x, y, agent, dir, animStep, seated } = entity
  const color = agent.color || '#3b82f6'

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  ctx.ellipse(x, y + 10, 12, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  if (isSelected) {
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = color
  const bodyBob = seated ? 0 : animStep % 2 === 0 ? 0 : -2

  ctx.fillRect(x - 8, y - 10 + bodyBob, 16, 16)

  ctx.fillStyle = '#f6d7b0'
  ctx.fillRect(x - 6, y - 22 + bodyBob, 12, 12)

  // Hair
  ctx.fillStyle = '#222'
  ctx.fillRect(x - 7, y - 25 + bodyBob, 14, 5)

  // Face eyes
  ctx.fillStyle = '#111'
  if (dir === 'left') {
    ctx.fillRect(x - 5, y - 18 + bodyBob, 2, 2)
  } else if (dir === 'right') {
    ctx.fillRect(x + 3, y - 18 + bodyBob, 2, 2)
  } else if (dir === 'down') {
    ctx.fillRect(x - 4, y - 18 + bodyBob, 2, 2)
    ctx.fillRect(x + 2, y - 18 + bodyBob, 2, 2)
  }

  if (seated && agent.status === 'working') {
    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    ctx.arc(x + 12, y - 18, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Name badge
  ctx.font = '10px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(15, 15, 20, 0.75)'
  const label = agent.name
  const textWidth = ctx.measureText(label).width
  ctx.fillRect(x - textWidth / 2 - 4, y - 38 + bodyBob, textWidth + 8, 12)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(label, x, y - 29 + bodyBob)

  if (agent.bubble) {
    drawBubble(ctx, x, y - 44 + bodyBob, agent.bubble)
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
  ctx.font = '9px sans-serif'
  const tw = ctx.measureText(text).width
  const bw = Math.min(tw + 12, 140)
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#333333'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x - bw / 2, y - 16, bw, 16, 4)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#111111'
  ctx.textAlign = 'center'
  ctx.fillText(text.slice(0, 22), x, y - 4)
}
