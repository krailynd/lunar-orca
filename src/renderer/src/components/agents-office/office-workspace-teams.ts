import type { Layout, PublicOffice } from './types'
import { buildDynamicOffice } from './office-dynamic-generator'
import officeBgImage from '@/assets/office-bg.png'
export { buildDynamicOffice } from './office-dynamic-generator'

export const PIXEL_OFFICE_LAYOUT: Layout = {
  background: officeBgImage,
  width: 1672,
  height: 940,
  entry: { x: 838, y: 915 },
  seats: [
    { x: 440, y: 432 },
    { x: 844, y: 432 },
    { x: 1249, y: 432 },
    { x: 397, y: 690 },
    { x: 844, y: 690 },
    { x: 1288, y: 690 }
  ],
  lights: [
    { x: 300, y: 52 },
    { x: 512, y: 90 },
    { x: 845, y: 55 },
    { x: 1190, y: 90 },
    { x: 1360, y: 52 }
  ],
  board: { x: 690, y: 80, w: 335, h: 135 },
  spots: [
    { x: 857, y: 265 },
    { x: 1440, y: 330 },
    { x: 230, y: 560 },
    { x: 1180, y: 820 }
  ]
}

export function getOfficeForWorkspace(workspaceName: string, workspaceId?: string): PublicOffice {
  // En todas las oficinas, el orquestador comienza solo en su oficina y los subagentes entran por la puerta al ser delegados
  return buildDynamicOffice(workspaceName, workspaceId)
}
