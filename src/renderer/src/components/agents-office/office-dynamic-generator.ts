import type { Agent, Appearance, PublicOffice } from './types'
import { PIXEL_OFFICE_LAYOUT } from './office-workspace-teams'

const DEFAULT_APPEARANCES: Appearance[] = [
  {
    skin: '#f1c27d',
    hair: '#3b2a1a',
    hairStyle: 'short',
    shirt: '#2e7d5b',
    pants: '#2b2b3a',
    accessory: 'none'
  },
  {
    skin: '#e0ac69',
    hair: '#1a1a1a',
    hairStyle: 'curly',
    shirt: '#4f6bed',
    pants: '#30343f',
    accessory: 'glasses'
  },
  {
    skin: '#c68642',
    hair: '#2a1b10',
    hairStyle: 'cap',
    shirt: '#d35400',
    pants: '#3a3a3a',
    accessory: 'none'
  },
  {
    skin: '#ffdbac',
    hair: '#a0522d',
    hairStyle: 'bun',
    shirt: '#8e44ad',
    pants: '#2c3e50',
    accessory: 'glasses'
  },
  {
    skin: '#8d5524',
    hair: '#0f0f0f',
    hairStyle: 'long',
    shirt: '#16a085',
    pants: '#34495e',
    accessory: 'none'
  },
  {
    skin: '#f1c7a5',
    hair: '#3b3b48',
    hairStyle: 'short',
    shirt: '#e86fa8',
    pants: '#2f4a6b',
    accessory: 'none'
  }
]

export function getAppearanceForIndex(index: number): Appearance {
  return DEFAULT_APPEARANCES[index % DEFAULT_APPEARANCES.length]
}

export function buildDynamicOffice(workspaceName: string, _workspacePath?: string): PublicOffice {
  const norm = workspaceName.toLowerCase()
  const cleanName = workspaceName.trim() || 'Proyecto'

  // El orquestador principal siempre está en el asiento 0
  const leadAgent: Agent = {
    id: `mate-${norm.replace(/[^a-z0-9]/g, '-')}`,
    name: 'Mate (el Gentleman)',
    role: `Orquestador / ${cleanName}`,
    seat: 0,
    lead: true,
    appearance: DEFAULT_APPEARANCES[0]
  }

  // Por diseño: la oficina inicia SOLO con el Orquestador en su escritorio.
  // Los subagentes entran por la puerta cuando el orquestador los delega.
  return {
    name: `Oficina ${cleanName}`,
    agents: [leadAgent],
    layout: PIXEL_OFFICE_LAYOUT
  }
}
