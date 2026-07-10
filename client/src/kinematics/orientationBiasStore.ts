let enabled = false
const listeners = new Set<() => void>()

export function isOrientationBiasEnabled(): boolean {
  return enabled
}

export function setOrientationBiasEnabled(value: boolean) {
  enabled = value
  listeners.forEach((listener) => listener())
}

export function subscribeOrientationBias(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
