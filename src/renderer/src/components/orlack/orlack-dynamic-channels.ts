import type { Worktree } from '../../../../shared/worktree/types'
import type { OrlackChannel, OrlackUser } from './orlack-types'
import { INITIAL_CHANNELS, INITIAL_USERS } from './orlack-data'
import { getOfficeForWorkspace } from '../agents-office/office-workspace-teams'

export function sanitizeChannelId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Genera canales dinámicos en base a todos los proyectos / worktrees existentes
 * en Lunar Orca, preservando los canales base y actualizando rutas y tópicos.
 */
export function buildDynamicChannels(worktrees: Worktree[]): OrlackChannel[] {
  const channelMap = new Map<string, OrlackChannel>()

  for (const base of INITIAL_CHANNELS) {
    channelMap.set(base.id, { ...base })
  }

  for (const wt of worktrees) {
    const rawName = wt.displayName || 'project'
    const channelId = sanitizeChannelId(rawName)

    if (channelMap.has(channelId)) {
      const existing = channelMap.get(channelId)!
      channelMap.set(channelId, {
        ...existing,
        worktreePath: wt.path,
        topic: existing.topic || `Canal de proyecto para ${wt.displayName}`
      })
      continue
    }

    // Canal inteligente generado dinámicamente para el worktree
    channelMap.set(channelId, {
      id: channelId,
      name: channelId,
      type: 'channel',
      topic: `Canal de proyecto para ${wt.displayName}`,
      orchestrator: 'Mate (el Gentleman)',
      worktreePath: wt.path
    })
  }

  return Array.from(channelMap.values())
}

/**
 * Devuelve el equipo dinámico de agentes y usuarios conectados para el canal seleccionado.
 * Mapea los empleados de la oficina del proyecto con sus roles, estados y avatares.
 */
export function buildUsersForChannel(channel: OrlackChannel): OrlackUser[] {
  const elvisUser: OrlackUser = INITIAL_USERS[0]
  // La oficina y sus agentes se resuelven exclusivamente según el canal seleccionado
  const office = getOfficeForWorkspace(channel.name)

  const channelUsers: OrlackUser[] = [elvisUser]

  for (const agent of office.agents) {
    channelUsers.push({
      id: agent.id,
      name: agent.name,
      avatarColor: agent.appearance.shirt || '#8b5cf6',
      role: agent.role,
      status: 'online',
      isBot: true,
      model: agent.model || 'gemini-3.8-flash-high',
      worktreeId: channel.worktreePath
    })
  }

  return channelUsers
}
