import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Coffee,
  Laptop,
  MessageSquare,
  RefreshCw,
  Send,
  Building2,
  FolderGit2,
  ChevronDown
} from 'lucide-react'
import { OfficeCanvas } from './OfficeCanvas'
import {
  getSharedOfficeEngine,
  isOfficeInitialized,
  markOfficeInitialized
} from './office-engine-singleton'
import type { PublicOffice } from './types'
import { getOfficeForWorkspace, PIXEL_OFFICE_LAYOUT } from './office-workspace-teams'
import { useAppStore } from '@/store'
import { useActiveWorktree, useAllWorktrees } from '@/store/selectors'
import { useOfficeRealtimeSync } from './use-office-realtime-sync'

export default function AgentsOfficePage(): React.JSX.Element {
  const engine = getSharedOfficeEngine()
  const worktrees = useAllWorktrees()
  const activeWorktree = useActiveWorktree()
  const openOrlack = useAppStore((state) => state.openOrlackPage)

  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState(
    activeWorktree?.displayName || worktrees[0]?.displayName || 'lunar-orca'
  )
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'working' | 'resting'>('all')
  const [allowWander, setAllowWander] = useState(false)
  const [zenMode, setZenMode] = useState(false)

  // Sincronizar automáticamente con el workspace activo cuando cambias en el sidebar
  useEffect(() => {
    if (activeWorktree?.displayName) {
      setSelectedWorkspaceName(activeWorktree.displayName)
    }
  }, [activeWorktree?.displayName])

  const office: PublicOffice = useMemo(() => {
    return getOfficeForWorkspace(selectedWorkspaceName)
  }, [selectedWorkspaceName])

  // Sincronización en tiempo real con Pi, orquestador y tareas del worktree
  useOfficeRealtimeSync(engine, office, selectedWorkspaceName)

  useEffect(() => {
    engine.allowWander = allowWander
  }, [engine, allowWander])

  useEffect(() => {
    const initialized = isOfficeInitialized(office.name)
    engine.setOffice(office)
    const firstAgent = office.agents[0]
    if (firstAgent) {
      setSelectedAgentId(firstAgent.id)
      if (!initialized) {
        markOfficeInitialized(office.name)
        engine.say(firstAgent.id, `Oficina "${office.name}" activa`, 3500)
      }
    }
  }, [engine, office])

  const selectedAgent = office.agents.find((a) => a.id === selectedAgentId) || office.agents[0]

  const handleMakeTalk = useCallback(() => {
    if (!selectedAgent) {
      return
    }
    const phrases = [
      '¡Listo para el próximo commit!',
      'Revisando diagnósticos de LSP...',
      'Orquestando subagentes en paralelo.',
      'Verificando tests y cobertura.',
      'Trabajando en el nuevo requerimiento.'
    ]
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
    engine.say(selectedAgent.id, randomPhrase, 4000)
    engine.setWorking(selectedAgent.id, true)
    setTimeout(() => {
      engine.setWorking(selectedAgent.id, false)
    }, 5000)
  }, [engine, selectedAgent])

  const handleSendToLounge = useCallback(() => {
    if (!selectedAgent) {
      return
    }
    const loungeSpots = PIXEL_OFFICE_LAYOUT.spots ?? [{ x: 857, y: 265 }]
    const spot = loungeSpots[Math.floor(Math.random() * loungeSpots.length)]
    engine.walkTo(selectedAgent.id, spot)
    engine.say(selectedAgent.id, 'Yendo al breakroom a descansar ☕', 3000)
  }, [engine, selectedAgent])

  const handleSendToDesk = useCallback(() => {
    if (!selectedAgent) {
      return
    }
    const char = engine.chars.get(selectedAgent.id)
    if (char) {
      engine.sendHome(char)
      engine.say(selectedAgent.id, 'De vuelta al escritorio 💻', 3000)
    }
  }, [engine, selectedAgent])

  const handleGoToBoard = useCallback(() => {
    if (!selectedAgent) {
      return
    }
    engine.goToBoardAndExplain(
      selectedAgent.id,
      selectedWorkspaceName,
      'Coordinando sprints y distribución de tareas del proyecto'
    )
  }, [engine, selectedAgent, selectedWorkspaceName])

  const filteredAgents = office.agents.filter((ag) => {
    const char = engine.chars.get(ag.id)
    if (filter === 'working') {
      return char?.working || char?.seated
    }
    if (filter === 'resting') {
      return !char?.seated
    }
    return true
  })

  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground select-none">
      {/* Top Header with Office / Workspace Switcher */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4 bg-card/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary">
            <Building2 className="h-5 w-5" />
            <h1 className="text-sm font-semibold tracking-tight">{office.name}</h1>
          </div>

          {/* Project / Workspace Dropdown */}
          <div className="relative flex items-center">
            <FolderGit2 className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedWorkspaceName}
              onChange={(e) => setSelectedWorkspaceName(e.target.value)}
              className="appearance-none rounded-md border border-border bg-background py-1 pl-8 pr-7 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="lunar-orca">Oficina: lunar-orca (HQ)</option>
              {worktrees.map((wt) => (
                <option key={wt.id} value={wt.displayName}>
                  Oficina: {wt.displayName}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {office.agents.length} empleados asignados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-card p-0.5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filter === 'all'
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('working')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filter === 'working'
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              En Escritorio
            </button>
            <button
              onClick={() => setFilter('resting')}
              className={`rounded px-2.5 py-1 transition-colors ${
                filter === 'resting'
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              En Descanso
            </button>
          </div>

          <button
            onClick={() => {
              setAllowWander(!allowWander)
              if (!allowWander) {
                engine.say(selectedAgent?.id || 'mate', 'Paseo ambiental activado ☕', 2500)
              } else {
                engine.say(selectedAgent?.id || 'mate', 'Modo enfocado: todos en reposo 🎯', 2500)
              }
            }}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
              allowWander
                ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            title="Activar o desactivar caminatas aleatorias automáticas"
          >
            <span>Paseo: {allowWander ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setZenMode(!zenMode)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
              zenMode
                ? 'border-primary bg-primary text-primary-foreground font-medium'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            title="Pantalla Completa / Ocultar paneles laterales"
          >
            <span>{zenMode ? 'Restaurar Paneles' : 'Solo Oficina (Zen)'}</span>
          </button>

          <button
            onClick={() => {
              engine.setOffice(office)
              if (selectedAgent) {
                engine.say(selectedAgent.id, 'Sincronizado con éxito', 2500)
              }
            }}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            title="Refrescar oficina"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Full Interactive Pixel Office Canvas Viewport */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto scrollbar-sleek bg-black/80 p-2">
          <div
            className={`relative overflow-hidden rounded-lg border border-border/80 shadow-2xl transition-all ${
              zenMode ? 'w-full h-full' : 'w-[1100px] h-[620px] shrink-0'
            }`}
          >
            <OfficeCanvas
              engine={engine}
              office={office}
              target={selectedAgentId}
              onPick={(id) => {
                if (id) {
                  setSelectedAgentId(id)
                }
              }}
            />
          </div>
        </div>

        {/* Sidebar Info & Controls Panel */}
        {!zenMode ? (
          <div className="flex w-80 flex-col border-l border-border bg-card/60 p-4">
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Empleado Seleccionado
              </h2>
              {selectedAgent ? (
                <div className="mt-3 rounded-lg border border-border bg-background/80 p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-md font-bold text-white shadow"
                      style={{ backgroundColor: selectedAgent.appearance.shirt }}
                    >
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span>{selectedAgent.name}</span>
                        {selectedAgent.lead ? (
                          <span className="rounded bg-annotation-highlight/20 px-1 py-0.2 text-[9px] font-bold text-annotation-highlight">
                            LEAD
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">{selectedAgent.role}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium bg-annotation-highlight/10 text-annotation-highlight">
                        <Laptop className="h-3 w-3" /> Escritorio #{selectedAgent.seat + 1}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2">
                      <button
                        onClick={handleMakeTalk}
                        className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/80 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Hacer hablar (Burbuja)</span>
                      </button>

                      <button
                        onClick={handleGoToBoard}
                        className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/80 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition"
                      >
                        <span>📋 Ir a la Pizarra</span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleSendToLounge}
                          className="flex items-center justify-center gap-1 rounded-md border border-border bg-secondary/60 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                        >
                          <Coffee className="h-3 w-3" />
                          <span>Al Lounge</span>
                        </button>
                        <button
                          onClick={handleSendToDesk}
                          className="flex items-center justify-center gap-1 rounded-md border border-border bg-secondary/60 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                        >
                          <Activity className="h-3 w-3" />
                          <span>Al Escritorio</span>
                        </button>
                      </div>

                      <button
                        onClick={() => openOrlack()}
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground shadow transition hover:opacity-90"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Abrir chat en Orlack</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Roster of agents in current Office */}
            <div className="flex-1 overflow-auto scrollbar-sleek">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Equipo de la Oficina ({filteredAgents.length})
              </h2>
              <div className="space-y-1.5">
                {filteredAgents.map((ag) => (
                  <div
                    key={ag.id}
                    onClick={() => setSelectedAgentId(ag.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-2 text-xs transition-colors ${
                      ag.id === selectedAgentId
                        ? 'border-primary/50 bg-accent text-accent-foreground'
                        : 'border-transparent bg-background/50 text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ag.appearance.shirt }}
                      />
                      <span className="font-medium">{ag.name}</span>
                      {ag.lead ? (
                        <span className="text-[10px] text-annotation-highlight font-bold">★</span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Escritorio #{ag.seat + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
