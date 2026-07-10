import type { Vec3 } from '../kinematics/types'

export type MotionCommand =
  | { type: 'JOG'; delta: Vec3 }
  | { type: 'MOVE_TO'; target: Vec3; speed?: number } // speed (m/s) overrides the default distance-based duration
  | { type: 'HOME' }

/**
 * Commands the remote controller page can send over the socket relay.
 * Every MotionCommand, plus PIN entry — which useRemoteCommands special-cases
 * (calls runPin directly) rather than routing through the executor.
 */
export type RemoteCommand = MotionCommand | { type: 'ENTER_PIN'; pin: string }

type Listener = (command: MotionCommand) => void

const listeners = new Set<Listener>()

export function emit(command: MotionCommand) {
  listeners.forEach((listener) => listener(command))
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
