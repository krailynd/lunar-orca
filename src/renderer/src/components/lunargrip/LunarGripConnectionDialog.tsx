import React, { useState } from 'react'
import { AlertTriangle, Database, Plug, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { DatabaseConnection } from './lunargrip-types'

export function LunarGripConnectionDialog({
  open,
  onOpenChange,
  onOpenDemo,
  onTestConnection
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDemo: () => void
  onTestConnection: (connection: DatabaseConnection) => void
}): React.JSX.Element {
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('1433')
  const [database, setDatabase] = useState('')
  const [username, setUsername] = useState('')

  const handleTest = (): void => {
    onTestConnection({
      id: 'pending-local-connection',
      name: `${host}:${port}`,
      engine: 'sqlserver',
      host,
      port: Number(port),
      database,
      username,
      isRemote: false
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Plug className="size-4" />
              Nueva conexión
            </span>
          </DialogTitle>
          <DialogDescription>
            Fase 1A valida el contrato y el host local, pero todavía no abre conexiones reales.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-warning" />
            <p>
              Probar conexión quedará disponible cuando exista el driver SQL Server. No se guardan
              contraseñas en esta fase.
            </p>
          </div>
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lunargrip-host">Host local</Label>
              <Input
                id="lunargrip-host"
                value={host}
                onChange={(event) => setHost(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lunargrip-port">Puerto</Label>
              <Input
                id="lunargrip-port"
                inputMode="numeric"
                value={port}
                onChange={(event) => setPort(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lunargrip-database">Base de datos (opcional)</Label>
            <Input
              id="lunargrip-database"
              placeholder="Se seleccionará después de conectar"
              value={database}
              onChange={(event) => setDatabase(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Método de autenticación</Label>
            <Select defaultValue="sql">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">Autenticación SQL Server</SelectItem>
                <SelectItem value="windows" disabled>
                  Autenticación integrada (pendiente)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lunargrip-username">Usuario</Label>
              <Input
                id="lunargrip-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lunargrip-password">Contraseña</Label>
              <Input
                id="lunargrip-password"
                type="password"
                autoComplete="new-password"
                placeholder="No se guarda"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X />
            Cancelar
          </Button>
          <Button variant="secondary" onClick={onOpenDemo}>
            <Database />
            Abrir demo local
          </Button>
          <Button onClick={handleTest}>Probar conexión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
