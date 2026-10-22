import type React from 'react'
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Building2,
  MessageSquare,
  Check
} from 'lucide-react'

export type DemoLandingProps = {
  onClose?: () => void
}

export function DemoLandingPage({ onClose }: DemoLandingProps): React.JSX.Element {
  return (
    <div className="relative flex h-full w-full flex-col overflow-auto scrollbar-sleek bg-background text-foreground select-none">
      {/* Navigation Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow">
            LO
          </div>
          <span className="text-sm font-bold tracking-tight">Lunar Orca Cloud</span>
          <span className="rounded-full bg-annotation-highlight/20 px-2 py-0.5 text-[10px] font-semibold text-annotation-highlight">
            v2.4
          </span>
        </div>

        <nav className="flex items-center gap-5 text-xs text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Capacidades
          </a>
          <a href="#architecture" className="hover:text-foreground transition-colors">
            Arquitectura ODD
          </a>
          <a href="#subagents" className="hover:text-foreground transition-colors">
            Equipo de Agentes
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition"
            >
              Cerrar Vista Previa
            </button>
          ) : (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 transition"
            >
              <span>Comenzar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 text-xs text-muted-foreground shadow-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Orquestación de Agentes con ODD & Worktree Isolation</span>
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
          El Centro de Mando Total para Desarrolladores y Agentes IA
        </h1>

        <p className="mt-4 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Diseñado nativamente en Omarchy Arch Linux. Administrá tus workspaces, supervisá tus
          agentes en la oficina pixel art 3D y colaborá por canales en tiempo real mediante Orlack.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg hover:opacity-90 transition"
          >
            <span>Desplegar Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span>Ver Documentación</span>
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-12 max-w-5xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold tracking-tight">Capacidades Centrales</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Herramientas integradas para desarrollo asistido por agentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col rounded-xl border border-border bg-card/60 p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Agents Office</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Visualización pixel art con Three.js, monitores CRT animados y seguimiento de posturas
              (escritorios, lounge y pizarra).
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-workspace-status-review">
              <Check className="h-3.5 w-3.5" />
              <span>Three.js Engine r186 Activo</span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card/60 p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Orlack Hub</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Comunicación basada en Block Buzz con soporte para menciones `@agente`, reportes de
              fase y streaming de tareas.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-workspace-status-review">
              <Check className="h-3.5 w-3.5" />
              <span>Event Bus Bidireccional</span>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card/60 p-5 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Aislamiento Seguro</h3>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Worktrees independientes por proyecto, control de permisos de red y ejecución acotada
              a superficies autorizadas.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-workspace-status-review">
              <Check className="h-3.5 w-3.5" />
              <span>Protocolo ODD Blindado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section id="architecture" className="border-t border-border bg-card/20 px-8 py-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <Cpu className="h-4 w-4" />
              <span>Especificación de Rendimiento</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-1">
              Aceleración por Hardware & Cero Latencia
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg leading-relaxed">
              Terminal acelerada por WebGL2 sobre Wayland (Hyprland), motor de tipos estricto y
              persistencia JSONL integrada en disco.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">0 ms</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Lag TUI</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">60 FPS</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Canvas 3D
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">100%</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Nativo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <Layers className="h-4 w-4 text-primary" />
          <span>Desarrollado para el Centro de Mando Lunar Orca · Omarchy Arch Linux</span>
        </div>
      </footer>
    </div>
  )
}
