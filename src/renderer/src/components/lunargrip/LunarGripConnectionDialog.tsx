import React, { useState } from 'react'
import { Database, Loader2, Plug, X } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { DatabaseConnection } from './lunargrip-types'

export type LunarGripConnectionInput = DatabaseConnection & {
  password?: string
  encrypt?: boolean
  trustServerCertificate?: boolean
}

export function LunarGripConnectionDialog({
  open,
  onOpenChange,
  onOpenDemo,
  onTestConnection,
  testing = false
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenDemo: () => void
  onTestConnection: (connection: LunarGripConnectionInput) => void
  testing?: boolean
}): React.JSX.Element {
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('1433')
  const [database, setDatabase] = useState('ProvocosDB')
  const [username, setUsername] = useState('sa')
  const [password, setPassword] = useState('Provocos2026!Seguro')
  const [encrypt, setEncrypt] = useState(false)
  const [trustServerCertificate, setTrustServerCertificate] = useState(true)

  const handleTest = (): void => {
    onTestConnection({
      id: 'pending-local-connection',
      name: `${host}:${port}`,
      engine: 'sqlserver',
      host,
      port: Number(port),
      database,
      username,
      isRemote: false,
      password,
      encrypt,
      trustServerCertificate
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
            Conexión TDS directa a SQL Server. La contraseña no se persiste en disco.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lunargrip-host">Host</Label>
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2 rounded-md border border-border bg-muted/30 p-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={encrypt} onCheckedChange={(value) => setEncrypt(value === true)} />
              Encriptación SSL
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={trustServerCertificate}
                onCheckedChange={(value) => setTrustServerCertificate(value === true)}
              />
              Confiar en certificado (TrustServerCertificate)
            </label>
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
          <Button onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="animate-spin" /> : null}
            {testing ? 'Conectando…' : 'Probar conexión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
