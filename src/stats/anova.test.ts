import { describe, expect, it } from 'vitest'
import { oneWayAnova } from './anova'

/**
 * Three groups of 6. Between SS = 84, within SS = 68, F = 630/68.
 * p-value from SciPy 1.14: scipy.stats.f.sf(630/68, 2, 15)
 */
const GROUPS = [
  { name: 'A', values: [6, 8, 4, 5, 3, 4] },
  { name: 'B', values: [8, 12, 9, 11, 6, 8] },
  { name: 'C', values: [13, 9, 11, 8, 7, 12] },
]
const F = 630 / 68
const SCIPY_P = 0.002398528011006219

describe('oneWayAnova', () => {
  it('returns null with fewer than 3 groups of n≥2', () => {
    expect(
      oneWayAnova([
        { name: 'A', values: [1, 2] },
        { name: 'B', values: [3, 4] },
      ]),
    ).toBeNull()
  })

  it('matches the textbook SS / F / p-value fixture', () => {
    const r = oneWayAnova(GROUPS)
    expect(r).not.toBeNull()
    expect(r!.grandMean).toBeCloseTo(8, 10)
    expect(r!.groupMeans[0]).toBeCloseTo(5, 10)
    expect(r!.groupMeans[1]).toBeCloseTo(9, 10)
    expect(r!.groupMeans[2]).toBeCloseTo(10, 10)
    expect(r!.betweenSS).toBeCloseTo(84, 10)
    expect(r!.withinSS).toBeCloseTo(68, 10)
    expect(r!.betweenDF).toBe(2)
    expect(r!.withinDF).toBe(15)
    expect(r!.f).toBeCloseTo(F, 10)
    expect(r!.pValue).toBeCloseTo(SCIPY_P, 6)
  })

  it('gives a large p when all groups share the same mean', () => {
    const r = oneWayAnova([
      { name: 'A', values: [1, 2, 3, 4] },
      { name: 'B', values: [1, 2, 3, 4] },
      { name: 'C', values: [1, 2, 3, 4] },
    ])
    expect(r).not.toBeNull()
    expect(r!.f).toBeCloseTo(0, 12)
    expect(r!.pValue).toBeCloseTo(1, 6)
  })
})
