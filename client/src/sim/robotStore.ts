import type { URDFRobot } from 'urdf-loader'

interface RobotStore {
  robot: URDFRobot | null
  listeners: Set<() => void>
}

const store: RobotStore = { robot: null, listeners: new Set() }

export function setRobot(robot: URDFRobot) {
  store.robot = robot
  store.listeners.forEach((listener) => listener())
}

export function getRobot(): URDFRobot | null {
  return store.robot
}

export function subscribeRobot(listener: () => void): () => void {
  store.listeners.add(listener)
  return () => store.listeners.delete(listener)
}
