import { describe, expect, it } from 'vitest'
import { normalQuantile, zTwoSided } from './normal'
import { planSampleSize, powerAtN } from './sampleSize'

describe('planSampleSize', () => {
  it('two-group means: δ=1, σ=2, α=0.05, 80% power matches the z formula in code', () => {
    const r = planSampleSize({
      kind: 'mean2',
      alpha: 0.05,
      power: 0.8,
      twoSided: true,
      delta: 1,
      sigma: 2,
    })
    expect(r).not.toBeNull()
    const zA = zTwoSided(0.05)
    const zB = normalQuantile(0.8)
    const d = 1 / 2
    const raw = (2 * (zA + zB) ** 2) / d ** 2 + zA ** 2 / 4
    expect(r!.nPerGroup).toBe(Math.max(5, Math.ceil(raw)))
    expect(r!.groups).toBe(2)
    expect(r!.effectSize).toBeCloseTo(0.5, 12)
  })

  it('powerAtN grows with n and hits ~80% near the planned size', () => {
    const input = {
      kind: 'mean2' as const,
      alpha: 0.05,
      power: 0.8,
      twoSided: true,
      delta: 1,
      sigma: 2,
    }
    const planned = planSampleSize(input)!
    const atPlan = powerAtN(input, planned.nPerGroup)!
    const atHalf = powerAtN(input, Math.max(5, Math.floor(planned.nPerGroup / 2)))!
    expect(atPlan).toBeGreaterThan(atHalf)
    expect(atPlan).toBeGreaterThan(0.78)
    expect(atPlan).toBeLessThan(0.9)
  })

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
