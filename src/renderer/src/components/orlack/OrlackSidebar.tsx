import type React from 'react'
import { Hash, Users, Circle, Building2, Sparkles, Terminal } from 'lucide-react'
import type { OrlackChannel, OrlackUser } from './orlack-types'

type OrlackSidebarProps = {
  channels: OrlackChannel[]
  users: OrlackUser[]
  activeChannelId: string
  selectedAgentFilter: string | null
  onSelectChannel: (id: string) => void
  onSelectAgentFilter: (id: string | null) => void
  onOpenOffice: () => void
}

export function OrlackSidebar({
  channels,
  users,
  activeChannelId,
  selectedAgentFilter,
  onSelectChannel,
  onSelectAgentFilter,
  onOpenOffice
}: OrlackSidebarProps): React.JSX.Element {
  // Separar los agentes en Orquestador Principal, Desarrollador Humano y Subagentes Delegados
  const humanUsers = users.filter((u) => !u.isBot)
  const orchestrators = users.filter((u) => u.isBot && !u.id.startsWith('sub-'))
  const subagents = users.filter((u) => u.isBot && u.id.startsWith('sub-'))

  const renderUserButton = (u: OrlackUser) => (
    <button
      key={u.id}
      onClick={() => onSelectAgentFilter(selectedAgentFilter === u.id ? null : u.id)}
      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
        selectedAgentFilter === u.id
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <div
          className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white shadow-xs shrink-0"
          style={{ backgroundColor: u.avatarColor }}
        >
          {u.name.charAt(0)}
        </div>
        <div className="flex flex-col text-left truncate">
          <span className="truncate font-medium text-foreground text-[11px] leading-tight">
            {u.name}
          </span>
          <span className="text-[9px] text-muted-foreground truncate leading-none">{u.role}</span>
        </div>
      </div>
      <Circle className="h-2 w-2 fill-workspace-status-review text-workspace-status-review shrink-0" />
    </button>
  )

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/60 select-none">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs shadow-xs">
            💬
          </div>
          <span>Orlack Workspace</span>
        </div>
        <button
          onClick={onOpenOffice}
          title="Ver Agents Office 3D"
          className="flex items-center gap-1.5 rounded-md bg-secondary/80 hover:bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground transition-all shadow-xs hover:scale-102"
        >
          <Building2 className="h-3 w-3 text-primary" />
          <span>Oficina 3D</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-sleek p-3 space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Canales de Proyectos</span>
            <span className="text-[10px] opacity-70">{channels.length}</span>
          </div>
          <div className="space-y-0.5">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  ch.id === activeChannelId && !selectedAgentFilter
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="h-3.5 w-3.5 opacity-70 shrink-0" />
                  <span className="truncate">{ch.name}</span>
                </div>
                {ch.orchestrator ? (
                  <span className="text-[9px] text-muted-foreground/60 shrink-0 font-normal">
                    bot
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Sección: Orquestador Central */}
        <div>
          <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Orquestador Principal
            </span>
          </div>
          <div className="space-y-0.5">{orchestrators.map(renderUserButton)}</div>
        </div>

        {/* Sección: Subagentes Delegados */}
        <div>
          <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Terminal className="h-3 w-3 text-workspace-status-review" /> Subagentes Delegados
            </span>
            <span className="text-[10px] opacity-70">{subagents.length}</span>
          </div>
          <div className="space-y-0.5">
            {subagents.length > 0 ? (
              subagents.map(renderUserButton)
            ) : (
              <div className="px-2 py-1 text-[10px] text-muted-foreground/60 italic">
                Sin subagentes activos en este canal
              </div>
            )}
          </div>
        </div>

        {/* Sección: Miembros Humanos */}
        <div>
          <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Equipo
            </span>
          </div>
          <div className="space-y-0.5">{humanUsers.map(renderUserButton)}</div>
        </div>
      </div>
    </div>
  )
}
