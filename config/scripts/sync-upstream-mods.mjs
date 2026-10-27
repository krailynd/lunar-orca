#!/usr/bin/env node
import { execSync } from 'node:child_process'

function run(cmd) {
  console.log(`[lunar-orca-sync] Running: ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: '/home/krailynd/lunar-orca' })
}

console.log('=== Lunar Orca Upstream Sync Tool ===')
try {
  run('git fetch upstream --tags')
  run('git fetch origin --tags')
  console.log('\n[lunar-orca-sync] Últimos tags estables disponibles en upstream:')
  run('git tag -l "v1.*" | sort -V | tail -10')
  console.log('\nPara sincronizar de forma segura con un nuevo tag estable:')
  console.log('1. git merge <nuevo-tag> (siguiendo docs-dev/SYNC.md)')
  console.log('2. pnpm run build:linux')
  console.log('3. git push origin mis-mods --tags')
} catch (e) {
  console.error('[lunar-orca-sync] Error:', e.message)
}
