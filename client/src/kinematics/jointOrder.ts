export const JOINT_ORDER = [
  'joint_1',
  'joint_2',
  'joint_3',
  'joint_4',
  'joint_5',
  'joint_6',
  'stylus_pitch',
] as const

export type JointName = (typeof JOINT_ORDER)[number]

/** Array of 7 joint angles (radians), aligned with JOINT_ORDER. */
export type JointVector = number[]

/** URDF joint limits (radians), used as a fallback before the robot has loaded. */
export const FALLBACK_JOINT_LIMITS: Record<JointName, { lower: number; upper: number }> = {
  joint_1: { lower: -3.1416, upper: 3.1416 },
  joint_2: { lower: -2.0944, upper: 2.0944 },
  joint_3: { lower: -2.618, upper: 2.618 },
  joint_4: { lower: -3.1416, upper: 3.1416 },
  joint_5: { lower: -2.0944, upper: 2.0944 },
  joint_6: { lower: -3.1416, upper: 3.1416 },
  stylus_pitch: { lower: -2.0944, upper: 2.0944 },
}
