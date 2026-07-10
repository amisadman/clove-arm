import { Vector3 } from 'three'
import type { URDFRobot } from 'urdf-loader'
import { getRobot, subscribeRobot } from '../sim/robotStore'
import { JOINT_ORDER, FALLBACK_JOINT_LIMITS, type JointVector, type JointName } from './jointOrder'

/**
 * The solver never touches the rendered robot mid-solve. It works on an
 * invisible clone ("twin") that is never added to the scene graph.
 */
let twin: URDFRobot | null = null
const tipWorld = new Vector3()

function buildTwin(): URDFRobot | null {
  const robot = getRobot()
  if (!robot) return null
  twin = robot.clone(true) as URDFRobot
  return twin
}

function ensureTwin(): URDFRobot | null {
  return twin ?? buildTwin()
}

subscribeRobot(() => {
  buildTwin()
  if (import.meta.env.DEV) logSelfCheck()
})

/** Forward kinematics: joint vector -> stylus_tip position in base_link frame. */
export function fk(q: JointVector): Vector3 {
  const t = ensureTwin()
  if (!t) return new Vector3()

  JOINT_ORDER.forEach((name, i) => t.setJointValue(name, q[i]))
  t.updateMatrixWorld(true)

  const tip = t.links['stylus_tip']
  if (!tip) return new Vector3()

  tip.getWorldPosition(tipWorld)
  t.worldToLocal(tipWorld)
  return tipWorld.clone()
}

/** URDF joint limits, read from the live robot with a static fallback. */
export function jointLimits(name: JointName): { lower: number; upper: number } {
  const limit = getRobot()?.joints[name]?.limit
  if (limit && Number.isFinite(limit.lower) && Number.isFinite(limit.upper)) {
    return { lower: limit.lower, upper: limit.upper }
  }
  return FALLBACK_JOINT_LIMITS[name]
}

export function clampToLimits(q: JointVector): JointVector {
  return JOINT_ORDER.map((name, i) => {
    const { lower, upper } = jointLimits(name)
    return Math.min(upper, Math.max(lower, q[i]))
  })
}

/** Current joint angles of the rendered robot, in JOINT_ORDER. */
export function currentJointVector(): JointVector {
  const robot = getRobot()
  return JOINT_ORDER.map((name) => (robot?.joints[name]?.angle as number) ?? 0)
}

function logSelfCheck() {
  const zeros = JOINT_ORDER.map(() => 0)
  const p = fk(zeros)
  console.log(
    `[kinematics] fk(zeros) = (${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)}) — expect ~(0, 0, 1.497)`,
  )
}
