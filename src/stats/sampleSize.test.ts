import { describe, expect, it } from 'vitest'
import { zTwoSided, normalQuantile } from './normal'
import { planSampleSize, powerAtN } from './sampleSize'
import { noncentralTCdf, studentTCdf } from './special'

describe('planSampleSize (Minitab 2-sample t)', () => {
  /**
   * support.minitab.com example: difference 5, σ = 10, power 0.9, α = 0.05 two-sided.
   * Sample size 86 per group, actual power 0.903230.
   */
  const minitab = {
    kind: 'mean2' as const,
    alpha: 0.05,
    power: 0.9,
    twoSided: true,
    delta: 5,
    sigma: 10,
  }

  it('matches the published n = 86, actual power 0.903230', () => {
    const r = planSampleSize(minitab)
    expect(r).not.toBeNull()
    expect(r!.nPerGroup).toBe(86)
    expect(r!.groups).toBe(2)
    expect(r!.effectSize).toBeCloseTo(0.5, 12)
    expect(r!.actualPower).toBeCloseTo(0.90323, 5)
    expect(powerAtN(minitab, 86)).toBeCloseTo(0.90323, 5)
    expect(powerAtN(minitab, 85)!).toBeLessThan(0.9)
  })

  it('powerAtN grows with n and clears the target at the planned size', () => {
    const planned = planSampleSize(minitab)!
    const atPlan = powerAtN(minitab, planned.nPerGroup)!
    const atHalf = powerAtN(minitab, Math.max(2, Math.floor(planned.nPerGroup / 2)))!
    expect(atPlan).toBeGreaterThan(atHalf)
    expect(atPlan).toBeGreaterThanOrEqual(0.9)
  })
})

describe('planSampleSize (rates)', () => {
  it('one-proportion plan is the textbook z sample-size formula', () => {
    const r = planSampleSize({
      kind: 'prop1',
      alpha: 0.05,
      power: 0.8,
      twoSided: true,
      baselinePct: 10,
      targetPct: 5,
    })
    expect(r).not.toBeNull()
    const zA = zTwoSided(0.05)
    const zB = normalQuantile(0.8)
    const p0 = 0.1
    const p1 = 0.05
    const raw =
      (zA * Math.sqrt(p0 * (1 - p0)) + zB * Math.sqrt(p1 * (1 - p1))) ** 2 /
      (p0 - p1) ** 2
    expect(r!.nPerGroup).toBe(Math.max(5, Math.ceil(raw)))
  })
})

describe('noncentralTCdf (AS 243 tables)', () => {
  it('reduces to Student-t when the noncentrality is 0', () => {
    expect(noncentralTCdf(3, 1, 0)).toBeCloseTo(studentTCdf(3, 1), 10)
    expect(noncentralTCdf(3, 1, 0)).toBeCloseTo(0.8975836176504333, 6)
  })

  it('matches the tabulated value df=10, λ=2, t=4', () => {
    expect(noncentralTCdf(4, 10, 2)).toBeCloseTo(0.9247683363, 6)
  })
})
