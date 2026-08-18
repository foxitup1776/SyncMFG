import { describe, expect, it } from 'vitest'
import { computeImr } from './imr'

describe('computeImr', () => {
  it('uses the classic n=2 constants E2=2.66, D4=3.267, d2=1.128', () => {
    const values = [10, 12, 11, 13, 10]
    const r = computeImr(values)
    expect(r).not.toBeNull()
    expect(r!.xBar).toBeCloseTo(11.2, 10)
    expect(r!.mrBar).toBeCloseTo(2, 10)
    expect(r!.uclX).toBeCloseTo(11.2 + 2.66 * 2, 10)
    expect(r!.lclX).toBeCloseTo(11.2 - 2.66 * 2, 10)
    expect(r!.uclMr).toBeCloseTo(3.267 * 2, 10)
    expect(r!.sigmaWithin).toBeCloseTo(2 / 1.128, 10)
  })
})
