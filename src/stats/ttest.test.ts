import { describe, expect, it } from 'vitest'
import { welchTTest } from './ttest'

/**
 * Fixture: two groups of 5, same sample variance, means 22 vs 30.
 * Algebra is exact (t = −8, Welch df = 8).
 * Two-sided p-value is I_{ν/(ν+t²)}(ν/2, 1/2) = I_{1/9}(4, 1/2).
 * Hypergeometric series and quadrature agree to 1e-18.
 */
const A = [20, 22, 24, 21, 23]
const B = [30, 28, 32, 29, 31]
const P_VALUE = 4.366826031328023e-5

describe('welchTTest', () => {
  it('returns null when a group has fewer than 2 points', () => {
    expect(welchTTest([1], B)).toBeNull()
    expect(welchTTest(A, [1])).toBeNull()
  })

  it('matches the known t, df, and p-value', () => {
    const r = welchTTest(A, B)
    expect(r).not.toBeNull()
    expect(r!.mean1).toBeCloseTo(22, 10)
    expect(r!.mean2).toBeCloseTo(30, 10)
    expect(r!.t).toBeCloseTo(-8, 10)
    expect(r!.df).toBeCloseTo(8, 10)
    expect(r!.pValue).toBeCloseTo(P_VALUE, 12)
  })

  it('is symmetric: swapping groups flips t and the CI, same p', () => {
    const ab = welchTTest(A, B)!
    const ba = welchTTest(B, A)!
    expect(ba.t).toBeCloseTo(-ab.t, 12)
    expect(ba.pValue).toBeCloseTo(ab.pValue, 12)
    expect(ba.meanDiff).toBeCloseTo(-ab.meanDiff, 12)
  })

  it('gives p ≈ 1 when the two samples are identical', () => {
    const r = welchTTest(A, A)!
    expect(r.t).toBeCloseTo(0, 12)
    expect(r.pValue).toBeCloseTo(1, 6)
  })

  it('truncates Welch df to an integer the way Minitab does', () => {
    // v1 = 1/3, v2 = 1 → Satterthwaite df = 32/19 ≈ 1.684 → 1
    const r = welchTTest([1, 2, 3], [10, 12])
    expect(r).not.toBeNull()
    expect(r!.df).toBe(1)
  })
})
