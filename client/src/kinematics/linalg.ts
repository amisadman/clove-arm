/**
 * Solves Ax = b via Gauss-Jordan elimination with partial pivoting.
 * Small, dependency-free helper for the optional 5x5 orientation-biased IK solve.
 */
export function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivotRow = col
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivotRow][col])) pivotRow = r
    }
    if (Math.abs(M[pivotRow][col]) < 1e-12) return null
    ;[M[col], M[pivotRow]] = [M[pivotRow], M[col]]

    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = M[r][col] / M[col][col]
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c]
    }
  }

  return M.map((row, i) => row[n] / row[i])
}
