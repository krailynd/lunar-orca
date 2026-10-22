import type { OfficeEvent } from './types'

type Listener = (event: OfficeEvent) => void

class OfficeEventBus {
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit(event: OfficeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (err) {
        console.error('OfficeEventBus listener error:', err)
      }
    }
  }
}

export const officeEventBus = new OfficeEventBus()
