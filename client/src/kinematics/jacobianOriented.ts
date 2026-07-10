import { fkOriented } from './solverTwin'
import { JOINT_ORDER, type JointVector } from './jointOrder'

const H = 1e-4

/**
 * 6x7 Jacobian: rows 0-2 = d(x,y,z)/dq, rows 3-5 = d(stylus zAxis x,y,z)/dq.
 *
 * The plan describes a 5-row version (x,y of the zAxis error only). That
 * formulation is degenerate: (zAxis.x, zAxis.y) is (0, 0) whether the stylus
 * points straight up OR straight down, so it can't tell those two apart. In
 * practice, starting from the home pose — where the tip already points
 * straight up — the 5-row solve has zero orientation gradient at the start
 * and converges to "vertical but pointing the wrong way" (verified: 178.8°
 * from down, worse than not using it at all). Including the z-component
 * (6 rows total) resolves the ambiguity and reliably converges to within a
 * few degrees of straight-down for all 6 keys — see solveIK's orientation
 * branch for the corresponding 6x6 damped solve.
 */
export type JacobianOriented = number[][]

export function computeJacobianOriented(q: JointVector): JacobianOriented {
  const base = fkOriented(q)
  const J: JacobianOriented = [[], [], [], [], [], []]

  for (let i = 0; i < JOINT_ORDER.length; i++) {
    const qh = q.slice()
    qh[i] += H
    const p = fkOriented(qh)
    J[0].push((p.position.x - base.position.x) / H)
    J[1].push((p.position.y - base.position.y) / H)
    J[2].push((p.position.z - base.position.z) / H)
    J[3].push((p.zAxis.x - base.zAxis.x) / H)
    J[4].push((p.zAxis.y - base.zAxis.y) / H)
    J[5].push((p.zAxis.z - base.zAxis.z) / H)
  }

  return J
}
