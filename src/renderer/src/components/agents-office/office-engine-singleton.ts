import { OfficeEngine } from './engine'

let sharedEngine: OfficeEngine | null = null
const initializedOffices = new Set<string>()

export function getSharedOfficeEngine(): OfficeEngine {
  if (!sharedEngine) {
    sharedEngine = new OfficeEngine()
  }
  return sharedEngine
}

export function isOfficeInitialized(officeName: string): boolean {
  return initializedOffices.has(officeName)
}

export function markOfficeInitialized(officeName: string): void {
  initializedOffices.add(officeName)
}

export function resetSharedOfficeEngine(): void {
  if (sharedEngine) {
    sharedEngine.chars.clear()
    sharedEngine.effects = []
    sharedEngine.boardText = ''
    sharedEngine.boardTitle = ''
    sharedEngine.layout = null
  }
  initializedOffices.clear()
}
